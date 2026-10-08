'use client'

import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'
import { useRevealSection, useRevealStore } from '@/stores/reveal-store'

export type TrustedLogo = {
  name: string
  src: string
  width: number
  height: number
}

export type TrustedBySectionProps = {
  title?: string
  logos: readonly TrustedLogo[]
  className?: string
}

const SECTION_ID = 'trusted-by' as const

function LogoRow({ logos, hidden = false }: { logos: readonly TrustedLogo[]; hidden?: boolean }) {
  const slotWidth = Math.max(...logos.map((logo) => logo.width))

  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-12 pr-12">
      {logos.map((logo) => (
        <li
          key={logo.name}
          className="group flex shrink-0 items-center justify-center min-[1440px]:w-auto!"
          style={{ width: slotWidth }}
        >
          <img
            src={logo.src}
            alt={hidden ? '' : logo.name}
            width={logo.width}
            height={logo.height}
            className="block shrink-0 grayscale transition-[filter] duration-300 group-hover:grayscale-0"
          />
        </li>
      ))}
    </ul>
  )
}

export function TrustedBySection({
  title = 'Trusted by',
  logos,
  className,
}: TrustedBySectionProps) {
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
      { threshold: 0.2, rootMargin: '0px 0px -5% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [setInView])

  return (
    <section ref={sectionRef} className={cn('overflow-hidden bg-white', className)}>
      <div className="flex w-full flex-col items-center gap-10 px-4 py-12 sm:px-6 md:px-8 md:py-16 lg:px-12 xl:px-16 xl:py-[100px] min-[1440px]:mx-auto min-[1440px]:max-w-[1440px] min-[1440px]:px-[156px]! min-[1440px]:py-[100px]">
        <h2 className="text-center font-sans text-[2rem] leading-[3rem] font-normal text-[#171616]">
          {title}
        </h2>
        <div className="relative w-full overflow-hidden min-[1440px]:h-12 min-[1440px]:w-[1328px]! min-[1440px]:max-w-none">
          <div
            className={cn(
              'trusted-marquee-track flex w-max items-center',
              visible && 'trusted-marquee-track-running',
            )}
          >
            <LogoRow logos={logos} />
            <LogoRow logos={logos} hidden />
          </div>
          <div
            aria-hidden="true"
            className="trusted-by-fade pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent sm:w-32 xl:w-[245px]"
          />
          <div
            aria-hidden="true"
            className="trusted-by-fade pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent sm:w-32 xl:w-[245px]"
          />
        </div>
      </div>
    </section>
  )
}
