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
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start gap-10 px-4 py-12 sm:px-6 md:px-8 md:py-16 lg:px-12 xl:flex-row xl:items-center xl:justify-between xl:px-[152px] xl:py-[73px] min-[1440px]:min-h-[613px] min-[1440px]:items-start! min-[1440px]:pr-[158px]!">
        <div className="w-full max-w-[748px] bg-white min-[1440px]:w-[747px] min-[1440px]:max-w-none min-[1440px]:shrink-0 min-[1440px]:bg-transparent">
          {mapSrc ? <img src={mapSrc} alt="" className="h-auto w-full min-[1440px]:h-[468px] min-[1440px]:object-contain" /> : null}
        </div>
        <ul className="flex w-full max-w-[17.125rem] flex-col gap-12 min-[1440px]:mt-[22px] min-[1440px]:max-w-[274px] min-[1440px]:gap-6">
          {stats.map((stat, index) => (
            <li
              key={stat.value}
              className={cn(
                index < stats.length - 1 &&
                  'min-[1440px]:border-b min-[1440px]:border-black/16 min-[1440px]:pb-6',
              )}
            >
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
