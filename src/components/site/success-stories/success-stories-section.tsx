import Link from 'next/link'

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
  subtitle?: string
  cta: {
    label: string
    href: string
  }
  feature: SuccessStory
  stories: readonly SuccessStory[]
  className?: string
  flushTop?: boolean
}

const trimmedLabelClassName =
  'block leading-none [text-box-edge:cap_alphabetic] [text-box-trim:trim-both]'

const titleLineBreaks: Record<string, string> = {
  'Automated object detection system': 'Automated object detection\nsystem',
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

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn(
        'size-5 shrink-0 transition-transform duration-300 ease-out group-hover:rotate-45 group-focus-visible:rotate-45 group-hover/case:rotate-45 group-focus-visible/case:rotate-45',
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

function StoryCta({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2.5 font-sans text-base font-normal text-[#222222]',
        className,
      )}
    >
      <span
        className={cn(
          trimmedLabelClassName,
          'underline decoration-transparent underline-offset-4 transition-colors duration-200 ease-out group-hover:decoration-[#222222] group-focus-within:decoration-[#222222]',
        )}
      >
        {label}
      </span>
      <ArrowUpRight />
    </span>
  )
}

function FeaturedStory({ story }: { story: SuccessStory }) {
  return (
    <article className="group relative flex min-h-[22rem] cursor-pointer items-center overflow-hidden bg-[#F8F8F8] lg:h-[420px]">
      <Link href={story.href} className="absolute inset-0 z-20" aria-label={story.ctaLabel} />
      {story.imageSrc ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full md:w-[62%] min-[1440px]:inset-auto min-[1440px]:top-0 min-[1440px]:left-[634px] min-[1440px]:h-[420px] min-[1440px]:w-[694px]!">
          <img
            src={story.imageSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top grayscale"
          />
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,#F8F8F8_0%,#F8F8F8_28%,rgba(248,248,248,0.72)_48%,rgba(248,248,248,0)_78%)] min-[1440px]:w-[507px] min-[1440px]:bg-[linear-gradient(270deg,rgba(248,248,248,0)_0%,rgba(248,248,248,0.72)_42%,#F8F8F8_72%,#F8F8F8_100%)]"
          />
        </div>
      ) : null}
      <div className="relative z-10 w-full px-6 py-10 sm:px-8 lg:px-[70px] lg:py-0 min-[1440px]:absolute min-[1440px]:top-[68px] min-[1440px]:left-[70px] min-[1440px]:w-[572px] min-[1440px]:p-0!">
        <div className="flex max-w-[572px] flex-col gap-6 min-[1440px]:w-full min-[1440px]:max-w-none">
          {story.badge ? (
            <span className="inline-flex h-10 w-fit items-center bg-white px-5 font-inter text-base leading-[26px] font-normal text-[#231F20] uppercase">
              {story.badge}
            </span>
          ) : null}
          <div className="flex flex-col gap-6 min-[1440px]:gap-8">
            <div className="flex flex-col gap-6 min-[1440px]:gap-3">
              <h3 className="font-sans text-2xl leading-8 font-normal whitespace-pre-line text-[#25282D] md:text-[2rem] md:leading-10 min-[1440px]:text-[32px] min-[1440px]:leading-[40px]">
                {storyTitle(story.title)}
              </h3>
              {story.description ? (
                <p className="font-sans text-base leading-6 font-normal text-[#222222]/85 min-[1440px]:text-[rgba(34,34,34,0.85)] min-[1440px]:opacity-80">
                  {story.description}
                </p>
              ) : null}
            </div>
            <StoryCta label={story.ctaLabel} className="h-12" />
          </div>
        </div>
      </div>
    </article>
  )
}

function StoryCard({ story }: { story: SuccessStory }) {
  return (
    <article className="group relative flex h-full min-h-80 cursor-pointer flex-col justify-end overflow-hidden bg-[#F8F8F8] md:h-[420px]">
      <Link href={story.href} className="absolute inset-0 z-20" aria-label={story.ctaLabel} />
      {story.imageSrc ? (
        <img
          src={story.imageSrc}
          alt=""
          className="absolute top-0 left-0 h-[72%] w-full object-cover object-top grayscale min-[1440px]:top-[-40px] min-[1440px]:h-[377px] min-[1440px]:w-full"
        />
      ) : null}
      {story.imageSrc ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[28%] h-24 bg-[linear-gradient(180deg,rgba(248,248,248,0)_0%,#F8F8F8_100%)] min-[1440px]:top-[161px] min-[1440px]:bottom-auto min-[1440px]:h-[259px] min-[1440px]:bg-[linear-gradient(180deg,rgba(248,248,248,0)_0%,#F8F8F8_50%)]"
        />
      ) : null}
      <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8 lg:p-[30px] min-[1440px]:absolute min-[1440px]:top-[239px] min-[1440px]:left-[30px] min-[1440px]:w-[572px] min-[1440px]:gap-4 min-[1440px]:p-0!">
        <div className="flex flex-col gap-6 min-[1440px]:gap-3">
          {story.category ? (
            <p className="inline-flex h-8 w-fit items-center bg-white px-3 font-inter text-xs leading-4 font-normal text-[#231F20] uppercase">
              {story.category}
            </p>
          ) : null}
          <h3 className="max-w-[36rem] font-sans text-2xl leading-8 font-normal whitespace-pre-line text-[#25282D] md:text-[1.75rem] md:leading-9 min-[1440px]:max-w-none min-[1440px]:text-[28px] min-[1440px]:leading-9">
            {storyTitle(story.title)}
          </h3>
        </div>
        <StoryCta label={story.ctaLabel} className="h-6 min-[1440px]:gap-2" />
      </div>
    </article>
  )
}

export function SuccessStoriesSection({
  title,
  subtitle,
  cta,
  feature,
  stories,
  className,
  flushTop = false,
}: SuccessStoriesSectionProps) {
  return (
    <section aria-label={title} className={cn('bg-white', className)}>
      <div
        className={cn(
          'mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-4 py-12 sm:px-6 md:px-8 md:py-16 xl:px-14 xl:pb-[100px]',
          flushTop ? 'xl:pt-0' : 'xl:pt-[100px]',
        )}
      >
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="flex max-w-[610px] flex-col gap-5">
            <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#33353F] md:text-5xl md:leading-[56px] min-[1440px]:text-[48px] min-[1440px]:leading-[56px] min-[1440px]:text-[#171616]">
              {title}
            </h2>
            {subtitle ? (
              <p className="font-sans text-base leading-6 font-normal text-[#222222]/[0.68]">
                {subtitle}
              </p>
            ) : null}
          </div>
          <Link
            href={cta.href}
            className="group/case inline-flex shrink-0 cursor-pointer items-center gap-2.5 font-sans text-base leading-6 font-normal text-[#33353F] no-underline"
          >
            <span className="underline underline-offset-4 decoration-[#33353F]">
              {cta.label}
            </span>
            <ArrowUpRight className="size-5" />
          </Link>
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
