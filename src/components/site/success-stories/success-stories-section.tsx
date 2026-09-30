import Link from 'next/link'

import { SiteOutlineButton } from '@/components/site/site-outline-button'
import { cn } from '@/lib/utils'

export type SuccessStory = {
  title: string
  href: string
  ctaLabel: string
  imageSrc?: string
  description?: string
  category?: string
  badge?: string
}

export type SuccessStoriesSectionProps = {
  title: string
  cta: {
    label: string
    href: string
  }
  feature: SuccessStory
  stories: readonly SuccessStory[]
  className?: string
}

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

function StoryLink({
  href,
  label,
  className,
}: {
  href: string
  label: string
  className?: string
}) {
  return (
    <Link href={href} className={cn('group inline-flex items-center gap-2.5 font-sans text-base font-normal', className)}>
      <span className={trimmedLabelClassName}>{label}</span>
      <ArrowUpRight />
    </Link>
  )
}

function StoryImage({ src, className }: { src?: string; className?: string }) {
  if (!src) return null

  return <img src={src} alt="" className={cn('absolute object-cover', className)} />
}

function FeaturedStory({ story }: { story: SuccessStory }) {
  return (
    <article className="relative flex min-h-[22rem] items-center overflow-hidden bg-[#F8F8F8] lg:h-[420px]">
      <StoryImage src={story.imageSrc} className="inset-y-0 right-0 h-full w-full md:w-[58%]" />
      {story.imageSrc ? (
        <div className="absolute inset-0 bg-gradient-to-r from-[#F8F8F8] from-35% via-[#F8F8F8]/85 via-55% to-transparent" />
      ) : null}
      <div className="relative z-10 w-full px-6 py-10 sm:px-8 lg:px-[70px] lg:py-0">
        <div className="flex max-w-[572px] flex-col gap-6">
          {story.badge ? (
            <span className="inline-flex h-10 w-fit items-center bg-white px-5 font-inter text-base leading-[26px] font-normal text-[#231F20] uppercase">
              {story.badge}
            </span>
          ) : null}
          <div className="flex flex-col gap-6">
            <h3 className="font-sans text-2xl leading-8 font-normal text-[#25282D] md:text-[2rem] md:leading-10">
              {story.title}
            </h3>
            {story.description ? (
              <p className="font-sans text-base leading-6 font-normal text-[#222222]/85">{story.description}</p>
            ) : null}
            <StoryLink href={story.href} label={story.ctaLabel} className="h-12 text-[#33353F]" />
          </div>
        </div>
      </div>
    </article>
  )
}

function StoryCard({ story }: { story: SuccessStory }) {
  return (
    <article className="relative flex min-h-80 flex-col justify-end overflow-hidden bg-[#F8F8F8] md:h-[420px]">
      <StoryImage src={story.imageSrc} className="inset-0 h-full w-full object-top" />
      {story.imageSrc ? (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-30% to-[#F8F8F8] to-70%" />
      ) : null}
      <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8 lg:p-[30px]">
        {story.category ? (
          <p className="inline-flex h-8 w-fit items-center bg-white px-3 font-inter text-xs leading-4 font-normal text-[#231F20] uppercase">
            {story.category}
          </p>
        ) : null}
        <h3 className="max-w-[36rem] font-sans text-2xl leading-8 font-normal text-[#25282D] md:text-[1.75rem] md:leading-9">
          {story.title}
        </h3>
        <StoryLink href={story.href} label={story.ctaLabel} className="h-6 text-[#222222]" />
      </div>
    </article>
  )
}

export function SuccessStoriesSection({
  title,
  cta,
  feature,
  stories,
  className,
}: SuccessStoriesSectionProps) {
  return (
    <section aria-label="Our success stories" className={cn('bg-white', className)}>
      <div className="mx-auto flex w-full flex-col gap-8 px-4 py-12 sm:px-6 md:gap-12 md:px-8 md:py-16 xl:px-14 xl:py-[100px]">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#171616] md:text-5xl md:leading-[56px]">
            {title}
          </h2>
          <SiteOutlineButton
            href={cta.href}
            text={cta.label}
            icon={<ArrowUpRight />}
            className="group h-[60px] gap-2.5 border-0 bg-[#484D56] px-5 text-base text-white hover:bg-[#484D56] sm:h-[60px] sm:px-5 sm:text-base lg:h-[60px] lg:px-5 lg:text-base 2xl:h-[60px] 2xl:px-5 2xl:text-base"
          />
        </div>
        <div className="flex flex-col gap-3">
          <FeaturedStory story={feature} />
          <div className="grid gap-3 md:grid-cols-2">
            {stories.map((story) => (
              <StoryCard key={story.href} story={story} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
