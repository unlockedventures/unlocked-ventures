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
          className="pointer-events-none absolute top-0 left-[calc(266/1440*100%)] h-auto w-[calc(1174/1440*100%)] max-w-none select-none"
        />
        {content.badgeSrc ? (
          <img
            src={content.badgeSrc}
            alt={content.badgeAlt}
            width={134}
            height={134}
            className="pointer-events-none absolute top-[177px] left-[calc(965/1440*100%)] z-10 hidden h-auto w-[134px] select-none xl:block"
          />
        ) : null}
        <div className="relative z-10 px-4 pt-12 sm:px-6 md:px-8 md:pt-16 lg:px-12 xl:px-[156px] xl:pt-20">
          <p className="font-sans text-base leading-[22px] font-normal text-[#222222]">
            <Link href={content.breadcrumbHomeHref} className="hover:text-[#1CACAE]">
              {content.breadcrumbHomeLabel}
            </Link>
            <span aria-hidden="true"> / </span>
            <span>{content.breadcrumbCurrent}</span>
          </p>
          <div className="mt-8 flex max-w-[1128px] flex-col gap-4 md:mt-12 xl:max-w-[800px]">
            <h1 className="font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#33353F] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
              {content.title}
            </h1>
            <p className="max-w-[581px] font-sans text-base leading-6 font-normal tracking-[0.36px] text-[#23313C] md:text-lg md:leading-[27px]">
              {content.description}
            </p>
          </div>
        </div>
        {content.heroSrc ? (
          <img
            src={content.heroSrc}
            alt={content.heroAlt}
            width={1506}
            height={560}
            className="relative z-10 mt-8 h-auto w-full bg-[#E8E8E8] object-cover md:mt-12 xl:mt-12 xl:h-[560px]"
          />
        ) : null}
      </div>
    </section>
  )
}
