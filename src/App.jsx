import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { apiRequest, assetUrl, getAiUrl, getBackendUrl, saveServerUrls } from './api/client.js'

const loadingPuppyImage = '/assets/loading-puppy.png'
const loadingCompletePuppyImage = '/assets/loading-puppy-complete.png'
const loadingStylingPuppyImage = '/assets/loading-puppy-styling.png'
const loadingOutfitPuppyImage = '/assets/loading-puppy-outfit.png'
const splashPuppyImage = '/assets/splash-puppy.png'
const loginRequestPuppyImage = '/assets/login-request-puppy.png'
const homePuppyImage = '/assets/home/home-puppy.png'

const fallbackProducts = [
  { id: 1, name: 'Stark 디스코 비세토스 백팩', price: 2150000, imageUrl: '/assets/home/product-1.png' },
  { id: 2, name: 'Aren 비세토스 닥스훈트 2D 참', price: 270000, imageUrl: '/assets/home/product-2.png' },
  { id: 3, name: 'Aren 비세토스 멀티 백팩', price: 2250000, imageUrl: '/assets/home/product-3.png' },
  { id: 4, name: 'Stark 비세토스 백팩 M', price: 1890000, imageUrl: '/assets/home/product-4.png' },
]

const fallbackClosetItems = [
  { id: 1, brand: 'MCM', name: 'Aren 비세토스 숄더백', imageUrl: '/assets/closet/closet-item-1.png' },
  { id: 2, brand: 'POLO', name: '스트라이프 블루 셔츠', imageUrl: '/assets/closet/closet-item-2.png' },
  { id: 3, brand: 'MUSINSA', name: '베이직 블랙 벨트', imageUrl: '/assets/closet/closet-item-2.png', imageClass: 'belt' },
  { id: 4, brand: 'MCM', name: 'Stark 비세토스 백팩', imageUrl: '/assets/closet/closet-item-4.png' },
]

const fallbackRecommendations = [
  { id: 1, name: 'Liz 엠보스드 모노그램 레더 쇼퍼', englishName: 'Liz embossed leather shopper', price: 1490000, imageUrl: '/assets/recommendations/recommend-3.png' },
  { id: 2, name: 'Tracy 비세토스 숄더백', englishName: 'Tracy visetos shoulder bag', price: 1450000, imageUrl: '/assets/recommendations/recommend-2.png' },
  { id: 3, name: 'Aren 비세토스 E/W 숄더백', englishName: 'Aren visetos E/W shoulder bag', price: 1090000, imageUrl: '/assets/recommendations/recommend-1.png' },
  { id: 4, name: '루렉스 데님 모노그램 포켓 셔츠', englishName: 'Lurex denim monogram pocket shirt', price: 830000, imageUrl: '/assets/recommendations/recommend-4.png' },
]

const categoryOptions = [
  { label: 'ALL', value: '' },
  { label: 'BAGS', value: '가방' },
  { label: 'ACCESSORIES', value: '악세서리' },
  { label: 'CLOTHES', value: 'clothes' },
]

const fallbackMoods = [
  { id: 2, label: '작업실 가는 날', labelEn: 'STUDIO DAY', iconKey: 'studio' },
  { id: 1, label: '저녁 약속', labelEn: 'DINNER DATE', iconKey: 'dinner' },
  { id: 3, label: '출장', labelEn: 'BUSINESS TRIP', iconKey: 'trip' },
  { id: 5, label: '저녁 산책', labelEn: 'WEEKEND WALK', iconKey: 'walk' },
]

function formatPrice(price) {
  return `₩${Number(price).toLocaleString('ko-KR')}`
}

function productCategory(product) {
  if (product.category === '가방') return 'BAGS'
  if (product.category === '악세서리') return 'ACCESSORIES'
  return 'CLOTHES'
}

function closetItemImage(item, index) {
  return assetUrl(item.cutoutUrl || item.imageUrl || fallbackClosetItems[index % fallbackClosetItems.length].imageUrl)
}

