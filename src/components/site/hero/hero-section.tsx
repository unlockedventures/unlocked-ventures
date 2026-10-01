import { SiteOutlineButton } from '@/components/site/site-outline-button'
import { cn } from '@/lib/utils'

export type HeroMedia = {
  primarySrc?: string
  secondarySrc?: string
  badgeSrc?: string
  badgeAlt?: string
}

export type HeroSectionProps = {
  title: string
  description: readonly string[]
  cta: {
    label: string
    href: string
  }
  media?: HeroMedia
  className?: string
}

function HeroMediaCollage({ media }: { media?: HeroMedia }) {
  return (
    <div className="relative aspect-[555/475] w-full lg:max-w-[460px] lg:min-w-0 lg:flex-1 min-[1440px]:absolute min-[1440px]:top-0 min-[1440px]:left-0 min-[1440px]:z-0 min-[1440px]:aspect-auto min-[1440px]:h-[715px] min-[1440px]:w-full! min-[1440px]:max-w-none! min-[1440px]:flex-none">
      {media?.primarySrc ? (
        <img
          src={media.primarySrc}
          alt=""
          className="absolute top-0 left-0 h-auto w-[calc(100%*279/555)] min-[1440px]:top-[calc(100%*100/715)] min-[1440px]:left-[calc(100%*729/1440)] min-[1440px]:w-[calc(100%*279/1440)]"
        />
      ) : null}
      {media?.secondarySrc ? (
        <img
          src={media.secondarySrc}
          alt=""
          className="absolute top-[calc(100%*238/475)] left-[calc(100%*208/555)] h-auto w-[calc(100%*347/555)] min-[1440px]:top-[calc(100%*338/715)] min-[1440px]:left-[calc(100%*937/1440)] min-[1440px]:w-[calc(100%*347/1440)]"
        />
      ) : null}
      {media?.badgeSrc ? (
        <div
          role="img"
          aria-label={media.badgeAlt || '30 years of experience'}
          className="absolute top-[calc(100%*196/475)] left-[calc(100%*175/555)] z-10 aspect-square w-[calc(100%*134/555)] min-[1440px]:top-[calc(100%*296/715)] min-[1440px]:left-[calc(100%*904/1440)] min-[1440px]:w-[calc(100%*134/1440)]"
        >
          <img src={media.badgeSrc} alt="" className="experience-badge-ring block size-full" />
          <img
            src={media.badgeSrc}
            alt=""
            aria-hidden="true"
            className="experience-badge-core pointer-events-none absolute inset-0 size-full"
          />
        </div>
      ) : null}
    </div>
  )
}

export function HeroSection({ title, description, cta, media, className }: HeroSectionProps) {
  return (
    <section aria-label="Introduction" className={cn('overflow-hidden bg-[#F3F4F9]', className)}>
      <div className="relative isolate mx-auto w-full max-w-[1440px] min-[1440px]:min-h-[715px]">
        <img
          src="/hero/hero-wave.svg"
          alt=""
          className="pointer-events-none absolute top-0 -z-10 left-[calc(265/1440*100%)] h-auto w-[calc(1475/1440*100%)] max-w-none translate-y-[calc(21/993*100%)] select-none"
        />
      <div className="flex flex-col gap-10 px-4 py-12 sm:px-6 md:px-8 md:py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-12 min-[1440px]:block min-[1440px]:px-[156px]! min-[1440px]:pt-[132px]! min-[1440px]:pb-[122px]!">
        <div className="relative z-10 w-full lg:max-w-[32rem] lg:shrink-0 min-[1440px]:max-w-[628px]!">
          <h1 className="font-sans text-[2.5rem] leading-[1.15] font-normal whitespace-pre-line text-[#33353F] sm:text-[3.25rem] sm:leading-[1.12] md:text-[4.25rem] md:leading-[1.1] xl:text-[4.375rem] xl:leading-[5rem]">
            {title}
          </h1>
          <div className="mt-6 w-full lg:max-w-[499px]">
            <div className="flex flex-col gap-[27px]">
              {description.map((paragraph) => (
                <p
                  key={paragraph}
                  className="font-sans text-base leading-6 font-normal tracking-[0.36px] text-[#23313C] md:text-lg md:leading-[27px] min-[1440px]:opacity-80"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <SiteOutlineButton
              href={cta.href}
              text={cta.label}
              icon={
                <img
                  src="/contact/icon-arrow-up-right.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="size-6 shrink-0 transition-transform duration-300 ease-out group-hover:rotate-45 group-focus-visible:rotate-45"
                />
              }
              className="group mt-8 h-12 gap-2.5 border-0 bg-[#484D56] px-5 text-base text-white hover:bg-[#484D56] sm:h-12 sm:px-5 sm:text-base md:mt-10 lg:h-12 lg:px-5 lg:text-base 2xl:h-12 2xl:px-5 2xl:text-base"
            />
          </div>
        </div>
        <HeroMediaCollage media={media} />
      </div>
      </div>
    </section>
  )
}
