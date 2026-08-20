// 태그·카테고리 어휘 — ai 스키마 enum과 동일 집합 (계약 §3-1)

export const categoryOptions = [
  { label: 'ALL', value: '' },
  { label: 'CLOTHES', value: 'clothes' },
  { label: 'BAGS', value: '가방' },
  { label: 'ACCESSORIES', value: '악세서리' },
]

// 스캔 태그 수정 옵션 (계약 §3-1: 태그는 사용자 수정 가능)
export const tagOptions = {
  category: ['상의', '하의', '아우터', '원피스', '신발', '가방', '악세서리'],
  color: ['블랙', '화이트', '네이비', '그레이', '베이지', '브라운', '카멜', '그린', '핑크', '블루', '스카이블루', '레드', '옐로우', '카키', '퍼플', '오렌지', '기타'],
  material: ['면', '니트', '데님', '가죽', '실크', '울', '합성', '기타'],
  mood: ['미니멀', '캐주얼', '클래식', '스트릿', '페미닌', '럭셔리'],
}

// 태그 어휘 색 → 스와치 hex (DNA dominantColors 표시용)
export const tagColorHex = {
  블랙: '#1f1f1f', 화이트: '#f5f2ea', 네이비: '#2c3a58', 그레이: '#9a9a94', 베이지: '#d9c9a8',
  브라운: '#7a5a3a', 카멜: '#b9855a', 그린: '#5b6a39', 핑크: '#e2a9b8', 블루: '#3e5f9c',
  스카이블루: '#a3c4e2', 레드: '#a84238', 옐로우: '#d4b04a', 카키: '#7a7350', 퍼플: '#7b5f93',
  오렌지: '#c9803f', 기타: '#c9c2b8',
}

// 서버 iconKey(계약 §4-3) → 보유한 svg 자산. office/daily/party 전용 아이콘은 아직 없어 유사 아이콘으로 대체
const moodIconFiles = { dinner: 'dinner', office: 'studio', trip: 'trip', daily: 'walk', walk: 'walk', party: 'dinner' }

export function moodIcon(iconKey) {
  return `/assets/mood/${moodIconFiles[iconKey] || 'walk'}.svg`
}
