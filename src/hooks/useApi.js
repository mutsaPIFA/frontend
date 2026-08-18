import { useEffect, useState } from 'react'

// 조회 화면 공통 훅 — data/isLoading/error 3종 상태와 언마운트 후 setState 방지를 한 곳에.
// fetcher가 throw하면 error에 메시지가 담긴다(빈 옷장 안내처럼 의도된 중단 포함).
// setData는 목록 화면의 낙관적 갱신(삭제 등)용.
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setIsLoading(true)
    setError('')
    Promise.resolve()
      .then(fetcher)
      .then((result) => {
        if (alive) setData(result)
      })
      .catch((requestError) => {
        if (alive) {
          setData(null)
          setError(requestError.message || '요청에 실패했어요.')
        }
      })
      .finally(() => {
        if (alive) setIsLoading(false)
      })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, setData, isLoading, error }
}
