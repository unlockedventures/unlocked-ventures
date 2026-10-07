import { cn } from '@/lib/utils'

export type Award = {
  name: string
  src: string
  width: number
  height: number
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
          'mx-auto flex w-full flex-col gap-8 px-4 py-12 sm:px-6 md:px-8 md:py-16 xl:gap-12 xl:px-14 xl:pb-[100px] min-[1440px]:max-w-[1440px]',
          flushTop ? 'xl:pt-0' : 'xl:pt-[100px]',
        )}
      >
        <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-0.02em] text-[#33353F] md:text-[3rem] md:leading-[3.5rem] md:tracking-[-1px]">
          {title}
        </h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6 lg:gap-6">
          {awards.map((award) => (
            <li
              key={award.name}
              className="group flex h-[130px] items-center justify-center border border-black/10 bg-white transition-[background-color,border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-[#1CACAE]/30 hover:bg-[#F4FBFA] hover:shadow-[0_18px_36px_-22px_rgba(28,172,174,0.5)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none"
            >
              <img
                src={award.src}
                alt={award.name}
                width={award.width}
                height={award.height}
                className="h-auto w-auto max-h-[97px] max-w-full object-contain grayscale transition-[filter,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] group-hover:grayscale-0 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                style={{ width: award.width }}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
