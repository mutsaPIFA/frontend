import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, assetUrl } from '../api/client.js'
import BackButton from '../components/BackButton.jsx'
import BottomNav from '../components/BottomNav.jsx'
import FadeImg from '../components/FadeImg.jsx'
import ItemInfoModal from '../components/ItemInfoModal.jsx'
import ProductImg from '../components/ProductImg.jsx'
import ReasonText from '../components/ReasonText.jsx'
import { invalidateApiCache, useApi } from '../hooks/useApi.js'
import { formatWornDate, scanItemName } from '../lib/format.js'
import { stylingSession } from '../lib/stylingSession.js'

export function StyleLogPage() {
  const navigate = useNavigate()
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isCelebrating, setIsCelebrating] = useState(false)
  const [message, setMessage] = useState('')
  const [wornDate] = useState(() => stylingSession.logDate() || new Date().toISOString().slice(0, 10))
  const outfitIndex = stylingSession.selectedIndex()
  const outfit = stylingSession.selectedOutfit()
  const isRecorded = Boolean(stylingSession.recordedLooks()[outfitIndex])

  async function handleSave() {
    if (!outfit.moodId) {
      setMessage('먼저 추천 코디를 선택해 주세요.')
      return
    }
    if (isRecorded) {
      setMessage('이미 기록한 코디예요. 후보 화면에서 기록을 취소하면 다시 저장할 수 있어요.')
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
      if (savedLook?.id != null) stylingSession.setRecordedLook(outfitIndex, savedLook.id)
      stylingSession.clearLogDate()
      invalidateApiCache('looks:')
      invalidateApiCache('profile')
      // 저장의 순간을 잠깐 축하 — 그 뒤 상세로 (작성 화면은 히스토리에서 대체)
      setIsCelebrating(true)
      setTimeout(() => navigate('/archive/detail', { replace: true }), 1100)
    } catch (saveError) {
      setMessage(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="style-log-screen" data-node-id="53:349">
      <header className="style-log-header">
        <BackButton onClick={() => navigate('/styling/recommendation/detail')} />
        <div><strong>코디 기록</strong><span>MY STYLE LOG</span></div>
      </header>

      <section className="style-log-upload-section">
        <h1>기록할 코디</h1><p>{formatWornDate(wornDate)}</p>
        <div className="style-log-photo-box has-photo">
          {outfit.imageUrl
            ? <FadeImg src={assetUrl(outfit.imageUrl)} alt="기록할 코디 화보" />
            : <p className="style-log-photo-empty">추천 코디를 먼저 선택해 주세요.</p>}
        </div>
      </section>

      <section className="style-log-note-card">
        <h2>이 코디 어땠어요 ?</h2><span>How do you feel about this outfit ?</span>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="오늘의 룩, 기분, 장소 등을 자유롭게 남겨주세요." />
      </section>

      {message && <p className="style-log-message" role="status">{message}</p>}
      <button className="style-log-submit" type="button" onClick={handleSave} disabled={isSaving || isCelebrating || isRecorded}>
        <span>{isRecorded ? '이미 기록한 코디예요' : isSaving ? '저장 중...' : '기록하기'}</span>
      </button>

      {isCelebrating && (
        <div className="save-celebration" role="status">
          <span className="save-celebration-check">✓</span>
          <img src="/assets/loading-puppy-complete.png" alt="" />
          <strong>기록 완료!</strong>
        </div>
      )}

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
  const [viewItem, setViewItem] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editDraft, setEditDraft] = useState({ note: '', wornDate: '' })
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editError, setEditError] = useState('')

  function startEdit() {
    setEditDraft({ note: look?.note || '', wornDate: look?.wornDate || '' })
    setEditError('')
    setIsEditing(true)
  }

  // 계약 §4-9 — 소감·날짜 부분 수정 (note 빈 문자열 = 제거)
  async function saveEdit() {
    try {
      const updated = await apiRequest(`/api/v1/looks/${look.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ note: editDraft.note, wornDate: editDraft.wornDate || null }),
      })
      setLook(updated)
      stylingSession.setSavedLook(updated)
      invalidateApiCache('looks:')
      invalidateApiCache('profile')
      setIsEditing(false)
    } catch (error) {
      setEditError(error.message)
    }
  }

  // 계약 §4-8 — 기록 삭제
  async function deleteLook() {
    try {
      await apiRequest(`/api/v1/looks/${look.id}`, { method: 'DELETE' })
      stylingSession.removeRecordedLookById(look.id)
      invalidateApiCache('looks:')
      invalidateApiCache('profile')
      navigate(-1)
    } catch (error) {
      setEditError(error.message)
      setIsDeleteOpen(false)
    }
  }

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
        <BackButton onClick={() => navigate(-1)} />
        <div><strong>코디 기록</strong><span>MY STYLE LOG</span></div>
      </header>
      <FadeImg className="style-log-detail-image" src={imageUrl} alt="저장한 코디" />
      <section className="style-log-detail-note">
        {look?.id && !isEditing && (
          <button className="look-edit-button" type="button" aria-label="소감·날짜 수정" onClick={startEdit}>✎</button>
        )}
        <strong>{formatWornDate(look?.wornDate)}{concept ? ` · ${concept}` : ''}</strong>
        {!isEditing && (
          look?.note
            ? <p>{look.note}</p>
            : bodyText && <ReasonText text={bodyText} extraKeywords={[product?.name]} />
        )}
        {isEditing && (
          <div className="look-edit-form">
            <input type="date" value={editDraft.wornDate} onChange={(event) => setEditDraft((current) => ({ ...current, wornDate: event.target.value }))} />
            <textarea
              value={editDraft.note}
              maxLength={1000}
              placeholder="이 코디, 어땠어요?"
              onChange={(event) => setEditDraft((current) => ({ ...current, note: event.target.value }))}
            />
            <div className="look-edit-actions">
              <button type="button" onClick={() => setIsEditing(false)}>취소</button>
              <button type="button" onClick={saveEdit}>저장</button>
            </div>
          </div>
        )}
        {editError && <p className="look-edit-error" role="alert">{editError}</p>}
      </section>
      <section className="style-log-detail-items">
        <div className="used-item-thumbs">
          {closetItems.map((item) => (
            <button key={`own-${item.id}`} className="used-item-thumb" type="button" onClick={() => setViewItem(item)}>
              <FadeImg src={assetUrl(item.cutoutUrl || item.imageUrl)} alt={scanItemName(item)} />
              <small>{item.category || '아이템'}</small>
            </button>
          ))}
          {product && (
            <button key="mcm" className="used-item-thumb used-item-thumb-mcm" type="button" onClick={() => setViewItem({ ...product, source: 'MCM' })}>
              <ProductImg src={product.cutoutUrl || product.imageUrl} width={480} alt={product.name} />
              <em>MCM</em>
              <small>{product.name}</small>
            </button>
          )}
        </div>
      </section>

      {look?.id && (
        <button className="look-delete-button" type="button" onClick={() => setIsDeleteOpen(true)}>기록 삭제</button>
      )}

      {isDeleteOpen && (
        <div className="closet-delete-modal-layer" role="presentation" onClick={() => setIsDeleteOpen(false)}>
          <section className="closet-delete-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h2>이 기록을 삭제할까요 ?</h2>
            <div className="closet-delete-actions">
              <button type="button" onClick={deleteLook}>네</button>
              <button type="button" onClick={() => setIsDeleteOpen(false)}>아니요</button>
            </div>
          </section>
        </div>
      )}

      <ItemInfoModal item={viewItem} onClose={() => setViewItem(null)} />
      <BottomNav active="style" />
    </main>
  )
}

export function StyleCalendarPage() {
  const navigate = useNavigate()
  const [viewDate, setViewDate] = useState(() => new Date())
  const [daySheet, setDaySheet] = useState(null) // 같은 날 여러 룩 — {day, looks}
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`

  function moveMonth(delta) {
    setViewDate(new Date(year, month + delta, 1))
    setDaySheet(null)
  }

  function openLook(look) {
    stylingSession.setSavedLook(look)
    navigate('/archive/detail')
  }

  const { data } = useApi(async () => {
    const result = await apiRequest(`/api/v1/looks?month=${monthKey}`)
    return Array.isArray(result) ? result : []
  }, [monthKey], { cacheKey: `looks:${monthKey}` })
  const looks = data || []

  const firstDay = new Date(year, month, 1)
  const mondayOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: mondayOffset + daysInMonth }, (_, index) => index < mondayOffset ? null : index - mondayOffset + 1)

  return (
    <main className="style-calendar-screen" data-node-id="257:209">
      <header className="style-calendar-header">
        <BackButton onClick={() => navigate(-1)} />
        <div><strong>코디 캘린더</strong><span>STYLE CALENDAR</span></div>
      </header>
      <div className="style-calendar-message"><img src="/assets/style-calendar/calendar-puppy.png" alt="" /><span>그동안의 코디를 확인해볼까요 ?</span></div>

      <div className="calendar-month-nav">
        <button type="button" aria-label="이전 달" onClick={() => moveMonth(-1)}>‹</button>
        <strong>{year}. {String(month + 1).padStart(2, '0')}</strong>
        <button type="button" aria-label="다음 달" onClick={() => moveMonth(1)}>›</button>
      </div>

      <section className="calendar-card" aria-label={`${year}년 ${month + 1}월 코디 캘린더`}>
        <div className="calendar-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid">
          {cells.map((day, index) => {
            const dayLooks = day ? looks.filter((item) => Number(String(item.wornDate).slice(-2)) === day) : []
            const dayLook = dayLooks[0]
            return (
              <button
                key={`${index}-${day || 'empty'}`}
                className={dayLook ? 'marked' : ''}
                type="button"
                disabled={!day}
                style={dayLook?.generatedImageUrl ? { backgroundImage: `url(${assetUrl(dayLook.generatedImageUrl)})` } : undefined}
                onClick={() => {
                  if (dayLooks.length > 1) {
                    setDaySheet({ day, looks: dayLooks })
                  } else if (dayLook?.id) {
                    openLook(dayLook)
                  } else if (day) {
                    stylingSession.setLogDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
                    navigate('/archive')
                  }
                }}
              >
                {day || ''}
                {dayLooks.length > 1 && <em className="calendar-day-count">{dayLooks.length}</em>}
              </button>
            )
          })}
        </div>
      </section>

      {/* 같은 날 여러 룩 — 계약 §4-7 허용, 리스트 시트로 고른다 */}
      {daySheet && (
        <div className="day-sheet-layer" role="presentation" onClick={() => setDaySheet(null)}>
          <section className="day-sheet" role="dialog" aria-modal="true" aria-label="이 날의 코디" onClick={(event) => event.stopPropagation()}>
            <strong>{month + 1}월 {daySheet.day}일의 코디 {daySheet.looks.length}개</strong>
            <div className="day-sheet-list">
              {daySheet.looks.map((look) => (
                <button key={look.id} type="button" onClick={() => openLook(look)}>
                  <FadeImg src={assetUrl(look.generatedImageUrl)} alt="" />
                  <span>{look.concept || look.occasionLabel || '코디 기록'}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
      <BottomNav active="style" />
    </main>
  )
}
