import Link from 'next/link'

export function AboutHero() {
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
        <img
          src="/about/experience-badge.svg"
          alt="30 years of experience"
          width={134}
          height={134}
          className="pointer-events-none absolute top-[177px] left-[calc(965/1440*100%)] z-10 hidden h-auto w-[134px] select-none xl:block"
        />
        <div className="relative z-10 px-4 pt-12 sm:px-6 md:px-8 md:pt-16 lg:px-12 xl:px-[156px] xl:pt-20">
          <p className="font-sans text-base leading-[22px] font-normal text-[#222222]">
            <Link href="/" className="hover:text-[#1CACAE]">
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <span>About</span>
          </p>
          <div className="mt-8 flex max-w-[1128px] flex-col gap-4 md:mt-12 xl:max-w-[800px]">
            <h1 className="font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#33353F] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
              We help businesses turn technology into results they can measure.
            </h1>
            <p className="max-w-[581px] font-sans text-base leading-6 font-normal tracking-[0.36px] text-[#23313C] md:text-lg md:leading-[27px]">
              Unlocked Ventures is an AI-native digital development company. We combine strategic
              advisory with hands-on engineering so the plan and the product come from the same
              team.
            </p>
          </div>
        </div>
        <img
          src="/about/hero-team.png"
          alt="The Unlocked Ventures team"
          width={1506}
          height={560}
          className="relative z-10 mt-8 h-auto w-full bg-[#E8E8E8] object-cover md:mt-12 xl:mt-12 xl:h-[560px]"
        />
      </div>
    </section>
  )
}
