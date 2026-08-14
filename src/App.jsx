import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { apiRequest } from './api/client.js'

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

function formatPrice(price) {
  return `₩${Number(price).toLocaleString('ko-KR')}`
}

function productCategory(product) {
  if (product.category === '가방') return 'BAGS'
  if (product.category === '악세서리') return 'ACCESSORIES'
  return 'CLOTHES'
}

function closetItemImage(item, index) {
  return item.cutoutUrl || item.imageUrl || fallbackClosetItems[index % fallbackClosetItems.length].imageUrl
}

function HomePage() {
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
          <article className="product-card" key={product.id ?? product.name}>
            <div className="product-image-wrap">
              <img src={product.imageUrl || product.cutoutUrl || fallbackProducts[index % fallbackProducts.length].imageUrl} alt="" />
              <button className="favorite-button" type="button" aria-label="찜하기">
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
  const [source, setSource] = useState('')
  const [items, setItems] = useState(fallbackClosetItems)

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

  return (
    <main className="closet-screen" data-node-id="53:280">
      <header className="closet-header">
        <button className="back-button" type="button" aria-label="뒤로 가기" onClick={() => window.history.back()} />
        <div className="closet-heading"><strong>내 옷장</strong><span>MY CLOSET</span></div>
        <button className="closet-filter-button" type="button"><img src="/assets/closet/closet-filter.svg" alt="" /> 필터</button>
      </header>

      <div className="closet-tabs" role="tablist" aria-label="옷장 출처">
        <button className={!source ? 'active' : ''} type="button" onClick={() => setSource('')} role="tab" aria-selected={!source}>전체</button>
        <button className={source === 'MCM' ? 'active' : ''} type="button" onClick={() => setSource('MCM')} role="tab" aria-selected={source === 'MCM'}>MCM</button>
      </div>

      <section className="closet-grid" aria-label="내 옷장 아이템">
        {items.map((item, index) => (
          <article className="closet-card" key={item.id ?? item.name}>
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

      <Link className="add-item-button" to="/closet/scan">
        <span>아이템 추가하기</span>
        <small>ADD ITEM</small>
      </Link>

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
              <div className={`closet-image-wrap ${item.imageClass ?? ''}`}><img src={item.imageUrl} alt="" /></div>
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
      })
      .catch(() => {
        // 백엔드가 준비되지 않은 개발 환경에서는 Figma 결과를 사용한다.
      })
  }, [])

  const product = recommendation?.bestPick?.product

  return (
    <main className="style-dna-screen" data-node-id="53:125">
      <header className="style-dna-header">
        <button className="back-button" type="button" aria-label="뒤로 가기" onClick={() => window.history.back()} />
        <div><strong>당신의 스타일 DNA</strong><span>YOUR STYLE DNA</span></div>
      </header>

      <section className="style-dna-section">
        <h1>당신의 스타일 DNA</h1>
        <div className="dna-summary-card">
          <strong>[{dna?.keywords?.join(' · ') || '차분하고 세련된 도시적 무드'}]</strong>
          <img className="dna-colors" src="/assets/dna/dna-colors.svg" alt="차콜, 그레이, 블루 컬러" />
          <p>{dna?.summary || '차콜과 그레이가 전체 분위기를 안정감 있게 잡아주고,\n부드러운 블루가 포인트가 되어줍니다.\n편안함 속에 단정한 세련미가 느껴지는 스타일이 돋보이네요.'}</p>
        </div>
      </section>

      <section className="style-dna-section recommendation-section">
        <h2>채우면 좋은 한가지</h2>
        <div className="recommendation-card">
          <span className="perfect-match">PERFECT MATCH</span>
          <img className="recommendation-image" src={product?.imageUrl || '/assets/dna/dna-recommendation.png'} alt={product?.name || 'Liz 엠보스드 모노그램 레더 쇼퍼'} />
          <p>{product?.name || 'Liz 엠보스드 모노그램 레더 쇼퍼'}</p>
          <Link className="more-recommendations" to="/products/recommendations">추천 더보기 →</Link>
        </div>
      </section>

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
            <div className="recommendation-thumb"><img src={product.imageUrl || fallbackRecommendations[index % fallbackRecommendations.length].imageUrl} alt="" /></div>
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

  useEffect(() => {
    apiRequest(`/api/v1/mcm-products/${id}`)
      .then((result) => setProduct((current) => ({ ...current, ...result, englishName: current.englishName })))
      .catch(() => {})
  }, [id])

  return (
    <main className="detail-screen" data-node-id="53:249">
      <header className="detail-header">
        <button className="back-button" type="button" aria-label="뒤로 가기" onClick={() => navigate(-1)} />
        <div><strong>제품 상세</strong><span>DETAILS</span></div>
      </header>

      <section className="detail-hero">
        <div className="detail-image-panel"><img src={product.imageUrl || '/assets/detail/detail-item.png'} alt={product.name} /></div>
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
        <Link className="buy-button" to={`/products/${id}/checkout`}>바로구매<small>BUY NOW</small></Link>
        <button className="reserve-button" type="button">매장 픽업 예약<small>RESERVE IN-STORE</small></button>
      </div>

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
      await apiRequest('/api/v1/scan', { method: 'POST', body: formData })
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

  return (
    <main className="recognize-screen" data-node-id="210:852">
      <header className="recognize-header">
        <button className="back-button" type="button" aria-label="뒤로 가기" onClick={() => navigate('/closet/scan')} />
        <div><strong>아이템 인식</strong><span>RECOGNIZE ITEM</span></div>
        <img src="/assets/recognize/header-mark.svg" alt="" />
      </header>

      <div className="recognize-status"><img src="/assets/recognize/check.svg" alt="" /><span>아이템 인식 완료</span></div>

      <section className="recognize-item-card">
        <img className="recognize-item-image" src="/assets/recognize/recognize-item.png" alt="POLO 스트라이프 블루 셔츠" />
        <div className="recognize-item-name">POLO 스트라이프 블루 셔츠</div>
      </section>

      <div className="recognize-actions">
        <button type="button" onClick={() => navigate('/closet/scan')}><strong>다시 스캔하기</strong><span>SCAN AGAIN</span></button>
        <button type="button" onClick={() => navigate('/closet')}><strong>옷장에 넣기</strong><span>PUT IN MY CLOSET</span></button>
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
      navigate('/closet')
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
      navigate('/closet')
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/request" element={<LoginRequestPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/closet" element={<ClosetPage />} />
      <Route path="/closet/scan" element={<ScanPage />} />
      <Route path="/closet/scan/product" element={<ProductScanPage />} />
      <Route path="/closet/scan/product/details" element={<ScannedProductDetailPage />} />
      <Route path="/closet/scan/recognize" element={<RecognizeResultPage />} />
      <Route path="/closet/style-dna" element={<DnaClosetPage />} />
      <Route path="/style-dna" element={<StyleDnaPage />} />
      <Route path="/products/recommendations" element={<RecommendationsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/products/:id/checkout" element={<CheckoutPage />} />
      <Route path="/products" element={<PlaceholderPage title="MCM 상품" />} />
      <Route path="/styling" element={<PlaceholderPage title="스타일링" />} />
      <Route path="*" element={<PlaceholderPage title="페이지를 찾을 수 없습니다" />} />
    </Routes>
  )
}

export default App
