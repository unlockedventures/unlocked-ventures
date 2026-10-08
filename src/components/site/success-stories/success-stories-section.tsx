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

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-5 shrink-0', className)}>
      <path
        d="M5 12H19M13 6L19 12L13 18"
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
        'inline-flex items-center gap-2.5 font-sans text-base font-normal text-[#33353F] no-underline transition-colors duration-300 ease-out group-hover:underline group-hover:decoration-[#33353F] group-hover:decoration-1 group-hover:underline-offset-4 group-focus-within:underline group-focus-within:decoration-[#33353F] group-focus-within:decoration-1 group-focus-within:underline-offset-4',
        className,
      )}
    >
      <span className={trimmedLabelClassName}>{label}</span>
      <ArrowRight className="transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-focus-within:translate-x-0.5" />
    </span>
  )
}

function StoryImage({ src, className }: { src?: string; className?: string }) {
  if (!src) return null

  return <img src={src} alt="" className={cn('absolute object-cover', className)} />
}

function FeaturedStory({ story }: { story: SuccessStory }) {
  return (
    <article className="group relative flex min-h-[22rem] cursor-pointer items-center overflow-hidden bg-[#F3FBFA] shadow-none ring-0 ring-[#1CACAE]/0 transition-[box-shadow,ring-color,ring-width] duration-300 ease-out hover:shadow-[0_14px_36px_-20px_rgba(28,172,174,0.45)] hover:ring-2 hover:ring-[#1CACAE]/35 focus-within:shadow-[0_14px_36px_-20px_rgba(28,172,174,0.45)] focus-within:ring-2 focus-within:ring-[#1CACAE]/35 lg:h-[420px]">
      <Link href={story.href} className="absolute inset-0 z-20" aria-label={story.ctaLabel} />
      {story.imageSrc ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full md:w-[58%] min-[1440px]:inset-auto min-[1440px]:top-0 min-[1440px]:left-[634px] min-[1440px]:h-[449px] min-[1440px]:w-[694px]!">
          <img
            src={story.imageSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top grayscale-0"
          />
          <div className="absolute inset-y-0 left-0 w-[78%] bg-[linear-gradient(90deg,#F3FBFA_0%,rgba(243,251,250,0.92)_38%,rgba(28,172,174,0.28)_68%,transparent_100%)] min-[1440px]:bottom-auto min-[1440px]:h-[420px] min-[1440px]:w-[507px] min-[1440px]:bg-[linear-gradient(270deg,transparent_0%,rgba(28,172,174,0.22)_40%,rgba(243,251,250,0.92)_72%,#F3FBFA_100%)]" />
        </div>
      ) : null}
      <div className="relative z-10 w-full px-6 py-10 sm:px-8 lg:px-[70px] lg:py-0 min-[1440px]:absolute min-[1440px]:top-[68px] min-[1440px]:left-[70px] min-[1440px]:w-[572px] min-[1440px]:p-0!">
        <div className="flex max-w-[572px] flex-col gap-6 min-[1440px]:w-full min-[1440px]:max-w-none">
          {story.badge ? (
            <span className="inline-flex h-10 w-fit items-center bg-white px-5 font-inter text-base leading-[26px] font-normal text-[#231F20] uppercase transition-colors duration-300 ease-out group-hover:bg-[#1CACAE] group-hover:text-white group-focus-within:bg-[#1CACAE] group-focus-within:text-white">
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
    <article className="group relative flex h-full min-h-80 cursor-pointer flex-col justify-end overflow-hidden bg-[#F3FBFA] shadow-none ring-0 ring-[#1CACAE]/0 transition-[box-shadow,ring-color,ring-width] duration-300 ease-out hover:shadow-[0_14px_36px_-20px_rgba(28,172,174,0.45)] hover:ring-2 hover:ring-[#1CACAE]/35 focus-within:shadow-[0_14px_36px_-20px_rgba(28,172,174,0.45)] focus-within:ring-2 focus-within:ring-[#1CACAE]/35 md:h-[420px]">
      <Link href={story.href} className="absolute inset-0 z-20" aria-label={story.ctaLabel} />
      <StoryImage src={story.imageSrc} className="inset-0 h-full w-full object-top grayscale-0" />
      {story.imageSrc ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,#F3FBFA_0%,rgba(243,251,250,0.96)_24%,rgba(28,172,174,0.42)_52%,rgba(28,172,174,0.16)_74%,transparent_100%)]"
        />
      ) : null}
      <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8 lg:p-[30px] min-[1440px]:absolute min-[1440px]:top-[239px] min-[1440px]:left-[30px] min-[1440px]:w-[572px] min-[1440px]:gap-4 min-[1440px]:p-0!">
        <div className="flex flex-col gap-6 min-[1440px]:gap-3">
          {story.category ? (
            <p className="inline-flex h-8 w-fit items-center bg-white px-3 font-inter text-xs leading-4 font-normal text-[#231F20] uppercase transition-colors duration-300 ease-out group-hover:bg-[#1CACAE] group-hover:text-white group-focus-within:bg-[#1CACAE] group-focus-within:text-white">
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
  cta,
  feature,
  stories,
  className,
}: SuccessStoriesSectionProps) {
  return (
    <section aria-label={title} className={cn('bg-white', className)}>
      <div className="mx-auto flex w-full flex-col gap-8 px-4 py-12 sm:px-6 md:gap-12 md:px-8 md:py-16 xl:px-14 xl:py-[100px] min-[1440px]:max-w-[1440px]">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#33353F] md:text-5xl md:leading-[56px] min-[1440px]:text-[48px] min-[1440px]:leading-[56px] min-[1440px]:text-[#171616]">
            {title}
          </h2>
          <Link
            href={cta.href}
            className="group/case inline-flex cursor-pointer items-center font-sans text-base leading-6 font-normal text-[#33353F] no-underline"
          >
            <span className="underline decoration-transparent underline-offset-4 transition-colors duration-200 ease-out group-hover/case:decoration-[#33353F] group-focus-visible/case:decoration-[#33353F] motion-reduce:transition-none">
              {cta.label}
            </span>
            <span className="inline-flex w-0 overflow-hidden opacity-0 transition-all duration-200 ease-out group-hover/case:ml-2 group-hover/case:w-5 group-hover/case:opacity-100 group-focus-visible/case:ml-2 group-focus-visible/case:w-5 group-focus-visible/case:opacity-100 motion-reduce:transition-none">
              <ArrowRight className="size-5" />
            </span>
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
