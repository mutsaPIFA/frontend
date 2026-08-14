const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export async function apiRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData
  const accessToken = localStorage.getItem('mcm_access_token')
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers,
    ...options,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    const message = errorBody?.message ?? `API 요청에 실패했습니다. (${response.status})`
    throw new Error(message)
  }

  if (response.status === 204) return null
  return response.json()
}

export { API_BASE_URL }
