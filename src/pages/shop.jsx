import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiRequest, assetUrl } from '../api/client.js'
import BackButton from '../components/BackButton.jsx'
import BottomNav from '../components/BottomNav.jsx'
import FadeImg from '../components/FadeImg.jsx'
import ProductImg from '../components/ProductImg.jsx'
import { invalidateApiCache, useApi } from '../hooks/useApi.js'
import { formatPrice, formatSize } from '../lib/format.js'
import { categoryOptions, tagColorHex } from '../lib/vocab.js'
import { stylingSession } from '../lib/stylingSession.js'

const homePuppyImage = '/assets/home/home-puppy.png'

function productCategory(product) {
  if (product.category === '가방') return 'BAGS'
  if (product.category === '악세서리') return 'ACCESSORIES'
  return 'CLOTHES'
}

// 탭별 서브 필터 — 가방·악세서리는 상품명 키워드(MCM 명명 규칙이 일관적), 의류는 실제 category 필드.
// 키워드에 안 걸리는 상품은 '전체'에서만 보인다 — 정식 서브카테고리 필드는 백로그(재크롤링 검토).
const SUB_FILTERS = {
  가방: [
    { label: '백팩', keywords: ['백팩', 'backpack'] },
    { label: '숄더', keywords: ['숄더', '호보', '메신저', 'shoulder', 'hobo', 'messenger'] },
    { label: '토트', keywords: ['토트', '쇼퍼', 'tote', 'shopper'] },
    { label: '크로스', keywords: ['크로스', '벨트 백', '벨트백', 'crossbody'] },
    { label: '파우치 · 미니', keywords: ['파우치', '미니백', '클러치', '베니티', '드로우스트링', 'pouch', 'clutch', 'vanity', 'drawstring'] },
    { label: '트래블', keywords: ['트롤리', '캐빈', '체크인', '더플', '위켄더', '보스턴', '캐리어', '가먼트', 'trolley', 'duffle'] },
  ],
  악세서리: [
    { label: '지갑 · 카드', keywords: ['지갑', '월렛', '카드', 'wallet', 'card'] },
    { label: '폰 · 테크', keywords: ['아이폰', 'iphone', '에어팟', 'airpods', '폰 케이스', '폰 파우치', '핸드폰', '랜야드', '테크', '노트북', '태블릿', 'watch'] },
    { label: '스카프 · 모자', keywords: ['스카프', '머플러', '숄', '비니', '캡', '모자', '버킷', '양말', 'scarf', 'shawl', 'beanie'] },
    { label: '키링 · 참', keywords: ['키 참', '키링', '키 링', '키 홀더', '참', '스트랩', 'charm', 'keyring'] },
    { label: '벨트', keywords: ['벨트', 'belt'] },
    { label: '뷰티 · 트래블', keywords: ['퍼퓸', '향수', '선글라스', '아이웨어', '코스메틱', '수트케이스', '트래블', '토일레트리', 'perfume', 'sunglasses'] },
    { label: '펫 · 토이', keywords: ['펫', '인형', 'pup', '토이'] },
  ],
  clothes: [
    { label: '상의', category: '상의' },
    { label: '하의', category: '하의' },
    { label: '아우터', category: '아우터' },
    { label: '신발', category: '신발' },
  ],
}

function matchesSubFilter(product, subFilter) {
  if (!subFilter) return true
  if (subFilter.category) return product.category === subFilter.category
  const name = (product.name || '').toLowerCase()
  return subFilter.keywords.some((keyword) => name.includes(keyword))
}

