'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

import type { AboutContent } from '@/components/site/about/about-content'
import { useRevealSection, useRevealStore } from '@/stores/reveal-store'

/** Soft stagger — slower than Pingen’s default for a calmer reveal. */
const STAGGER_MS = 160
const BASE_DELAY_MS = 120
const SECTION_ID = 'about-delivered' as const

export function AboutDelivered({ title, stats }: { title: string; stats: AboutContent['stats'] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const { visible } = useRevealSection(SECTION_ID)
  const setInView = useRevealStore((state) => state.setInView)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setInView(SECTION_ID, true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(SECTION_ID, Boolean(entry?.isIntersecting))
      },
      { threshold: 0.2 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [setInView])

  return (
    <section ref={sectionRef} id="delivered" className="scroll-mt-24 bg-[#F3F4F9] py-16 md:py-20 xl:py-[100px]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 sm:px-6 md:gap-12 md:px-8 lg:px-12 xl:px-[156px]">
        <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#33353F] md:text-5xl md:leading-[56px]">
          {title}
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <li
              key={stat.label}
              className={cn(
                'flex flex-col gap-4 bg-white px-6 py-10 transition-[opacity,transform] duration-[1100ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] will-change-[opacity,transform] motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none sm:gap-6 sm:px-8 sm:py-12 xl:py-14',
                visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
              )}
              style={
                visible
                  ? { transitionDelay: `${BASE_DELAY_MS + index * STAGGER_MS}ms` }
                  : { transitionDelay: '0ms' }
              }
            >
              <p className="font-sans text-[2.5rem] leading-[3rem] font-light tracking-[-1px] text-[#4F5663] md:text-[3rem] md:leading-[56px]">
                {stat.value}
              </p>
              <p className="font-sans text-base leading-6 font-normal text-[#222222] md:text-lg md:leading-[26px]">
                {stat.label}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
