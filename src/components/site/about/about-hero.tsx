import Link from 'next/link'

import type { AboutContent } from '@/components/site/about/about-content'

export function AboutHero({
  content,
}: {
  content: Pick<
    AboutContent,
    | 'breadcrumbHomeLabel'
    | 'breadcrumbHomeHref'
    | 'breadcrumbCurrent'
    | 'title'
    | 'description'
    | 'badgeSrc'
    | 'badgeAlt'
    | 'heroSrc'
    | 'heroAlt'
  >
}) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative mx-auto w-full max-w-[1440px]">
        <img
          src="/about/hero-wave.svg"
          alt=""
          width={1174}
          height={756}
          className="pointer-events-none absolute top-0 left-[calc(266/1440*100%)] hidden h-auto w-[calc(1174/1440*100%)] max-w-none select-none md:block"
        />
        {content.badgeSrc ? (
          <div
            role="img"
            aria-label={content.badgeAlt}
            className="pointer-events-none absolute top-[100px] right-6 z-10 hidden aspect-square w-[100px] select-none sm:top-[120px] sm:right-8 sm:w-[112px] md:top-[140px] md:block lg:right-12 lg:w-[120px] xl:top-[157px] xl:right-[156px] xl:w-[134px]"
          >
            <img src={content.badgeSrc} alt="" className="experience-badge-ring block size-full" />
            <img
              src={content.badgeSrc}
              alt=""
              aria-hidden="true"
              className="experience-badge-core pointer-events-none absolute inset-0 size-full"
            />
          </div>
        ) : null}

        <div className="relative z-10 px-4 pt-10 sm:px-6 md:px-8 md:pt-14 lg:px-12 xl:px-[156px] xl:pt-20">
          <p className="font-sans text-sm leading-5 font-normal text-[#919191] md:text-base md:leading-[22px]">
            <Link href={content.breadcrumbHomeHref} className="hover:text-[#33353F]">
              {content.breadcrumbHomeLabel}
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-[#33353F]">{content.breadcrumbCurrent}</span>
          </p>
          <div className="mt-6 flex max-w-[800px] flex-col gap-4 md:mt-10 xl:mt-12">
            <h1 className="font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#33353F] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
              {content.title}
            </h1>
            <p className="max-w-[581px] font-sans text-base leading-6 font-normal tracking-[0.36px] text-[#23313C] md:text-lg md:leading-[27px] md:opacity-80">
              {content.description}
            </p>
          </div>
        </div>

        {content.heroSrc ? (
          <div className="relative z-10 mt-8 px-4 sm:px-6 md:mt-10 md:px-8 lg:px-12 xl:mt-12 xl:px-[156px]">
            <img
              src={content.heroSrc}
              alt={content.heroAlt}
              width={1128}
              height={560}
              className="h-auto w-full bg-[#E8E8E8] object-cover object-top grayscale xl:h-[560px]"
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
