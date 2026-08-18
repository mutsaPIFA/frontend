import { useEffect, useState } from 'react'

// 긴 AI 작업의 풀스크린 대기 연출 — 데모의 와우 포인트 구간.
// 원형 게이지가 평균 소요(expectedSeconds) 기준으로 90%까지 차오르고, 그 뒤엔 천천히 기며
// "거의 다 됐어요"로 전환된다(실제 완료 시 오버레이가 사라지므로 100%는 만들지 않는다).
// slides를 주면 재료(옷 누끼 등)가 나타났다 사라지며 "조합 중" 연출.
export default function LoadingOverlay({ image, messages, expectedSeconds = 30, slides = [] }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setElapsed((current) => current + 0.25), 250)
    return () => clearInterval(timer)
  }, [])

  const ratio = elapsed / expectedSeconds
  const progress = ratio < 1 ? ratio * 0.9 : Math.min(0.98, 0.9 + (elapsed - expectedSeconds) * 0.004)
  const nearDone = progress >= 0.9
  // 멘트는 진행률 20%p 단위로 순서대로 — 작업의 스토리가 된다
  const step = Math.min(messages.length - 1, Math.floor(progress / 0.2))
  const current = nearDone
    ? { title: '거의 다 됐어요', subtitle: '마지막 손질을 하고 있어요' }
    : messages[step]
  // 재료 누끼는 진행률 15%p마다 교체 — 너무 자주 사라지지 않게, 전환 길이도 구간에 맞춘다
  const slideStep = Math.floor(progress / 0.15)
  const slide = slides.length > 0 ? slides[slideStep % slides.length] : null
  const slideDuration = expectedSeconds * 0.15

  const R = 118
  const C = 2 * Math.PI * R

  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-gauge">
        <svg viewBox="0 0 260 260" aria-hidden="true">
          <circle className="loading-gauge-track" cx="130" cy="130" r={R} />
          <circle className="loading-gauge-fill" cx="130" cy="130" r={R} strokeDasharray={C} strokeDashoffset={C * (1 - progress)} />
        </svg>
        <img className="loading-overlay-puppy" src={image} alt="" />
        {slide && (
          <span className={`loading-slide loading-slide-pos${slideStep % 4}`} key={slideStep} style={{ animationDuration: `${slideDuration}s` }}>
            <img src={slide} alt="" />
          </span>
        )}
      </div>
      <div className="loading-overlay-copy" key={nearDone ? 'near-done' : step}>
        <strong>{current.title}</strong>
        {current.subtitle && <p>{current.subtitle}</p>}
      </div>
      <span className="loading-overlay-percent">{Math.round(progress * 100)}%</span>
    </div>
  )
}