// 찜 상태 공용 훅 (계약 §5-3~5-5) — 하트 상태는 찜 목록 id 집합으로 매칭, 토글은 낙관적 갱신
function useWishlist() {
  const { data, setData } = useApi(async () => {
    const result = await apiRequest('/api/v1/wishlist')
    return Array.isArray(result) ? result : []
  }, [], { cacheKey: 'wishlist' })
  const [wishError, setWishError] = useState('')

  const wishedIds = new Set((data || []).map((product) => product.id))

  async function toggleWish(product) {
    const wished = wishedIds.has(product.id)
    setWishError('')
    setData((current) => wished
      ? (current || []).filter((item) => item.id !== product.id)
      : [product, ...(current || [])])
    invalidateApiCache('profile')
    const call = () => apiRequest(`/api/v1/wishlist/${product.id}`, { method: wished ? 'DELETE' : 'POST' })
    try {
      try {
        await call()
      } catch {
        // 일시적 네트워크·프록시 오류는 1회 재시도로 흡수 (백엔드 찜 API는 멱등)
        await new Promise((resolve) => setTimeout(resolve, 600))
        await call()
      }
    } catch {
      // 재시도까지 실패 — 원상 복구하되, 조용히 되돌리면 버그처럼 보이므로 이유를 보여준다
      setData((current) => wished
        ? [product, ...(current || [])]
        : (current || []).filter((item) => item.id !== product.id))
      setWishError('찜 처리에 실패했어요. 잠시 후 다시 시도해주세요.')
      setTimeout(() => setWishError(''), 3000)
    }
  }

  return { wishlist: data || [], wishedIds, toggleWish, wishError }
}

