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

const cardLiftClassName =
  'origin-center transition-transform duration-[400ms] ease hover:z-10 hover:-translate-y-[6px] hover:scale-[1.02] focus-within:z-10 focus-within:-translate-y-[6px] focus-within:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 motion-reduce:focus-within:translate-y-0 motion-reduce:focus-within:scale-100'

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
    <article
      className={cn(
        'relative flex min-h-[22rem] items-center overflow-hidden bg-[#F8F8F8] lg:h-[420px]',
        cardLiftClassName,
      )}
    >
      {story.imageSrc ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full md:w-[58%] min-[1440px]:inset-auto min-[1440px]:top-0 min-[1440px]:left-[634px] min-[1440px]:h-[449px] min-[1440px]:w-[694px]!">
          <img
            src={story.imageSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top grayscale"
          />
          <div className="absolute inset-y-0 left-0 w-[73%] bg-gradient-to-r from-[#F8F8F8] to-transparent min-[1440px]:bottom-auto min-[1440px]:h-[420px] min-[1440px]:w-[507px] min-[1440px]:bg-[linear-gradient(270deg,transparent_0%,#F8F8F8_100%)]" />
          <div className="absolute top-[-4%] -left-[7.2%] h-[115%] w-[26.8%] bg-[#F8F8F8] blur-[100px] min-[1440px]:top-[-17px] min-[1440px]:left-[-50px] min-[1440px]:h-[483px] min-[1440px]:w-[186px] min-[1440px]:blur-[102px]" />
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
            <StoryLink href={story.href} label={story.ctaLabel} className="h-12 text-[#33353F]" />
          </div>
        </div>
      </div>
    </article>
  )
}

function StoryCard({ story }: { story: SuccessStory }) {
  return (
    <article
      className={cn(
        'relative flex h-full min-h-80 flex-col justify-end overflow-hidden bg-[#F8F8F8] md:h-[420px]',
        cardLiftClassName,
      )}
    >
      <StoryImage src={story.imageSrc} className="inset-0 h-full w-full object-top grayscale" />
      {story.imageSrc ? (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-30% to-[#F8F8F8] to-70% min-[1440px]:inset-x-0 min-[1440px]:top-[161px] min-[1440px]:bottom-auto min-[1440px]:h-[259px] min-[1440px]:bg-[linear-gradient(180deg,transparent_0%,#F4F4F4_50%)]" />
      ) : null}
      {story.imageSrc ? (
        <div className="pointer-events-none absolute hidden bg-[#F8F8F8] blur-[102px] min-[1440px]:top-[205px] min-[1440px]:-left-[25px] min-[1440px]:block min-[1440px]:h-[161px] min-[1440px]:w-[707px]" />
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
        <StoryLink
          href={story.href}
          label={story.ctaLabel}
          className="h-6 text-[#222222] min-[1440px]:gap-2 min-[1440px]:text-[rgba(34,34,34,0.7)]"
        />
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
