import { cn } from '@/lib/utils'

export type Award = {
  name: string
  src: string
  width: number
  height: number
  href: string
}

type AwardsSectionProps = {
  title: string
  awards: readonly Award[]
  className?: string
  flushTop?: boolean
}

export function AwardsSection({
  title,
  awards,
  className,
  flushTop = false,
}: AwardsSectionProps) {
  return (
    <section aria-label={title} className={cn('bg-white', className)}>
      <div
        className={cn(
          'mx-auto flex w-full flex-col items-stretch gap-12 px-4 pb-[100px] pt-12 sm:px-6 md:px-8 md:pt-16 xl:px-14 xl:pt-0 min-[1440px]:max-w-[1440px]',
          !flushTop && 'xl:pt-[100px]',
        )}
      >
        <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-0.02em] text-[#33353F] md:text-[3rem] md:leading-[3.5rem] md:tracking-[-1px]">
          {title}
        </h2>
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {awards.map((award) => (
            <li key={award.name}>
              <a
                href={award.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-[130px] w-full cursor-pointer items-center justify-center border border-black/10 bg-white"
              >
                <img
                  src={award.src}
                  alt={award.name}
                  width={award.width}
                  height={award.height}
                  className="h-auto w-auto max-h-[97px] max-w-full object-contain grayscale transition-[filter] duration-300 ease-out group-hover:grayscale-0"
                  style={{ width: award.width }}
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
