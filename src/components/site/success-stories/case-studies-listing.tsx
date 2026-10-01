'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'

import type { CaseStudyCard } from '@/data/get-case-studies'
import { cn } from '@/lib/utils'

const pageSize = 8

const trimmedLabelClassName =
  'block leading-none [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]'

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn(
        'size-6 shrink-0 transition-transform duration-300 ease-out group-hover:rotate-45 group-focus-visible:rotate-45',
        className,
      )}
    >
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

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-6 shrink-0', className)}>
      <path
        d="M6 9.5L12 15.5L18 9.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0">
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

const titleLineBreaks: Record<string, string> = {
  'Dynamic payment solution for telecom providers': 'Dynamic payment solution for\ntelecom providers',
  'Streamlined operations engine for enterprise teams':
    'Streamlined operations engine for\nenterprise teams',
  'Go-to-market roadmap for a fintech startup': 'Go-to-market roadmap for a\nfintech startup',
  'Innovative patient management system for hospitals':
    'Innovative patient management system\nfor hospitals',
}

function storyTitle(title: string) {
  return titleLineBreaks[title] ?? title
}

function StoryCard({ story }: { story: CaseStudyCard }) {
  return (
    <article className="relative flex min-h-80 flex-col justify-end overflow-hidden bg-[#F7F7F7] md:h-[calc(100cqi*420/1128)] md:min-h-0 min-[1440px]:h-[420px] min-[1440px]:bg-[#F8F8F8]">
      {story.imageSrc ? (
        <img
          src={story.imageSrc}
          alt=""
          className="absolute top-0 left-0 h-[72%] w-full object-cover object-top grayscale min-[1440px]:top-[-40px] min-[1440px]:h-[377px] min-[1440px]:w-[565px] min-[1440px]:max-w-none"
        />
      ) : null}
      {story.imageSrc ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[28%] h-24 bg-gradient-to-b from-transparent to-[#F7F7F7] min-[1440px]:top-[161px] min-[1440px]:bottom-auto min-[1440px]:h-[259px] min-[1440px]:bg-[linear-gradient(180deg,transparent_0%,#F8F8F8_50%)]"
        />
      ) : null}
      <div className="relative z-10 flex flex-col gap-4 p-6 sm:p-[30px] min-[1440px]:absolute min-[1440px]:top-[239px] min-[1440px]:left-[30px] min-[1440px]:w-[572px] min-[1440px]:p-0!">
        <div className="flex flex-col gap-3">
          {story.category ? (
            <p className="inline-flex h-8 w-fit items-center bg-white px-3 font-inter text-xs leading-4 font-normal text-[#231F20] uppercase">
              {story.category}
            </p>
          ) : null}
          <h2 className="font-sans text-2xl leading-8 font-normal text-[#25282D] md:text-[1.75rem] md:leading-9 min-[1440px]:w-full min-[1440px]:text-[28px] min-[1440px]:leading-[36px] min-[1440px]:whitespace-pre-line min-[1440px]:line-clamp-2">
            {storyTitle(story.title)}
          </h2>
        </div>
        <Link
          href={story.href}
          className="group inline-flex h-6 items-center gap-2.5 font-sans text-base font-normal text-[#222222] min-[1440px]:text-[rgba(34,34,34,0.7)]"
        >
          <span className={trimmedLabelClassName}>{story.ctaLabel}</span>
          <ArrowUpRight />
        </Link>
      </div>
    </article>
  )
}

function CategoryFilter({
  categories,
  value,
  onChange,
}: {
  categories: readonly string[]
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selectedLabel = value === 'all' ? 'All' : value

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        className="inline-flex h-[60px] cursor-pointer items-center gap-2.5 border border-[#484D56] bg-white px-5 font-sans text-base leading-[22px] font-normal text-[#484D56]"
        onClick={() => setOpen((current) => !current)}
      >
        <span className={trimmedLabelClassName}>Select category: {selectedLabel}</span>
        <ChevronDown className={cn('transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Category"
          className="absolute top-full right-0 z-20 mt-1 min-w-full border border-[#484D56] bg-white py-2 shadow-sm"
        >
          {['all', ...categories].map((category) => {
            const label = category === 'all' ? 'All' : category
            const selected = value === category

            return (
              <li key={category} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    'block w-full cursor-pointer px-5 py-2 text-left font-sans text-base leading-[22px] text-[#484D56] hover:bg-[#F7F7F7]',
                    selected && 'bg-[#F7F7F7]',
                  )}
                  onClick={() => {
                    onChange(category)
                    setOpen(false)
                  }}
                >
                  {label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

export function CaseStudiesListing({ stories }: { stories: readonly CaseStudyCard[] }) {
  const [category, setCategory] = useState('all')
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const categories = [...new Set(stories.flatMap((story) => (story.category ? [story.category] : [])))]
  const filtered =
    category === 'all' ? stories : stories.filter((story) => story.category === category)
  const visible = filtered.slice(0, visibleCount)
  const hasMore = visible.length < filtered.length

  return (
    <div className="relative z-10 flex w-full flex-col gap-12 pt-12 md:pt-16 lg:pt-20 xl:gap-[72px]">
      <div className="flex flex-col items-start justify-between gap-8 px-4 sm:px-6 md:px-8 lg:flex-row lg:max-[1439px]:items-center lg:gap-12 lg:px-[72px] xl:px-[156px] min-[1440px]:items-end">
        <div className="flex max-w-[740px] flex-col gap-8 md:gap-12">
          <p className="font-sans text-base leading-[22px] font-normal text-[#222222]">
            <Link href="/" className="text-[#222222] hover:text-[#1CACAE] min-[1440px]:text-[#919191]">
              Home
            </Link>
            <span aria-hidden="true" className="min-[1440px]:text-[#919191]">
              {' '}
              /{' '}
            </span>
            <span>Our success story</span>
          </p>
          <div className="flex flex-col gap-4">
            <h1 className="font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#33353F] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
              Our Success Stories
            </h1>
            <p className="font-sans text-base leading-6 font-normal tracking-[0.36px] text-[#23313C] md:text-lg md:leading-[27px] min-[1440px]:opacity-80">
              Products, platforms and roadmaps we have built with operators, founders and portfolio
              companies, and what changed once they shipped.
            </p>
          </div>
        </div>
        <CategoryFilter
          categories={categories}
          value={category}
          onChange={(next) => {
            setCategory(next)
            setVisibleCount(pageSize)
          }}
        />
      </div>

      <div className="flex flex-col gap-12 px-4 pb-16 sm:px-6 md:px-8 lg:px-[72px] xl:px-[156px] xl:pb-[100px]">
        {visible.length > 0 ? (
          <ul className="grid grid-cols-1 gap-[calc(100vw*1/45)] md:@container md:grid-cols-2 min-[1440px]:gap-3">
            {visible.map((story) => (
              <li key={story.id}>
                <StoryCard story={story} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-sans text-base leading-6 text-[#23313C]">No stories in this category yet.</p>
        )}

        {hasMore ? (
          <div className="flex justify-center">
            <button
              type="button"
              className="inline-flex h-[60px] cursor-pointer items-center gap-2.5 border border-[#484D56] bg-white px-5 font-sans text-base leading-[22px] font-normal text-[#484D56]"
              onClick={() => setVisibleCount((count) => count + pageSize)}
            >
              <span className={trimmedLabelClassName}>See more</span>
              <ChevronRight />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
