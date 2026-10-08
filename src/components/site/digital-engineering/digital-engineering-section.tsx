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
    <article className="h-full bg-[#F3F4F9] px-6 py-10 sm:px-10 lg:px-10 lg:py-12">
      <div className="flex flex-col gap-7">
        <h3 className="font-sans text-[2rem] leading-7 font-normal text-[#33353F]">{group.title}</h3>
        {group.description ? (
          <p className="font-sans text-base leading-6 font-normal text-[#222222]/70">{group.description}</p>
        ) : null}
        {group.items?.length ? (
          <ul className="flex flex-col gap-4">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex origin-left cursor-pointer items-center justify-between gap-4 border-b border-[#3C3C43]/15 pb-4 text-[#222222] transition-[color,border-color,scale,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:scale-[1.03] hover:border-[#1CACAE] hover:text-[#1CACAE] focus-visible:-translate-y-0.5 focus-visible:scale-[1.03] focus-visible:border-[#1CACAE] focus-visible:text-[#1CACAE] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
                >
                  <span className="font-sans text-lg leading-8 font-normal sm:text-xl">{item.label}</span>
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[#9C9EA4] bg-white text-[#9C9EA4] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-[#1CACAE] group-hover:bg-[#1CACAE] group-hover:text-white group-focus-visible:border-[#1CACAE] group-focus-visible:bg-[#1CACAE] group-focus-visible:text-white">
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
  groups,
  className,
}: DigitalEngineeringSectionProps) {
  return (
    <section id="digital-engineering" aria-label={title} className={cn('scroll-mt-24 bg-white', className)}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-12 sm:px-6 md:gap-12 md:px-8 md:py-16 xl:px-14 xl:py-[100px]">
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