export function ShopPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [subLabel, setSubLabel] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const subOptions = SUB_FILTERS[category] || []
  const activeSubFilter = subOptions.find((option) => option.label === subLabel) || null

  function switchCategory(next) {
    setCategory(next)
    setSubLabel('')
  }

  // 타이핑마다 API를 쏘지 않게 300ms 디바운스
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data, isLoading, error: loadError, reload } = useApi(async () => {
    const params = new URLSearchParams()
    if (debouncedQuery.trim()) params.set('query', debouncedQuery.trim())
    if (category && category !== 'clothes') params.set('category', category)
    const suffix = params.toString() ? `?${params.toString()}` : ''
    const result = await apiRequest(`/api/v1/mcm-products${suffix}`)
    return Array.isArray(result) ? result : []
  }, [debouncedQuery, category], { cacheKey: `products:${category}:${debouncedQuery.trim()}` })

  const products = data || []
  const visibleProducts = useMemo(() => {
    let list = products
    if (category === 'clothes') list = products.filter((product) => productCategory(product) === 'CLOTHES')
    if (activeSubFilter) list = list.filter((product) => matchesSubFilter(product, activeSubFilter))
    // ALL 탭은 id순(시드 순서)이라 같은 시리즈가 연속으로 뜬다 — 고정 해시로 섞어 다양하게
    if (!category && !debouncedQuery.trim()) {
      list = [...list].sort((a, b) => ((a.id * 2654435761) % 4093) - ((b.id * 2654435761) % 4093))
    }
    return list
  }, [products, category, activeSubFilter, debouncedQuery])

  // 589개를 한 번에 그리지 않고 스크롤에 맞춰 20개씩 — 무한 스크롤 체감 + 성능
  const [visibleCount, setVisibleCount] = useState(20)
  const sentinelRef = useRef(null)

  useEffect(() => {
    setVisibleCount(20)
  }, [category, subLabel, debouncedQuery])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return undefined
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisibleCount((count) => count + 20)
    }, { rootMargin: '600px' })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const pagedProducts = visibleProducts.slice(0, visibleCount)

  return (
    <main className="home-screen" data-node-id="257:661">
      <header className="home-header">
        <div className="home-heading"><strong>샵</strong><span>SHOP</span></div>
      </header>

      <section className="home-intro">
        <img src={homePuppyImage} alt="MCM MUSE mascot" />
        <h1>취향을 아는 샵<br /><span>MCM MUSE</span></h1>
      </section>

      <section className="catalog-controls">
        <form className="product-search" onSubmit={(event) => event.preventDefault()}>
          <img src="/assets/home/search.svg" alt="" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="어떤 상품을 찾으시나요 ?" />
        </form>
        <div className="category-tabs" role="tablist" aria-label="상품 카테고리">
          {categoryOptions.map((option) => (
            <button
              key={option.label}
              className={category === option.value ? 'active' : ''}
              type="button"
              onClick={() => switchCategory(option.value)}
              role="tab"
              aria-selected={category === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
        {subOptions.length > 0 && (
          <div className="category-subtabs" role="tablist" aria-label="상품 세부 종류">
            <button className={subLabel === '' ? 'active' : ''} type="button" onClick={() => setSubLabel('')} role="tab" aria-selected={subLabel === ''}>전체</button>
            {subOptions.map((option) => (
              <button
                key={option.label}
                className={subLabel === option.label ? 'active' : ''}
                type="button"
                onClick={() => setSubLabel(option.label)}
                role="tab"
                aria-selected={subLabel === option.label}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="product-grid" aria-label="MCM 상품 목록">
        {isLoading && <p className="grid-status">상품을 불러오고 있어요...</p>}
        {!isLoading && loadError && (
          <div className="grid-status" role="alert">
            <p>{loadError}</p>
            <button className="retry-button" type="button" onClick={reload}>다시 시도</button>
          </div>
        )}
        {!isLoading && !loadError && visibleProducts.length === 0 && <p className="grid-status">조건에 맞는 상품이 없어요.</p>}
        {pagedProducts.map((product) => (
          <article
            className="product-card product-card-clickable"
            key={product.id}
            role="link"
            tabIndex={0}
            onClick={() => navigate(`/products/${product.id}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                navigate(`/products/${product.id}`)
              }
            }}
          >
            <div className="product-image-wrap">
              <ProductImg src={product.imageUrl || product.cutoutUrl} width={400} alt="" loading="lazy" />
            </div>
            <div className="product-info">
              {/* 전부 MCM이라 브랜드 뱃지는 무의미 — 카테고리 뱃지로 (팀 확정) */}
              <span className="product-brand">{productCategory(product)}</span>
              <p>{product.name}</p>
              <strong>{formatPrice(product.price)}</strong>
            </div>
          </article>
        ))}
        <div ref={sentinelRef} aria-hidden="true" />
      </section>

      <BottomNav active="shop" />
    </main>
  )
}

export function ProductDetailPage() {
  const { id = '1' } = useParams()
  const navigate = useNavigate()
  const { wishedIds, toggleWish, wishError } = useWishlist()
  const [isAddingToCloset, setIsAddingToCloset] = useState(false)
  const [closetMessage, setClosetMessage] = useState('')
  const [imageIndex, setImageIndex] = useState(0)
  const carouselRef = useRef(null)

  const { data: product, error: loadError, reload } = useApi(
    () => apiRequest(`/api/v1/mcm-products/${id}`),
    [id],
    { cacheKey: `product:${id}` },
  )

  useEffect(() => {
    setImageIndex(0)
    carouselRef.current?.scrollTo({ left: 0 })
  }, [product])

  // 캐러셀 이미지 — imageUrls(계약 §2, 5~8장) 없으면 대표 1장
  const carouselImages =
    Array.isArray(product?.imageUrls) && product.imageUrls.length > 0
      ? product.imageUrls
      : [product?.imageUrl].filter(Boolean)

  function handleCarouselScroll() {
    const el = carouselRef.current
    if (!el || el.clientWidth === 0) return
    setImageIndex(Math.min(carouselImages.length - 1, Math.round(el.scrollLeft / el.clientWidth)))
  }

  async function handleAddToCloset() {
    setIsAddingToCloset(true)
    setClosetMessage('')

    try {
      await apiRequest('/api/v1/closet-items', {
        method: 'POST',
        body: JSON.stringify({ mcmProductId: Number(id) }),
      })
      invalidateApiCache('closet:')
      invalidateApiCache('dna:')
      invalidateApiCache('recommendations:')
      setClosetMessage('내 옷장에 추가됐어요.')
    } catch (error) {
      setClosetMessage(error.message)
    } finally {
      setIsAddingToCloset(false)
    }
  }

  return (
    <main className="detail-screen" data-node-id="53:249">
      <header className="detail-header">
        <BackButton onClick={() => navigate(-1)} />
        <div><strong>제품 상세</strong><span>DETAILS</span></div>
        {product && (
          <button
            className="detail-wish-button"
            type="button"
            aria-label={wishedIds.has(product.id) ? '찜 해제' : '찜하기'}
            aria-pressed={wishedIds.has(product.id)}
            onClick={() => toggleWish(product)}
          >
            <img src={`/assets/home/${wishedIds.has(product.id) ? 'heart-filled.svg' : 'heart-outline.svg'}`} alt="" />
          </button>
        )}
      </header>

      {wishError && <p className="wish-error" role="alert">{wishError}</p>}

      {!product && (
        <div className="grid-status" role={loadError ? 'alert' : 'status'}>
          <p>{loadError || '상품 정보를 불러오고 있어요...'}</p>
          {loadError && <button className="retry-button" type="button" onClick={reload}>다시 시도</button>}
        </div>
      )}
      {product && (<>
      <section className="detail-hero">
        <div className="detail-image-panel">
          <div className="detail-carousel" ref={carouselRef} onScroll={handleCarouselScroll}>
            {carouselImages.map((src, i) => (
              <ProductImg key={i} src={src} width={800} tone="studio" alt={`${product.name} ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} />
            ))}
          </div>
          {carouselImages.length > 1 && (
            <div className="detail-carousel-bar" aria-hidden="true">
              <i style={{ width: `${((imageIndex + 1) / carouselImages.length) * 100}%` }} />
            </div>
          )}
        </div>
        <div className="detail-overview">
          <h1>{product.name}</h1>
          {product.englishName && <p className="detail-english">{product.englishName}</p>}
          <strong className="detail-price">{formatPrice(product.price)}</strong>
          {/* 상품 실제 색을 반영 — 어휘 밖이면 뉴트럴 */}
          {product.color && <span className="detail-color-dot" style={{ background: tagColorHex[product.color] || '#c9c2b8' }} />}
          <p className="detail-options">{product.color && <>color: {product.color}</>}{formatSize(product.size) && <><br />size: {formatSize(product.size)}</>}</p>
        </div>
      </section>

      {product.description && <section className="detail-description">{product.description}</section>}

      {product.material && (
        <div className="detail-info-row material-row"><img src="/assets/detail/material-icon.svg" alt="" /><span>소재<small>{product.material}</small></span></div>
      )}

      <div className="detail-actions">
        <a
          className="buy-button"
          href={product.productUrl || 'https://kr.mcmworldwide.com/'}
          aria-label={`${product.name} MCM 공식몰에서 바로 구매`}
        >
          구매
        </a>
      </div>

      <button className="closet-add-detail-button" type="button" onClick={handleAddToCloset} disabled={isAddingToCloset}>
        <span>{isAddingToCloset ? '저장 중...' : '옷장에 저장하기'}</span>
      </button>
      {closetMessage && <p className="closet-add-detail-message" role="status">{closetMessage}</p>}
      </>)}

      <BottomNav active="shop" />
    </main>
  )
}

export function WishlistPage() {
  const navigate = useNavigate()
  const { wishlist, toggleWish, wishError } = useWishlist()

  return (
    <main className="recommendations-screen">
      <header className="recommendations-header">
        <BackButton onClick={() => navigate(-1)} />
        <div><strong>찜한 상품</strong><span>MY PICKS</span></div>
      </header>

      {wishError && <p className="wish-error" role="alert">{wishError}</p>}

      <section className="recommendation-list wishlist-list" aria-label="찜한 상품">
        {wishlist.length === 0 && (
          <div className="grid-status">
            <p>아직 찜한 상품이 없어요.<br />샵에서 마음에 드는 MCM에 하트를 눌러보세요.</p>
            <button className="retry-button" type="button" onClick={() => navigate('/')}>샵 구경가기</button>
          </div>
        )}
        {wishlist.map((product) => (
          <Link className="recommendation-row" key={product.id} to={`/products/${product.id}`}>
            <div className="recommendation-thumb"><ProductImg src={product.imageUrl || product.cutoutUrl} width={240} alt="" /></div>
            <div className="recommendation-details">
              <p>{product.name}</p>
              <small>{productCategory(product)}</small>
              <strong>{formatPrice(product.price)}</strong>
            </div>
            <button
              className="wishlist-remove"
              type="button"
              aria-label="찜 해제"
              onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleWish(product) }}
            >
              <img src="/assets/home/heart-filled.svg" alt="" />
            </button>
          </Link>
        ))}
      </section>

      <BottomNav active="profile" />
    </main>
  )
}

export function RecommendationsPage() {
  const [category, setCategory] = useState('ALL')

  const dnaIds = stylingSession.dnaItemIds()
  const { data, isLoading, error: loadError, reload } = useApi(async () => {
    // DNA 화면을 거쳤으면 그때 고른 아이템, 아니면 옷장 전체로 추천받는다
    let ids = stylingSession.dnaItemIds()
    if (ids.length === 0) {
      const closet = await apiRequest('/api/v1/closet-items')
      ids = (Array.isArray(closet) ? closet : []).map((item) => item.id)
    }
    if (ids.length === 0) throw new Error('옷장에 아이템을 먼저 담아주세요. 스캔하면 취향에 맞는 MCM을 추천해 드려요.')
    const result = await apiRequest('/api/v1/recommendations', { method: 'POST', body: JSON.stringify({ closetItemIds: ids }) })
    return [result?.bestPick, ...(result?.more ?? [])]
      .filter(Boolean)
      .map((item) => ({
        id: item.product?.id,
        name: item.product?.name,
        subtitle: item.reason,
        price: item.product?.price,
        imageUrl: item.product?.imageUrl || item.product?.cutoutUrl,
      }))
  }, [], { cacheKey: `recommendations:${dnaIds.join(',')}` })

  const products = data || []

  return (
    <main className="recommendations-screen" data-node-id="53:208">
      <header className="recommendations-header">
        <BackButton onClick={() => window.history.back()} />
        <div><strong>옷장에 어울리는 <span>MCM</span></strong><span><b>MCM</b> PICKS FOR YOUR CLOSET</span></div>
      </header>

      <div className="recommendation-tabs" role="tablist" aria-label="추천 상품 카테고리">
        {['ALL', 'BAGS', 'ACCESSORIES', 'CLOTHES'].map((option) => (
          <button key={option} className={category === option ? 'active' : ''} type="button" onClick={() => setCategory(option)}>{option}</button>
        ))}
      </div>

      <section className="recommendation-list" aria-label="추천 상품">
        {isLoading && <p className="grid-status">옷장을 분석해 추천을 고르고 있어요...</p>}
        {!isLoading && loadError && (
          <div className="grid-status" role="alert">
            <p>{loadError}</p>
            <button className="retry-button" type="button" onClick={reload}>다시 시도</button>
          </div>
        )}
        {products.map((product) => (
          <Link className="recommendation-row" key={product.id} to={`/products/${product.id}`}>
            <div className="recommendation-thumb"><ProductImg src={product.imageUrl} width={240} alt="" /></div>
            <div className="recommendation-details">
              <p>{product.name}</p>
              <small>{product.subtitle}</small>
              <strong>{formatPrice(product.price)}</strong>
            </div>
          </Link>
        ))}
      </section>

      <BottomNav active="closet" />
    </main>
  )
}
