import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage, LoginRequestPage, SignupPage, SplashPage } from './pages/auth.jsx'
import { ProductDetailPage, RecommendationsPage, ShopPage } from './pages/shop.jsx'
import { ClosetAddCompletePage, ClosetPage, RecognizeResultPage, ScanPage, StyleDnaPage } from './pages/closet.jsx'
import { MoodSelectionPage, OutfitDetailPage, OutfitRecommendationPage } from './pages/styling.jsx'
import { StyleCalendarPage, StyleLogDetailPage, StyleLogPage } from './pages/archive.jsx'
import { ProfilePage } from './pages/profile.jsx'

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
  const [showSplash, setShowSplash] = useState(() => sessionStorage.getItem('mcm_intro_seen') !== 'true')

  useEffect(() => {
    if (!showSplash) return undefined

    const timer = window.setTimeout(() => {
      sessionStorage.setItem('mcm_intro_seen', 'true')
      setShowSplash(false)
    }, 1400)

    return () => window.clearTimeout(timer)
  }, [showSplash])

  if (showSplash) return <SplashPage />
  if (localStorage.getItem('mcm_access_token')) return <ShopPage />
  return <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootPage />} />
      <Route path="/auth/request" element={<LoginRequestPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/closet" element={<ProtectedRoute><ClosetPage /></ProtectedRoute>} />
      <Route path="/closet/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
      <Route path="/closet/scan/recognize" element={<ProtectedRoute><RecognizeResultPage /></ProtectedRoute>} />
      <Route path="/closet/scan/recognize/complete" element={<ProtectedRoute><ClosetAddCompletePage /></ProtectedRoute>} />
      <Route path="/style-dna" element={<ProtectedRoute><StyleDnaPage /></ProtectedRoute>} />
      <Route path="/products/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
      <Route path="/products/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><PlaceholderPage title="MCM 상품" /></ProtectedRoute>} />
      <Route path="/styling" element={<ProtectedRoute><MoodSelectionPage /></ProtectedRoute>} />
      <Route path="/styling/recommendation" element={<ProtectedRoute><OutfitRecommendationPage /></ProtectedRoute>} />
      <Route path="/styling/recommendation/detail" element={<ProtectedRoute><OutfitDetailPage /></ProtectedRoute>} />
      <Route path="/archive" element={<ProtectedRoute><StyleLogPage /></ProtectedRoute>} />
      <Route path="/archive/detail" element={<ProtectedRoute><StyleLogDetailPage /></ProtectedRoute>} />
      <Route path="/archive/calendar" element={<ProtectedRoute><StyleCalendarPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="*" element={<PlaceholderPage title="페이지를 찾을 수 없습니다" />} />
    </Routes>
  )
}

export default App
