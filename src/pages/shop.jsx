import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiRequest, assetUrl } from '../api/client.js'
import BottomNav from '../components/BottomNav.jsx'
import { useApi } from '../hooks/useApi.js'
import { formatPrice, formatSize } from '../lib/format.js'
import { categoryOptions } from '../lib/vocab.js'
import { stylingSession } from '../lib/stylingSession.js'

const homePuppyImage = '/assets/home/home-puppy.png'

function productCategory(product) {
  if (product.category === '가방') return 'BAGS'
  if (product.category === '악세서리') return 'ACCESSORIES'
  return 'CLOTHES'
}

export function ShopPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // 타이핑마다 API를 쏘지 않게 300ms 디바운스
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data, isLoading, error: loadError } = useApi(async () => {
    const params = new URLSearchParams()
    if (debouncedQuery.trim()) params.set('query', debouncedQuery.trim())
    if (category && category !== 'clothes') params.set('category', category)
    const suffix = params.toString() ? `?${params.toString()}` : ''
    const result = await apiRequest(`/api/v1/mcm-products${suffix}`)
    return Array.isArray(result) ? result : []
  }, [debouncedQuery, category])

  const products = data || []
  const visibleProducts = useMemo(() => {
    if (category !== 'clothes') return products
    return products.filter((product) => productCategory(product) === 'CLOTHES')
  }, [products, category])

  return (
    <main className="home-screen" data-node-id="257:661">
      <header className="home-header">
        <div className="home-heading"><strong>샵</strong><span>SHOP</span></div>
      </header>

      <section className="home-intro">
        <img src={homePuppyImage} alt="MCM MUSE mascot" />
        <h1>당신만의 <span>MCM</span> 스타일,<br /><span>MCM MUSE</span></h1>
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
              onClick={() => setCategory(option.value)}
              role="tab"
              aria-selected={category === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="product-grid" aria-label="MCM 상품 목록">
        {isLoading && <p className="grid-status">상품을 불러오고 있어요...</p>}
        {!isLoading && loadError && <p className="grid-status" role="alert">{loadError}</p>}
        {!isLoading && !loadError && visibleProducts.length === 0 && <p className="grid-status">조건에 맞는 상품이 없어요.</p>}
        {visibleProducts.map((product) => (
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
              <img src={assetUrl(product.cutoutUrl || product.imageUrl)} alt="" loading="lazy" />
            </div>
            <div className="product-info">
              <span className="product-brand">MCM</span>
              <p>{product.name}</p>
              <strong>{formatPrice(product.price)}</strong>
            </div>
          </article>
        ))}
      </section>

      <BottomNav active="shop" />
    </main>
  )
}

export function ProductDetailPage() {
  const { id = '1' } = useParams()
  const navigate = useNavigate()
  const [isAddingToCloset, setIsAddingToCloset] = useState(false)
  const [closetMessage, setClosetMessage] = useState('')
  const [imageIndex, setImageIndex] = useState(0)
  const carouselRef = useRef(null)

  const { data: product, error: loadError } = useApi(
    () => apiRequest(`/api/v1/mcm-products/${id}`),
    [id],
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
        <button className="back-button" type="button" aria-label="뒤로 가기" onClick={() => navigate(-1)} />
        <div><strong>제품 상세</strong><span>DETAILS</span></div>
      </header>

      {!product && (
        <p className="grid-status" role={loadError ? 'alert' : 'status'}>{loadError || '상품 정보를 불러오고 있어요...'}</p>
      )}
      {product && (<>
      <section className="detail-hero">
        <div className="detail-image-panel">
          <div className="detail-carousel" ref={carouselRef} onScroll={handleCarouselScroll}>
            {carouselImages.map((src, i) => (
              <img key={i} src={assetUrl(src)} alt={`${product.name} ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} />
            ))}
          </div>
          {carouselImages.length > 1 && (
            <div className="detail-carousel-dots" aria-hidden="true">
              {carouselImages.map((_, i) => <i key={i} className={i === imageIndex ? 'active' : ''} />)}
            </div>
          )}
        </div>
        <div className="detail-overview">
          <h1>{product.name}</h1>
          {product.englishName && <p className="detail-english">{product.englishName}</p>}
          <strong className="detail-price">{formatPrice(product.price)}</strong>
          <span className="detail-color-dot" />
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
          바로구매<small>BUY NOW</small>
        </a>
      </div>

      <button className="closet-add-detail-button" type="button" onClick={handleAddToCloset} disabled={isAddingToCloset}>
        <span>{isAddingToCloset ? '추가 중...' : '옷장에 편입하기'}</span>
        <small>{isAddingToCloset ? 'ADDING TO CLOSET' : 'ADD TO MY CLOSET'}</small>
      </button>
      {closetMessage && <p className="closet-add-detail-message" role="status">{closetMessage}</p>}
      </>)}

      <BottomNav active="shop" />
    </main>
  )
}

export function RecommendationsPage() {
  const [category, setCategory] = useState('ALL')

  const { data, isLoading, error: loadError } = useApi(async () => {
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
        imageUrl: item.product?.cutoutUrl || item.product?.imageUrl,
      }))
  }, [])

  const products = data || []

  return (
    <main className="recommendations-screen" data-node-id="53:208">
      <header className="recommendations-header">
        <button className="back-button" type="button" aria-label="뒤로 가기" onClick={() => window.history.back()} />
        <div><strong>옷장에 어울리는 <span>MCM</span></strong><span><b>MCM</b> PICKS FOR YOUR CLOSET</span></div>
      </header>

      <div className="recommendation-tabs" role="tablist" aria-label="추천 상품 카테고리">
        {['ALL', 'BAGS', 'ACCESSORIES', 'CLOTHES'].map((option) => (
          <button key={option} className={category === option ? 'active' : ''} type="button" onClick={() => setCategory(option)}>{option}</button>
        ))}
      </div>

      <section className="recommendation-list" aria-label="추천 상품">
        {isLoading && <p className="grid-status">옷장을 분석해 추천을 고르고 있어요...</p>}
        {!isLoading && loadError && <p className="grid-status" role="alert">{loadError}</p>}
        {products.map((product) => (
          <Link className="recommendation-row" key={product.id} to={`/products/${product.id}`}>
            <div className="recommendation-thumb"><img src={assetUrl(product.imageUrl)} alt="" /></div>
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
