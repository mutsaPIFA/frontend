import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { apiRequest, assetUrl } from './api/client.js'

const loadingPuppyImage = '/assets/loading-puppy.png'
const loadingCompletePuppyImage = '/assets/loading-puppy-complete.png'
const loadingStylingPuppyImage = '/assets/loading-puppy-styling.png'
const loadingOutfitPuppyImage = '/assets/loading-puppy-outfit.png'
const splashPuppyImage = '/assets/splash-puppy.png'
const loginRequestPuppyImage = '/assets/login-request-puppy.png'
const homePuppyImage = '/assets/home/home-puppy.png'

const categoryOptions = [
  { label: 'ALL', value: '' },
  { label: 'BAGS', value: '가방' },
  { label: 'ACCESSORIES', value: '악세서리' },
  { label: 'CLOTHES', value: 'clothes' },
]

// 서버 iconKey(계약 §4-3) → 보유한 svg 자산. office/daily/party 전용 아이콘은 아직 없어 유사 아이콘으로 대체
const moodIconFiles = { dinner: 'dinner', office: 'studio', trip: 'trip', daily: 'walk', walk: 'walk', party: 'dinner' }
function moodIcon(iconKey) {
  return `/assets/mood/${moodIconFiles[iconKey] || 'walk'}.svg`
}

// 스캔 태그 수정 옵션 — ai 스키마 enum과 동일 집합 (계약 §3-1: 태그는 사용자 수정 가능)
const tagOptions = {
  category: ['상의', '하의', '아우터', '원피스', '신발', '가방', '악세서리'],
  color: ['블랙', '화이트', '네이비', '그레이', '베이지', '브라운', '카멜', '그린', '핑크', '기타'],
  material: ['면', '니트', '데님', '가죽', '실크', '울', '합성', '기타'],
  mood: ['미니멀', '캐주얼', '클래식', '스트릿', '페미닌', '럭셔리'],
}

function scanItemName(tags) {
  return [tags?.color, tags?.material, tags?.category].filter(Boolean).join(' ') || '내 아이템'
}

// 태그 어휘 색 → 스와치 hex (DNA dominantColors 표시용)
const tagColorHex = {
  블랙: '#1f1f1f', 화이트: '#f5f2ea', 네이비: '#2c3a58', 그레이: '#9a9a94', 베이지: '#d9c9a8',
  브라운: '#7a5a3a', 카멜: '#b9855a', 그린: '#5b6a39', 핑크: '#e2a9b8', 기타: '#c9c2b8',
}

// 하단 바 아이콘 — 화면별 피그마 export 아이콘이 제각각이던 문제를 인라인 SVG 한 세트로 통일.
// stroke=currentColor라 활성 색(.active)이 CSS만으로 걸린다.
const navIcons = {
  shop: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5.5 8h13l-1.1 12.5H6.6L5.5 8Z" />
      <path d="M9 10.5V6a3 3 0 0 1 6 0v4.5" />
    </svg>
  ),
  closet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.2 3.8a2.2 2.2 0 1 0-4.3.7c.2 1 1.1 1.5 2.1 1.5" />
      <path d="M12 6v2.4" />
      <path d="m12 8.4 8.6 6.9a1.5 1.5 0 0 1-.9 2.7H4.3a1.5 1.5 0 0 1-.9-2.7L12 8.4Z" />
    </svg>
  ),
  style: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  ),
}

const navTabs = [
  { key: 'shop', to: '/', label: 'shop' },
  { key: 'closet', to: '/closet', label: 'closet' },
  { key: 'style', to: '/styling', label: 'style' },
  { key: 'profile', to: '/profile', label: 'profile' },
]

function BottomNav({ active }) {
  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      {navTabs.map((tab) => (
        <Link key={tab.key} className={active === tab.key ? 'active' : ''} to={tab.to} aria-current={active === tab.key ? 'page' : undefined}>
          {navIcons[tab.key]}
          <span>{tab.label}</span>
        </Link>
      ))}
    </nav>
  )
}

// 'yyyy-MM-dd' → '2026.08.18 (화)'
function formatWornDate(value) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return String(value)
  const day = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
  return `${String(value).replaceAll('-', '.')} (${day})`
}

function formatPrice(price) {
  return `₩${Number(price).toLocaleString('ko-KR')}`
}

function productCategory(product) {
  if (product.category === '가방') return 'BAGS'
  if (product.category === '악세서리') return 'ACCESSORIES'
  return 'CLOTHES'
}

function closetItemImage(item) {
  return assetUrl(item.cutoutUrl || item.imageUrl)
}

function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // 타이핑마다 API를 쏘지 않게 300ms 디바운스
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedQuery.trim()) params.set('query', debouncedQuery.trim())
    if (category && category !== 'clothes') params.set('category', category)
    const suffix = params.toString() ? `?${params.toString()}` : ''

    setLoadError('')
    apiRequest(`/api/v1/mcm-products${suffix}`)
      .then((result) => setProducts(Array.isArray(result) ? result : []))
      .catch((error) => {
        setProducts([])
        setLoadError(error.message)
      })
      .finally(() => setIsLoading(false))
  }, [debouncedQuery, category])

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

function SplashPage() {
  return (
    <main className="splash-screen" data-node-id="0">
      <section className="splash-content" aria-label="MCM MUSE 시작 화면">
        <img className="splash-image" src={splashPuppyImage} alt="MCM MUSE mascot" />
        <div className="splash-copy">
          <h1 className="splash-title">MCM MUSE</h1>
          <p className="splash-subtitle">당신만의 스타일을 발견하세요</p>
        </div>
      </section>
    </main>
  )
}

function LoginRequestPage() {
  return (
    <main className="login-request-screen" data-node-id="53:31">
      <div className="login-request-content">
        <img
          className="login-request-image"
          src={loginRequestPuppyImage}
          alt="MCM MUSE mascot holding clothes"
          data-node-id="53:42"
        />
        <div className="login-request-copy" data-node-id="53:34">
          <p>당신만의</p>
          <p><span className="mcm-wordmark">MCM</span> 스타일을 열어보세요</p>
        </div>
        <Link className="login-request-button" to="/login" data-node-id="53:37">
          <span>로그인</span>
          <small>LOGIN</small>
        </Link>
      </div>
    </main>
  )
}

