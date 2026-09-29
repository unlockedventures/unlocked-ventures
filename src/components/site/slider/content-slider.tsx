'use client'

import { Children, useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type ContentSliderProps = {
  children: ReactNode
  label: string
  heading?: ReactNode
  className?: string
  headerClassName?: string
  controlsClassName?: string
  trackClassName?: string
  slideClassName?: string
}

export function ContentSlider({
  children,
  label,
  heading,
  className,
  headerClassName,
  controlsClassName,
  trackClassName,
  slideClassName,
}: ContentSliderProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canPrevious, setCanPrevious] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const updateEdges = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const maxScroll = scroller.scrollWidth - scroller.clientWidth
    setCanPrevious(scroller.scrollLeft > 1)
    setCanNext(scroller.scrollLeft < maxScroll - 1)
  }, [])

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    updateEdges()
    scroller.addEventListener('scroll', updateEdges, { passive: true })
    const observer = new ResizeObserver(updateEdges)
    observer.observe(scroller)
    return () => {
      scroller.removeEventListener('scroll', updateEdges)
      observer.disconnect()
    }
  }, [updateEdges, children])

  const scrollBySlide = (direction: -1 | 1) => {
    const scroller = scrollerRef.current
    const slide = scroller?.querySelector<HTMLElement>('[data-slider-slide]')
    if (!scroller || !slide) return
    const styles = getComputedStyle(scroller)
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    scroller.scrollBy({
      left: direction * (slide.offsetWidth + gap),
      behavior: reduced ? 'auto' : 'smooth',
    })
  }

  return (
    <div className={cn('flex flex-col gap-8 md:gap-12', className)}>
      <div
        className={cn(
          'flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end',
          headerClassName,
        )}
      >
        <div className="min-w-0">{heading}</div>
        <div className={cn('flex shrink-0 gap-5', controlsClassName)}>
          <SliderControl
            direction="previous"
            disabled={!canPrevious}
            onClick={() => scrollBySlide(-1)}
          />
          <SliderControl direction="next" disabled={!canNext} onClick={() => scrollBySlide(1)} />
        </div>
      </div>
      <div
        ref={scrollerRef}
        role="region"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            scrollBySlide(-1)
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            scrollBySlide(1)
          }
        }}
        className={cn(
          'flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#484D56] [&::-webkit-scrollbar]:hidden',
          trackClassName,
        )}
      >
        {Children.map(children, (child) => (
          <div data-slider-slide className={cn('w-full shrink-0 snap-start', slideClassName)}>
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SliderControl({
  direction,
  disabled = false,
  onClick,
}: {
  direction: 'previous' | 'next'
  disabled?: boolean
  onClick: () => void
}) {
  const label = direction === 'previous' ? 'Previous' : 'Next'

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex size-12 cursor-pointer items-center justify-center rounded-full border border-[#EBEDF0] text-[#30373F] disabled:cursor-default disabled:opacity-40',
        direction === 'next' && 'text-[#484D56]',
      )}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={cn('size-[30px]', direction === 'previous' && 'rotate-180')}
      >
        <path
          d="M9 6l6 6-6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
