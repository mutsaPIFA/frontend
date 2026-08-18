import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest, assetUrl } from '../api/client.js'
import BottomNav from '../components/BottomNav.jsx'
import { useApi } from '../hooks/useApi.js'
import { formatWornDate, scanItemName } from '../lib/format.js'
import { stylingSession } from '../lib/stylingSession.js'

export function StyleLogPage() {
  const navigate = useNavigate()
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [wornDate] = useState(() => stylingSession.logDate() || new Date().toISOString().slice(0, 10))
  const outfit = stylingSession.selectedOutfit()

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
      stylingSession.setSavedLook(savedLook)
      stylingSession.clearLogDate()
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

export function StyleLogDetailPage() {
  const navigate = useNavigate()
  const [look, setLook] = useState(() => stylingSession.savedLook())
  const candidate = useMemo(() => stylingSession.selectedOutfit(), [])
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

export function StyleCalendarPage() {
  const navigate = useNavigate()
  const [viewDate] = useState(() => new Date())
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`

  const { data } = useApi(async () => {
    const result = await apiRequest(`/api/v1/looks?month=${monthKey}`)
    return Array.isArray(result) ? result : []
  }, [monthKey])
  const looks = data || []

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
                stylingSession.setSavedLook(look)
                navigate('/archive/detail')
              } else if (day) {
                stylingSession.setLogDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
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
