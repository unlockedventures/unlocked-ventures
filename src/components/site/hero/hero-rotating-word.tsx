'use client'

import { useEffect, useState } from 'react'

const HOLD_MS = 2400

export function HeroRotatingWord({ words }: { words: readonly string[] }) {
  const [index, setIndex] = useState(0)
  const [sliding, setSliding] = useState(false)
  const [motion, setMotion] = useState(true)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) {
      setMotion(false)
      return
    }

    if (words.length < 2) return

    const id = window.setInterval(() => setSliding(true), HOLD_MS)
    return () => window.clearInterval(id)
  }, [words.length])

  const current = words[index % words.length] ?? words[0]
  const upcoming = words[(index + 1) % words.length] ?? current
  const longest = words.reduce((widest, word) => (word.length > widest.length ? word : widest), words[0])

  return (
    <span className="relative block" aria-hidden="true">
      <span className="invisible block">{longest}</span>
      <span className="hero-digital-banner absolute inset-0 text-[#1CACAE]">
        <span
          className={
            motion && sliding
              ? 'block transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]'
              : 'block'
          }
          style={{ transform: sliding ? 'translateY(-50%)' : 'translateY(0)' }}
          onTransitionEnd={(event) => {
            if (event.propertyName !== 'transform' || event.target !== event.currentTarget) return
            setIndex((value) => (value + 1) % words.length)
            setSliding(false)
          }}
        >
          <span className="block h-[1lh]">{current}</span>
          <span className="block h-[1lh]">{upcoming}</span>
        </span>
      </span>
    </span>
  )
}
