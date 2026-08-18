import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, assetUrl } from '../api/client.js'
import BottomNav from '../components/BottomNav.jsx'
import FadeImg from '../components/FadeImg.jsx'
import ItemInfoModal from '../components/ItemInfoModal.jsx'
import LoadingOverlay from '../components/LoadingOverlay.jsx'
import { invalidateApiCache, useApi } from '../hooks/useApi.js'
import { scanItemName } from '../lib/format.js'
import { moodIcon } from '../lib/vocab.js'
import { stylingSession } from '../lib/stylingSession.js'

export function MoodSelectionPage() {
  const navigate = useNavigate()
  const [selectedMoodId, setSelectedMoodId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const { data, error: moodError, reload } = useApi(async () => {
    const result = await apiRequest('/api/v1/moods')
    return Array.isArray(result) ? result : []
  }, [], { cacheKey: 'moods' })
  const moods = data || []

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
        <span />
      </header>

      <div className="mood-curator-message">
        <img src="/assets/mood/curator.png" alt="" />
        <span>무드를 고르면 내 옷장으로 코디를 만들어 드려요.</span>
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
            onClick={() => setSelectedMoodId((current) => current === mood.id ? null : mood.id)}
          >
            <span className={`mood-icon mood-icon-${mood.iconKey}`}><img src={moodIcon(mood.iconKey)} alt="" /></span>
            <strong>{mood.label}</strong>
            <small>{mood.labelEn}</small>
          </button>
        ))}
      </section>

      {error && <p className="mood-selection-error" role="alert">{error}</p>}
      <button className="mood-see-looks-button" type="button" onClick={handleSeeLooks} disabled={isCreating}>
        <span>{isCreating ? '코디를 만들고 있어요' : '추천 코디 보기'}</span>
      </button>

      {isCreating && (
        <LoadingOverlay
          image="/assets/loading-puppy-outfit.png"
          messages={[
            { title: '코디를 생성하고 있어요', subtitle: '옷장과 MCM을 조합하는 중 (20~40초)' },
            { title: '어울리는 조합을 고르고 있어요', subtitle: '무드에 맞춰 밸런스를 잡는 중이에요' },
            { title: '화보를 촬영하고 있어요', subtitle: '조명까지 세팅해서 예쁘게 담는 중' },
            { title: '거의 다 됐어요', subtitle: '마지막 손질을 하고 있어요' },
          ]}
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
  const [recorded, setRecorded] = useState(() => stylingSession.recordedLooks())

  // 기록 취소(계약 §4-8) — x 탭: 저장된 룩 삭제 후 다시 기록 가능 상태로
  async function cancelRecord(event, index) {
    event.stopPropagation()
    const lookId = recorded[index]
    if (!lookId) return
    try {
      await apiRequest(`/api/v1/looks/${lookId}`, { method: 'DELETE' })
      stylingSession.removeRecordedLook(index)
      setRecorded(stylingSession.recordedLooks())
      invalidateApiCache('looks:')
      invalidateApiCache('profile')
    } catch {
      // 삭제 실패 시 상태 유지 — 재시도 가능
    }
  }

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
          <article className={`outfit-recommendation-card ${recorded[index] ? 'recorded' : ''}`} key={index} onClick={() => { stylingSession.setSelectedIndex(index); navigate('/styling/recommendation/detail') }} role="button" tabIndex="0">
            <div className="outfit-recommendation-image"><FadeImg src={assetUrl(look.imageUrl)} alt={`LOOK ${index + 1}`} /></div>
            {recorded[index] && (
              <>
                <span className="look-recorded-badge">기록됨</span>
                <button className="look-cancel-button" type="button" aria-label="기록 취소" onClick={(event) => cancelRecord(event, index)}>✕</button>
              </>
            )}
            {/* concept=제목(영어 작명, 폴백이면 없음) · reason=추천 이유 본문 — 계약 §4-4 */}
            <div className="outfit-recommendation-copy"><strong>LOOK {index + 1}{look.concept ? ` · ${look.concept}` : ''}</strong><p>{look.reason}</p></div>
          </article>
        ))}
      </section>

      <BottomNav active="style" />
    </main>
  )
}

export function OutfitDetailPage() {
  const navigate = useNavigate()
  const [viewItem, setViewItem] = useState(null)
  const index = stylingSession.selectedIndex()
  const outfit = stylingSession.selectedOutfit()
  const isRecorded = Boolean(stylingSession.recordedLooks()[index])
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
        {/* 코디는 전부 내 옷장 아이템 조합 — 탭하면 옷 정보, MCM은 상품 페이지로 */}
        <div className="used-item-thumbs">
          {closetItems.map((item) => (
            <button key={`own-${item.id}`} className="used-item-thumb" type="button" onClick={() => setViewItem(item)}>
              <FadeImg src={assetUrl(item.cutoutUrl || item.imageUrl)} alt={scanItemName(item)} />
              <small>{item.category || '아이템'}</small>
            </button>
          ))}
          {outfit.mcmProduct && (
            <button key="mcm" className="used-item-thumb used-item-thumb-mcm" type="button" onClick={() => outfit.mcmProduct.id && navigate(`/products/${outfit.mcmProduct.id}`)}>
              <FadeImg src={assetUrl(outfit.mcmProduct.cutoutUrl || outfit.mcmProduct.imageUrl)} alt={outfit.mcmProduct.name} />
              <em>MCM</em>
              <small>{outfit.mcmProduct.name}</small>
            </button>
          )}
        </div>
      </section>

      <div className="outfit-detail-actions">
        <button className="outfit-detail-upload" type="button" onClick={() => navigate('/archive')} disabled={isRecorded}>
          <span>{isRecorded ? '이미 기록한 코디예요' : '이 코디 기록하기'}</span>
        </button>
      </div>

      <ItemInfoModal item={viewItem} onClose={() => setViewItem(null)} />

      <BottomNav active="style" />
    </main>
  )
}
