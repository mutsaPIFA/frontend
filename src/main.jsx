import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/global.css'

// 테마(팀 투표용) — ?theme=warm|bw 로 지정하면 저장되고, 이후엔 저장값 사용. 기본 블랙&화이트
const themeParam = new URLSearchParams(window.location.search).get('theme')
if (themeParam === 'warm' || themeParam === 'bw') localStorage.setItem('mcm_theme', themeParam)
if (localStorage.getItem('mcm_theme') === 'warm') document.documentElement.dataset.theme = 'warm'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
