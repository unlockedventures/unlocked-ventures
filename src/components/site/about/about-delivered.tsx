'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from 'cn'

import type { AboutContent } from '@/components/site/about/about-content'

/** Soft stagger — slower than Pingen’s default for a calmer reveal. */
const STAGGER_MS = 160
const BASE_DELAY_MS = 120

export function AboutDelivered({ title, stats }: { title: string; stats: AboutContent['stats'] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setVisible(true)
        observer.disconnect()
      },
      { threshold: 0.2 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="experience" className="scroll-mt-24 bg-[#F3F4F9] py-[100px]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[156px]">
        <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#33353F] md:text-[3rem] md:leading-[56px]">
          {title}
        </h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <li
              key={stat.label}
              className={cn(
                'flex flex-col gap-6 bg-white px-8 py-14 transition-[opacity,transform] duration-[1100ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] will-change-[opacity,transform] motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none',
                visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
              )}
              style={
                visible
                  ? { transitionDelay: `${BASE_DELAY_MS + index * STAGGER_MS}ms` }
                  : { transitionDelay: '0ms' }
              }
            >
              <p className="font-sans text-[3rem] leading-[56px] font-light tracking-[-1px] text-[#4F5663]">
                {stat.value}
              </p>
              <p className="font-sans text-lg leading-[26px] font-normal text-[#222222]">{stat.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
