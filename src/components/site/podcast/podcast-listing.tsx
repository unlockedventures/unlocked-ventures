'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

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

const PAGE_SIZE = 9

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

function ChannelTabs({
  channels,
  selectedSlug,
  onSelect,
}: {
  channels: PodcastChannelTab[]
  selectedSlug: string
  onSelect: (slug: string) => void
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
            onClick={() => onSelect(channel.slug)}
            className={cn(
              'shrink-0 cursor-pointer border-b-2 px-4 py-3 font-sans text-base leading-[22px] font-normal transition-colors sm:px-5',
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
  const [selectedSlug, setSelectedSlug] = useState(channels[0]?.slug ?? '')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const hero =
    copy.episodes.find((episode) => episode.heroFeatured) ?? copy.episodes[0] ?? null

  const channelEpisodes = useMemo(() => {
    if (!selectedSlug) return copy.episodes
    return copy.episodes.filter((episode) => episode.channelSlug === selectedSlug)
  }, [copy.episodes, selectedSlug])

  const visible = channelEpisodes.slice(0, visibleCount)
  const hasMore = visible.length < channelEpisodes.length
  const selectedChannel = channels.find((channel) => channel.slug === selectedSlug)

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
      >
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 sm:px-6 md:gap-12 md:px-8 xl:px-[156px]">
          <ChannelTabs
            channels={channels}
            selectedSlug={selectedSlug}
            onSelect={(slug) => {
              setSelectedSlug(slug)
              setVisibleCount(PAGE_SIZE)
            }}
          />

          {visible.length > 0 ? (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((episode) => (
                <li key={episode.href}>
                  <ExploreCard episode={episode} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-sans text-base text-[#23313C]">{copy.emptyLabel}</p>
          )}

          {hasMore ? (
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
