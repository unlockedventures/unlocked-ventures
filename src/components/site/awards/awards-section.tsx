import { cn } from '@/lib/utils'

export type Award = {
  name: string
  src: string
  width: number
  height: number
}

type AwardsSectionProps = {
  title?: string
  awards: readonly Award[]
  className?: string
  flushTop?: boolean
}

export function AwardsSection({
  title = 'Awards & Recognitions',
  awards,
  className,
  flushTop = false,
}: AwardsSectionProps) {
  return (
    <section aria-label={title} className={cn('bg-white', className)}>
      <div
        className={cn(
          'mx-auto flex w-full flex-col gap-8 px-4 py-12 sm:px-6 md:px-8 md:py-16 xl:gap-12 xl:px-14 xl:pb-[100px]',
          flushTop ? 'xl:pt-0' : 'xl:pt-[100px]',
        )}
      >
        <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-0.02em] text-[#33353F] md:text-[3rem] md:leading-[3.5rem] md:tracking-[-1px]">
          {title}
        </h2>
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {awards.map((award) => (
            <li
              key={award.name}
              className="group flex h-[130px] items-center justify-center border border-black/10"
            >
              <img
                src={award.src}
                alt={award.name}
                width={award.width}
                height={award.height}
                className="h-auto w-auto max-h-[97px] max-w-full object-contain grayscale transition-[filter] duration-300 group-hover:grayscale-0"
                style={{ width: award.width }}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
