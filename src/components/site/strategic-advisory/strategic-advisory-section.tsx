import Link from 'next/link'

import { SiteOutlineButton } from '@/components/site/site-outline-button'
import { cn } from '@/lib/utils'

export type AdvisoryOffering = {
  label: string
  href: string
}

export type AdvisoryGroup = {
  title: string
  items: readonly AdvisoryOffering[]
  iconSrc: string
  iconWidth: number
  iconHeight: number
}

export type StrategicAdvisorySectionProps = {
  title: string
  description: string
  cta: {
    label: string
    href: string
  }
  groups: readonly AdvisoryGroup[]
  className?: string
}

const arrowHoverClassName =
  'transition-transform duration-300 ease-out group-hover:rotate-45 group-focus-visible:rotate-45'

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-6 shrink-0', className)}>
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

function AdvisoryCard({ group }: { group: AdvisoryGroup }) {
  return (
    <article className="flex h-full min-w-0 flex-col gap-7 overflow-visible bg-[#F3F4F9] px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:pt-[60px] lg:pb-12">
      <img
        src={group.iconSrc}
        alt=""
        width={group.iconWidth}
        height={group.iconHeight}
        className="block h-auto w-[4.5rem] max-w-full shrink-0 self-start sm:w-20 lg:w-[90px]"
      />
      <div className="flex flex-col gap-8">
        <h3 className="font-sans text-base leading-7 font-normal tracking-normal text-[#25282D] uppercase">
          {group.title}
        </h3>
        <ul className="flex flex-col gap-3">
          {group.items.map((item) => (
            <li key={`${group.title}-${item.label}`} className="border-b border-[#3C3C43]/15 pb-3">
              <Link
                href={item.href}
                className="group flex cursor-pointer items-center justify-between gap-4 text-[#222222]"
              >
                <span className="font-sans text-xl leading-7 font-normal sm:text-2xl sm:leading-8">
                  {item.label}
                </span>
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[#33353F] transition-colors duration-300 ease-out group-hover:bg-[#33353F] group-hover:text-white group-focus-visible:bg-[#33353F] group-focus-visible:text-white">
                  <ArrowUpRight className={arrowHoverClassName} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export function StrategicAdvisorySection({
  title,
  description,
  cta,
  groups,
  className,
}: StrategicAdvisorySectionProps) {
  return (
    <section aria-label={title} className={cn('bg-white', className)}>
      <div className="mx-auto flex w-full flex-col gap-8 px-4 py-12 sm:px-6 md:gap-12 md:px-8 md:py-16 xl:px-[156px] xl:py-[100px] min-[1440px]:max-w-[1440px]">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <div className="flex max-w-[610px] flex-col gap-5">
            <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#33353F] md:text-5xl md:leading-[56px]">
              {title}
            </h2>
            <p className="font-sans text-base leading-6 font-normal text-[#222222]/[0.68]">{description}</p>
          </div>
          <SiteOutlineButton
            href={cta.href}
            text={cta.label}
            icon={<ArrowUpRight className={arrowHoverClassName} />}
            className="group h-[60px] gap-2.5 rounded-none border-0 bg-[#484D56] px-5 text-base text-white hover:bg-[#484D56] sm:h-[60px] sm:px-5 sm:text-base lg:h-[60px] lg:px-5 lg:text-base 2xl:h-[60px] 2xl:px-5 2xl:text-base"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {groups.map((group) => (
            <AdvisoryCard key={group.title} group={group} />
          ))}
        </div>
      </div>
    </section>
  )
}
