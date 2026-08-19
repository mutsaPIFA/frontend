import { assetUrl } from '../api/client.js'
import { productThumb } from '../lib/format.js'
import FadeImg from './FadeImg.jsx'

// MCM 상품 사진 전용 이미지 — 상품 사진에 얽힌 두 정책을 이 한 곳에 고정한다.
// ① 리사이즈: 이미지 CDN(Amplience)은 ?w= 만 알아듣는다 — 표면별 폭으로 경량화 (원본 2000px 방지)
// ② 배경 경계 제거: CDN 실사진에는 스튜디오 배경(실측 rgb(247) 균일)이 박혀 있다. 표면이 tone으로 고른다 —
//    white(목록: 배경을 흰색까지 끌어올려 흰 카드에 융합) / studio(상세: 회색 유지, 영역을 같은 톤으로).
//    누끼 PNG는 투명이므로 아무 배경도 깔지 않는다 — 조건 분기가 여기 안에 있다.
export default function ProductImg({ src, width = 400, tone = 'white', className = '', ...props }) {
  const resolved = assetUrl(src)
  const isStudioPhoto = typeof resolved === 'string' && resolved.includes('images.mcmworldwide.com')
  const toneClass = isStudioPhoto ? `product-img-${tone}` : ''
  return (
    <FadeImg
      {...props}
      className={`${toneClass} ${className}`.trim()}
      src={productThumb(resolved, width)}
    />
  )
}
