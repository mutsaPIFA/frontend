import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../api/client.js'

const splashPuppyImage = '/assets/splash-puppy.png'
const loginRequestPuppyImage = '/assets/login-request-puppy.png'

export function SplashPage() {
  return (
    <main className="splash-screen" data-node-id="0">
      <section className="splash-content" aria-label="MCM MUSE 시작 화면">
        <img className="splash-image" src={splashPuppyImage} alt="MCM MUSE mascot" />
        <div className="splash-copy">
          <h1 className="splash-title">MCM MUSE</h1>
          <p className="splash-subtitle">당신만의 스타일을 발견하세요</p>
        </div>
      </section>
    </main>
  )
}

export function LoginRequestPage() {
  return (
    <main className="login-request-screen" data-node-id="53:31">
      <div className="login-request-content">
        <img
          className="login-request-image"
          src={loginRequestPuppyImage}
          alt="MCM MUSE mascot holding clothes"
          data-node-id="53:42"
        />
        <div className="login-request-copy" data-node-id="53:34">
          <p>당신만의</p>
          <p><span className="mcm-wordmark">MCM</span> 스타일을 열어보세요</p>
        </div>
        <Link className="login-request-button" to="/login" data-node-id="53:37">
          <span>로그인</span>
          <small>LOGIN</small>
        </Link>
      </div>
    </main>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const result = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      localStorage.setItem('mcm_access_token', result.accessToken)
      navigate('/')
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-screen" data-node-id="65:2">
      <div className="login-content">
        <div className="login-heading" data-node-id="72:110">
          <p>로그인</p>
          <p>LOGIN</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="email">이메일 주소</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            data-node-id="66:18"
          />
          <label className="sr-only" htmlFor="password">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            data-node-id="66:20"
          />
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="login-submit" type="submit" disabled={isSubmitting} data-node-id="210:2">
            <span>{isSubmitting ? '로그인 중' : '로그인'}</span>
            <small>{isSubmitting ? 'PLEASE WAIT' : 'LOGIN'}</small>
          </button>
        </form>

        <Link className="signup-link" to="/signup" data-node-id="65:12">
          <span className="mcm-wordmark">MCM</span> 회원가입
        </Link>
      </div>
    </main>
  )
}

export function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nickname: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const result = await apiRequest('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          nickname: form.nickname,
        }),
      })
      localStorage.setItem('mcm_access_token', result.accessToken)
      navigate('/')
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="signup-screen" data-node-id="72:38">
      <div className="signup-content">
        <div className="signup-heading" data-node-id="72:111">
          <p>회원가입</p>
          <p>SIGN UP</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="nickname">성명</label>
          <input id="nickname" name="nickname" placeholder="성명*" value={form.nickname} onChange={updateField} required />
          <label className="sr-only" htmlFor="signup-email">이메일 주소</label>
          <input id="signup-email" name="email" type="email" placeholder="이메일 주소*" value={form.email} onChange={updateField} required />
          <label className="sr-only" htmlFor="signup-password">비밀번호</label>
          <input id="signup-password" name="password" type="password" placeholder="비밀번호*" value={form.password} onChange={updateField} required />

          <p className="signup-required-note">*표시가 있는 모든 항목은 필수입니다.</p>
          {error && <p className="signup-error" role="alert">{error}</p>}

          <button className="signup-submit" type="submit" disabled={isSubmitting} data-node-id="72:47">
            <span>{isSubmitting ? '가입 중' : '회원가입'}</span>
            <small>{isSubmitting ? 'PLEASE WAIT' : 'SIGN UP'}</small>
          </button>
        </form>
      </div>
    </main>
  )
}
