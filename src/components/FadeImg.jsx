import { useEffect, useRef, useState } from 'react'

// 이미지가 뜰 때 공백→팝인 대신 부드럽게 페이드인 — 목록·히어로 이미지용.
// 브라우저 캐시에 이미 있던 이미지는 onLoad가 핸들러 부착 전에 끝나므로 complete를 확인한다.
export default function FadeImg({ className = '', ...props }) {
  const ref = useRef(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (ref.current?.complete) setLoaded(true)
  }, [props.src])

  return (
    <img
      {...props}
      ref={ref}
      className={`fade-img ${loaded ? 'loaded' : ''} ${className}`.trim()}
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(true)}
    />
  )
}
