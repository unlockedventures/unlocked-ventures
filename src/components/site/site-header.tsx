import Image from 'next/image'
import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="box-border h-14 border-b border-[#898989]/16 bg-[#F3F4F9] sm:h-16 md:h-[72px] lg:h-20 2xl:h-[88px]">
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center px-4 sm:px-6 md:px-8 lg:px-[72px] 2xl:px-24">
        <Link
          href="/"
          aria-label="Unlocked Ventures"
          className="inline-flex shrink-0 items-center gap-2 sm:gap-2.5 md:gap-[11px] lg:gap-3 2xl:gap-[13px]"
        >
          <Image
            src="/brand/brand-logo.svg"
            alt=""
            width={115}
            height={117}
            priority
            className="h-7 w-auto sm:h-8 md:h-9 lg:h-10 xl:h-10 2xl:h-11"
          />
          <Image
            src="/brand/unlocked-ventures-wordmark.svg"
            alt=""
            width={154}
            height={15}
            priority
            className="h-[10.5px] w-auto sm:h-3 md:h-[13.5px] lg:h-[15px] xl:h-[15px] 2xl:h-[16.5px]"
          />
        </Link>
        <Link
          href="/contact"
          className="ml-auto inline-flex h-8 shrink-0 items-center justify-center border border-solid border-[#C8CAD0] bg-transparent px-3 font-sans text-[13px] leading-[18px] font-normal tracking-normal text-[#464646] antialiased hover:bg-[#484D56]/5 sm:h-9 sm:px-3.5 sm:text-[14px] sm:leading-5 lg:h-10 lg:px-4 lg:text-[15px] lg:leading-[22px] 2xl:h-11 2xl:text-[16px] 2xl:leading-6"
        >
          Get in touch
        </Link>
      </div>
    </header>
  )
}
