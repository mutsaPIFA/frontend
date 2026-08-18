import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, assetUrl } from '../api/client.js'
import BottomNav from '../components/BottomNav.jsx'
import { clearApiCache, invalidateApiCache, useApi } from '../hooks/useApi.js'
import { tagColorHex } from '../lib/vocab.js'

export function ProfilePage() {
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [message, setMessage] = useState('')

  const { data, setData } = useApi(async () => {
    const [me, looks, closet, wishlist] = await Promise.all([
      apiRequest('/api/v1/me'),
      apiRequest('/api/v1/looks'),
      apiRequest('/api/v1/closet-items'),
      apiRequest('/api/v1/wishlist'),
    ])
    return {
      me,
      lookCount: Array.isArray(looks) ? looks.length : 0,
      closetCount: Array.isArray(closet) ? closet.length : 0,
      wishlistCount: Array.isArray(wishlist) ? wishlist.length : 0,
    }
  }, [], { cacheKey: 'profile' })

  const me = data?.me || { nickname: '', email: '', avatarUrl: null, styleDna: null }
  const dna = me.styleDna

  // §5-1 닉네임 수정
  async function saveNickname() {
    const nickname = nameDraft.trim()
    if (!nickname) return
    try {
      const updated = await apiRequest('/api/v1/me', { method: 'PATCH', body: JSON.stringify({ nickname }) })
      setData((current) => ({ ...current, me: updated }))
      setIsEditingName(false)
    } catch (error) {
      setMessage(error.message)
    }
  }

  // §5-2 프로필 이미지 — 업로드 즉시 교체
  async function changeAvatar(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setMessage('')
    const formData = new FormData()
    formData.append('image', file)
    try {
      const result = await apiRequest('/api/v1/me/avatar', { method: 'POST', body: formData })
      setData((current) => ({ ...current, me: { ...current.me, avatarUrl: result.avatarUrl } }))
      invalidateApiCache('profile')
    } catch (error) {
      setMessage(error.message)
    }
  }

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
          <span />
          <div><strong>프로필</strong><span>PROFILE</span></div>
          <span />
        </header>

        <section className="profile-identity">
          <label className="profile-avatar" aria-label="프로필 이미지 변경">
            <img src={me.avatarUrl ? assetUrl(me.avatarUrl) : '/assets/profile/profile-mascot.png'} alt="프로필 이미지" />
            <span className="profile-avatar-edit">✎</span>
            <input type="file" accept="image/*" onChange={changeAvatar} />
          </label>
          {!isEditingName ? (
            <h1>
              {me.nickname || ' '}
              {me.nickname && (
                <button className="profile-name-edit" type="button" aria-label="닉네임 수정" onClick={() => { setNameDraft(me.nickname); setIsEditingName(true) }}>✎</button>
              )}
            </h1>
          ) : (
            <div className="profile-name-form">
              <input value={nameDraft} maxLength={20} onChange={(event) => setNameDraft(event.target.value)} />
              <button type="button" onClick={saveNickname}>저장</button>
              <button type="button" onClick={() => setIsEditingName(false)}>취소</button>
            </div>
          )}
          {me.email && <p>{me.email}</p>}
        </section>

        {/* 나의 스타일 DNA — 최근 분석 스냅샷 (계약 §1-5), 분석 전엔 미표시 */}
        {dna && (
          <section className="profile-dna-card">
            <div className="profile-card-label">MY STYLE DNA</div>
            <div className="dna-keywords">
              {(dna.keywords || []).map((keyword, i) => (
                <em key={keyword} style={{ animationDelay: `${i * 0.12}s` }}>{keyword}</em>
              ))}
            </div>
            {(dna.dominantColors || []).length > 0 && (
              <div className="dna-colors" aria-label={`주요 컬러: ${dna.dominantColors.join(', ')}`}>
                {dna.dominantColors.map((color, i) => (
                  <i key={color} title={color} style={{ background: tagColorHex[color] || tagColorHex.기타, animationDelay: `${0.3 + i * 0.12}s` }} />
                ))}
              </div>
            )}
            <p>{dna.summary}</p>
          </section>
        )}

        <section className="profile-stats-grid">
          <button type="button" className="profile-stat-card profile-stat-card-wide" onClick={() => navigate('/archive/calendar')}>
            <span className="profile-stat-icon"><img src="/assets/profile/looks.svg" alt="" /></span>
            <span className="profile-stat-label">저장한 코디</span>
            <strong>{data?.lookCount ?? 0} <small>looks</small></strong>
          </button>
          <button type="button" className="profile-stat-card" onClick={() => navigate('/closet')}>
            <span className="profile-stat-label">옷장 아이템</span>
            <strong>{data?.closetCount ?? 0} <small>items</small></strong>
          </button>
          <button type="button" className="profile-stat-card" onClick={() => navigate('/wishlist')}>
            <span className="profile-stat-label">찜한 상품</span>
            <strong>{data?.wishlistCount ?? 0} <small>picks</small></strong>
          </button>
        </section>

        {message && <p className="profile-message" role="status">{message}</p>}
        <section className="profile-logout">
          <button type="button" onClick={handleLogout} disabled={isLoggingOut}>{isLoggingOut ? '로그아웃 중...' : '로그아웃'}</button>
          <span>MCM MUSE</span>
        </section>
      </div>

      <BottomNav active="profile" />
    </main>
  )
}
