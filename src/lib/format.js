import { assetUrl } from '../api/client.js'

export function formatPrice(price) {
  return `₩${Number(price).toLocaleString('ko-KR')}`
}

// 사이즈는 '|' 구분 목록일 수 있음 (계약 §2 — 신발은 사이즈 리스트) — 표시용으로 축약
export function formatSize(size) {
  if (!size) return null
  const parts = size.split('|').map((part) => part.trim()).filter(Boolean)
  if (parts.length === 0) return null
  return parts.length > 1 ? `${parts[0]} 외 ${parts.length - 1}` : parts[0]
}

// 'yyyy-MM-dd' → '2026.08.18 (화)'
export function formatWornDate(value) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return String(value)
  const day = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
  return `${String(value).replaceAll('-', '.')} (${day})`
}

// 표시명은 태그 조합으로 만든다 (스캔 결과·명칭 없는 아이템용)
export function scanItemName(tags) {
  return [tags?.color, tags?.material, tags?.category].filter(Boolean).join(' ') || '내 아이템'
}

// 옷장 아이템 표시명 — 사용자 지정 명칭(계약 §3-6) 우선, 없으면 태그 조합
export function itemDisplayName(item) {
  return item?.name || scanItemName(item)
}

export function closetItemImage(item) {
  return assetUrl(item.cutoutUrl || item.imageUrl)
}

// MCM 이미지 CDN(Amplience)은 ?w= 로 리사이즈한다 — 시드 URL의 ?sw=(SFCC 문법)는 무시돼
// 원본 2000px(~128KB)이 그대로 내려온다. 실측: ?w=400 = 6KB. 목록 화면은 반드시 이걸 거칠 것.
export function productThumb(url, width = 400) {
  if (!url || !url.includes('images.mcmworldwide.com')) return url
  return `${url.split('?')[0]}?w=${width}&fmt=auto`
}
