// 긴 AI 작업(스캔 10~40s, 코디 생성 20~40s) 동안의 풀스크린 대기 연출 — 데모의 와우 포인트 구간
export default function LoadingOverlay({ image, title, subtitle }) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <img className="loading-overlay-puppy" src={image} alt="" />
      <strong>{title}</strong>
      {subtitle && <p>{subtitle}</p>}
      <span className="loading-overlay-dots" aria-hidden="true"><i /><i /><i /></span>
    </div>
  )
}
