'use client'

import { useEffect, useState } from 'react'

const TYPE_MS = 68
const DELETE_MS = 42
const HOLD_MS = 4200
const PAUSE_MS = 380

type Phase = 'typing' | 'holding' | 'deleting' | 'pausing'

export function HeroRotatingWord({ words }: { words: readonly string[] }) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<Phase>('typing')
  const [motion, setMotion] = useState(true)

  const word = words[index % words.length] ?? words[0] ?? ''
  const longest = words.reduce((widest, next) => (next.length > widest.length ? next : widest), words[0] ?? '')

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setMotion(!media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (motion || words.length === 0) return
    setText(words[index % words.length] ?? '')
  }, [motion, index, words])

  useEffect(() => {
    if (motion || words.length < 2) return

    const id = window.setInterval(() => {
      setIndex((value) => (value + 1) % words.length)
    }, HOLD_MS)

    return () => window.clearInterval(id)
  }, [motion, words.length])

  useEffect(() => {
    if (!motion || words.length === 0) return

    if (phase === 'typing') {
      if (text === word) {
        const id = window.setTimeout(() => setPhase('holding'), 0)
        return () => window.clearTimeout(id)
      }

      const id = window.setTimeout(() => {
        setText(word.slice(0, text.length + 1))
      }, TYPE_MS)
      return () => window.clearTimeout(id)
    }

    if (phase === 'holding') {
      if (words.length < 2) return
      const id = window.setTimeout(() => setPhase('deleting'), HOLD_MS)
      return () => window.clearTimeout(id)
    }

    if (phase === 'deleting') {
      if (text.length === 0) {
        const id = window.setTimeout(() => setPhase('pausing'), 0)
        return () => window.clearTimeout(id)
      }

      const id = window.setTimeout(() => {
        setText((value) => value.slice(0, -1))
      }, DELETE_MS)
      return () => window.clearTimeout(id)
    }

    const id = window.setTimeout(() => {
      setIndex((value) => (value + 1) % words.length)
      setPhase('typing')
    }, PAUSE_MS)
    return () => window.clearTimeout(id)
  }, [motion, phase, text, word, words.length])

  return (
    <span className="relative block min-h-[1lh]" aria-hidden="true">
      <span className="invisible block select-none">{longest}</span>
      <span className="absolute inset-0 flex items-baseline text-[#167F81]">
        <span className="whitespace-pre">{text}</span>
        {motion ? (
          <span
            className="hero-type-caret ml-[0.06em] inline-block h-[0.82em] w-[0.08em] shrink-0 translate-y-[0.06em] bg-current"
            aria-hidden="true"
          />
        ) : null}
      </span>
    </span>
  )
}
