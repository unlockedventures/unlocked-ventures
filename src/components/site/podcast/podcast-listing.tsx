'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 9
/** Opacity-only crossfade — no layout swap mid-transition. */
const FADE_MS = 420
const EASE = 'cubic-bezier(0.33, 1, 0.68, 1)'

export type PodcastListEpisode = {
  title: string
  href: string
  duration: string
  category: string
  channelSlug: string
  excerpt: string
  stats: string
  imageSrc?: string
  imageAlt: string
  heroFeatured?: boolean
  featured?: boolean
}

export type PodcastChannelTab = {
  title: string
  slug: string
}

export type PodcastListingCopy = {
  metaTitle: string
  metaDescription: string
  homeLabel: string
  homeHref: string
  currentLabel: string
  title: string
  description: string
  watchNowLabel: string
  browseTitle: string
  viewAllCategoriesLabel: string
  categories: string[]
  channels: PodcastChannelTab[]
  featuredTitle: string
  exploreTitle: string
  sortLabel: string
  sortAllLabel: string
  uncategorizedLabel: string
  previousCategoriesLabel: string
  nextCategoriesLabel: string
  seeMoreLabel: string
  emptyLabel: string
  subscribeTitle: string
  subscribeDescription: string
  subscribe: { name: string; href: string; logoSrc: string; width: number; height: number }[]
  episodes: PodcastListEpisode[]
}

const categoryColors: Record<string, string> = {
  communication: '#EC6A15',
  'digital engineering': '#015B5B',
  future: '#9747FF',
  'artificial intelligence (ai)': '#00A6CA',
  ai: '#00A6CA',
  'mental health': '#9747FF',
  'ai in business': '#00A6CA',
  'build & engineering': '#015B5B',
  'strategy & growth': '#EC6A15',
}

function categoryColor(label: string) {
  return categoryColors[label.trim().toLowerCase()] ?? '#015B5B'
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-5 shrink-0', className)}>
      <path
        d="M9 6.5L15 12.5L9 18.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DurationBadge({ label }: { label: string }) {
  if (!label) return null
  return (
    <span className="absolute right-3 bottom-3 z-10 bg-[rgba(34,34,34,0.8)] px-3 py-2 font-sans text-sm leading-none font-normal text-white backdrop-blur-[2px]">
      {label}
    </span>
  )
}

function ExploreCard({ episode }: { episode: PodcastListEpisode }) {
  return (
    <article className="group/card relative flex h-full flex-col gap-5 bg-white">
      <Link href={episode.href} className="absolute inset-0 z-20" aria-label={episode.title} />
      <div className="relative aspect-[368/220] w-full overflow-hidden bg-[#E4E6EA]">
        {episode.imageSrc ? (
          <img
            src={episode.imageSrc}
            alt={episode.imageAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <DurationBadge label={episode.duration} />
      </div>
      <div className="relative z-10 flex flex-col gap-3 px-5 pb-6">
        <p
          className="font-sans text-xs leading-[26px] font-medium uppercase"
          style={{ color: categoryColor(episode.category) }}
        >
          {episode.category}
        </p>
        <h3 className="font-sans text-xl leading-7 font-normal text-[#25282D]">{episode.title}</h3>
        {episode.stats ? (
          <p className="font-sans text-base leading-6 font-normal text-[rgba(34,34,34,0.85)] opacity-80">
            {episode.stats}
          </p>
        ) : null}
      </div>
    </article>
  )
}

function ExploreCardSkeleton() {
  return (
    <div className="relative flex h-full flex-col gap-5 bg-white" aria-hidden="true">
      {/* Same image frame as ExploreCard */}
      <div className="relative aspect-[368/220] w-full overflow-hidden bg-[#E4E6EA]">
        <Skeleton className="absolute inset-0 size-full rounded-none bg-[#E4E6EA]" />
      </div>
      {/* Same text block: category (leading-[26px]) + title (text-xl / leading-7, ~2 lines) */}
      <div className="relative flex flex-col gap-3 px-5 pb-6">
        <Skeleton className="h-[26px] w-[7.5rem] max-w-[45%] rounded-none bg-[#E4E6EA]" />
        <div className="flex flex-col gap-0">
          <Skeleton className="h-7 w-full rounded-none bg-[#E4E6EA]" />
          <Skeleton className="h-7 w-[82%] rounded-none bg-[#E4E6EA]" />
        </div>
      </div>
    </div>
  )
}

function EpisodeGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <ExploreCardSkeleton />
        </li>
      ))}
    </ul>
  )
}

