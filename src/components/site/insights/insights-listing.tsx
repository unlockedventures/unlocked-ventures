'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import type { NewsPost } from '@/components/site/latest-news/latest-news-section'
import { cn } from '@/lib/utils'
import { useInsightsStore } from '@/stores/insights-store'

export type InsightsListingCopy = {
  metaTitle: string
  metaDescription: string
  homeLabel: string
  homeHref: string
  currentLabel: string
  title: string
  description: string
  emptyLabel: string
  seeMoreLabel: string
  listTitle: string
  sortLabel: string
  sortAllLabel: string
  readArticleLabel: string
  featuredTagLabel: string
  tocTitle: string
  shareTitle: string
  relatedTitle: string
}

const trimmedLabelClassName =
  'block leading-none [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]'

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

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn(
        'size-5 shrink-0 transition-transform duration-300 ease-out group-hover/card:rotate-45 group-focus-within/card:rotate-45',
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

function AuthorMeta({ post }: { post: NewsPost }) {
  const metaParts = [post.publishedAt, post.readTime].filter(Boolean)
  if (!post.authorName && metaParts.length === 0) return null

  return (
    <div className="flex items-center gap-3">
      {post.authorImageSrc ? (
        <img
          src={post.authorImageSrc}
          alt=""
          className="size-9 shrink-0 rounded-full object-cover"
        />
      ) : post.authorName ? (
        <span
          aria-hidden="true"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white font-sans text-xs font-medium text-[#484D56]"
        >
          {post.authorName
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </span>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-sm leading-5 font-normal text-[#484D56]">
        {post.authorName ? <span className="text-[#171616]">{post.authorName}</span> : null}
        {post.authorName && metaParts.length > 0 ? (
          <span aria-hidden="true" className="text-[#C8CAD0]">
            ·
          </span>
        ) : null}
        {metaParts.length > 0 ? <span>{metaParts.join(' · ')}</span> : null}
      </div>
    </div>
  )
}

function FeaturedPost({
  post,
  featuredTagLabel,
  readArticleLabel,
}: {
  post: NewsPost
  featuredTagLabel: string
  readArticleLabel: string
}) {
  const tags = [featuredTagLabel, ...(post.tags ?? []).slice(0, 1)]

  return (
    <article className="group/featured relative grid overflow-hidden bg-[#F3F4F9] lg:grid-cols-2">
      <Link href={post.href} className="absolute inset-0 z-20" aria-label={readArticleLabel} />
      <div className="flex min-h-[260px] items-center justify-center bg-[#33353F] px-8 py-12 sm:min-h-[320px] lg:min-h-[420px]">
        {post.imageSrc ? (
          <img
            src={post.imageSrc}
            alt={post.imageAlt ?? ''}
            className="h-auto w-full max-w-[220px] object-contain brightness-0 invert sm:max-w-[260px]"
          />
        ) : null}
      </div>
      <div className="relative z-10 flex flex-col justify-center gap-6 px-6 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag}>
              <span className="inline-flex h-8 items-center rounded-full bg-white px-3 font-sans text-sm leading-5 font-normal text-[#484D56]">
                {tag}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-4">
          <h2 className="font-sans text-[1.75rem] leading-9 font-normal tracking-[-0.5px] text-[#171616] sm:text-[2rem] sm:leading-10 lg:text-[2.5rem] lg:leading-[48px]">
            {post.title}
          </h2>
          <p className="font-sans text-base leading-6 font-normal text-[#484D56] md:text-lg md:leading-7">
            {post.excerpt}
          </p>
        </div>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <AuthorMeta post={post} />
          <span className="inline-flex h-11 w-fit items-center gap-2 border border-[#C8CAD0] bg-transparent px-4 font-sans text-sm leading-5 font-normal text-[#484D56] transition-colors group-hover/featured:border-[#484D56] group-hover/featured:text-[#171616]">
            {readArticleLabel}
            <ChevronRight />
          </span>
        </div>
      </div>
    </article>
  )
}

function InsightCard({
  post,
  readArticleLabel,
}: {
  post: NewsPost
  readArticleLabel: string
}) {
  return (
    <article className="group/card relative flex h-full cursor-pointer flex-col bg-[#F3F4F9]">
      <Link href={post.href} className="absolute inset-0 z-20" aria-label={readArticleLabel} />
      <div className="flex aspect-[16/10] w-full shrink-0 items-center justify-center px-8 pt-10 sm:px-10 sm:pt-12">
        {post.imageSrc ? (
          <img
            src={post.imageSrc}
            alt={post.imageAlt ?? ''}
            className="h-full max-h-[160px] w-auto max-w-[min(100%,200px)] object-contain sm:max-h-[180px]"
          />
        ) : null}
      </div>
      <div className="relative z-10 flex flex-1 flex-col gap-4 px-6 pb-8 sm:px-8">
        <h3 className="font-sans text-xl leading-7 font-normal tracking-[-0.3px] text-[#171616] sm:text-2xl sm:leading-8">
          {post.title}
        </h3>
        <p className="line-clamp-3 font-sans text-base leading-6 font-normal text-[#484D56]">
          {post.excerpt}
        </p>
        <span className="mt-auto inline-flex h-12 w-fit items-center justify-center gap-2.5 bg-white px-5 font-sans text-base leading-[22px] font-normal whitespace-nowrap text-[#171616] transition-colors duration-300 ease-out group-hover/card:bg-[#171616] group-hover/card:text-white group-focus-within/card:bg-[#171616] group-focus-within/card:text-white">
          <span className="block leading-none">{readArticleLabel}</span>
          <ArrowUpRight />
        </span>
      </div>
    </article>
  )
}

export function InsightsListing({
  posts,
  copy,
}: {
  posts: readonly NewsPost[]
  copy: InsightsListingCopy
}) {
  const visibleCount = useInsightsStore((state) => state.visibleCount)
  const showMore = useInsightsStore((state) => state.showMore)
  const [category, setCategory] = useState(copy.sortAllLabel)

  const featured =
    posts.find((post) => post.featured) ?? posts[0] ?? null

  const categories = useMemo(() => {
    const values = new Set<string>()
    for (const post of posts) {
      for (const tag of post.tags ?? []) values.add(tag)
    }
    return [copy.sortAllLabel, ...Array.from(values).sort((a, b) => a.localeCompare(b))]
  }, [copy.sortAllLabel, posts])

  const gridPosts = useMemo(() => {
    const rest = featured ? posts.filter((post) => post.href !== featured.href) : posts
    if (category === copy.sortAllLabel) return rest
    return rest.filter((post) => post.tags?.includes(category))
  }, [category, copy.sortAllLabel, featured, posts])

  const visible = gridPosts.slice(0, visibleCount)
  const hasMore = visible.length < gridPosts.length

  return (
    <div className="relative isolate flex w-full flex-col items-center bg-white p-0">
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-12 pt-12 md:gap-16 md:pt-16 lg:gap-20 lg:pt-20 xl:gap-[72px]">
        <img
          src="/about/hero-wave.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 hidden h-auto w-[min(42%,520px)] opacity-60 lg:block"
        />

        <div className="relative z-10 flex max-w-[740px] flex-col gap-8 px-4 sm:px-6 md:gap-10 md:px-8 xl:px-14">
          <p className="font-sans text-base leading-[22px] font-normal text-[#222222]">
            <Link
              href={copy.homeHref}
              className="text-[#222222] hover:text-[#1CACAE] min-[1440px]:text-[#919191]"
            >
              {copy.homeLabel}
            </Link>
            <span aria-hidden="true" className="min-[1440px]:text-[#919191]">
              {' '}
              /{' '}
            </span>
            <span>{copy.currentLabel}</span>
          </p>
          <div className="flex flex-col gap-4">
            <h1 className="font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#33353F] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
              {copy.title}
            </h1>
            <p className="font-sans text-base leading-6 font-normal tracking-[0.36px] text-[#23313C] md:text-lg md:leading-[27px] min-[1440px]:opacity-80">
              {copy.description}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex w-full flex-col gap-12 px-4 pb-16 sm:px-6 md:gap-16 md:px-8 xl:gap-20 xl:px-14 xl:pb-[100px]">
          {featured ? (
            <FeaturedPost
              post={featured}
              featuredTagLabel={copy.featuredTagLabel}
              readArticleLabel={copy.readArticleLabel}
            />
          ) : null}

          <div className="flex flex-col gap-8 md:gap-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <h2 className="font-sans text-[1.75rem] leading-9 font-normal tracking-[-0.5px] text-[#33353F] md:text-[2rem] md:leading-10 lg:text-[2.5rem] lg:leading-[48px]">
                {copy.listTitle}
              </h2>
              <label className="inline-flex items-center gap-2 font-sans text-sm leading-5 font-normal text-[#484D56]">
                <span className="whitespace-nowrap">{copy.sortLabel}:</span>
                <span className="relative inline-flex items-center">
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="h-10 appearance-none border border-[#C8CAD0] bg-white py-2 pr-10 pl-3 font-sans text-sm leading-5 text-[#171616] outline-none focus:border-[#484D56]"
                  >
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#484D56]" />
                </span>
              </label>
            </div>

            {visible.length > 0 ? (
              <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                {visible.map((post) => (
                  <li key={post.href}>
                    <InsightCard post={post} readArticleLabel={copy.readArticleLabel} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-sans text-base leading-6 text-[#23313C]">{copy.emptyLabel}</p>
            )}

            {hasMore ? (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  className="inline-flex h-[60px] cursor-pointer items-center gap-2.5 border border-[#484D56] bg-white px-5 font-sans text-base leading-[22px] font-normal text-[#484D56] transition-colors hover:bg-[#F3F4F9]"
                  onClick={showMore}
                >
                  <span className={trimmedLabelClassName}>{copy.seeMoreLabel}</span>
                  <ChevronRight />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
