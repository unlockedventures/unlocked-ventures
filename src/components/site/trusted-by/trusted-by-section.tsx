import { cn } from '@/lib/utils'

export type TrustedLogo = {
  name: string
  src: string
  width: number
  height: number
}

type TrustedBySectionProps = {
  title?: string
  logos: readonly TrustedLogo[]
  className?: string
}

export const homepageTrustedLogos = [
  {
    name: 'Constellation',
    src: '/logos/partners/constellation.svg',
    width: 164,
    height: 41,
  },
  {
    name: 'Elevance Health',
    src: '/logos/partners/elevance-health.svg',
    width: 115,
    height: 48,
  },
  {
    name: 'TransUnion',
    src: '/logos/partners/transunion.svg',
    width: 145,
    height: 39,
  },
  {
    name: 'PayPal',
    src: '/logos/partners/paypal.svg',
    width: 124,
    height: 33,
  },
  {
    name: 'Amwell',
    src: '/logos/partners/amwell.svg',
    width: 130,
    height: 36,
  },
  {
    name: 'Vori Health',
    src: '/logos/partners/vori-health.svg',
    width: 180,
    height: 35,
  },
  {
    name: 'Coca-Cola',
    src: '/logos/partners/coca-cola.svg',
    width: 120,
    height: 41,
  },
] as const satisfies readonly TrustedLogo[]

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
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-10 py-12 md:py-16 xl:py-[100px]">
        <h2 className="px-4 text-center font-sans text-[2rem] leading-[3rem] font-normal text-[#171616]">
          {title}
        </h2>
        <div className="relative w-full max-w-[1328px] overflow-hidden">
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
