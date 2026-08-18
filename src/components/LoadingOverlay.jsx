import { useEffect, useState } from 'react'

// 긴 AI 작업(스캔 10~40s, 코디 생성 20~40s) 동안의 풀스크린 대기 연출 — 데모의 와우 포인트 구간.
// messages를 3.5초마다 순환해 대기가 지루하지 않게.
export default function LoadingOverlay({ image, messages }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setStep((current) => current + 1), 3500)
    return () => clearInterval(timer)
  }, [])

  const current = messages[step % messages.length]

  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <img className="loading-overlay-puppy" src={image} alt="" />
      <div className="loading-overlay-copy" key={step}>
        <strong>{current.title}</strong>
        {current.subtitle && <p>{current.subtitle}</p>}
      </div>
      <span className="loading-overlay-dots" aria-hidden="true"><i /><i /><i /></span>
    </div>
  )
}
