import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// 앞으로 갈 땐 맨 위에서 시작, 뒤로 올 땐 보던 위치 복원 — 목록↔상세 왕복이 자연스러워진다
const scrollPositions = new Map()

export default function ScrollManager() {
  const location = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    const saved = scrollPositions.get(location.key)
    if (navigationType === 'POP' && saved != null) {
      window.scrollTo(0, saved)
    } else {
      window.scrollTo(0, 0)
    }
    return () => {
      scrollPositions.set(location.key, window.scrollY)
    }
  }, [location, navigationType])

  return null
}
