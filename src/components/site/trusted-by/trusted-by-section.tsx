import { cn } from '@/lib/utils'

export type TrustedLogo = {
  name: string
  src: string
  width: number
  height: number
}

export type TrustedBySectionProps = {
  title?: string
  logos: readonly TrustedLogo[]
  className?: string
}

function LogoRow({ logos, hidden = false }: { logos: readonly TrustedLogo[]; hidden?: boolean }) {
  const slotWidth = Math.max(...logos.map((logo) => logo.width))

  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-12 pr-12">
      {logos.map((logo) => (
        <li
          key={logo.name}
          className="group flex shrink-0 items-center justify-center"
          style={{ width: slotWidth }}
        >
          <img
            src={logo.src}
            alt={hidden ? '' : logo.name}
            width={logo.width}
            height={logo.height}
            className="block shrink-0 grayscale transition-[filter] duration-300 group-hover:grayscale-0"
          />
        </li>
      ))}
    </ul>
  )
}

export function TrustedBySection({
  title = 'Trusted by',
  logos,
  className,
}: TrustedBySectionProps) {
  return (
    <section className={cn('overflow-hidden bg-white', className)}>
      <div className="flex w-full flex-col items-center gap-10 px-4 py-12 sm:px-6 md:px-8 md:py-16 lg:px-12 xl:px-16 xl:py-[100px] 2xl:px-20">
        <h2 className="text-center font-sans text-[2rem] leading-[3rem] font-normal text-[#171616]">
          {title}
        </h2>
        <div className="relative w-full overflow-hidden">
          <div className="trusted-marquee-track flex w-max items-center">
            <LogoRow logos={logos} />
            <LogoRow logos={logos} hidden />
          </div>
          <div
            aria-hidden="true"
            className="trusted-by-fade pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent sm:w-32 xl:w-[245px]"
          />
          <div
            aria-hidden="true"
            className="trusted-by-fade pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent sm:w-32 xl:w-[245px]"
          />
        </div>
      </div>
    </section>
  )
}
