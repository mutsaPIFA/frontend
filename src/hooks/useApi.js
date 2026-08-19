import { useCallback, useEffect, useState } from 'react'

// 세션 메모리 캐시 — 한 번 본 화면은 재방문 시 즉시 그리고, 뒤에서 갱신한다(stale-while-revalidate).
const cache = new Map()

// 낙관적 갱신(setData) 횟수 — 갱신 이전에 출발한 fetch가 늦게 도착해 새 상태를 덮어쓰는 경합 방지.
// (예: 화면 진입 재검증 중 찜 하트를 누르면, 늦게 온 이전 목록이 하트를 원위치시키던 버그)
const mutationVersions = new Map()

// 로그인/로그아웃 시 호출 — 다른 계정의 데이터가 보이면 안 된다
export function clearApiCache() {
  cache.clear()
}

// 변경 작업(옷장 등록·룩 저장 등) 후 관련 화면 캐시만 무효화
export function invalidateApiCache(prefix) {
  for (const key of cache.keys()) {
    if (String(key).startsWith(prefix)) cache.delete(key)
  }
}

// 조회 화면 공통 훅 — data/isLoading/error 3종 상태와 언마운트 후 setState 방지를 한 곳에.
// fetcher가 throw하면 error에 메시지가 담긴다(빈 옷장 안내처럼 의도된 중단 포함).
// options.cacheKey를 주면 SWR 캐시가 적용된다. setData는 낙관적 갱신용(캐시에도 반영).
export function useApi(fetcher, deps = [], { cacheKey } = {}) {
  const cached = cacheKey !== undefined ? cache.get(cacheKey) : undefined
  const [data, setDataState] = useState(cached ?? null)
  const [isLoading, setIsLoading] = useState(cached === undefined)
  const [error, setError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let alive = true
    const hasCache = cacheKey !== undefined && cache.has(cacheKey)
    if (hasCache) {
      setDataState(cache.get(cacheKey))
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }
    setError('')
    const versionAtStart = cacheKey !== undefined ? mutationVersions.get(cacheKey) || 0 : 0
    Promise.resolve()
      .then(fetcher)
      .then((result) => {
        // fetch 중에 setData(낙관적 갱신)가 있었다면 이 응답은 낡았다 — 버린다
        if (cacheKey !== undefined && (mutationVersions.get(cacheKey) || 0) !== versionAtStart) {
          if (alive) setIsLoading(false)
          return
        }
        if (cacheKey !== undefined) cache.set(cacheKey, result)
        if (alive) {
          setDataState(result)
          setIsLoading(false)
        }
      })
      .catch((requestError) => {
        if (!alive) return
        // 캐시된 데이터를 이미 보여주고 있으면 백그라운드 갱신 실패는 조용히 넘긴다
        if (!hasCache) {
          setDataState(null)
          setError(requestError.message || '요청에 실패했어요.')
        }
        setIsLoading(false)
      })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken])

  const setData = useCallback((updater) => {
    if (cacheKey !== undefined) mutationVersions.set(cacheKey, (mutationVersions.get(cacheKey) || 0) + 1)
    setDataState((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater
      if (cacheKey !== undefined) cache.set(cacheKey, next)
      return next
    })
  }, [cacheKey])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  return { data, setData, isLoading, error, reload }
}
