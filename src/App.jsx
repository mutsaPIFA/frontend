import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { apiRequest } from './api/client.js'
import { clearApiCache } from './hooks/useApi.js'
import { LoginPage, LoginRequestPage, SignupPage, SplashPage } from './pages/auth.jsx'
import { ProductDetailPage, RecommendationsPage, ShopPage, WishlistPage } from './pages/shop.jsx'
import { ClosetAddCompletePage, ClosetPage, RecognizeResultPage, ScanPage, StyleDnaPage } from './pages/closet.jsx'
import { MoodSelectionPage, OutfitDetailPage, OutfitRecommendationPage } from './pages/styling.jsx'
import { StyleCalendarPage, StyleLogDetailPage, StyleLogPage } from './pages/archive.jsx'
import { ProfilePage } from './pages/profile.jsx'
import ScrollManager from './components/ScrollManager.jsx'

function PlaceholderPage({ title }) {
  return (
    <main className="page-shell">
      <section className="placeholder-card">
        <p className="eyebrow">MCM MUSE</p>
        <h1>{title}</h1>
        <p>Figma 프레임을 연결해 실제 화면으로 구현할 영역입니다.</p>
        <Link className="button button-primary" to="/">홈으로 돌아가기</Link>
      </section>
    </main>
  )
}

function ProtectedRoute({ children }) {
  const accessToken = localStorage.getItem('mcm_access_token')
  return accessToken ? children : <Navigate to="/login" replace />
}

function RootPage() {
  // 앱(APK)은 실행할 때마다 스플래시 — 웹은 세션당 1회
  const [showSplash, setShowSplash] = useState(() => isNativeApp || sessionStorage.getItem('mcm_intro_seen') !== 'true')

  useEffect(() => {
    if (!showSplash) return undefined

    const timer = window.setTimeout(() => {
      sessionStorage.setItem('mcm_intro_seen', 'true')
      setShowSplash(false)
    }, 1400)

    return () => window.clearTimeout(timer)
  }, [showSplash])

  if (showSplash) return <SplashPage />
  if (localStorage.getItem('mcm_access_token')) return <ClosetPage />
  if (isNativeApp) return <Navigate to="/login" replace />
  return <GuestEntry />
}

// Capacitor 앱(APK) 여부 — 앱에서는 게스트 자동 발급 없이 일반 로그인으로 (부스 패드는 고정 계정 사용)
const isNativeApp = Boolean(window.Capacitor?.isNativePlatform?.())

// QR 진입(계약 §1-6) — 토큰이 없으면 자동으로 게스트 계정을 발급해 바로 옷장으로.
// 팀·심사위원의 일반 로그인은 /login 직접 접근으로 유지된다.
function GuestEntry() {
  const [status, setStatus] = useState('issuing')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const result = await apiRequest('/api/v1/auth/guest', { method: 'POST' })
        localStorage.setItem('mcm_access_token', result.accessToken)
        clearApiCache()
        if (alive) setStatus('done')
      } catch {
        if (alive) setStatus('failed')
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  if (status === 'done') return <ClosetPage />
  if (status === 'failed') return <Navigate to="/login" replace />
  return <SplashPage />
}

function App() {
  return (
    <>
    <ScrollManager />
    <Routes>
      <Route path="/" element={<RootPage />} />
      <Route path="/auth/request" element={<LoginRequestPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/shop" element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
      <Route path="/closet" element={<ProtectedRoute><ClosetPage /></ProtectedRoute>} />
      <Route path="/closet/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
      <Route path="/closet/scan/recognize" element={<ProtectedRoute><RecognizeResultPage /></ProtectedRoute>} />
      <Route path="/closet/scan/recognize/complete" element={<ProtectedRoute><ClosetAddCompletePage /></ProtectedRoute>} />
      <Route path="/style-dna" element={<ProtectedRoute><StyleDnaPage /></ProtectedRoute>} />
      <Route path="/products/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
      <Route path="/products/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><PlaceholderPage title="MCM 상품" /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
      <Route path="/styling" element={<ProtectedRoute><MoodSelectionPage /></ProtectedRoute>} />
      <Route path="/styling/recommendation" element={<ProtectedRoute><OutfitRecommendationPage /></ProtectedRoute>} />
      <Route path="/styling/recommendation/detail" element={<ProtectedRoute><OutfitDetailPage /></ProtectedRoute>} />
      <Route path="/archive" element={<ProtectedRoute><StyleLogPage /></ProtectedRoute>} />
      <Route path="/archive/detail" element={<ProtectedRoute><StyleLogDetailPage /></ProtectedRoute>} />
      <Route path="/archive/calendar" element={<ProtectedRoute><StyleCalendarPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="*" element={<PlaceholderPage title="페이지를 찾을 수 없습니다" />} />
    </Routes>
    </>
  )
}

export default App
