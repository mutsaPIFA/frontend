import { Link } from 'react-router-dom'

// 하단 바 — 화면별 피그마 export 아이콘이 제각각이던 것을 인라인 SVG 한 세트로 통일.
// stroke=currentColor라 활성 색(.active)이 CSS만으로 걸린다.
const navIcons = {
  shop: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5.5 8h13l-1.1 12.5H6.6L5.5 8Z" />
      <path d="M9 10.5V6a3 3 0 0 1 6 0v4.5" />
    </svg>
  ),
  closet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.2 3.8a2.2 2.2 0 1 0-4.3.7c.2 1 1.1 1.5 2.1 1.5" />
      <path d="M12 6v2.4" />
      <path d="m12 8.4 8.6 6.9a1.5 1.5 0 0 1-.9 2.7H4.3a1.5 1.5 0 0 1-.9-2.7L12 8.4Z" />
    </svg>
  ),
  style: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  ),
}

const navTabs = [
  { key: 'shop', to: '/', label: 'shop' },
  { key: 'closet', to: '/closet', label: 'closet' },
  { key: 'style', to: '/styling', label: 'style' },
  { key: 'profile', to: '/profile', label: 'profile' },
]

export default function BottomNav({ active }) {
  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      {navTabs.map((tab) => (
        <Link key={tab.key} className={active === tab.key ? 'active' : ''} to={tab.to} aria-current={active === tab.key ? 'page' : undefined}>
          {navIcons[tab.key]}
          <span>{tab.label}</span>
        </Link>
      ))}
    </nav>
  )
}
