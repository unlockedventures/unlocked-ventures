import Link from 'next/link'

import { SiteOutlineButton } from '@/components/site/site-outline-button'
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
}

const arrowMotionClassName = 'transition-transform duration-300 ease-out'

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
    <article
      className={cn(
        'bg-white/10 px-6 sm:px-10',
        group.items?.length ? 'py-10 lg:px-10 lg:py-12' : 'py-9',
      )}
    >
      <div className="flex flex-col gap-7">
        <div className="flex items-center gap-4">
          <p className="font-sans text-xl leading-7 font-normal text-white/50">{group.index}</p>
          <h3 className="font-sans text-[2rem] leading-7 font-normal text-white">{group.title}</h3>
        </div>
        {group.description ? (
          <p className="font-sans text-base leading-6 font-normal text-white/70">{group.description}</p>
        ) : null}
        {group.items?.length ? (
          <ul className="flex flex-col gap-4">
            {group.items.map((item) => (
              <li key={item.href} className="border-b border-white/10 pb-4">
                <Link
                  href={item.href}
                  className="group flex cursor-pointer items-center justify-between gap-4 text-white/70"
                >
                  <span className="font-sans text-lg leading-8 font-normal sm:text-xl">{item.label}</span>
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[#9C9EA4] text-[#9C9EA4] transition-colors duration-300 ease-out group-hover:border-white group-hover:bg-white group-hover:text-[#33353F] group-focus-visible:border-white group-focus-visible:bg-white group-focus-visible:text-[#33353F]">
                    <ArrowUpRight
                      className={cn(
                        'size-5',
                        arrowMotionClassName,
                        'group-hover:rotate-45 group-focus-visible:rotate-45',
                      )}
                    />
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
  cta,
  imageSrc,
  imageAlt = '',
  groups,
  className,
}: DigitalEngineeringSectionProps) {
  return (
    <section aria-label="Digital engineering" className={cn('bg-[#484D56]', className)}>
      <div className="mx-auto flex w-full flex-col gap-8 px-4 py-12 sm:px-6 md:gap-12 md:px-8 md:py-16 xl:pt-[100px]! xl:pr-[156px]! xl:pb-[100px]! xl:pl-[156px]!">
        <div className="flex max-w-[610px] flex-col gap-9">
          <div className="flex flex-col gap-5">
            <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-white md:text-5xl md:leading-[56px]">
              {title}
            </h2>
            <p className="font-sans text-base leading-6 font-normal text-white/70">{description}</p>
          </div>
          <SiteOutlineButton
            href={cta.href}
            text={cta.label}
            icon={
              <ArrowUpRight className="transition-opacity duration-300 ease-out group-hover:opacity-0 group-focus-visible:opacity-0" />
            }
            className="group h-[60px] w-fit gap-2.5 border-0 bg-white px-5 text-base text-[#33353F] hover:bg-white sm:h-[60px] sm:px-5 sm:text-base lg:h-[60px] lg:px-5 lg:text-base 2xl:h-[60px] 2xl:px-5 2xl:text-base"
          />
        </div>
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(0,556fr)_minmax(0,524fr)] lg:gap-12">
          <div className="relative min-h-72 overflow-hidden bg-white lg:min-h-[573px]">
            {imageSrc ? (
              <img src={imageSrc} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover grayscale" />
            ) : null}
          </div>
          <div className="flex flex-col gap-4">
            {groups.map((group) => (
              <EngineeringGroupCard key={group.index} group={group} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