function ClosetPage() {
  const navigate = useNavigate()
  const [source, setSource] = useState('')
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const suffix = source ? `?source=${source}` : ''
    setLoadError('')
    apiRequest(`/api/v1/closet-items${suffix}`)
      .then((result) => setItems(Array.isArray(result) ? result : []))
      .catch((error) => {
        setItems([])
        setLoadError(error.message)
      })
      .finally(() => setIsLoading(false))
  }, [source])

  function toggleItem(id) {
    setSelectedIds((current) => current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id])
  }

  function buildDna() {
    sessionStorage.setItem('mcm_style_dna_item_ids', JSON.stringify(selectedIds))
    navigate('/style-dna')
  }

  async function deleteSelectedItems() {
    setDeleteError('')
    try {
      await Promise.all(selectedIds.map((id) => apiRequest(`/api/v1/closet-items/${id}`, { method: 'DELETE' })))
      setItems((current) => current.filter((item) => !selectedIds.includes(item.id)))
      setSelectedIds([])
      setIsDeleteModalOpen(false)
    } catch {
      setDeleteError('아이템을 삭제하지 못했어요. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <main className="closet-screen" data-node-id="53:280">
      <header className="closet-header">
        <button className="back-button" type="button" aria-label="뒤로 가기" onClick={() => window.history.back()} />
        <div className="closet-heading"><strong>내 옷장</strong><span>MY CLOSET</span></div>
        <button
          className="closet-delete-button"
          type="button"
          aria-label="선택한 아이템 삭제"
          disabled={selectedIds.length === 0}
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <img src="/assets/closet/trash.svg" alt="" />
        </button>
      </header>

      <div className="closet-tabs" role="tablist" aria-label="옷장 출처">
        <button className={!source ? 'active' : ''} type="button" onClick={() => setSource('')} role="tab" aria-selected={!source}>전체</button>
        <button className={source === 'MCM' ? 'active' : ''} type="button" onClick={() => setSource('MCM')} role="tab" aria-selected={source === 'MCM'}>MCM</button>
      </div>

      <section className="closet-grid" aria-label="내 옷장 아이템">
        {isLoading && <p className="grid-status">옷장을 여는 중이에요...</p>}
        {!isLoading && loadError && <p className="grid-status" role="alert">{loadError}</p>}
        {!isLoading && !loadError && items.length === 0 && (
          <div className="grid-status closet-empty">
            <p>아직 옷장이 비어 있어요.<br />첫 아이템을 스캔해서 채워볼까요?</p>
          </div>
        )}
        {items.map((item) => (
          <article
            className={`closet-card closet-selectable-card ${selectedIds.includes(item.id) ? 'selected' : ''}`}
            key={item.id}
            role="button"
            tabIndex={0}
            aria-pressed={selectedIds.includes(item.id)}
            onClick={() => toggleItem(item.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                toggleItem(item.id)
              }
            }}
          >
            <img className="dna-selection-icon" src={`/assets/closet/${selectedIds.includes(item.id) ? 'selected.svg' : 'unselected.svg'}`} alt={selectedIds.includes(item.id) ? '선택됨' : '선택 안 됨'} />
            <div className="closet-image-wrap">
              <img src={closetItemImage(item)} alt="" />
            </div>
            <div className="closet-info">
              <span>{item.source === 'MCM' ? 'MCM' : 'OWN'}</span>
              <p>{scanItemName(item)}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="closet-actions">
        <Link className="add-item-button closet-add-item-button" to="/closet/scan">
          <span>아이템 추가하기</span>
          <small>ADD ITEM</small>
        </Link>
        <button className="add-item-button dna-build-button closet-dna-button" type="button" onClick={buildDna} disabled={selectedIds.length === 0}>
          <span>스타일 DNA 만들기 {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</span>
          <small>BUILD MY DNA</small>
        </button>
      </div>

      {isDeleteModalOpen && (
        <div className="closet-delete-modal-layer" role="presentation" onClick={() => setIsDeleteModalOpen(false)}>
          <section
            className="closet-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="closet-delete-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="closet-delete-title">선택한 아이템을<br />삭제할까요 ?</h2>
            {deleteError && <p className="closet-delete-error">{deleteError}</p>}
            <div className="closet-delete-actions">
              <button type="button" onClick={deleteSelectedItems}>네</button>
              <button type="button" onClick={() => setIsDeleteModalOpen(false)}>아니요</button>
            </div>
          </section>
        </div>
      )}

      <BottomNav active="closet" />
    </main>
  )
}

function StyleDnaPage() {
  const [dna, setDna] = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [requestState, setRequestState] = useState('loading')
  const [requestError, setRequestError] = useState('')
  const recommendationCarouselRef = useRef(null)

  useEffect(() => {
    async function load() {
      // 옷장에서 고르고 왔으면 그 아이템, 직접 진입이면 옷장 전체로 분석
      let ids = JSON.parse(sessionStorage.getItem('mcm_style_dna_item_ids') || '[]')
      if (!Array.isArray(ids) || ids.length === 0) {
        const closet = await apiRequest('/api/v1/closet-items')
        ids = (Array.isArray(closet) ? closet : []).map((item) => item.id)
      }
      if (ids.length === 0) throw new Error('옷장에 아이템을 먼저 담아주세요. 스캔하면 스타일 DNA를 만들 수 있어요.')
      const body = JSON.stringify({ closetItemIds: ids })
      const [dnaResult, recommendationResult] = await Promise.all([
        apiRequest('/api/v1/style-dna', { method: 'POST', body }),
        apiRequest('/api/v1/recommendations', { method: 'POST', body }),
      ])
      setDna(dnaResult)
      setRecommendation(recommendationResult)
      setRequestState('success')
    }

    load().catch((error) => {
      setRequestError(error.message || '스타일 DNA를 불러오지 못했어요.')
      setRequestState('error')
    })
  }, [])

  const recommendationPicks = [recommendation?.bestPick, ...(recommendation?.more ?? [])]
    .filter((pick) => pick?.product)

  function moveRecommendations(direction) {
    const carousel = recommendationCarouselRef.current
    if (!carousel) return
    const firstCard = carousel.querySelector('.recommendation-card')
    const cardStep = (firstCard?.getBoundingClientRect().width || 353) + 12
    carousel.scrollBy({ left: direction * cardStep, behavior: 'smooth' })
  }

  return (
    <main className="style-dna-screen" data-node-id="53:125">
      <header className="style-dna-header">
        <button className="back-button" type="button" aria-label="뒤로 가기" onClick={() => window.history.back()} />
        <div><strong>당신의 스타일 DNA</strong><span>YOUR STYLE DNA</span></div>
      </header>

      {requestState === 'loading' && (
        <section className="style-dna-loading" aria-live="polite">
          <img src="/assets/loading-puppy-styling.png" alt="" />
          <strong>스타일 DNA를 분석하고 있어요</strong>
          <span>잠시만 기다려주세요</span>
        </section>
      )}

      {requestState === 'error' && (
        <section className="style-dna-error" role="alert">
          <h1>스타일 DNA를 불러오지 못했어요</h1>
          <p>{requestError}</p>
          <button type="button" onClick={() => window.location.reload()}>다시 시도하기</button>
        </section>
      )}

      {requestState === 'success' && (
        <>
          <section className="style-dna-section">
            <h1>당신의 스타일 DNA</h1>
            <div className="dna-summary-card">
              <strong>[{dna?.keywords?.join(' · ') || '-'}]</strong>
              {(dna?.dominantColors || []).length > 0 && (
                <div className="dna-colors" aria-label={`주요 컬러: ${dna.dominantColors.join(', ')}`}>
                  {dna.dominantColors.map((color) => (
                    <i key={color} title={color} style={{ background: tagColorHex[color] || tagColorHex.기타 }} />
                  ))}
                </div>
              )}
              <p>{dna?.summary || '스타일 분석 결과를 준비하고 있어요.'}</p>
            </div>
          </section>

          <section className="style-dna-section recommendation-section">
            <div className="recommendation-heading-row">
              <h2>채우면 좋은 한가지</h2>
              <span className="recommendation-count">{recommendationPicks.length} PICKS</span>
            </div>
            <div className="recommendation-carousel-wrap">
              <button className="recommendation-arrow recommendation-arrow-prev" type="button" aria-label="이전 추천 제품" onClick={() => moveRecommendations(-1)}>‹</button>
              <div className="recommendation-carousel" ref={recommendationCarouselRef} aria-label="추천 상품 5가지">
                {recommendationPicks.map((pick, index) => (
                  <article className="recommendation-card" key={pick.product.id}>
                    <span className="perfect-match">{index === 0 ? 'PERFECT MATCH' : `MATCH ${index + 1}`}</span>
                    <img className="recommendation-image" src={assetUrl(pick.product.imageUrl)} alt={pick.product.name} />
                    <p>{pick.product.name}</p>
                    <div className="recommendation-reason">
                      <div className="recommendation-reason-copy">
                        <strong>추천 근거</strong>
                        <span>{pick.reason || '현재 옷장 아이템과 자연스럽게 어울리는 상품이에요.'}</span>
                      </div>
                      <div className="recommendation-mascot">
                        <img src="/assets/loading-puppy-styling.png" alt="MCM 스타일리스트 꼬미" />
                        <span>MCM 스타일리스트 꼬미</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <button className="recommendation-arrow recommendation-arrow-next" type="button" aria-label="다음 추천 제품" onClick={() => moveRecommendations(1)}>›</button>
            </div>
          </section>
        </>
      )}

      <BottomNav active="closet" />
    </main>
  )
}

function RecommendationsPage() {
  const [category, setCategory] = useState('ALL')
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    async function load() {
      // DNA 화면을 거쳤으면 그때 고른 아이템, 아니면 옷장 전체로 추천받는다
      let ids = JSON.parse(sessionStorage.getItem('mcm_style_dna_item_ids') || '[]')
      if (!Array.isArray(ids) || ids.length === 0) {
        const closet = await apiRequest('/api/v1/closet-items')
        ids = (Array.isArray(closet) ? closet : []).map((item) => item.id)
      }
      if (ids.length === 0) {
        setLoadError('옷장에 아이템을 먼저 담아주세요. 스캔하면 취향에 맞는 MCM을 추천해 드려요.')
        return
      }
      const result = await apiRequest('/api/v1/recommendations', { method: 'POST', body: JSON.stringify({ closetItemIds: ids }) })
      const items = [result?.bestPick, ...(result?.more ?? [])]
        .filter(Boolean)
        .map((item) => ({
          id: item.product?.id,
          name: item.product?.name,
          subtitle: item.reason,
          price: item.product?.price,
          imageUrl: item.product?.cutoutUrl || item.product?.imageUrl,
        }))
      setProducts(items)
    }

    load()
      .catch((error) => setLoadError(error.message))
      .finally(() => setIsLoading(false))
  }, [])

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

// 사이즈는 '|' 구분 목록일 수 있음 (계약 §2 — 신발은 사이즈 리스트) — 표시용으로 축약
function formatSize(size) {
  if (!size) return null
  const parts = size.split('|').map((part) => part.trim()).filter(Boolean)
  if (parts.length === 0) return null
  return parts.length > 1 ? `${parts[0]} 외 ${parts.length - 1}` : parts[0]
}

function ProductDetailPage() {
  const { id = '1' } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [isAddingToCloset, setIsAddingToCloset] = useState(false)
  const [closetMessage, setClosetMessage] = useState('')
  const [imageIndex, setImageIndex] = useState(0)
  const carouselRef = useRef(null)

  useEffect(() => {
    setProduct(null)
    setLoadError('')
    apiRequest(`/api/v1/mcm-products/${id}`)
      .then((result) => {
        setProduct(result)
        setImageIndex(0)
        carouselRef.current?.scrollTo({ left: 0 })
      })
      .catch((error) => setLoadError(error.message))
  }, [id])

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

function ScanPage() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError('')
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError('앨범이나 카메라로 아이템 사진을 선택해주세요.')
      return
    }

    const formData = new FormData()
    formData.append('image', selectedFile)
    setIsUploading(true)
    setError('')

    try {
      const result = await apiRequest('/api/v1/scan', { method: 'POST', body: formData })
      sessionStorage.setItem('mcm_scan_result', JSON.stringify(result))
      navigate('/closet/scan/recognize')
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <main className="scan-screen" data-node-id="190:120">
      <header className="scan-header">
        <button className="back-button" type="button" aria-label="뒤로 가기" onClick={() => navigate('/closet')} />
        <div className="scan-heading"><strong>아이템 추가하기</strong><span>ADD ITEM</span></div>
      </header>

      <section className="scan-preview" aria-label="아이템 사진 미리보기">
        <div className="scan-frame" />
        {previewUrl && <img className="scan-item-image" src={previewUrl} alt="선택한 아이템" />}
        <img className="scan-plus" src="/assets/scan/scan-plus.svg" alt="" />
      </section>

      {error && <p className="scan-error" role="alert">{error}</p>}

      <div className="scan-actions">
        <label className="album-button" aria-label="앨범에서 추가">
          <img src="/assets/scan/album-button.svg" alt="앨범에서 추가" />
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>
        <label className="camera-button" aria-label="카메라로 촬영">
          <img src="/assets/scan/camera-button.svg" alt="카메라로 촬영" />
          <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} />
        </label>
      </div>

      <button className="scan-submit" type="button" onClick={handleUpload} disabled={isUploading}>
        {isUploading ? '분석 중...' : selectedFile ? '아이템 분석하기' : '사진을 선택해주세요'}
      </button>

      <BottomNav active="closet" />
    </main>
  )
}

function RecognizeResultPage() {
  const navigate = useNavigate()
  const scanResult = useMemo(() => JSON.parse(sessionStorage.getItem('mcm_scan_result') || 'null'), [])
  const [tags, setTags] = useState(scanResult?.tags || {})

  useEffect(() => {
    if (!scanResult) navigate('/closet/scan', { replace: true })
  }, [navigate, scanResult])

  // 계약 §3-1: AI 태그는 사용자가 수정 가능 — 수정본을 스캔 결과에 되써서 등록 단계가 그대로 쓰게 한다
  function updateTag(key, value) {
    const nextTags = { ...tags, [key]: value }
    setTags(nextTags)
    sessionStorage.setItem('mcm_scan_result', JSON.stringify({ ...scanResult, tags: nextTags }))
  }

  if (!scanResult) return null
  const itemName = scanItemName(tags)
  const itemImage = assetUrl(scanResult.cutoutUrl || scanResult.originalUrl)

  return (
    <main className="recognize-screen" data-node-id="210:852">
      <header className="recognize-header">
        <button className="back-button" type="button" aria-label="뒤로 가기" onClick={() => navigate('/closet/scan')} />
        <div><strong>아이템 인식</strong><span>RECOGNIZE ITEM</span></div>
        <img src="/assets/recognize/header-mark.svg" alt="" />
      </header>

      <div className="recognize-status"><img src="/assets/recognize/check.svg" alt="" /><span>아이템 인식 완료</span></div>

      <section className="recognize-item-card">
        <img className="recognize-item-image" src={itemImage} alt={itemName} />
        <div className="recognize-item-name">{itemName}</div>
      </section>

      <section className="recognize-tags" aria-label="인식된 태그 확인·수정">
        {[['category', '종류'], ['color', '색상'], ['material', '소재'], ['mood', '무드']].map(([key, label]) => (
          <label key={key}>
            <span>{label}</span>
            <select value={tags[key] || ''} onChange={(event) => updateTag(key, event.target.value)}>
              {!tags[key] && <option value="">선택</option>}
              {tagOptions[key].map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        ))}
      </section>

      <div className="recognize-actions">
        <button type="button" onClick={() => navigate('/closet/scan')}><strong>다시 스캔하기</strong><span>SCAN AGAIN</span></button>
        <button type="button" onClick={() => navigate('/closet/scan/recognize/complete')}><strong>옷장에 넣기</strong><span>PUT IN MY CLOSET</span></button>
      </div>

      <BottomNav active="closet" />
    </main>
  )
}

function MoodSelectionPage() {
  const navigate = useNavigate()
  const [moods, setMoods] = useState([])
  const [moodError, setMoodError] = useState('')
  const [selectedMoodId, setSelectedMoodId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  // 기록 날짜 (계약 §4-5 wornDate — 미선택 시 서버가 오늘로) — 룩 저장 화면이 mcm_log_date를 읽는다
  const [logDate, setLogDate] = useState(() => sessionStorage.getItem('mcm_log_date') || '')

  function handleLogDateChange(event) {
    const value = event.target.value
    setLogDate(value)
    if (value) sessionStorage.setItem('mcm_log_date', value)
    else sessionStorage.removeItem('mcm_log_date')
  }

  useEffect(() => {
    apiRequest('/api/v1/moods')
      .then((result) => setMoods(Array.isArray(result) ? result : []))
      .catch((requestError) => setMoodError(requestError.message))
  }, [])

  async function handleSeeLooks() {
    if (!selectedMoodId) {
      setError('오늘의 무드를 선택해 주세요.')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const outfits = await apiRequest('/api/v1/outfits', {
        method: 'POST',
        body: JSON.stringify({ moodId: selectedMoodId }),
      })
      sessionStorage.setItem('mcm_outfits', JSON.stringify(outfits))
      const selectedMood = moods.find((mood) => mood.id === selectedMoodId)
      sessionStorage.setItem('mcm_selected_mood', JSON.stringify(selectedMood || {}))
      navigate('/styling/recommendation')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="mood-selection-screen" data-node-id="53:547">
      <header className="mood-selection-header">
        <button className="mood-back-button" type="button" aria-label="뒤로 가기" onClick={() => navigate(-1)}>
          <img src="/assets/mood/back.svg" alt="" />
        </button>
        <div><strong>오늘은 어떤 하루예요 ?</strong><span>WHAT’S THE VIBE ?</span></div>
        <label className="mood-calendar-button" aria-label="기록 날짜 선택">
          <img className="mood-calendar" src="/assets/mood/calendar.svg" alt="" />
          {logDate && <small>{logDate.slice(5).replace('-', '.')}</small>}
          <input type="date" value={logDate} onChange={handleLogDateChange} />
        </label>
      </header>

      <div className="mood-curator-message">
        <img src="/assets/mood/curator.png" alt="" />
        <span>취향은 지키고, 포인트 한 스푼 더했어요.</span>
      </div>

      <section className="mood-grid" aria-label="오늘의 무드 선택">
        {moods.length === 0 && <p className="grid-status" role={moodError ? 'alert' : 'status'}>{moodError || '무드를 불러오고 있어요...'}</p>}
        {moods.map((mood) => (
          <button
            key={mood.id}
            className={`mood-card ${selectedMoodId === mood.id ? 'selected' : ''}`}
            type="button"
            aria-pressed={selectedMoodId === mood.id}
            onClick={() => setSelectedMoodId(mood.id)}
          >
            <span className="mood-icon"><img src={moodIcon(mood.iconKey)} alt="" /></span>
            <strong>{mood.label}</strong>
            <small>{mood.labelEn}</small>
          </button>
        ))}
      </section>

      {error && <p className="mood-selection-error" role="alert">{error}</p>}
      <button className="mood-see-looks-button" type="button" onClick={handleSeeLooks} disabled={isLoading}>
        <span>{isLoading ? '코디를 만들고 있어요' : '추천 코디 보기'}</span>
        <small>{isLoading ? 'CREATING LOOKS' : 'SEE LOOKS'}</small>
      </button>

      <BottomNav active="style" />
    </main>
  )
}

function OutfitRecommendationPage() {
  const navigate = useNavigate()
  const outfits = JSON.parse(sessionStorage.getItem('mcm_outfits') || '[]')
  const selectedMood = JSON.parse(sessionStorage.getItem('mcm_selected_mood') || '{}')
  // 계약 §4-4: 후보는 1~3개 가변(화보 실패분은 서버가 제외) — 온 만큼만 렌더, 목업으로 채우지 않는다
  const looks = Array.isArray(outfits) ? outfits : []

  return (
    <main className="outfit-recommendation-screen" data-node-id="53:606">
      <header className="outfit-recommendation-header">
        <button type="button" aria-label="뒤로 가기" onClick={() => navigate('/styling')}><img src="/assets/outfit-recommendation/mark.svg" alt="" /></button>
        <div><strong>AI 스타일리스트</strong><span>AI STYLIST</span></div>
      </header>

      <section className="outfit-recommendation-title">
        <h1>{selectedMood.label ? `${selectedMood.label}을 위한 추천 코디` : '추천 코디'}</h1>
        <p>{selectedMood.labelEn ? `LOOKS FOR ${selectedMood.labelEn}` : 'RECOMMENDED LOOKS'}</p>
      </section>

      <section className="outfit-recommendation-list" aria-label="추천 코디 목록">
        {looks.length === 0 && (
          <div className="outfit-recommendation-empty">
            <p>아직 추천 코디가 없어요. 무드를 골라 코디를 만들어 보세요.</p>
            <button type="button" onClick={() => navigate('/styling')}>무드 선택하러 가기</button>
          </div>
        )}
        {looks.map((look, index) => (
          <article className="outfit-recommendation-card" key={index} onClick={() => { sessionStorage.setItem('mcm_selected_outfit_index', String(index)); navigate('/styling/recommendation/detail') }} role="button" tabIndex="0">
            <div className="outfit-recommendation-image"><img src={assetUrl(look.imageUrl)} alt={`LOOK ${index + 1}`} /></div>
            {/* concept=제목(영어 작명, 폴백이면 없음) · reason=추천 이유 본문 — 계약 §4-4 */}
            <div className="outfit-recommendation-copy"><strong>LOOK {index + 1}{look.concept ? ` · ${look.concept}` : ''}</strong><p>{look.reason}</p></div>
          </article>
        ))}
      </section>

      <button className="outfit-log-button" type="button" onClick={() => navigate('/archive')}>
        <span>코디 기록하기</span>
        <small>UPLOAD MY STYLE LOG</small>
      </button>

      <BottomNav active="style" />
    </main>
  )
}

function OutfitDetailPage() {
  const navigate = useNavigate()
  const outfits = JSON.parse(sessionStorage.getItem('mcm_outfits') || '[]')
  const index = Number(sessionStorage.getItem('mcm_selected_outfit_index') || 0)
  const outfit = outfits[index] || {}
  const closetItems = outfit.closetItems || []
  const imageUrl = assetUrl(outfit.imageUrl)
  // concept=제목 · reason=본문 — 서로 대체 관계가 아니다 (계약 §4-4)
  const reason = outfit.reason || ''

  return (
    <main className="outfit-detail-screen" data-node-id="268:168">
      <header className="outfit-detail-header">
        <button type="button" aria-label="뒤로 가기" onClick={() => navigate('/styling/recommendation')}><img src="/assets/outfit-detail/mark.svg" alt="" /></button>
        <div><strong>추천 코디</strong><span>LOOKS</span></div>
      </header>

      <h1 className="outfit-detail-look-title">LOOK {index + 1}{outfit.concept ? ` · ${outfit.concept}` : ''}</h1>
      <img className="outfit-detail-image" src={imageUrl} alt={`LOOK ${index + 1}`} />

      {reason && (
        <section className="outfit-detail-description">
          <p>{reason}</p>
        </section>
      )}

      <section className="outfit-detail-items">
        <h2>사용된 아이템</h2><span>ITEMS USED</span>
        <div className="used-item"><b>내 옷장</b><p>{closetItems.map((item) => item.name || scanItemName(item)).filter(Boolean).join(', ') || '—'}</p></div>
        {outfit.mcmProduct && (
          <div className="used-item"><b>MCM 추천</b><p>{outfit.mcmProduct.name}</p>{outfit.mcmProduct.id && <Link to={`/products/${outfit.mcmProduct.id}`}>보러가기</Link>}</div>
        )}
      </section>

      <div className="outfit-detail-actions">
        <button className="outfit-detail-upload" type="button" onClick={() => navigate('/archive')}><span>이 코디 기록하기</span><small>UPLOAD THIS STYLE LOG</small></button>
      </div>

      <BottomNav active="style" />
    </main>
  )
}

function StyleLogPage() {
  const navigate = useNavigate()
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [wornDate] = useState(() => sessionStorage.getItem('mcm_log_date') || new Date().toISOString().slice(0, 10))
  const outfit = JSON.parse(sessionStorage.getItem('mcm_outfits') || '[]')[Number(sessionStorage.getItem('mcm_selected_outfit_index') || 0)] || {}

  async function handleSave() {
    if (!outfit.moodId) {
      setMessage('먼저 추천 코디를 선택해 주세요.')
      return
    }
    setIsSaving(true)
    setMessage('')
    try {
      const savedLook = await apiRequest('/api/v1/looks', {
        method: 'POST',
        body: JSON.stringify({
          moodId: outfit.moodId,
          closetItemIds: (outfit.closetItems || []).map((item) => item.id).filter(Boolean),
          mcmProductId: outfit.mcmProduct?.id || null,
          imageUrl: outfit.imageUrl || null,
          // 계약 §4-5: concept=후보 값 그대로(60자 제한) · note=사용자 소감 — 섞으면 60자 초과 400
          concept: outfit.concept || null,
          note: note || null,
          reason: outfit.reason || '',
          wornDate,
        }),
      })
      sessionStorage.setItem('mcm_saved_look', JSON.stringify(savedLook))
      sessionStorage.removeItem('mcm_log_date')
      navigate('/archive/detail')
    } catch (saveError) {
      setMessage(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="style-log-screen" data-node-id="53:349">
      <header className="style-log-header">
        <button type="button" aria-label="뒤로 가기" onClick={() => navigate('/styling/recommendation/detail')}><img src="/assets/style-log/mark.svg" alt="" /></button>
        <div><strong>코디 기록</strong><span>MY STYLE LOG</span></div>
      </header>

      <section className="style-log-upload-section">
        <h1>기록할 코디</h1><p>{formatWornDate(wornDate)}</p>
        <div className="style-log-photo-box has-photo">
          {outfit.imageUrl
            ? <img src={assetUrl(outfit.imageUrl)} alt="기록할 코디 화보" />
            : <p className="style-log-photo-empty">추천 코디를 먼저 선택해 주세요.</p>}
        </div>
      </section>

      <section className="style-log-note-card">
        <h2>이 코디 어땠어요 ?</h2><span>How do you feel about this outfit ?</span>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="오늘의 룩, 기분, 장소 등을 자유롭게 남겨주세요." />
      </section>

      {message && <p className="style-log-message" role="status">{message}</p>}
      <button className="style-log-submit" type="button" onClick={handleSave} disabled={isSaving}><span>{isSaving ? '저장 중' : '업로드하기'}</span><small>{isSaving ? 'SAVING' : 'UPLOAD'}</small></button>

      <BottomNav active="style" />
    </main>
  )
}

function StyleLogDetailPage() {
  const navigate = useNavigate()
  const [look, setLook] = useState(() => JSON.parse(sessionStorage.getItem('mcm_saved_look') || 'null'))
  const candidate = useMemo(
    () => JSON.parse(sessionStorage.getItem('mcm_outfits') || '[]')[Number(sessionStorage.getItem('mcm_selected_outfit_index') || 0)] || {},
    [],
  )
  const [fetchedProduct, setFetchedProduct] = useState(null)
  const [fetchedItems, setFetchedItems] = useState([])

  // 세션의 후보 데이터는 "방금 저장한 그 룩"과 구성이 일치할 때만 신뢰한다 —
  // 캘린더로 연 옛 룩에 최신 후보의 아이템·제품 이름이 섞이면 안 됨
  const lookItemIds = (look?.closetItemIds || []).slice().sort((a, b) => a - b).join(',')
  const candidateMatches =
    Boolean(look) &&
    candidate.mcmProduct?.id === look.mcmProductId &&
    (candidate.closetItems || []).map((item) => item.id).sort((a, b) => a - b).join(',') === lookItemIds

  useEffect(() => {
    if (!look?.id) return
    apiRequest(`/api/v1/looks/${look.id}`).then(setLook).catch(() => {})
  }, [look?.id])

  // 계약 §4-5: 저장된 룩은 mcmProductId·closetItemIds(아이디만) — 표시 이름은 조회해 채운다
  useEffect(() => {
    if (candidateMatches || !look?.mcmProductId) return
    apiRequest(`/api/v1/mcm-products/${look.mcmProductId}`).then(setFetchedProduct).catch(() => {})
  }, [candidateMatches, look?.mcmProductId])

  useEffect(() => {
    if (candidateMatches || !lookItemIds) return
    const ids = lookItemIds.split(',').map(Number)
    apiRequest('/api/v1/closet-items')
      .then((all) => setFetchedItems((Array.isArray(all) ? all : []).filter((item) => ids.includes(item.id))))
      .catch(() => {})
  }, [candidateMatches, lookItemIds])

  const closetItems = candidateMatches ? candidate.closetItems || [] : fetchedItems
  const product = candidateMatches ? candidate.mcmProduct : fetchedProduct
  const imageUrl = assetUrl(look?.generatedImageUrl || (candidateMatches ? candidate.imageUrl : ''))
  const concept = look?.concept
  const bodyText = look?.note || look?.reason || ''

  return (
    <main className="style-log-detail-screen" data-node-id="257:558">
      <header className="style-log-detail-header">
        <button type="button" aria-label="뒤로 가기" onClick={() => navigate('/archive')}><img src="/assets/style-log-detail/mark.svg" alt="" /></button>
        <div><strong>코디 기록</strong><span>MY STYLE LOG</span></div>
      </header>
      <img className="style-log-detail-image" src={imageUrl} alt="저장한 코디" />
      <section className="style-log-detail-note">
        <strong>{formatWornDate(look?.wornDate)}{concept ? ` · ${concept}` : ''}</strong>
        {bodyText && <p>{bodyText}</p>}
      </section>
      <section className="style-log-detail-items">
        <div className="style-log-used-item"><b>내 옷장</b><p>{closetItems.map((item) => item.name || scanItemName(item)).filter(Boolean).join(', ') || '—'}</p></div>
        {product && (
          <div className="style-log-used-item"><b>MCM 추천</b><p>{product.name}</p>{product.id && <Link to={`/products/${product.id}`}>보러가기</Link>}</div>
        )}
      </section>
      <BottomNav active="style" />
    </main>
  )
}

function StyleCalendarPage() {
  const navigate = useNavigate()
  const [viewDate] = useState(() => new Date())
  const [looks, setLooks] = useState([])
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`

  useEffect(() => {
    apiRequest(`/api/v1/looks?month=${monthKey}`)
      .then((result) => setLooks(Array.isArray(result) ? result : []))
      .catch(() => setLooks([]))
  }, [monthKey])

  const markedDates = looks.map((look) => Number(String(look.wornDate).slice(-2)))
  const firstDay = new Date(year, month, 1)
  const mondayOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: mondayOffset + daysInMonth }, (_, index) => index < mondayOffset ? null : index - mondayOffset + 1)

  return (
    <main className="style-calendar-screen" data-node-id="257:209">
      <header className="style-calendar-header">
        <button type="button" aria-label="뒤로 가기" onClick={() => navigate('/archive')}><img src="/assets/style-calendar/mark.svg" alt="" /></button>
        <div><strong>코디 캘린더</strong><span>STYLE CALENDAR</span></div>
      </header>
      <div className="style-calendar-message"><img src="/assets/style-calendar/calendar-puppy.png" alt="" /><span>그동안의 코디를 확인해볼까요 ?</span></div>
      <section className="calendar-card" aria-label={`${year}년 ${month + 1}월 코디 캘린더`}>
        <div className="calendar-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid">
          {cells.map((day, index) => (
            <button key={`${index}-${day || 'empty'}`} className={day && markedDates.includes(day) ? 'marked' : ''} type="button" disabled={!day} onClick={() => {
              const look = looks.find((item) => Number(String(item.wornDate).slice(-2)) === day)
              if (look?.id) {
                sessionStorage.setItem('mcm_saved_look', JSON.stringify(look))
                navigate('/archive/detail')
              } else if (day) {
                sessionStorage.setItem('mcm_log_date', `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
                navigate('/archive')
              }
            }}>{day || ''}</button>
          ))}
        </div>
      </section>
      <BottomNav active="style" />
    </main>
  )
}

function ClosetAddCompletePage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const scanResult = useMemo(() => JSON.parse(sessionStorage.getItem('mcm_scan_result') || 'null'), [])
  const itemName = scanItemName(scanResult?.tags)
  const itemImage = assetUrl(scanResult?.cutoutUrl || scanResult?.originalUrl)

  useEffect(() => {
    if (!scanResult) {
      navigate('/closet/scan')
      return
    }

    const request = {
      source: 'OWN',
      category: scanResult.tags?.category,
      color: scanResult.tags?.color,
      material: scanResult.tags?.material,
      mood: scanResult.tags?.mood,
      imageUrl: scanResult.originalUrl,
      cutoutUrl: scanResult.cutoutUrl,
    }

    apiRequest('/api/v1/closet-items', { method: 'POST', body: JSON.stringify(request) })
      .then((item) => sessionStorage.setItem('mcm_last_closet_item', JSON.stringify(item)))
      .catch((requestError) => setError(requestError.message))
  }, [navigate, scanResult])

  return (
    <main className="closet-add-complete-screen" data-node-id="53:512">
      <section className="closet-add-complete-content" aria-live="polite">
        <img className="closet-add-complete-image" src={itemImage} alt={itemName} />
        <div className="closet-add-complete-copy">
          <h1>옷장에 추가됐어요 !</h1>
          <p className="closet-add-complete-english">ADDED TO YOUR CLOSET</p>
          <p className="closet-add-complete-item">{itemName}가<br />내 옷장에 들어왔어요</p>
        </div>
        {error && <p className="closet-add-complete-error" role="alert">{error}</p>}
      </section>

      <button className="closet-add-complete-button" type="button" onClick={() => navigate('/closet')}>
        <span>옷장으로 가기</span>
        <small>GO TO MY CLOSET</small>
      </button>

      <BottomNav active="closet" />
    </main>
  )
}

function ProfilePage() {
  const navigate = useNavigate()
  const [me, setMe] = useState({ nickname: '', email: '' })
  const [looks, setLooks] = useState([])
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    Promise.all([
      apiRequest('/api/v1/me'),
      apiRequest('/api/v1/looks'),
    ])
      .then(([profile, savedLooks]) => {
        setMe(profile)
        if (Array.isArray(savedLooks)) setLooks(savedLooks)
      })
      .catch(() => {})
  }, [])

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await apiRequest('/api/v1/auth/logout', { method: 'POST' })
    } catch (error) {
      // 토큰이 이미 만료된 경우에도 로컬 세션은 정리한다.
    } finally {
      localStorage.removeItem('mcm_access_token')
      sessionStorage.clear()
      navigate('/login', { replace: true })
    }
  }

  return (
    <main className="profile-screen" data-node-id="4:2912">
      <div className="profile-content">
        <header className="profile-header">
          <button className="profile-back-button" type="button" aria-label="홈으로 가기" onClick={() => navigate('/')}>
            <img src="/assets/profile/back.svg" alt="" />
          </button>
          <div><strong>프로필</strong><span>PROFILE</span></div>
          <span />
        </header>

        <section className="profile-identity">
          <div className="profile-avatar">
            <img src="/assets/profile/profile-mascot.png" alt="프로필 이미지" />
          </div>
          <h1>{me.nickname || ' '}</h1>
          {me.email && <p>{me.email}</p>}
        </section>

        <section className="profile-stats-grid">
          <button type="button" className="profile-stat-card profile-stat-card-wide" onClick={() => navigate('/archive/calendar')}>
            <span className="profile-stat-icon"><img src="/assets/profile/looks.svg" alt="" /></span>
            <span className="profile-stat-label">저장한 코디</span>
            <strong>{looks.length} <small>looks</small></strong>
          </button>
        </section>
        <section className="profile-logout">
          <button type="button" onClick={handleLogout} disabled={isLoggingOut}>{isLoggingOut ? '로그아웃 중...' : '로그아웃'}</button>
          <span>MCM MUSE</span>
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const result = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      localStorage.setItem('mcm_access_token', result.accessToken)
      navigate('/')
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-screen" data-node-id="65:2">
      <div className="login-content">
        <div className="login-heading" data-node-id="72:110">
          <p>로그인</p>
          <p>LOGIN</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="email">이메일 주소</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            data-node-id="66:18"
          />
          <label className="sr-only" htmlFor="password">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            data-node-id="66:20"
          />
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="login-submit" type="submit" disabled={isSubmitting} data-node-id="210:2">
            <span>{isSubmitting ? '로그인 중' : '로그인'}</span>
            <small>{isSubmitting ? 'PLEASE WAIT' : 'LOGIN'}</small>
          </button>
        </form>

        <Link className="signup-link" to="/signup" data-node-id="65:12">
          <span className="mcm-wordmark">MCM</span> 회원가입
        </Link>
      </div>
    </main>
  )
}

