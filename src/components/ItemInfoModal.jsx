import { assetUrl } from '../api/client.js'
import { scanItemName } from '../lib/format.js'
import FadeImg from './FadeImg.jsx'

// 내 옷 정보 — 옷장 카드·코디 사용 아이템 탭 시 공용
export default function ItemInfoModal({ item, onClose }) {
  if (!item) return null
  const chips = [
    ['종류', item.category],
    ['색상', item.color],
    ['소재', item.material],
    ['무드', item.mood],
  ].filter(([, value]) => value)

  return (
    <div className="item-modal-layer" role="presentation" onClick={onClose}>
      <section className="item-modal" role="dialog" aria-modal="true" aria-label="아이템 정보" onClick={(event) => event.stopPropagation()}>
        <div className="item-modal-image">
          <FadeImg src={assetUrl(item.cutoutUrl || item.imageUrl)} alt="" />
        </div>
        <div className="item-modal-title">
          <strong>{scanItemName(item)}</strong>
          {item.source && <span>{item.source === 'MCM' ? 'MCM' : 'OWN'}</span>}
        </div>
        {chips.length > 0 && (
          <div className="item-modal-chips">
            {chips.map(([label, value]) => (
              <span key={label}><small>{label}</small>{value}</span>
            ))}
          </div>
        )}
        <button className="item-modal-close" type="button" onClick={onClose}>닫기</button>
      </section>
    </div>
  )
}