function EpisodeGrid({
  episodes,
  emptyLabel,
}: {
  episodes: PodcastListEpisode[]
  emptyLabel: string
}) {
  if (episodes.length === 0) {
    return <p className="font-sans text-base text-[#23313C]">{emptyLabel}</p>
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {episodes.map((episode) => (
        <li key={episode.href}>
          <ExploreCard episode={episode} />
        </li>
      ))}
    </ul>
  )
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function PodcastListingSkeleton() {
  return (
    <div
      className="relative isolate flex w-full flex-col items-center bg-white p-0"
      aria-busy="true"
      aria-label="Loading podcast"
    >
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col">
        <div className="relative z-10 flex flex-col gap-12 px-4 pt-12 sm:px-6 md:gap-[48px] md:px-8 md:pt-16 xl:px-14 xl:pt-20">
          <div className="flex max-w-[800px] flex-col gap-4">
            <Skeleton className="h-[22px] w-40 rounded-sm bg-[#E4E6EA]" />
            <div className="flex flex-col gap-4">
              <Skeleton className="h-10 w-72 max-w-full rounded-sm bg-[#E4E6EA] lg:h-14 lg:w-96" />
              <Skeleton className="h-6 w-full max-w-[740px] rounded-sm bg-[#E4E6EA]" />
              <Skeleton className="h-6 w-4/5 max-w-[640px] rounded-sm bg-[#E4E6EA]" />
            </div>
          </div>

          <div className="flex flex-col gap-8 pb-4 xl:pb-8">
            <Skeleton className="aspect-[16/9] w-full rounded-none bg-[#E4E6EA] md:aspect-[1328/593]" />
          </div>
        </div>
      </div>

      <section className="w-full bg-[#F3F4F9] py-16 md:py-[100px]" aria-hidden="true">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 sm:px-6 md:gap-12 md:px-8 xl:px-14">
          <div className="flex gap-2 overflow-hidden border-b border-[#D1D6EA]">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="mb-px h-12 w-28 shrink-0 rounded-none bg-[#E4E6EA]" />
            ))}
          </div>

          <EpisodeGridSkeleton />
        </div>
      </section>
    </div>
  )
}

function ChannelTabs({
  channels,
  selectedSlug,
  onSelect,
  disabled,
}: {
  channels: PodcastChannelTab[]
  selectedSlug: string
  onSelect: (slug: string) => void
  disabled?: boolean
}) {
  if (channels.length === 0) return null

  return (
    <div
      role="tablist"
      aria-label="Channels"
      className="flex w-full gap-2 overflow-x-auto border-b border-[#D1D6EA] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {channels.map((channel) => {
        const selected = channel.slug === selectedSlug
        return (
          <button
            key={channel.slug}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={disabled}
            onClick={() => onSelect(channel.slug)}
            className={cn(
              'shrink-0 cursor-pointer border-b-2 px-4 py-3 font-sans text-base leading-[22px] font-normal transition-[color,border-color,opacity] duration-200 sm:px-5 disabled:cursor-wait',
              selected
                ? 'border-[#171616] text-[#171616]'
                : 'border-transparent text-[#696969] hover:text-[#171616]',
            )}
          >
            {channel.title}
          </button>
        )
      })}
    </div>
  )
}

