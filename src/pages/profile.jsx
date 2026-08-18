import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../api/client.js'
import BottomNav from '../components/BottomNav.jsx'
import { clearApiCache, useApi } from '../hooks/useApi.js'

export function ProfilePage() {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const { data } = useApi(async () => {
    const [me, looks] = await Promise.all([
      apiRequest('/api/v1/me'),
      apiRequest('/api/v1/looks'),
    ])
    return { me, looks: Array.isArray(looks) ? looks : [] }
  }, [], { cacheKey: 'profile' })

  const me = data?.me || { nickname: '', email: '' }
  const looks = data?.looks || []

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await apiRequest('/api/v1/auth/logout', { method: 'POST' })
    } catch {
      // 토큰이 이미 만료된 경우에도 로컬 세션은 정리한다.
    } finally {
      localStorage.removeItem('mcm_access_token')
      sessionStorage.clear()
      clearApiCache()
      navigate('/login', { replace: true })
    }
  }

  return (
    <main className="profile-screen" data-node-id="4:2912">
      <div className="profile-content">
        <header className="profile-header">
          <button className="profile-back-button" type="button" aria-label="홈으로 가기" onClick={() => navigate('/')}>
            <img src="/assets/profile/back.svg" alt="" />
          </button>
          <div><strong>프로필</strong><span>PROFILE</span></div>
          <span />
        </header>

        <section className="profile-identity">
          <div className="profile-avatar">
            <img src="/assets/profile/profile-mascot.png" alt="프로필 이미지" />
          </div>
          <h1>{me.nickname || ' '}</h1>
          {me.email && <p>{me.email}</p>}
        </section>

        <section className="profile-stats-grid">
          <button type="button" className="profile-stat-card profile-stat-card-wide" onClick={() => navigate('/archive/calendar')}>
            <span className="profile-stat-icon"><img src="/assets/profile/looks.svg" alt="" /></span>
            <span className="profile-stat-label">저장한 코디</span>
            <strong>{looks.length} <small>looks</small></strong>
          </button>
        </section>
        <section className="profile-logout">
          <button type="button" onClick={handleLogout} disabled={isLoggingOut}>{isLoggingOut ? '로그아웃 중...' : '로그아웃'}</button>
          <span>MCM MUSE</span>
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  )
}
