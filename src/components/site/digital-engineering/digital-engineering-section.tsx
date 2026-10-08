import Link from 'next/link'

import { cn } from '@/lib/utils'

export type EngineeringOffering = {
  label: string
  href: string
}

export type EngineeringGroup = {
  index: string
  title: string
  description?: string
  items?: readonly EngineeringOffering[]
  iconSrc: string
  iconWidth: number
  iconHeight: number
}

export type DigitalEngineeringSectionProps = {
  title: string
  description: string
  cta: {
    label: string
    href: string
  }
  imageSrc?: string
  imageAlt?: string
  groups: readonly EngineeringGroup[]
  className?: string
  flushTop?: boolean
}

const arrowHoverClassName =
  'transition-transform duration-700 ease-out group-hover:rotate-45 group-focus-visible:rotate-45'

const optionBorderClassName =
  'relative border-b border-[#3C3C43]/15 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-[#0B1F3A] after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.4,0,0.2,1)] after:content-[""] hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:after:transition-none'

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

function EngineeringGroupCard({ group }: { group: EngineeringGroup }) {
  return (
    <article className="flex h-full min-w-0 flex-col gap-7 overflow-visible bg-[#F3F4F9] px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:pt-[60px] lg:pb-12">
      <img
        src={group.iconSrc}
        alt=""
        width={group.iconWidth}
        height={group.iconHeight}
        className="block h-auto w-[4.5rem] max-w-full shrink-0 self-start object-contain sm:w-20 lg:w-[90px]"
      />
      <div className="flex flex-col gap-8">
        <h3 className="font-sans text-base leading-7 font-normal tracking-normal text-[#25282D] uppercase">
          {group.title}
        </h3>
        {group.description ? (
          <p className="font-sans text-base leading-6 font-normal text-[#222222]/70">{group.description}</p>
        ) : null}
        {group.items?.length ? (
          <ul className="flex flex-col gap-3">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex cursor-pointer items-center justify-between gap-4 pb-3 text-[#222222]',
                    optionBorderClassName,
                  )}
                >
                  <span className="font-sans text-lg leading-7 font-normal sm:text-xl sm:leading-8">
                    {item.label}
                  </span>
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[#0b1f3a]">
                    <ArrowUpRight className={arrowHoverClassName} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  )
}

export function DigitalEngineeringSection({
  title,
  description,
  groups,
  className,
  flushTop = false,
}: DigitalEngineeringSectionProps) {
  return (
    <section id="digital-engineering" aria-label={title} className={cn('scroll-mt-24 bg-white', className)}>
      <div
        className={cn(
          'mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-12 sm:px-6 md:gap-12 md:px-8 md:py-16 xl:gap-12 xl:px-14 xl:pb-[100px]',
          flushTop ? 'xl:pt-0' : 'xl:pt-[100px]',
        )}
      >
        <div className="flex max-w-[610px] flex-col gap-9">
          <div className="flex flex-col gap-5">
            <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#33353F] md:text-5xl md:leading-[56px]">
              {title}
            </h2>
            <p className="font-sans text-base leading-6 font-normal text-[#222222]/70">{description}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <EngineeringGroupCard key={group.title} group={group} />
          ))}
        </div>
      </div>
    </section>
  )
}
