import { useState } from 'react'
import { apiRequest, assetUrl } from '../api/client.js'
import { invalidateApiCache } from '../hooks/useApi.js'
import { itemDisplayName } from '../lib/format.js'
import { tagOptions } from '../lib/vocab.js'
import ProductImg from './ProductImg.jsx'

// 내 옷 정보 — 옷장 카드·코디 사용 아이템 탭 시 공용.
// editable이면 명칭·태그 수정 가능 (계약 §3-6 PATCH /closet-items/{id})
export default function ItemInfoModal({ item, editable = false, onClose, onSaved, onDeleted }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [form, setForm] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  if (!item) return null

  function startEdit() {
    setForm({
      // 미설정이어도 현재 표시명이 채워진 채로 시작 — 그걸 고치면 된다
      name: itemDisplayName(item),
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
    setIsConfirmingDelete(false)
    setForm(null)
    setError('')
    onClose()
  }

  // 계약 §3-5 — 옷장에서 삭제 (룩 기록은 보존되는 소프트 삭제)
  async function deleteItem() {
    setIsSaving(true)
    setError('')
    try {
      await apiRequest(`/api/v1/closet-items/${item.id}`, { method: 'DELETE' })
      invalidateApiCache('closet:')
      invalidateApiCache('dna:')
      invalidateApiCache('recommendations:')
      onDeleted?.(item.id)
      close()
    } catch (deleteError) {
      setError(deleteError.message)
      setIsConfirmingDelete(false)
    } finally {
      setIsSaving(false)
    }
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
          <ProductImg src={item.cutoutUrl || item.imageUrl} width={600} alt="" />
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
            {error && <p className="item-modal-error" role="alert">{error}</p>}
            {!isConfirmingDelete ? (
              <>
                <div className="item-modal-actions">
                  {editable && <button className="item-modal-edit" type="button" onClick={startEdit}>수정</button>}
                  <button className="item-modal-close" type="button" onClick={close}>닫기</button>
                </div>
                {editable && (
                  <button className="item-modal-delete" type="button" onClick={() => setIsConfirmingDelete(true)}>옷장에서 삭제</button>
                )}
              </>
            ) : (
              <div className="item-modal-actions">
                <button className="item-modal-edit" type="button" onClick={() => setIsConfirmingDelete(false)} disabled={isSaving}>아니요</button>
                <button className="item-modal-close item-modal-delete-confirm" type="button" onClick={deleteItem} disabled={isSaving}>{isSaving ? '삭제 중...' : '삭제할게요'}</button>
              </div>
            )}
          </>
        )}

        {isEditing && (
          <>
            <label className="item-modal-name">
              <span>명칭</span>
              <input
                value={form.name}
                maxLength={30}
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
