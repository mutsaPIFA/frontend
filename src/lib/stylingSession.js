// 화면 간 세션 상태의 단일 창구 — sessionStorage 키를 화면 코드에서 직접 만지지 않는다.
// 키가 흩어져 있을 때 "다른 화면이 남긴 값을 잘못 신뢰"하는 류의 버그가 나왔던 것의 구조적 방지.

const read = (key, fallback) => {
  try {
    return JSON.parse(sessionStorage.getItem(key) ?? fallback)
  } catch {
    return JSON.parse(fallback)
  }
}
const write = (key, value) => sessionStorage.setItem(key, JSON.stringify(value))

export const stylingSession = {
  // 코디 후보 (계약 §4-4 응답 그대로)
  outfits: () => {
    const value = read('mcm_outfits', '[]')
    return Array.isArray(value) ? value : []
  },
  setOutfits: (outfits) => write('mcm_outfits', outfits),

  selectedIndex: () => Number(sessionStorage.getItem('mcm_selected_outfit_index') || 0),
  setSelectedIndex: (index) => sessionStorage.setItem('mcm_selected_outfit_index', String(index)),
  selectedOutfit() {
    return this.outfits()[this.selectedIndex()] || {}
  },

  selectedMood: () => read('mcm_selected_mood', '{}') || {},
  setSelectedMood: (mood) => write('mcm_selected_mood', mood || {}),

  // 저장된 룩 (계약 §4-5 응답)
  savedLook: () => read('mcm_saved_look', 'null'),
  setSavedLook: (look) => write('mcm_saved_look', look),

  // 스캔 결과 (계약 §3-1 응답) — 태그는 사용자 수정본으로 덮어쓸 수 있다
  scanResult: () => read('mcm_scan_result', 'null'),
  setScanResult: (result) => write('mcm_scan_result', result),
  updateScanTags(tags) {
    const result = this.scanResult()
    if (result) this.setScanResult({ ...result, tags })
  },

  // DNA 분석에 쓸 아이템 (옷장에서 선택; 비어 있으면 화면이 옷장 전체로 폴백)
  dnaItemIds: () => {
    const value = read('mcm_style_dna_item_ids', '[]')
    return Array.isArray(value) ? value : []
  },
  setDnaItemIds: (ids) => write('mcm_style_dna_item_ids', ids),

  // 기록 날짜 (계약 §4-5 wornDate — 미지정 시 서버가 오늘)
  logDate: () => sessionStorage.getItem('mcm_log_date') || '',
  setLogDate: (date) => {
    if (date) sessionStorage.setItem('mcm_log_date', date)
    else sessionStorage.removeItem('mcm_log_date')
  },
  clearLogDate: () => sessionStorage.removeItem('mcm_log_date'),
}