export function PodcastListing({ copy }: { copy: PodcastListingCopy }) {
  const channels = copy.channels
  const initialSlug = channels[0]?.slug ?? ''
  const [tabSlug, setTabSlug] = useState(initialSlug)
  const [displaySlug, setDisplaySlug] = useState(initialSlug)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [fading, setFading] = useState(false)
  const [lockedHeight, setLockedHeight] = useState<number | undefined>()
  const gridRef = useRef<HTMLDivElement>(null)
  const pendingSlugRef = useRef(initialSlug)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const hero =
    copy.episodes.find((episode) => episode.heroFeatured) ?? copy.episodes[0] ?? null

  const channelEpisodes = useMemo(() => {
    if (!displaySlug) return copy.episodes
    return copy.episodes.filter((episode) => episode.channelSlug === displaySlug)
  }, [copy.episodes, displaySlug])

  const visible = channelEpisodes.slice(0, visibleCount)
  const hasMore = visible.length < channelEpisodes.length
  const selectedChannel = channels.find((channel) => channel.slug === tabSlug)
  const busy = fading

  const selectChannel = (slug: string) => {
    if (slug === tabSlug || busy) return

    setTabSlug(slug)
    pendingSlugRef.current = slug
    setVisibleCount(PAGE_SIZE)

    if (prefersReducedMotion()) {
      setDisplaySlug(slug)
      setFading(false)
      setLockedHeight(undefined)
      return
    }

    if (timerRef.current !== null) window.clearTimeout(timerRef.current)

    // Lock height so the section does not jump while opacity eases.
    const height = gridRef.current?.getBoundingClientRect().height
    if (height && height > 0) setLockedHeight(height)

    // Fade current cards out — swap channel data only once fully invisible.
    setFading(true)

    timerRef.current = window.setTimeout(() => {
      setDisplaySlug(pendingSlugRef.current)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFading(false)
          timerRef.current = window.setTimeout(() => setLockedHeight(undefined), FADE_MS)
        })
      })
    }, FADE_MS)
  }

  return (
    <div className="relative isolate flex w-full flex-col items-center bg-white p-0">
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col">
        <img
          src="/about/hero-wave.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 hidden h-auto w-[min(48%,560px)] opacity-70 lg:block"
        />

        <div className="relative z-10 flex flex-col gap-12 px-4 pt-12 sm:px-6 md:gap-[48px] md:px-8 md:pt-16 xl:px-14 xl:pt-20">
          <div className="flex max-w-[800px] flex-col gap-4 md:gap-4">
            <p className="font-sans text-base leading-[22px] font-normal text-[#919191]">
              <Link href={copy.homeHref} className="hover:text-[#1CACAE]">
                {copy.homeLabel}
              </Link>
              <span aria-hidden="true"> / </span>
              <span className="text-[#919191]">{copy.currentLabel}</span>
            </p>
            <div className="flex flex-col gap-4">
              <h1 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#33353F] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
                {copy.title}
              </h1>
              <p className="max-w-[740px] font-sans text-base leading-6 font-normal tracking-[0.36px] text-[#23313C] md:text-lg md:leading-[27px] min-[1440px]:opacity-80">
                {copy.description}
              </p>
            </div>
          </div>

          {hero ? (
            <div className="flex flex-col gap-8 pb-4 md:gap-8 xl:pb-8">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#171616] md:aspect-[1328/593]">
                {hero.imageSrc ? (
                  <img
                    src={hero.imageSrc}
                    alt={hero.imageAlt}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black to-transparent" />
                <Link
                  href={hero.href}
                  className="absolute right-6 bottom-6 z-10 inline-flex size-14 items-center justify-center rounded-full bg-white/16 text-white backdrop-blur-sm transition-transform hover:scale-105"
                  aria-label={copy.watchNowLabel}
                >
                  <span className="ml-0.5 size-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-white" />
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <section
        className="w-full bg-[#F3F4F9] py-16 md:py-[100px]"
        aria-label={selectedChannel?.title ?? copy.title}
        aria-busy={busy}
      >
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 sm:px-6 md:gap-12 md:px-8 xl:px-14">
          <ChannelTabs
            channels={channels}
            selectedSlug={tabSlug}
            disabled={busy}
            onSelect={selectChannel}
          />

          <div
            ref={gridRef}
            className="relative"
            style={lockedHeight ? { minHeight: lockedHeight } : undefined}
            aria-live="polite"
          >
            <div
              className={cn(
                'transition-opacity will-change-[opacity] motion-reduce:opacity-100 motion-reduce:transition-none',
                fading ? 'opacity-0' : 'opacity-100',
              )}
              style={{ transitionDuration: `${FADE_MS}ms`, transitionTimingFunction: EASE }}
            >
              <EpisodeGrid
                key={displaySlug}
                episodes={visible}
                emptyLabel={copy.emptyLabel}
              />
            </div>
          </div>

          {hasMore && !busy ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="inline-flex h-[60px] items-center gap-2.5 border border-[#484D56] bg-transparent px-5 font-sans text-base leading-[22px] font-normal text-[#484D56] transition-colors hover:bg-white"
              >
                {copy.seeMoreLabel}
                <ChevronRight />
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
