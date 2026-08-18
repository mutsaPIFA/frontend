import { tagOptions } from '../lib/vocab.js'

const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// AI 추천 이유(줄글)를 시각화 — 문장 단위로 끊고, MCM·카테고리·색상·제품명을 하이라이트
export default function ReasonText({ text, extraKeywords = [] }) {
  if (!text) return null
  const keywords = [...new Set(['MCM', ...tagOptions.category, ...tagOptions.color, ...extraKeywords.filter(Boolean)])]
    .sort((a, b) => b.length - a.length)
  const re = new RegExp(`(${keywords.map(escapeRe).join('|')})`, 'g')
  const kwSet = new Set(keywords)
  const sentences = text.split(/(?<=\.)\s+/).filter(Boolean)

  return sentences.map((sentence, i) => (
    <p key={i}>
      {sentence.split(re).map((part, j) => (kwSet.has(part) ? <mark key={j}>{part}</mark> : part))}
    </p>
  ))
}