function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nickname: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const result = await apiRequest('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          nickname: form.nickname,
        }),
      })
      localStorage.setItem('mcm_access_token', result.accessToken)
      navigate('/')
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="signup-screen" data-node-id="72:38">
      <div className="signup-content">
        <div className="signup-heading" data-node-id="72:111">
          <p>회원가입</p>
          <p>SIGN UP</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="nickname">성명</label>
          <input id="nickname" name="nickname" placeholder="성명*" value={form.nickname} onChange={updateField} required />
          <label className="sr-only" htmlFor="signup-email">이메일 주소</label>
          <input id="signup-email" name="email" type="email" placeholder="이메일 주소*" value={form.email} onChange={updateField} required />
          <label className="sr-only" htmlFor="signup-password">비밀번호</label>
          <input id="signup-password" name="password" type="password" placeholder="비밀번호*" value={form.password} onChange={updateField} required />

          <p className="signup-required-note">*표시가 있는 모든 항목은 필수입니다.</p>
          {error && <p className="signup-error" role="alert">{error}</p>}

          <button className="signup-submit" type="submit" disabled={isSubmitting} data-node-id="72:47">
            <span>{isSubmitting ? '가입 중' : '회원가입'}</span>
            <small>{isSubmitting ? 'PLEASE WAIT' : 'SIGN UP'}</small>
          </button>
        </form>
      </div>
    </main>
  )
}