function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [products, setProducts] = useState(fallbackProducts)

  useEffect(() => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('query', query.trim())
    if (category && category !== 'clothes') params.set('category', category)
    const suffix = params.toString() ? `?${params.toString()}` : ''

    apiRequest(`/api/v1/mcm-products${suffix}`)
      .then((result) => {
        if (Array.isArray(result) && result.length > 0) setProducts(result)
      })
      .catch(() => {
        // 백엔드가 아직 실행되지 않은 개발 환경에서는 Figma 샘플 상품을 유지한다.
      })
  }, [query, category])

  const visibleProducts = useMemo(() => {
    if (category !== 'clothes') return products
    return products.filter((product) => productCategory(product) === 'CLOTHES')
  }, [products, category])

  return (
    <main className="home-screen" data-node-id="257:661">
      <header className="home-header">
        <button className="back-button" type="button" aria-label="뒤로 가기" onClick={() => window.history.back()} />
        <div className="home-heading"><strong>홈</strong><span>HOME</span></div>
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
        <button className="filter-button" type="button"><img src="/assets/home/filter.svg" alt="" /> 필터</button>
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
        {visibleProducts.map((product, index) => (
          <article
            className="product-card product-card-clickable"
            key={product.id ?? product.name}
            role="link"
            tabIndex={0}
            onClick={() => navigate(`/products/${product.id ?? 1}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                navigate(`/products/${product.id ?? 1}`)
              }
            }}
          >
            <div className="product-image-wrap">
              <img src={assetUrl(product.imageUrl || product.cutoutUrl || fallbackProducts[index % fallbackProducts.length].imageUrl)} alt="" />
              <button className="favorite-button" type="button" aria-label="찜하기" onClick={(event) => event.stopPropagation()}>
                <img src={`/assets/home/${index % 2 === 0 ? 'heart-outline.svg' : 'heart-filled.svg'}`} alt="" />
              </button>
            </div>
            <div className="product-info">
              <span className="product-brand">MCM</span>
              <p>{product.name}</p>
              <strong>{formatPrice(product.price)}</strong>
            </div>
          </article>
        ))}
      </section>

      <nav className="bottom-nav" aria-label="주요 메뉴">
        <Link className="active" to="/"><img src="/assets/home/home.svg" alt="" /><span>home</span></Link>
        <Link to="/closet"><img src="/assets/home/closet.svg" alt="" /><span>closet</span></Link>
        <Link to="/styling"><img src="/assets/home/style.svg" alt="" /><span>style</span></Link>
        <Link to="/profile"><img src="/assets/home/profile.svg" alt="" /><span>profile</span></Link>
      </nav>
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
  const [items, setItems] = useState(fallbackClosetItems)
  const [selectedIds, setSelectedIds] = useState([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const suffix = source ? `?source=${source}` : ''
    apiRequest(`/api/v1/closet-items${suffix}`)
      .then((result) => {
        if (Array.isArray(result)) setItems(result)
      })
      .catch(() => {
        // 인증 전 개발 화면에서는 Figma 샘플 아이템을 표시한다.
      })
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
        {items.map((item, index) => (
          <article
            className={`closet-card closet-selectable-card ${selectedIds.includes(item.id) ? 'selected' : ''}`}
            key={item.id ?? item.name}
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
            <div className={`closet-image-wrap ${item.imageClass ?? ''}`}>
              <img src={closetItemImage(item, index)} alt="" />
            </div>
            <div className="closet-info">
              <span>{item.brand ?? (item.source === 'MCM' ? 'MCM' : 'OWN')}</span>
              <p>{item.name}</p>
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

      <nav className="bottom-nav closet-bottom-nav" aria-label="주요 메뉴">
        <Link to="/"><img src="/assets/closet/closet-home.svg" alt="" /><span>home</span></Link>
        <Link className="active" to="/closet"><img src="/assets/closet/closet-closet.svg" alt="" /><span>closet</span></Link>
        <Link to="/styling"><img src="/assets/closet/closet-style.svg" alt="" /><span>style</span></Link>
        <Link to="/profile"><img src="/assets/closet/closet-profile.svg" alt="" /><span>profile</span></Link>
      </nav>
    </main>
  )
}

function DnaClosetPage() {
  const navigate = useNavigate()
  const [selectedIds, setSelectedIds] = useState([1, 2, 3])

  function toggleItem(id) {
    setSelectedIds((current) => current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id])
  }

  function buildDna() {
    sessionStorage.setItem('mcm_style_dna_item_ids', JSON.stringify(selectedIds))
    navigate('/style-dna')
  }

  return (
    <main className="closet-screen dna-closet-screen" data-node-id="210:424">
      <header className="closet-header">
        <button className="back-button" type="button" aria-label="뒤로 가기" onClick={() => navigate('/closet')} />
        <div className="closet-heading"><strong>내 옷장</strong><span>MY CLOSET</span></div>
        <button className="closet-filter-button" type="button"><img src="/assets/closet/closet-filter.svg" alt="" /> 필터</button>
      </header>

      <div className="closet-tabs" role="tablist" aria-label="옷장 출처">
        <button className="active" type="button">전체</button>
        <button type="button">MCM</button>
      </div>

      <section className="closet-grid" aria-label="스타일 DNA에 사용할 아이템">
        {fallbackClosetItems.map((item) => {
          const isSelected = selectedIds.includes(item.id)
          return (
            <button className="closet-card dna-item-card" key={item.id} type="button" onClick={() => toggleItem(item.id)} aria-pressed={isSelected}>
              <img className="dna-selection-icon" src={`/assets/closet/${isSelected ? 'selected.svg' : 'unselected.svg'}`} alt={isSelected ? '선택됨' : '선택 안 됨'} />
              <div className={`closet-image-wrap ${item.imageClass ?? ''}`}><img src={assetUrl(item.imageUrl)} alt="" /></div>
              <div className="closet-info"><span>{item.brand}</span><p>{item.name}</p></div>
            </button>
          )
        })}
      </section>

      <button className="add-item-button dna-build-button" type="button" onClick={buildDna} disabled={selectedIds.length === 0}>
        <span>스타일 DNA 만들기</span>
        <small>BUILD MY DNA</small>
      </button>

      <nav className="bottom-nav closet-bottom-nav" aria-label="주요 메뉴">
        <Link to="/"><img src="/assets/closet/closet-home.svg" alt="" /><span>home</span></Link>
        <Link className="active" to="/closet"><img src="/assets/closet/closet-closet.svg" alt="" /><span>closet</span></Link>
        <Link to="/styling"><img src="/assets/closet/closet-style.svg" alt="" /><span>style</span></Link>
        <Link to="/profile"><img src="/assets/closet/closet-profile.svg" alt="" /><span>profile</span></Link>
      </nav>
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
    const storedIds = JSON.parse(sessionStorage.getItem('mcm_style_dna_item_ids') || '[1,2,3]')
    const body = JSON.stringify({ closetItemIds: storedIds })

    Promise.all([
      apiRequest('/api/v1/style-dna', { method: 'POST', body }),
      apiRequest('/api/v1/recommendations', { method: 'POST', body }),
    ])
      .then(([dnaResult, recommendationResult]) => {
        setDna(dnaResult)
        setRecommendation(recommendationResult)
        setRequestState('success')
      })
      .catch((error) => {
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
              <img className="dna-colors" src="/assets/dna/dna-colors.svg" alt="스타일 컬러" />
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

      <nav className="bottom-nav style-dna-bottom-nav" aria-label="주요 메뉴">
        <Link to="/"><img src="/assets/dna/dna-home.svg" alt="" /><span>home</span></Link>
        <Link className="active" to="/closet"><img src="/assets/dna/dna-closet.svg" alt="" /><span>closet</span></Link>
        <Link to="/styling"><img src="/assets/dna/dna-style.svg" alt="" /><span>style</span></Link>
        <Link to="/profile"><img src="/assets/dna/dna-profile.svg" alt="" /><span>profile</span></Link>
      </nav>
    </main>
  )
}

function RecommendationsPage() {
  const [category, setCategory] = useState('ALL')
  const [products, setProducts] = useState(fallbackRecommendations)

  useEffect(() => {
    const ids = JSON.parse(sessionStorage.getItem('mcm_style_dna_item_ids') || '[1,2,3]')
    apiRequest('/api/v1/recommendations', { method: 'POST', body: JSON.stringify({ closetItemIds: ids }) })
      .then((result) => {
        const items = [result?.bestPick, ...(result?.more ?? [])]
          .filter(Boolean)
          .map((item) => ({
            id: item.product?.id,
            name: item.product?.name,
            englishName: item.reason,
            price: item.product?.price,
            imageUrl: item.product?.imageUrl,
          }))
        if (items.length > 0) setProducts(items)
      })
      .catch(() => {})
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
        {products.map((product, index) => (
          <Link className="recommendation-row" key={product.id ?? product.name} to={`/products/${product.id ?? 1}`}>
            <div className="recommendation-thumb"><img src={assetUrl(product.imageUrl || fallbackRecommendations[index % fallbackRecommendations.length].imageUrl)} alt="" /></div>
            <div className="recommendation-details">
              <p>{product.name}</p>
              <small>{product.englishName}</small>
              <strong>{formatPrice(product.price)}</strong>
            </div>
            <button className="recommendation-favorite" type="button" aria-label="찜하기">
              <img src={`/assets/recommendations/${index === 1 || index === 2 ? 'recommend-heart-filled.svg' : 'recommend-heart.svg'}`} alt="" />
            </button>
          </Link>
        ))}
      </section>

      <nav className="bottom-nav recommendations-bottom-nav" aria-label="주요 메뉴">
        <Link to="/"><img src="/assets/recommendations/recommend-home.svg" alt="" /><span>home</span></Link>
        <Link className="active" to="/closet"><img src="/assets/recommendations/recommend-closet.svg" alt="" /><span>closet</span></Link>
        <Link to="/styling"><img src="/assets/recommendations/recommend-style.svg" alt="" /><span>style</span></Link>
        <Link to="/profile"><img src="/assets/recommendations/recommend-profile.svg" alt="" /><span>profile</span></Link>
      </nav>
    </main>
  )
}

function ProductDetailPage() {
  const { id = '1' } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState({
    name: 'Tracy 비세토스 숄더백',
    englishName: 'Tracy visetos shoulder bag',
    price: 1450000,
    imageUrl: '/assets/detail/detail-item.png',
    color: 'Cognac',
    size: 'S',
  })
  const [isAddingToCloset, setIsAddingToCloset] = useState(false)
  const [closetMessage, setClosetMessage] = useState('')

  useEffect(() => {
    apiRequest(`/api/v1/mcm-products/${id}`)
      .then((result) => setProduct((current) => ({ ...current, ...result, englishName: current.englishName })))
      .catch(() => {})
  }, [id])

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

      <section className="detail-hero">
        <div className="detail-image-panel"><img src={assetUrl(product.imageUrl || '/assets/detail/detail-item.png')} alt={product.name} /></div>
        <div className="detail-overview">
          <h1>{product.name}</h1>
          <p className="detail-english">{product.englishName}</p>
          <strong className="detail-price">{formatPrice(product.price)}</strong>
          <span className="detail-color-dot" />
          <p className="detail-options">color: {product.color || 'Cognac'}<br />size: {product.size || 'S'}</p>
        </div>
      </section>

      <section className="detail-description">
        우아한 로고 락 클로저가 돋보이는 Tracy(트레이시) 숄더백은 클래식한 호보 디자인에서 영감을 받았으며, 시그니처 비세토스 캔버스 바디 전면을 부드러운 나파 가죽으로 감싸 고급스러움을 더했습니다. 마이크로파이버 스웨이드 안감은 극도의 부드러움과 세련된 무드를 선사하며, 소지품을 더욱 안전하게 보관할 수 있습니다.
      </section>

      <button className="detail-info-row size-row" type="button"><img src="/assets/detail/size-icon.svg" alt="" /><span>사이즈 가이드<small>SIZE GUIDE</small></span><img src="/assets/detail/arrow-right.svg" alt="" /></button>
      <button className="detail-info-row material-row" type="button"><img src="/assets/detail/material-icon.svg" alt="" /><span>지속가능성 & 소재<small>MATERIALS</small></span><img src="/assets/detail/arrow-down.svg" alt="" /></button>

      <div className="detail-actions">
        <a
          className="buy-button"
          href={product.productUrl || 'https://kr.mcmworldwide.com/'}
          aria-label={`${product.name} MCM 공식몰에서 바로 구매`}
        >
          바로구매<small>BUY NOW</small>
        </a>
        <button className="reserve-button" type="button">매장 픽업 예약<small>RESERVE IN-STORE</small></button>
      </div>

      <button className="closet-add-detail-button" type="button" onClick={handleAddToCloset} disabled={isAddingToCloset}>
        <span>{isAddingToCloset ? '추가 중...' : '옷장에 편입하기'}</span>
        <small>{isAddingToCloset ? 'ADDING TO CLOSET' : 'ADD TO MY CLOSET'}</small>
      </button>
      {closetMessage && <p className="closet-add-detail-message" role="status">{closetMessage}</p>}

      <nav className="bottom-nav detail-bottom-nav" aria-label="주요 메뉴">
        <Link to="/"><img src="/assets/detail/detail-home.svg" alt="" /><span>home</span></Link>
        <Link className="active" to="/closet"><img src="/assets/detail/detail-closet.svg" alt="" /><span>closet</span></Link>
        <Link to="/styling"><img src="/assets/detail/detail-style.svg" alt="" /><span>style</span></Link>
        <Link to="/profile"><img src="/assets/detail/detail-profile.svg" alt="" /><span>profile</span></Link>
      </nav>
    </main>
  )
}

function CheckoutPage() {
  const { id = '1' } = useParams()
  const navigate = useNavigate()
  const [deliveryMode, setDeliveryMode] = useState('pickup')
  const [selectedStore, setSelectedStore] = useState('cheongdam')
  const [paymentMethod, setPaymentMethod] = useState(false)
  const [message, setMessage] = useState('')

  function handlePay() {
    if (deliveryMode === 'pickup' && !selectedStore) {
      setMessage('픽업 매장을 선택해주세요.')
      return
    }
    if (!paymentMethod) {
      setMessage('결제 수단을 선택해주세요.')
      return
    }
    setMessage('결제 API 연결 후 주문이 완료됩니다.')
  }

  return (
    <main className="checkout-screen" data-node-id="53:262">
      <header className="checkout-header">
        <button className="back-button" type="button" aria-label="뒤로 가기" onClick={() => navigate(`/products/${id}`)} />
        <div><strong>예약 & 결제</strong><span>CHECKOUT</span></div>
      </header>

      <section className="checkout-product">
        <div><img src="/assets/checkout/checkout-item.png" alt="Tracy 비세토스 숄더백" /></div>
        <p>Tracy 비세토스 숄더백<small>Tracy visetos shoulder bag</small><strong>₩1,450,000</strong></p>
      </section>

      <div className="delivery-tabs">
        <button className={deliveryMode === 'pickup' ? 'active' : ''} type="button" onClick={() => setDeliveryMode('pickup')}>매장 픽업</button>
        <button className={deliveryMode === 'delivery' ? 'active' : ''} type="button" onClick={() => setDeliveryMode('delivery')}>온라인 배송</button>
      </div>

      {deliveryMode === 'pickup' ? (
        <section className="store-list" aria-label="픽업 매장 선택">
          <button className={`store-card ${selectedStore === 'cheongdam' ? 'selected' : ''}`} type="button" onClick={() => setSelectedStore('cheongdam')}>
            <span><b>MCM</b> 청담 플래그십 스토어<small>서울 강남구 압구정로 412</small><em>2시간 내 준비</em><i>1.2 km</i></span>
            <img src={`/assets/checkout/${selectedStore === 'cheongdam' ? 'checkout-selected.svg' : 'checkout-unselected.svg'}`} alt="" />
          </button>
          <button className={`store-card ${selectedStore === 'lotte' ? 'selected' : ''}`} type="button" onClick={() => setSelectedStore('lotte')}>
            <span><b>MCM</b> 롯데백화점 본점<small>서울 중구 남대문로 81</small><em>내일 오후 준비</em><i>4.5 km</i></span>
            <img src={`/assets/checkout/${selectedStore === 'lotte' ? 'checkout-selected.svg' : 'checkout-unselected.svg'}`} alt="" />
          </button>
        </section>
      ) : (
        <section className="delivery-message">온라인 배송 주소를 입력하면 배송 가능 여부를 확인합니다.</section>
      )}

      <button className={`payment-method ${paymentMethod ? 'chosen' : ''}`} type="button" onClick={() => setPaymentMethod((current) => !current)}>
        <img src="/assets/checkout/payment.svg" alt="" />
        <span>결제 수단 선택<small>{paymentMethod ? 'CARD •••• 1234' : 'SELECT PAYMENT METHOD'}</small></span>
        <img src="/assets/checkout/checkout-arrow.svg" alt="" />
      </button>

      {message && <p className="checkout-message" role="status">{message}</p>}

      <section className="checkout-total">
        <p>총 결제 금액<strong>₩1,450,000</strong></p>
        <button type="button" onClick={handlePay}><span>결제하기</span><small>PAY</small></button>
      </section>
    </main>
  )
}

function ScanPage() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('/assets/scan/scan-item.png')
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
        <img className="scan-item-image" src={previewUrl} alt="선택한 아이템" />
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
        <Link className="product-scan-button" to="/closet/scan/product" aria-label="제품 보기">
          <img src="/assets/scan/product-button.svg" alt="제품 보기" />
        </Link>
      </div>

      <button className="scan-submit" type="button" onClick={handleUpload} disabled={isUploading}>
        {isUploading ? '분석 중...' : selectedFile ? '아이템 분석하기' : '사진을 선택해주세요'}
      </button>

      <nav className="bottom-nav scan-bottom-nav" aria-label="주요 메뉴">
        <Link to="/"><img src="/assets/scan/scan-home.svg" alt="" /><span>home</span></Link>
        <Link className="active" to="/closet"><img src="/assets/scan/scan-closet.svg" alt="" /><span>closet</span></Link>
        <Link to="/styling"><img src="/assets/scan/scan-style.svg" alt="" /><span>style</span></Link>
        <Link to="/profile"><img src="/assets/scan/scan-profile.svg" alt="" /><span>profile</span></Link>
      </nav>
    </main>
  )
}

function ProductScanPage() {
  const navigate = useNavigate()

  return (
    <main className="scan-screen product-scan-screen" data-node-id="210:180">
      <header className="scan-header">
        <button className="back-button" type="button" aria-label="뒤로 가기" onClick={() => navigate('/closet/scan')} />
        <div className="scan-heading"><strong>아이템 추가하기</strong><span>ADD ITEM</span></div>
      </header>

      <section className="scan-preview" aria-label="MCM 상품 미리보기">
        <div className="scan-frame" />
        <img className="scan-item-image product-scan-image" src="/assets/scan/scan-product.png" alt="MCM 비세토스 백팩" />
        <img className="scan-plus" src="/assets/scan/scan-plus.svg" alt="" />
      </section>

      <div className="scan-actions">
        <label className="album-button" aria-label="앨범에서 추가하기">
          <img src="/assets/scan/album-button.svg" alt="앨범에서 추가하기" />
          <input type="file" accept="image/*" />
        </label>
        <button className="camera-button" type="button" aria-label="카메라로 촬영">
          <img src="/assets/scan/product-scan-camera.svg" alt="카메라로 촬영" />
        </button>
        <Link className="product-scan-button" to="/closet/scan/product/details" aria-label="제품 보기">
          <img src="/assets/scan/product-button.svg" alt="제품 보기" />
        </Link>
      </div>

      <nav className="bottom-nav scan-bottom-nav" aria-label="주요 메뉴">
        <Link to="/"><img src="/assets/scan/scan-home.svg" alt="" /><span>home</span></Link>
        <Link className="active" to="/closet"><img src="/assets/scan/scan-closet.svg" alt="" /><span>closet</span></Link>
        <Link to="/styling"><img src="/assets/scan/scan-style.svg" alt="" /><span>style</span></Link>
        <Link to="/profile"><img src="/assets/scan/scan-profile.svg" alt="" /><span>profile</span></Link>
      </nav>
    </main>
  )
}

function ScannedProductDetailPage() {
  const navigate = useNavigate()

  return (
    <main className="scanned-detail-screen" data-node-id="210:231">
      <header className="detail-header">
        <button className="back-button" type="button" aria-label="뒤로 가기" onClick={() => navigate('/closet/scan/product')} />
        <div><strong>제품 보기</strong><span>DETAILS</span></div>
      </header>

      <section className="scanned-detail-hero">
        <div className="scanned-detail-image"><img src="/assets/scanned-detail/scanned-detail-item.png" alt="Stark 사이드 스터드 비세토스 백팩" /></div>
        <div className="scanned-detail-overview">
          <h1>Stark 사이드 스터드 비세토스 백팩</h1>
          <p>Stark side stud visetos backpack</p>
          <strong>₩1,650,000</strong>
          <span className="scanned-color-dot" />
          <p>color: Cognac</p>
          <p>size: S</p>
        </div>
      </section>

      <p className="scanned-description">MCM의 아이코닉한 비세토스 캔버스에 사이드 스터드 디테일을 더한 백팩입니다. 넉넉한 수납공간과 실용적인 디자인으로 데일리 룩에 활용하기 좋습니다.</p>
      <button className="scanned-info-row scanned-size-row" type="button">
        <img src="/assets/scanned-detail/scanned-detail-size.svg" alt="" /><span>사이즈 가이드</span><img src="/assets/scanned-detail/scanned-detail-down.svg" alt="" />
      </button>
      <div className="scanned-info-row scanned-material-row">
        <img src="/assets/scanned-detail/scanned-detail-leaf.svg" alt="" /><span>소재<br /><small>Visetos coated canvas</small></span>
      </div>

      <nav className="bottom-nav scanned-detail-bottom-nav" aria-label="주요 메뉴">
        <Link className="active" to="/"><img src="/assets/scanned-detail/scanned-detail-home.svg" alt="" /><span>home</span></Link>
        <Link to="/closet"><img src="/assets/scanned-detail/scanned-detail-closet.svg" alt="" /><span>closet</span></Link>
        <Link to="/styling"><img src="/assets/scanned-detail/scanned-detail-style.svg" alt="" /><span>style</span></Link>
        <Link to="/profile"><img src="/assets/scanned-detail/scanned-detail-profile.svg" alt="" /><span>profile</span></Link>
      </nav>
    </main>
  )
}

function RecognizeResultPage() {
  const navigate = useNavigate()
  const scanResult = useMemo(() => JSON.parse(sessionStorage.getItem('mcm_scan_result') || 'null'), [])
  const itemName = scanResult?.name || 'POLO 스트라이프 블루 셔츠'
  const itemImage = assetUrl(scanResult?.cutoutUrl || scanResult?.originalUrl || '/assets/recognize/recognize-item.png')

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

      <div className="recognize-actions">
        <button type="button" onClick={() => navigate('/closet/scan')}><strong>다시 스캔하기</strong><span>SCAN AGAIN</span></button>
        <button type="button" onClick={() => navigate('/closet/scan/recognize/complete')}><strong>옷장에 넣기</strong><span>PUT IN MY CLOSET</span></button>
      </div>

      <nav className="bottom-nav recognize-bottom-nav" aria-label="주요 메뉴">
        <Link to="/"><img src="/assets/recognize/home.svg" alt="" /><span>home</span></Link>
        <Link className="active" to="/closet"><img src="/assets/recognize/closet.svg" alt="" /><span>closet</span></Link>
        <Link to="/styling"><img src="/assets/recognize/style.svg" alt="" /><span>style</span></Link>
        <Link to="/profile"><img src="/assets/recognize/profile.svg" alt="" /><span>profile</span></Link>
      </nav>
    </main>
  )
}

function MoodSelectionPage() {
  const navigate = useNavigate()
  const [moods, setMoods] = useState(fallbackMoods)
  const [selectedMoodId, setSelectedMoodId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/api/v1/moods')
      .then((result) => {
        if (!Array.isArray(result)) return
        const labels = Object.fromEntries(fallbackMoods.map((mood) => [mood.id, mood]))
        const nextMoods = result
          .filter((mood) => labels[mood.id])
          .map((mood) => ({ ...labels[mood.id], ...mood, label: labels[mood.id].label, labelEn: labels[mood.id].labelEn }))
        if (nextMoods.length === fallbackMoods.length) setMoods(nextMoods)
      })
      .catch(() => {})
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
      sessionStorage.setItem('mcm_selected_mood', JSON.stringify(selectedMood || { label: '저녁 약속', labelEn: 'DINNER DATE' }))
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
        <img className="mood-calendar" src="/assets/mood/calendar.svg" alt="" />
      </header>

      <div className="mood-curator-message">
        <img src="/assets/mood/curator.png" alt="" />
        <span>취향은 지키고, 포인트 한 스푼 더했어요.</span>
      </div>

      <section className="mood-grid" aria-label="오늘의 무드 선택">
        {moods.map((mood) => (
          <button
            key={mood.id}
            className={`mood-card ${selectedMoodId === mood.id ? 'selected' : ''}`}
            type="button"
            aria-pressed={selectedMoodId === mood.id}
            onClick={() => setSelectedMoodId(mood.id)}
          >
            <span className="mood-icon"><img src={`/assets/mood/${mood.iconKey}.svg`} alt="" /></span>
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

      <nav className="bottom-nav mood-selection-nav" aria-label="주요 메뉴">
        <Link to="/"><img src="/assets/mood/home.svg" alt="" /><span>home</span></Link>
        <Link to="/closet"><img src="/assets/mood/closet.svg" alt="" /><span>closet</span></Link>
        <Link className="active" to="/styling"><img src="/assets/mood/style.svg" alt="" /><span>style</span></Link>
        <Link to="/profile"><img src="/assets/mood/profile.svg" alt="" /><span>profile</span></Link>
      </nav>
    </main>
  )
}

function OutfitRecommendationPage() {
  const navigate = useNavigate()
  const outfits = JSON.parse(sessionStorage.getItem('mcm_outfits') || '[]')
  const selectedMood = JSON.parse(sessionStorage.getItem('mcm_selected_mood') || '{"label":"저녁 약속","labelEn":"DINNER DATE"}')
  // 계약 §4-4: 후보는 1~3개 가변(화보 실패분은 서버가 제외) — 온 만큼만 렌더, 목업으로 채우지 않는다
  const looks = Array.isArray(outfits) ? outfits : []

  return (
    <main className="outfit-recommendation-screen" data-node-id="53:606">
      <header className="outfit-recommendation-header">
        <button type="button" aria-label="뒤로 가기" onClick={() => navigate('/styling')}><img src="/assets/outfit-recommendation/mark.svg" alt="" /></button>
        <div><strong>AI 스타일리스트</strong><span>AI STYLIST</span></div>
      </header>

      <section className="outfit-recommendation-title">
        <h1>{selectedMood.label}을 위한 추천 코디</h1>
        <p>LOOKS FOR {selectedMood.labelEn}</p>
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
            <div className="outfit-recommendation-image"><img src={assetUrl(look.imageUrl) || '/assets/outfit-recommendation/look-1.png'} alt={`LOOK ${index + 1}`} /></div>
            {/* concept=제목(영어 작명, 폴백이면 없음) · reason=추천 이유 본문 — 계약 §4-4 */}
            <div className="outfit-recommendation-copy"><strong>LOOK {index + 1}{look.concept ? ` · ${look.concept}` : ''}</strong><p>{look.reason}</p></div>
          </article>
        ))}
      </section>

      <button className="outfit-log-button" type="button" onClick={() => navigate('/archive')}>
        <span>코디 기록하기</span>
        <small>UPLOAD MY STYLE LOG</small>
      </button>

      <nav className="bottom-nav outfit-recommendation-nav" aria-label="주요 메뉴">
        <Link to="/"><img src="/assets/outfit-recommendation/home.svg" alt="" /><span>home</span></Link>
        <Link to="/closet"><img src="/assets/outfit-recommendation/closet.svg" alt="" /><span>closet</span></Link>
        <Link className="active" to="/styling"><img src="/assets/outfit-recommendation/style.svg" alt="" /><span>style</span></Link>
        <Link to="/profile"><img src="/assets/outfit-recommendation/profile.svg" alt="" /><span>profile</span></Link>
      </nav>
    </main>
  )
}

function OutfitDetailPage() {
  const navigate = useNavigate()
  const outfits = JSON.parse(sessionStorage.getItem('mcm_outfits') || '[]')
  const index = Number(sessionStorage.getItem('mcm_selected_outfit_index') || 0)
  const outfit = outfits[index] || {}
  const closetItems = outfit.closetItems || []
  const imageUrl = assetUrl(outfit.imageUrl || '/assets/outfit-detail/look.png')
  // concept=제목 · reason=본문 — 서로 대체 관계가 아니다 (계약 §4-4)
  const reason = outfit.reason || '깔끔하면서도 여성스러운 스타일이에요. 아이보리 블라우스와 플리츠 스커트로 단정한 분위기를 잡고, MCM Tracy 비세토스 숄더백으로 포인트를 더해 은근한 고급스러움과 존재감을 살린 룩입니다.'

  return (
    <main className="outfit-detail-screen" data-node-id="268:168">
      <header className="outfit-detail-header">
        <button type="button" aria-label="뒤로 가기" onClick={() => navigate('/styling/recommendation')}><img src="/assets/outfit-detail/mark.svg" alt="" /></button>
        <div><strong>추천 코디</strong><span>LOOKS</span></div>
      </header>

      <h1 className="outfit-detail-look-title">LOOK {index + 1}{outfit.concept ? ` · ${outfit.concept}` : ''}</h1>
      <img className="outfit-detail-image" src={imageUrl} alt={`LOOK ${index + 1}`} />

      <section className="outfit-detail-description">
        <p>{reason}</p>
      </section>

      <section className="outfit-detail-matching">
        <h2>스타일 매칭</h2><span>STYLE MATCHING</span>
        <div className="matching-row"><label>스타일 DNA</label><div><i style={{ width: '87%' }}>80% 일치</i></div></div>
        <div className="matching-row"><label>상황 적합도</label><div><i style={{ width: '95%' }}>95% 일치</i></div></div>
      </section>

      <section className="outfit-detail-items">
        <h2>사용된 아이템</h2><span>ITEMS USED</span>
        <div className="used-item"><b>내 옷장</b><p>{closetItems.length > 0 ? closetItems.map((item) => item.name || item.category).filter(Boolean).join(', ') : '아이보리 블라우스, 플리츠 스커트'}</p></div>
        <div className="used-item"><b>MCM 추천</b><p>{outfit.mcmProduct?.name || 'Tracy 비세토스 숄더백'}</p><a href="#mcm-product">보러가기</a></div>
      </section>

      <div className="outfit-detail-actions">
        <button className="outfit-detail-upload" type="button" onClick={() => navigate('/archive')}><span>이 코디 기록하기</span><small>UPLOAD THIS STYLE LOG</small></button>
        <button className="outfit-detail-save" type="button" aria-label="저장"><img src="/assets/outfit-detail/bookmark.svg" alt="" /><span>저장</span></button>
      </div>

      <nav className="bottom-nav outfit-detail-nav" aria-label="주요 메뉴">
        <Link to="/"><img src="/assets/outfit-detail/home.svg" alt="" /><span>home</span></Link>
        <Link to="/closet"><img src="/assets/outfit-detail/closet.svg" alt="" /><span>closet</span></Link>
        <Link className="active" to="/styling"><img src="/assets/outfit-detail/style.svg" alt="" /><span>style</span></Link>
        <Link to="/profile"><img src="/assets/outfit-detail/profile.svg" alt="" /><span>profile</span></Link>
      </nav>
    </main>
  )
}

function StyleLogPage() {
  const navigate = useNavigate()
  const [photoUrl, setPhotoUrl] = useState('')
  const [note, setNote] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [wornDate] = useState(() => sessionStorage.getItem('mcm_log_date') || new Date().toISOString().slice(0, 10))
  const outfit = JSON.parse(sessionStorage.getItem('mcm_outfits') || '[]')[Number(sessionStorage.getItem('mcm_selected_outfit_index') || 0)] || {}

  function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    if (file) setPhotoUrl(URL.createObjectURL(file))
  }

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
        <h1>사진 올리기</h1><p>UPLOAD PHOTOS</p>
        <label className={`style-log-photo-box ${photoUrl ? 'has-photo' : ''}`}>
          {photoUrl ? <img src={photoUrl} alt="선택한 코디 사진" /> : <img src="/assets/style-log/plus.svg" alt="사진 추가" />}
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
        </label>
      </section>

      <section className="style-log-note-card">
        <h2>이 코디 어땠어요 ?</h2><span>How do you feel about this outfit ?</span>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="오늘의 룩, 기분, 장소 등을 자유롭게 남겨주세요." />
      </section>

      <section className="style-log-public-card">
        <div><strong>전체 공개</strong><p>다른 사람들과 내 스타일을 공유해요</p></div>
        <button className={isPublic ? 'on' : ''} type="button" aria-pressed={isPublic} onClick={() => setIsPublic((current) => !current)}><span /></button>
      </section>

      {message && <p className="style-log-message" role="status">{message}</p>}
      <button className="style-log-submit" type="button" onClick={handleSave} disabled={isSaving}><span>{isSaving ? '저장 중' : '업로드하기'}</span><small>{isSaving ? 'SAVING' : 'UPLOAD'}</small></button>

      <nav className="bottom-nav style-log-nav" aria-label="주요 메뉴">
        <Link to="/"><img src="/assets/style-log/home.svg" alt="" /><span>home</span></Link>
        <Link to="/closet"><img src="/assets/style-log/closet.svg" alt="" /><span>closet</span></Link>
        <Link className="active" to="/styling"><img src="/assets/style-log/style.svg" alt="" /><span>style</span></Link>
        <Link to="/profile"><img src="/assets/style-log/profile.svg" alt="" /><span>profile</span></Link>
      </nav>
    </main>
  )
}

function StyleLogDetailPage() {
  const navigate = useNavigate()
  const [look, setLook] = useState(() => JSON.parse(sessionStorage.getItem('mcm_saved_look') || 'null'))
  const fallbackOutfit = JSON.parse(sessionStorage.getItem('mcm_outfits') || '[]')[Number(sessionStorage.getItem('mcm_selected_outfit_index') || 0)] || {}

  useEffect(() => {
    if (!look?.id) return
    apiRequest(`/api/v1/looks/${look.id}`).then(setLook).catch(() => {})
  }, [look?.id])

  const source = look || fallbackOutfit
  const imageUrl = assetUrl(source.imageUrl || '/assets/style-log-detail/look.png')
  const closetItems = source.closetItems || fallbackOutfit.closetItems || []

  return (
    <main className="style-log-detail-screen" data-node-id="257:558">
      <header className="style-log-detail-header">
        <button type="button" aria-label="뒤로 가기" onClick={() => navigate('/archive')}><img src="/assets/style-log-detail/mark.svg" alt="" /></button>
        <div><strong>코디 기록</strong><span>MY STYLE LOG</span></div>
      </header>
      <img className="style-log-detail-image" src={imageUrl} alt="저장한 코디" />
      <section className="style-log-detail-note">
        <strong>{source.wornDate || '2026.08.14 (금)'}</strong>
        <p>{source.concept || source.reason || '오늘 옷 센스 있다는 말 들어서 기분 좋았던 날, 꾸안꾸 룩'}</p>
      </section>
      <section className="style-log-detail-items">
        <div className="style-log-used-item"><b>내 옷장</b><p>{closetItems.length ? closetItems.map((item) => item.name || item.category).filter(Boolean).join(', ') : '스트라이프 블루 셔츠, 블랙 슬랙스'}</p></div>
        <div className="style-log-used-item"><b>MCM 추천</b><p>{source.mcmProduct?.name || 'Tracy 비세토스 숄더백'}</p><a href="#mcm-product">보러가기</a></div>
      </section>
      <nav className="bottom-nav style-log-detail-nav" aria-label="주요 메뉴">
        <Link to="/"><img src="/assets/style-log-detail/home.svg" alt="" /><span>home</span></Link>
        <Link to="/closet"><img src="/assets/style-log-detail/closet.svg" alt="" /><span>closet</span></Link>
        <Link className="active" to="/styling"><img src="/assets/style-log-detail/style.svg" alt="" /><span>style</span></Link>
        <Link to="/profile"><img src="/assets/style-log-detail/profile.svg" alt="" /><span>profile</span></Link>
      </nav>
    </main>
  )
}

function StyleCalendarPage() {
  const navigate = useNavigate()
  const [viewDate] = useState(() => new Date())
  const [looks, setLooks] = useState([])
  const [recommendedOnly, setRecommendedOnly] = useState(true)
  const [mineOnly, setMineOnly] = useState(false)
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
  const fallbackDates = [7, 11, 12, 13, 14, 17, 18, 19, 22, 23]

  useEffect(() => {
    apiRequest(`/api/v1/looks?month=${monthKey}`)
      .then((result) => setLooks(Array.isArray(result) ? result : []))
      .catch(() => setLooks([]))
  }, [monthKey])

  const visibleLooks = looks.filter((look) => {
    if (recommendedOnly && !look.mcmProductId) return false
    if (mineOnly && look.mcmProductId) return false
    return true
  })
  const markedDates = visibleLooks.length > 0
    ? visibleLooks.map((look) => Number(String(look.wornDate).slice(-2)))
    : fallbackDates
  const firstDay = new Date(year, month, 1)
  const mondayOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: mondayOffset + daysInMonth }, (_, index) => index < mondayOffset ? null : index - mondayOffset + 1)

  function toggleRecommended() {
    setRecommendedOnly((current) => !current)
    setMineOnly(false)
  }

  function toggleMine() {
    setMineOnly((current) => !current)
    setRecommendedOnly(false)
  }

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
      <FilterToggle className="calendar-recommended-filter" title="추천 코디 기록만 보기" description="MCM MUSE가 추천한 코디만 보여줘요" on={recommendedOnly} onClick={toggleRecommended} />
      <FilterToggle className="calendar-mine-filter" title="나의 코디 기록만 보기" description="내가 직접 기록한 코디만 보여줘요" on={mineOnly} onClick={toggleMine} />
      <nav className="bottom-nav style-calendar-nav" aria-label="주요 메뉴">
        <Link to="/"><img src="/assets/style-calendar/home.svg" alt="" /><span>home</span></Link>
        <Link to="/closet"><img src="/assets/style-calendar/closet.svg" alt="" /><span>closet</span></Link>
        <Link className="active" to="/styling"><img src="/assets/style-calendar/style.svg" alt="" /><span>style</span></Link>
        <Link to="/profile"><img src="/assets/style-calendar/profile.svg" alt="" /><span>profile</span></Link>
      </nav>
    </main>
  )
}

function FilterToggle({ className, title, description, on, onClick }) {
  return (
    <section className={`calendar-filter ${className}`}>
      <div><strong>{title}</strong><p>{description}</p></div>
      <button className={on ? 'on' : ''} type="button" aria-pressed={on} onClick={onClick}><span /></button>
    </section>
  )
}

function ClosetAddCompletePage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const scanResult = useMemo(() => JSON.parse(sessionStorage.getItem('mcm_scan_result') || 'null'), [])
  const itemName = scanResult?.name || 'POLO 스트라이프 블루 셔츠'
  const itemImage = assetUrl(scanResult?.cutoutUrl || scanResult?.originalUrl || '/assets/closet-complete/item.png')

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

      <nav className="bottom-nav closet-add-complete-nav" aria-label="주요 메뉴">
        <Link to="/"><img src="/assets/closet-complete/home.svg" alt="" /><span>home</span></Link>
        <Link className="active" to="/closet"><img src="/assets/closet-complete/closet.svg" alt="" /><span>closet</span></Link>
        <Link to="/styling"><img src="/assets/closet-complete/style.svg" alt="" /><span>style</span></Link>
        <Link to="/profile"><img src="/assets/closet-complete/profile.svg" alt="" /><span>profile</span></Link>
      </nav>
    </main>
  )
}

function ProfilePage() {
  const navigate = useNavigate()
  const [me, setMe] = useState({ nickname: '수아', email: '' })
  const [looks, setLooks] = useState([])
  const [message, setMessage] = useState('')
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
          <div><strong>홈 Home</strong><span>HOME</span></div>
          <button className="profile-action-button" type="button" aria-label="서버 설정" onClick={() => navigate('/settings')}>
            <img src="/assets/profile/profile.svg" alt="" />
          </button>
        </header>

        <section className="profile-identity">
          <div className="profile-avatar">
            <img src="/assets/profile/profile-mascot.png" alt="프로필 이미지" />
            <span><img src="/assets/profile/edit.svg" alt="" /></span>
          </div>
          <h1>{me.nickname || '수아'}</h1>
          <p>Fashion Enthusiast</p>
        </section>

        <section className="profile-taste-card">
          <div className="profile-card-label"><img src="/assets/profile/taste.svg" alt="" /><span>YOUR TASTE AXIS</span></div>
          <h2>취향 중심축: 미니멀·웜뉴트럴</h2>
          <p>따뜻한 색감과 간결한 실루엣을 선호하시네요.<br />최근 저장한 코디의 78%가 이 축에 속합니다.</p>
          <div className="taste-meter"><span /></div>
          <div className="taste-meter-labels"><span>MINIMAL</span><span>78% MATCH</span></div>
        </section>

        <section className="profile-stats-grid">
          <button type="button" className="profile-stat-card" onClick={() => navigate('/archive/calendar')}>
            <span className="profile-stat-icon"><img src="/assets/profile/looks.svg" alt="" /></span>
            <span className="profile-stat-label">저장한 코디</span>
            <strong>{looks.length} <small>looks</small></strong>
          </button>
          <button type="button" className="profile-purchase-card" onClick={() => setMessage('구매 이력은 결제 API 연결 후 제공됩니다.')}>
            <span className="profile-stat-icon"><img src="/assets/profile/purchase.svg" alt="" /></span>
            <span><strong>구매 이력</strong><small>PURCHASE HISTORY</small></span>
            <img src="/assets/profile/chevron-right.svg" alt="" />
          </button>
        </section>

        <section className="profile-settings">
          <p>ACCOUNT SETTINGS</p>
          <button type="button" onClick={() => navigate('/settings')}><img src="/assets/profile/bell.svg" alt="" /><span>서버 연결 설정</span><img src="/assets/profile/chevron-right.svg" alt="" /></button>
          <button type="button"><img src="/assets/profile/lock.svg" alt="" /><span>개인정보 및 보안</span><img src="/assets/profile/chevron-right.svg" alt="" /></button>
          <button type="button"><img src="/assets/profile/help.svg" alt="" /><span>고객센터</span><img src="/assets/profile/chevron-right.svg" alt="" /></button>
        </section>

        {message && <p className="profile-message" role="status">{message}</p>}
        <section className="profile-logout">
          <button type="button" onClick={handleLogout} disabled={isLoggingOut}>{isLoggingOut ? '로그아웃 중...' : '로그아웃'}</button>
          <span>VERSION 2.4.1</span>
        </section>
      </div>

      <nav className="profile-bottom-nav" aria-label="주요 메뉴">
        <Link to="/"><img src="/assets/profile/home.svg" alt="" /><span>Home</span></Link>
        <Link to="/closet"><img src="/assets/profile/closet.svg" alt="" /><span>Closet</span></Link>
        <Link to="/closet/scan"><img className="profile-scan-icon" src="/assets/profile/scan-bg.svg" alt="" /><span>Scan</span></Link>
        <Link to="/styling"><img src="/assets/profile/style.svg" alt="" /><span>Style</span></Link>
        <Link className="active" to="/profile"><img src="/assets/profile/profile-active.svg" alt="" /><span>Profile</span></Link>
      </nav>
    </main>
  )
}

function SettingsPage() {
  const navigate = useNavigate()
  const [backendUrl, setBackendUrl] = useState(getBackendUrl())
  const [aiUrl, setAiUrl] = useState(getAiUrl())
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function handleSave(event) {
    event.preventDefault()
    setError('')
    try {
      saveServerUrls({ backendUrl, aiUrl })
      setBackendUrl(getBackendUrl())
      setAiUrl(getAiUrl())
      setMessage('서버 주소가 저장되었습니다. APK를 다시 설치할 필요가 없습니다.')
    } catch {
      setError('주소를 http:// 또는 https:// 형식으로 입력해주세요.')
    }
  }

  async function handleTest() {
    setMessage('')
    setError('')
    try {
      const response = await fetch(`${backendUrl.replace(/\/+$/, '')}/actuator/health`)
      if (!response.ok) throw new Error()
      setMessage('백엔드 연결에 성공했습니다.')
    } catch {
      setError('백엔드에 연결할 수 없습니다. 주소와 같은 Wi-Fi 연결을 확인해주세요.')
    }
  }

  return (
    <main className="server-settings-screen">
      <header className="server-settings-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로 가기">‹</button>
        <div><strong>서버 설정</strong><span>SERVER SETTINGS</span></div>
        <span />
      </header>
      <form className="server-settings-card" onSubmit={handleSave}>
        <p className="server-settings-intro">팀원의 PC에서 실행 중인 서버 주소를 입력하세요.<br />저장 후 APK를 다시 빌드하지 않아도 됩니다.</p>
        <label>백엔드 주소<input value={backendUrl} onChange={(event) => setBackendUrl(event.target.value)} placeholder="http://192.168.0.20:8080" /></label>
        <label>AI 서버 주소<input value={aiUrl} onChange={(event) => setAiUrl(event.target.value)} placeholder="http://192.168.0.20:8000" /></label>
        <p className="server-settings-help">휴대폰과 서버 PC가 같은 Wi-Fi에 연결되어 있어야 합니다.</p>
        {message && <p className="server-settings-message success" role="status">{message}</p>}
        {error && <p className="server-settings-message error" role="alert">{error}</p>}
        <div className="server-settings-actions"><button type="button" onClick={handleTest}>연결 테스트</button><button type="submit">저장하기</button></div>
      </form>
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

        <div className="social-login" data-node-id="72:33" aria-label="소셜 로그인">
          <button type="button" aria-label="카카오 로그인">
            <img src="/assets/kakao-login.png" alt="카카오" />
          </button>
          <button className="naver-login" type="button" aria-label="네이버 로그인">N</button>
        </div>
        <Link className="signup-link" to="/signup" data-node-id="65:12">
          <span className="mcm-wordmark">MCM</span> 회원가입
        </Link>
      </div>
    </main>
  )
}

function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nickname: '', email: '', phone: '', password: '' })
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
          <label className="sr-only" htmlFor="phone">전화번호</label>
          <input id="phone" name="phone" type="tel" placeholder="전화번호" value={form.phone} onChange={updateField} />
          <label className="sr-only" htmlFor="signup-password">비밀번호</label>
          <input id="signup-password" name="password" type="password" placeholder="비밀번호*" value={form.password} onChange={updateField} required />

          <p className="signup-required-note">*표시가 있는 모든 항목은 필수입니다.</p>
          <button className="signup-consent" type="button">동의하기</button>
          {error && <p className="signup-error" role="alert">{error}</p>}

          <div className="social-login signup-social" aria-label="소셜 로그인">
            <button type="button" aria-label="카카오 로그인">
              <img src="/assets/kakao-signup.png" alt="카카오" />
            </button>
            <button className="naver-login" type="button" aria-label="네이버 로그인">N</button>
          </div>

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
      <Route path="/closet/scan/product" element={<ProtectedRoute><ProductScanPage /></ProtectedRoute>} />
      <Route path="/closet/scan/product/details" element={<ProtectedRoute><ScannedProductDetailPage /></ProtectedRoute>} />
      <Route path="/closet/scan/recognize" element={<ProtectedRoute><RecognizeResultPage /></ProtectedRoute>} />
      <Route path="/closet/scan/recognize/complete" element={<ProtectedRoute><ClosetAddCompletePage /></ProtectedRoute>} />
      <Route path="/closet/style-dna" element={<ProtectedRoute><DnaClosetPage /></ProtectedRoute>} />
      <Route path="/style-dna" element={<ProtectedRoute><StyleDnaPage /></ProtectedRoute>} />
      <Route path="/products/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
      <Route path="/products/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
      <Route path="/products/:id/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><PlaceholderPage title="MCM 상품" /></ProtectedRoute>} />
      <Route path="/styling" element={<ProtectedRoute><MoodSelectionPage /></ProtectedRoute>} />
      <Route path="/styling/recommendation" element={<ProtectedRoute><OutfitRecommendationPage /></ProtectedRoute>} />
      <Route path="/styling/recommendation/detail" element={<ProtectedRoute><OutfitDetailPage /></ProtectedRoute>} />
      <Route path="/archive" element={<ProtectedRoute><StyleLogPage /></ProtectedRoute>} />
      <Route path="/archive/detail" element={<ProtectedRoute><StyleLogDetailPage /></ProtectedRoute>} />
      <Route path="/archive/calendar" element={<ProtectedRoute><StyleCalendarPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<PlaceholderPage title="페이지를 찾을 수 없습니다" />} />
    </Routes>
  )
}

export default App
