'use client'

import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'
import { useRevealSection, useRevealStore } from '@/stores/reveal-store'

export type LocationStat = {
  value: string
  label: string
}

export type LocationsSectionProps = {
  stats: readonly LocationStat[]
  mapSrc?: string
  className?: string
  /** Wider page inset used on About (156px). Default matches the homepage (56px). */
  contentInset?: 'home' | 'page'
}

const STAGGER_MS = 160
const BASE_DELAY_MS = 80
const SECTION_ID = 'locations' as const

export function LocationsSection({
  stats,
  mapSrc,
  className,
  contentInset = 'home',
}: LocationsSectionProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const { visible, playId } = useRevealSection(SECTION_ID)
  const setInView = useRevealStore((state) => state.setInView)

  useEffect(() => {
    const node = listRef.current
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
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [setInView])

  return (
    <section aria-label="Our locations" className={cn('bg-[#F3F4F9]', className)}>
      <div
        className={cn(
          'mx-auto flex w-full max-w-[1440px] flex-col items-start gap-10 px-4 py-12 sm:px-6 md:px-8 md:py-16 xl:flex-row xl:items-center xl:justify-between xl:py-[73px] min-[1440px]:min-h-[613px] min-[1440px]:items-start!',
          contentInset === 'page' ? 'lg:px-12 xl:px-[156px]' : 'xl:px-14',
        )}
      >
        <div className="w-full max-w-[748px] bg-white min-[1440px]:w-[747px] min-[1440px]:max-w-none min-[1440px]:shrink-0 min-[1440px]:bg-transparent">
          {mapSrc ? (
            <img
              src={mapSrc}
              alt=""
              className="h-auto w-full min-[1440px]:h-[468px] min-[1440px]:object-contain"
            />
          ) : null}
        </div>
        <ul
          ref={listRef}
          className="flex w-full max-w-[17.125rem] flex-col gap-12 min-[1440px]:mt-[22px] min-[1440px]:max-w-[274px] min-[1440px]:gap-6"
        >
          {stats.map((stat, index) => (
            <li
              key={`${stat.value}-${playId}`}
              className={cn(
                'locations-stat',
                visible && 'locations-stat-in',
                index < stats.length - 1 &&
                  'min-[1440px]:border-b min-[1440px]:border-black/16 min-[1440px]:pb-6',
              )}
              style={
                visible
                  ? { animationDelay: `${BASE_DELAY_MS + index * STAGGER_MS}ms` }
                  : undefined
              }
            >
              <p className="font-sans text-4xl leading-[44px] font-normal tracking-[-1px] text-[#33353F] md:text-[3rem] md:leading-[56px]">
                {stat.value}
              </p>
              <p className="mt-3 font-sans text-base leading-6 font-normal text-[#222222]/85">
                {stat.label}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
