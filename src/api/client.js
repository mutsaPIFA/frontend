const BACKEND_URL_KEY = 'mcm_backend_url'
const DEFAULT_BACKEND_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function normalizeBaseUrl(value, fallback) {
  const candidate = String(value || fallback).trim().replace(/\/+$/, '')
  try {
    const url = new URL(candidate)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported protocol')
    return url.toString().replace(/\/+$/, '')
  } catch {
    return fallback
  }
}

export function getBackendUrl() {
  return normalizeBaseUrl(localStorage.getItem(BACKEND_URL_KEY), DEFAULT_BACKEND_URL)
}

export function saveServerUrls({ backendUrl }) {
  localStorage.setItem(BACKEND_URL_KEY, normalizeBaseUrl(backendUrl, DEFAULT_BACKEND_URL))
}

export function clearServerUrls() {
  localStorage.removeItem(BACKEND_URL_KEY)
  localStorage.removeItem('mcm_ai_url')
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
