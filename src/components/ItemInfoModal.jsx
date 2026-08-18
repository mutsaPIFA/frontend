import { useState } from 'react'
import { apiRequest, assetUrl } from '../api/client.js'
import { invalidateApiCache } from '../hooks/useApi.js'
import { itemDisplayName } from '../lib/format.js'
import { tagOptions } from '../lib/vocab.js'
import FadeImg from './FadeImg.jsx'

// 내 옷 정보 — 옷장 카드·코디 사용 아이템 탭 시 공용.
// editable이면 명칭·태그 수정 가능 (계약 §3-6 PATCH /closet-items/{id})
export default function ItemInfoModal({ item, editable = false, onClose, onSaved }) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  if (!item) return null

  function startEdit() {
    setForm({
      name: item.name || '',
      category: item.category || '',
      color: item.color || '',
      material: item.material || '',
      mood: item.mood || '',
    })
    setError('')
    setIsEditing(true)
  }

  function close() {
    setIsEditing(false)
    setForm(null)
    setError('')
    onClose()
  }

  async function save() {
    setIsSaving(true)
    setError('')
    try {
      const updated = await apiRequest(`/api/v1/closet-items/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          // 빈 문자열 = 명칭 제거 (계약 §3-6) — 항상 보낸다
          name: form.name.trim(),
          category: form.category || null,
          color: form.color || null,
          material: form.material || null,
          mood: form.mood || null,
        }),
      })
      invalidateApiCache('closet:')
      invalidateApiCache('dna:')
      invalidateApiCache('recommendations:')
      onSaved?.(updated)
      setIsEditing(false)
      setForm(null)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const chips = [
    ['종류', item.category],
    ['색상', item.color],
    ['소재', item.material],
    ['무드', item.mood],
  ].filter(([, value]) => value)

  return (
    <div className="item-modal-layer" role="presentation" onClick={close}>
      <section className="item-modal" role="dialog" aria-modal="true" aria-label="아이템 정보" onClick={(event) => event.stopPropagation()}>
        <div className="item-modal-image">
          <FadeImg src={assetUrl(item.cutoutUrl || item.imageUrl)} alt="" />
        </div>

        {!isEditing && (
          <>
            <div className="item-modal-title">
              <strong>{itemDisplayName(item)}</strong>
              {item.source && <span>{item.source === 'MCM' ? 'MCM' : 'OWN'}</span>}
            </div>
            {chips.length > 0 && (
              <div className="item-modal-chips">
                {chips.map(([label, value]) => (
                  <span key={label}><small>{label}</small>{value}</span>
                ))}
              </div>
            )}
            <div className="item-modal-actions">
              {editable && <button className="item-modal-edit" type="button" onClick={startEdit}>수정</button>}
              <button className="item-modal-close" type="button" onClick={close}>닫기</button>
            </div>
          </>
        )}

        {isEditing && (
          <>
            <label className="item-modal-name">
              <span>명칭</span>
              <input
                value={form.name}
                maxLength={30}
                placeholder="예: 출근용 셔츠 (비우면 태그로 표시)"
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <div className="item-modal-selects">
              {[['category', '종류'], ['color', '색상'], ['material', '소재'], ['mood', '무드']].map(([key, label]) => (
                <label key={key}>
                  <span>{label}</span>
                  <select value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}>
                    {!form[key] && <option value="">선택</option>}
                    {tagOptions[key].map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
              ))}
            </div>
            {error && <p className="item-modal-error" role="alert">{error}</p>}
            <div className="item-modal-actions">
              <button className="item-modal-edit" type="button" onClick={() => setIsEditing(false)} disabled={isSaving}>취소</button>
              <button className="item-modal-close" type="button" onClick={save} disabled={isSaving}>{isSaving ? '저장 중...' : '저장'}</button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
