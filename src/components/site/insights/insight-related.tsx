'use client'

import Link from 'next/link'

import type { NewsPost } from '@/components/site/latest-news/latest-news-section'
import { ContentSlider } from '@/components/site/slider/content-slider'
import { cn } from '@/lib/utils'

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

function RelatedCard({ post }: { post: NewsPost }) {
  const ctaLabel = post.ctaLabel ?? 'Read More'

  return (
    <article className="group/card relative flex h-full cursor-pointer flex-col gap-6 border border-[#E7E9F3] bg-white pb-3 sm:gap-7">
      <Link href={post.href} className="absolute inset-0 z-20" aria-label={ctaLabel} />
      <div className="flex aspect-[4/3] max-h-[min(200px,32vw)] w-full shrink-0 items-center justify-center px-6 pt-6 sm:max-h-[min(220px,28vw)] sm:px-8 sm:pt-8 lg:max-h-[200px]">
        {post.imageSrc ? (
          <img
            src={post.imageSrc}
            alt={post.imageAlt ?? ''}
            className="h-full max-h-full w-auto max-w-[min(100%,180px)] object-contain sm:max-w-[min(100%,200px)]"
          />
        ) : null}
      </div>
      <div className="relative z-10 flex flex-1 flex-col gap-6 px-6 pb-5 sm:px-8">
        <div className="flex flex-col gap-3">
          <h3 className="min-h-[60px] font-sans text-2xl leading-[30px] font-normal tracking-[-0.48px] text-[#25282D] min-[1440px]:h-[60px] min-[1440px]:overflow-hidden min-[1440px]:text-ellipsis min-[1440px]:[display:-webkit-box] min-[1440px]:[-webkit-box-orient:vertical] min-[1440px]:[-webkit-line-clamp:2]">
            {post.title}
          </h3>
          <p className="h-[72px] overflow-hidden font-sans text-base leading-6 font-normal text-[#222222]/68 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
            {post.excerpt}
          </p>
        </div>
        <div className="mt-auto">
          <span
            className={cn(
              'inline-flex h-12 w-[154px] items-center justify-center gap-2.5 rounded-md border border-solid border-[#484D56] bg-transparent px-5 font-sans text-base leading-[22px] font-normal whitespace-nowrap text-[#484D56] transition-colors duration-300 ease-out',
              'group-hover/card:border-[#484D56] group-hover/card:bg-[#484D56] group-hover/card:text-white',
              'group-focus-within/card:border-[#484D56] group-focus-within/card:bg-[#484D56] group-focus-within/card:text-white',
            )}
          >
            <span className="block leading-none">{ctaLabel}</span>
            <ArrowUpRight />
          </span>
        </div>
      </div>
    </article>
  )
}

export function InsightRelated({
  title,
  posts,
}: {
  title: string
  posts: readonly NewsPost[]
}) {
  if (posts.length === 0) return null

  return (
    <section aria-label={title} className="w-full bg-[#F3F4F9]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6 sm:py-14 md:px-8 md:py-16 xl:px-14 xl:py-[100px]">
        <ContentSlider
          label={title}
          controlsClassName="gap-[21px]"
          trackClassName="py-6 -my-6"
          heading={
            <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#33353F] md:text-5xl md:leading-[56px]">
              {title}
            </h2>
          }
          slideClassName="md:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
        >
          {posts.map((post) => (
            <RelatedCard key={post.href} post={post} />
          ))}
        </ContentSlider>
      </div>
    </section>
  )
}
