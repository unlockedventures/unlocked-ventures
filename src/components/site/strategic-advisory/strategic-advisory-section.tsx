import Link from 'next/link'
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
      <div className="flex flex-col gap-8">
        <h3 className="font-sans text-[1.5rem] leading-[2rem] font-normal tracking-normal text-[#1cacae] uppercase">
          {group.title}
        </h3>
        <ul className="flex flex-col gap-3">
          {group.items.map((item) => (
            <li key={`${group.title}-${item.label}`}>
              <Link
                href={item.href}
                className="group flex cursor-pointer items-center justify-between gap-4 border-b border-[#3C3C43]/15 pb-3 text-[#222222] transition-[border-color] duration-300 ease-out hover:border-[#33353F] focus-visible:border-[#33353F]"
              >
                <span className="font-sans text-xl leading-7 font-normal sm:text-2xl sm:leading-8">
                  {item.label}
                </span>
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[#0b1f3a] transition-colors duration-300 ease-out group-hover:bg-[#0b1f3a] group-hover:text-white group-focus-visible:bg-[#33353F] group-focus-visible:text-white">
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
    <section id="strategic-advisory" aria-label={title} className={cn('scroll-mt-24 bg-white', className)}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-12 sm:px-6 md:gap-12 md:px-8 md:py-16 xl:px-14 xl:py-[100px]">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <div className="flex max-w-[610px] flex-col gap-5">
            <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#33353F] md:text-5xl md:leading-[56px]">
              {title}
            </h2>
            <p className="font-sans text-base leading-6 font-normal text-[#222222]/[0.68]">{description}</p>
          </div>
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
