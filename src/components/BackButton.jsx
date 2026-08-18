// 뒤로가기 통일 — 화면마다 제각각이던 아이콘을 인라인 SVG 한 세트로
export default function BackButton({ onClick, className = '' }) {
  return (
    <button className={`back-chevron ${className}`.trim()} type="button" aria-label="뒤로 가기" onClick={onClick}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.5 5.5 8 12l6.5 6.5" />
      </svg>
    </button>
  )
}
