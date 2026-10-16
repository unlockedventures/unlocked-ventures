'use client'

import { useEffect, useState } from 'react'

import {
  PodcastListing,
  PodcastListingSkeleton,
} from '@/components/site/podcast/podcast-listing'
import { usePodcastListing } from '@/hooks/queries/use-site-queries'
import { cn } from '@/lib/utils'

const REVEAL_MS = 500

export function PodcastListingPageView() {
  const page = usePodcastListing()
  const ready = Boolean(page.data) && !page.isPending
  const [revealed, setRevealed] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(true)

  useEffect(() => {
    if (!ready) {
      setRevealed(false)
      setShowSkeleton(true)
      return
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setRevealed(true)
      setShowSkeleton(false)
      return
    }

    const frame = requestAnimationFrame(() => setRevealed(true))
    const timeout = window.setTimeout(() => setShowSkeleton(false), REVEAL_MS)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timeout)
    }
  }, [ready])

  if (!page.data && !showSkeleton) return null

  return (
    <section
      className="relative isolate overflow-hidden bg-white"
      aria-label={page.data?.title || 'Podcast'}
      aria-busy={showSkeleton}
    >
      {page.data ? (
        <div
          className={cn(
            'transition-[opacity,transform] ease-[cubic-bezier(0.22,0.61,0.36,1)] will-change-[opacity,transform] motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none',
            revealed ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          )}
          style={{ transitionDuration: `${REVEAL_MS}ms` }}
        >
          <PodcastListing copy={page.data} />
        </div>
      ) : null}

      {showSkeleton ? (
        <div
          className={cn(
            'bg-white transition-opacity ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none',
            page.data ? 'absolute inset-0 z-10' : 'relative',
            revealed ? 'opacity-0' : 'opacity-100',
          )}
          style={{ transitionDuration: `${REVEAL_MS}ms` }}
          aria-hidden={ready}
        >
          <PodcastListingSkeleton />
        </div>
      ) : null}
    </section>
  )
}
