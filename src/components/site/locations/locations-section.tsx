import { cn } from '@/lib/utils'

export type LocationStat = {
  value: string
  label: string
}

export type LocationsSectionProps = {
  stats: readonly LocationStat[]
  mapSrc?: string
  className?: string
}

export function LocationsSection({ stats, mapSrc, className }: LocationsSectionProps) {
  return (
    <section aria-label="Our locations" className={cn('bg-[#F3F4F9]', className)}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start gap-10 px-4 py-12 sm:px-6 md:px-8 md:py-16 lg:px-12 xl:flex-row xl:items-center xl:justify-between xl:px-[152px] xl:py-[73px]">
        <div className="w-full max-w-[748px] bg-white">
          {mapSrc ? <img src={mapSrc} alt="" className="h-auto w-full" /> : null}
        </div>
        <ul className="flex w-full max-w-[17.125rem] flex-col gap-12">
          {stats.map((stat) => (
            <li key={stat.value}>
              <p className="font-sans text-4xl leading-[44px] font-normal tracking-[-1px] text-[#33353F] md:text-[3rem] md:leading-[56px]">
                {stat.value}
              </p>
              <p className="mt-3 font-sans text-base leading-6 font-normal text-[#222222]/85">
                {stat.label}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
