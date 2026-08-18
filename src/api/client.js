// 서버 주소는 빌드 타임 고정 — 배포는 nginx 단일 origin이라 빈 값(상대 경로)으로 빌드한다.
// dev는 .env가 없으면 localhost:8080.
const API_BASE = (() => {
  const raw = String(import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').trim()
  try {
    const url = new URL(raw)
    if (!['http:', 'https:'].includes(url.protocol)) return ''
    return url.toString().replace(/\/+$/, '')
  } catch {
    return ''
  }
})()

export function getBackendUrl() {
  return API_BASE
}

export function assetUrl(value) {
  if (!value) return value
  if (value.startsWith('/assets/')) return value
  if (value.startsWith('/')) return `${getBackendUrl()}${value}`
  try {
    const url = new URL(value)
    const configured = new URL(getBackendUrl())
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      url.protocol = configured.protocol
      url.hostname = configured.hostname
      url.port = configured.port
    }
    return url.toString()
  } catch {
    return value
  }
}

export async function apiRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData
  const request = (accessToken) => fetch(`${getBackendUrl()}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  })

  let accessToken = localStorage.getItem('mcm_access_token')
  let response = await request(accessToken)

  if (response.status === 401 && !path.startsWith('/api/v1/auth/')) {
    const refreshResponse = await fetch(`${getBackendUrl()}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    if (refreshResponse.ok) {
      const refreshed = await refreshResponse.json()
      accessToken = refreshed.accessToken
      localStorage.setItem('mcm_access_token', accessToken)
      response = await request(accessToken)
    }

    // refresh까지 만료 — 화면마다 에러 문구를 띄우는 대신 로그인으로 보낸다
    if (response.status === 401) {
      localStorage.removeItem('mcm_access_token')
      window.location.assign('/login')
      throw new Error('로그인이 만료되었어요. 다시 로그인해 주세요.')
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    const message = errorBody?.message ?? `API 요청에 실패했습니다. (${response.status})`
    throw new Error(message)
  }

  if (response.status === 204) return null
  return response.json()
}

export const API_BASE_URL = DEFAULT_BACKEND_URL
