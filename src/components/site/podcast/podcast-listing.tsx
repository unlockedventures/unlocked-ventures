'use client'

import Link from 'next/link'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { ContentSlider } from '@/components/site/slider/content-slider'
import { cn } from '@/lib/utils'

export type PodcastListEpisode = {
  title: string
  href: string
  duration: string
  category: string
  excerpt: string
  stats: string
  imageSrc?: string
  imageAlt: string
  heroFeatured?: boolean
  featured?: boolean
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
  featuredTitle: string
  exploreTitle: string
  sortLabel: string
  sortAllLabel: string
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

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-4 shrink-0', className)}>
      <path
        d="M6 9l6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-5 shrink-0', className)}>
      <path
        d="M7 17L17 7M7 7L17 7L17 17"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PlayCircle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-6 shrink-0', className)}>
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" />
      <path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" />
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

function SideEpisodeCard({ episode }: { episode: PodcastListEpisode }) {
  return (
    <article className="group/side relative flex w-full max-w-[302px] flex-col gap-6">
      <Link href={episode.href} className="absolute inset-0 z-20" aria-label={episode.title} />
      <div className="relative aspect-[302/180] w-full overflow-hidden bg-[#E4E6EA]">
        {episode.imageSrc ? (
          <img
            src={episode.imageSrc}
            alt={episode.imageAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <DurationBadge label={episode.duration} />
      </div>
      <div className="relative z-10 flex flex-col gap-3">
        <p
          className="font-sans text-xs leading-[26px] font-medium tracking-[0.02em] uppercase"
          style={{ color: categoryColor(episode.category) }}
        >
          {episode.category}
        </p>
        <h3 className="font-sans text-xl leading-[26px] font-normal text-[#25282D]">{episode.title}</h3>
        {episode.stats ? (
          <p className="font-sans text-sm leading-6 font-normal text-[#222222]/80">{episode.stats}</p>
        ) : null}
      </div>
    </article>
  )
}

function FeaturedGridCard({ episode }: { episode: PodcastListEpisode }) {
  return (
    <article className="group/card relative flex h-full flex-col gap-6">
      <Link href={episode.href} className="absolute inset-0 z-20" aria-label={episode.title} />
      <div className="relative aspect-[252/180] w-full overflow-hidden bg-[#E4E6EA]">
        {episode.imageSrc ? (
          <img
            src={episode.imageSrc}
            alt={episode.imageAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <DurationBadge label={episode.duration} />
      </div>
      <div className="relative z-10 flex flex-col gap-3">
        <p
          className="font-sans text-xs leading-[26px] font-medium uppercase"
          style={{ color: categoryColor(episode.category) }}
        >
          {episode.category}
        </p>
        <h3 className="font-sans text-xl leading-[26px] font-normal text-[#25282D]">{episode.title}</h3>
        {episode.stats ? (
          <p className="font-sans text-sm leading-6 font-normal text-[#222222]/80">{episode.stats}</p>
        ) : null}
      </div>
    </article>
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

function BrowseCategories({
  title,
  categories,
  viewAllLabel,
}: {
  title: string
  categories: string[]
  viewAllLabel: string
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canPrevious, setCanPrevious] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const updateEdges = useCallback(() => {
    const node = scrollerRef.current
    if (!node) return
    const maxScroll = node.scrollWidth - node.clientWidth
    setCanPrevious(node.scrollLeft > 2)
    setCanNext(maxScroll > 2 && node.scrollLeft < maxScroll - 2)
  }, [])

  useLayoutEffect(() => {
    const node = scrollerRef.current
    if (!node) return
    updateEdges()
    node.addEventListener('scroll', updateEdges, { passive: true })
    const observer = new ResizeObserver(updateEdges)
    observer.observe(node)
    return () => {
      node.removeEventListener('scroll', updateEdges)
      observer.disconnect()
    }
  }, [updateEdges, categories])

  const scrollByDirection = (direction: -1 | 1) => {
    const node = scrollerRef.current
    if (!node) return
    const pill = node.querySelector<HTMLElement>('[data-category-pill]')
    const styles = getComputedStyle(node)
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 16
    const step = (pill?.offsetWidth ?? 200) + gap
    const maxScroll = Math.max(0, node.scrollWidth - node.clientWidth)
    const nextLeft = Math.min(maxScroll, Math.max(0, node.scrollLeft + direction * step))
    if (nextLeft === node.scrollLeft) return
    node.scrollTo({ left: nextLeft, behavior: 'smooth' })
    // Some environments ignore smooth scrollTo; force the position if it didn't move.
    window.setTimeout(() => {
      if (Math.abs(node.scrollLeft - nextLeft) > 2) {
        node.scrollLeft = nextLeft
      }
    }, 50)
  }

  if (categories.length === 0) return null

  return (
    <section className="w-full bg-[#33353F] py-14 md:py-16" aria-label={title}>
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col items-center gap-9 px-4 sm:px-6 md:px-8 xl:px-14">
        <h2 className="font-sans text-[2rem] leading-[56px] font-normal text-white md:text-4xl">
          {title}
        </h2>
        <div className="relative w-full">
          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto px-4 py-1 sm:px-6 md:px-[88px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {/* Duplicate when the row fits, so edge arrows always have overflow to scroll. */}
            {[...categories, ...categories].map((category, index) => (
              <span
                key={`${category}-${index}`}
                data-category-pill
                className="inline-flex h-[60px] shrink-0 items-center bg-[#484D56] px-6 font-sans text-base leading-[22px] font-normal whitespace-nowrap text-white"
              >
                {category}
              </span>
            ))}
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-[min(320px,28%)] bg-[linear-gradient(270deg,rgba(51,53,63,0)_0%,#33353F_76.56%)] md:block"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-[1] hidden w-[min(312px,28%)] bg-[linear-gradient(90deg,rgba(51,53,63,0)_0%,#33353F_75%)] md:block"
            aria-hidden="true"
          />
          <button
            type="button"
            aria-label="Previous categories"
            disabled={!canPrevious}
            onClick={() => scrollByDirection(-1)}
            className="absolute top-1/2 left-[30px] z-10 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(235,237,240,0.16)] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-30 md:inline-flex"
          >
            <ChevronRight className="rotate-180" />
          </button>
          <button
            type="button"
            aria-label="Next categories"
            disabled={!canNext}
            onClick={() => scrollByDirection(1)}
            className="absolute top-1/2 right-[30px] z-10 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(235,237,240,0.16)] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-30 md:inline-flex"
          >
            <ChevronRight />
          </button>
        </div>
        <a
          href="#explore-podcasts"
          className="inline-flex items-center gap-2 font-sans text-base leading-[22px] font-normal text-white"
        >
          {viewAllLabel}
          <ArrowUpRight />
        </a>
      </div>
    </section>
  )
}

export function PodcastListing({ copy }: { copy: PodcastListingCopy }) {
  const [category, setCategory] = useState(copy.sortAllLabel)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const hero =
    copy.episodes.find((episode) => episode.heroFeatured) ?? copy.episodes[0] ?? null
  const sideEpisodes = useMemo(() => {
    if (!hero) return copy.episodes.slice(0, 2)
    return copy.episodes.filter((episode) => episode.href !== hero.href).slice(0, 2)
  }, [copy.episodes, hero])

  const featuredEpisodes = useMemo(() => {
    const rest = hero ? copy.episodes.filter((episode) => episode.href !== hero.href) : copy.episodes
    const featured = rest.filter((episode) => episode.featured)
    return (featured.length > 0 ? featured : rest).slice(0, 8)
  }, [copy.episodes, hero])

  const exploreEpisodes = useMemo(() => {
    if (category === copy.sortAllLabel) return copy.episodes
    return copy.episodes.filter(
      (episode) => episode.category.toLowerCase() === category.toLowerCase(),
    )
  }, [category, copy.episodes, copy.sortAllLabel])

  const visible = exploreEpisodes.slice(0, visibleCount)
  const hasMore = visible.length < exploreEpisodes.length

  const filterOptions = useMemo(() => {
    const values = new Set(copy.episodes.map((episode) => episode.category).filter(Boolean))
    return [copy.sortAllLabel, ...Array.from(values).sort((a, b) => a.localeCompare(b))]
  }, [copy.episodes, copy.sortAllLabel])

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

             {/* <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-[72px]">
                <div className="flex max-w-[592px] flex-col gap-6">
                  <p
                    className="font-sans text-xs leading-[26px] font-medium uppercase opacity-80"
                    style={{ color: categoryColor(hero.category) }}
                  >
                    {hero.category}
                  </p>
                  <div className="flex flex-col gap-6">
                    <h2 className="font-sans text-[1.75rem] leading-8 font-normal tracking-[-0.02em] text-[#222222] md:text-[2rem] md:leading-[30px]">
                      {hero.title}
                    </h2>
                    {hero.excerpt ? (
                      <p className="font-sans text-sm leading-6 font-normal text-[#222222]/80">
                        {hero.excerpt}
                      </p>
                    ) : null}
                    <Link
                      href={hero.href}
                      className="inline-flex h-[60px] w-fit items-center gap-2.5 bg-[#484D56] px-5 font-sans text-base leading-[22px] font-normal text-white transition-colors hover:bg-[#33353F]"
                    >
                      {copy.watchNowLabel}
                      <PlayCircle />
                    </Link>
                  </div>
                      
                </div>

              </div> 
              */}
            </div>
          ) : null}
        </div>
      </div>

      <BrowseCategories
        title={copy.browseTitle}
        categories={copy.categories}
        viewAllLabel={copy.viewAllCategoriesLabel}
      />

      {featuredEpisodes.length > 0 ? (
        <section className="w-full bg-white py-16 md:py-[100px]" aria-label={copy.featuredTitle}>
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 xl:px-[156px]">
            <ContentSlider
              label={copy.featuredTitle}
              className="gap-10 md:gap-10"
              headerClassName="w-full items-center border-b border-[#D1D6EA] pb-5 sm:items-center"
              controlsClassName="gap-4"
              trackClassName="gap-5"
              heading={
                <h2 className="font-sans text-[2rem] leading-10 font-normal text-[#171616] md:text-5xl md:leading-[56px]">
                  {copy.featuredTitle}
                </h2>
              }
              slideClassName="w-[min(100%,280px)] sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/3.25)]"
            >
              {featuredEpisodes.map((episode, index) => (
                <div key={episode.href} className="flex h-full items-stretch gap-5">
                  {index > 0 ? (
                    <div className="hidden w-px shrink-0 self-stretch bg-[#D1D6EA] lg:block" aria-hidden="true" />
                  ) : null}
                  <FeaturedGridCard episode={episode} />
                </div>
              ))}
            </ContentSlider>
          </div>
        </section>
      ) : null}

      <section
        id="explore-podcasts"
        className="w-full bg-[#F3F4F9] py-16 md:py-[100px]"
        aria-label={copy.exploreTitle}
      >
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-4 sm:px-6 md:gap-12 md:px-8 xl:px-[156px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-sans text-[2rem] leading-10 font-normal text-[#171616] md:text-5xl md:leading-[56px]">
              {copy.exploreTitle}
            </h2>
            <label className="inline-flex h-[60px] items-center gap-2 border border-[#484D56] px-5 font-sans text-base leading-[22px] text-[#484D56]">
              <span className="whitespace-nowrap">{copy.sortLabel}:</span>
              <span className="relative inline-flex items-center">
                <select
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value)
                    setVisibleCount(PAGE_SIZE)
                  }}
                  className="appearance-none bg-transparent pr-8 font-sans text-base text-[#171616] outline-none"
                >
                  {filterOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2" />
              </span>
            </label>
          </div>

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

      {/*
      copy.subscribe.length > 0 ? (
        <section className="w-full bg-white py-16 md:py-20" aria-label={copy.subscribeTitle}>
          <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-10 px-4 sm:px-6 md:px-8 xl:px-[156px]">
            <div className="flex max-w-[1128px] flex-col items-center gap-2 text-center">
              <h2 className="font-sans text-[2rem] leading-10 font-normal text-[#171616] md:text-4xl md:leading-[56px]">
                {copy.subscribeTitle}
              </h2>
              <p className="font-sans text-base leading-[22px] font-normal text-[#222222]/85 opacity-80">
                {copy.subscribeDescription}
              </p>
            </div>
            <ul className="grid w-full max-w-[1128px] grid-cols-2 gap-4 md:grid-cols-4">
              {copy.subscribe.map((platform) => (
                <li key={platform.name}>
                  <a
                    href={platform.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform.name}
                    className="flex h-[86px] items-center justify-center border border-black/8 bg-white px-5 transition-colors hover:border-black/20"
                  >
                    <img
                      src={platform.logoSrc}
                      alt=""
                      width={platform.width}
                      height={platform.height}
                      className="h-9 w-auto max-w-full object-contain"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null
      */}
    </div>
  )
}