function PlaceholderPage({ title }) {
  return (
    <main className="page-shell">
      <section className="placeholder-card">
        <p className="eyebrow">MCM MUSE</p>
        <h1>{title}</h1>
        <p>Figma 프레임을 연결해 실제 화면으로 구현할 영역입니다.</p>
        <Link className="button button-primary" to="/">홈으로 돌아가기</Link>
      </section>
    </main>
  )
}

function ProtectedRoute({ children }) {
  const accessToken = localStorage.getItem('mcm_access_token')
  return accessToken ? children : <Navigate to="/login" replace />
}

function RootPage() {
  const [showSplash, setShowSplash] = useState(() => sessionStorage.getItem('mcm_intro_seen') !== 'true')

  useEffect(() => {
    if (!showSplash) return undefined

    const timer = window.setTimeout(() => {
      sessionStorage.setItem('mcm_intro_seen', 'true')
      setShowSplash(false)
    }, 1400)

    return () => window.clearTimeout(timer)
  }, [showSplash])

  if (showSplash) return <SplashPage />
  if (localStorage.getItem('mcm_access_token')) return <HomePage />
  return <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootPage />} />
      <Route path="/auth/request" element={<LoginRequestPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/closet" element={<ProtectedRoute><ClosetPage /></ProtectedRoute>} />
      <Route path="/closet/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
      <Route path="/closet/scan/recognize" element={<ProtectedRoute><RecognizeResultPage /></ProtectedRoute>} />
      <Route path="/closet/scan/recognize/complete" element={<ProtectedRoute><ClosetAddCompletePage /></ProtectedRoute>} />
      <Route path="/style-dna" element={<ProtectedRoute><StyleDnaPage /></ProtectedRoute>} />
      <Route path="/products/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
      <Route path="/products/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><PlaceholderPage title="MCM 상품" /></ProtectedRoute>} />
      <Route path="/styling" element={<ProtectedRoute><MoodSelectionPage /></ProtectedRoute>} />
      <Route path="/styling/recommendation" element={<ProtectedRoute><OutfitRecommendationPage /></ProtectedRoute>} />
      <Route path="/styling/recommendation/detail" element={<ProtectedRoute><OutfitDetailPage /></ProtectedRoute>} />
      <Route path="/archive" element={<ProtectedRoute><StyleLogPage /></ProtectedRoute>} />
      <Route path="/archive/detail" element={<ProtectedRoute><StyleLogDetailPage /></ProtectedRoute>} />
      <Route path="/archive/calendar" element={<ProtectedRoute><StyleCalendarPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="*" element={<PlaceholderPage title="페이지를 찾을 수 없습니다" />} />
    </Routes>
  )
}

export default App
