import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest, assetUrl } from '../api/client.js'
import BottomNav from '../components/BottomNav.jsx'
import FadeImg from '../components/FadeImg.jsx'
import LoadingOverlay from '../components/LoadingOverlay.jsx'
import { useApi } from '../hooks/useApi.js'
import { scanItemName } from '../lib/format.js'
import { moodIcon } from '../lib/vocab.js'
import { stylingSession } from '../lib/stylingSession.js'

export function MoodSelectionPage() {
  const navigate = useNavigate()
  const [selectedMoodId, setSelectedMoodId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  // 기록 날짜 (계약 §4-5 wornDate — 미선택 시 서버가 오늘로) — 룩 저장 화면이 읽는다
  const [logDate, setLogDate] = useState(() => stylingSession.logDate())

  const { data, error: moodError, reload } = useApi(async () => {
    const result = await apiRequest('/api/v1/moods')
    return Array.isArray(result) ? result : []
  }, [], { cacheKey: 'moods' })
  const moods = data || []

  function handleLogDateChange(event) {
    const value = event.target.value
    setLogDate(value)
    stylingSession.setLogDate(value)
  }

  async function handleSeeLooks() {
    if (!selectedMoodId) {
      setError('오늘의 무드를 선택해 주세요.')
      return
    }

    setIsCreating(true)
    setError('')
    try {
      const outfits = await apiRequest('/api/v1/outfits', {
        method: 'POST',
        body: JSON.stringify({ moodId: selectedMoodId }),
      })
      stylingSession.setOutfits(outfits)
      stylingSession.setSelectedMood(moods.find((mood) => mood.id === selectedMoodId))
      navigate('/styling/recommendation')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsCreating(false)
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
        {moods.length === 0 && (
          <div className="grid-status" role={moodError ? 'alert' : 'status'}>
            <p>{moodError || '무드를 불러오고 있어요...'}</p>
            {moodError && <button className="retry-button" type="button" onClick={reload}>다시 시도</button>}
          </div>
        )}
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
      <button className="mood-see-looks-button" type="button" onClick={handleSeeLooks} disabled={isCreating}>
        <span>{isCreating ? '코디를 만들고 있어요' : '추천 코디 보기'}</span>
        <small>{isCreating ? 'CREATING LOOKS' : 'SEE LOOKS'}</small>
      </button>

      {isCreating && (
        <LoadingOverlay
          image="/assets/loading-puppy-outfit.png"
          title="코디를 생성하고 있어요"
          subtitle="옷장과 MCM을 조합해 화보를 만드는 중 (20~40초)"
        />
      )}

      <BottomNav active="style" />
    </main>
  )
}

export function OutfitRecommendationPage() {
  const navigate = useNavigate()
  // 계약 §4-4: 후보는 1~3개 가변(화보 실패분은 서버가 제외) — 온 만큼만 렌더
  const looks = stylingSession.outfits()
  const selectedMood = stylingSession.selectedMood()

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
          <article className="outfit-recommendation-card" key={index} onClick={() => { stylingSession.setSelectedIndex(index); navigate('/styling/recommendation/detail') }} role="button" tabIndex="0">
            <div className="outfit-recommendation-image"><FadeImg src={assetUrl(look.imageUrl)} alt={`LOOK ${index + 1}`} /></div>
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

export function OutfitDetailPage() {
  const navigate = useNavigate()
  const index = stylingSession.selectedIndex()
  const outfit = stylingSession.selectedOutfit()
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
      <FadeImg className="outfit-detail-image" src={imageUrl} alt={`LOOK ${index + 1}`} />

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
