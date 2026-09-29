import Image from 'next/image'
import Link from 'next/link'

const labelClassName = 'block leading-none'

export function TryingToBuildSection() {
  return (
    <section className="relative overflow-hidden bg-[#484D56]">
      <Image
        src="/solutions/strategic-growth/cta-lines-left.svg"
        alt=""
        width={727}
        height={400}
        className="pointer-events-none absolute top-1/2 left-0 z-0 h-auto w-[min(727px,62vw)] max-w-none -translate-y-1/2 select-none"
      />
      <Image
        src="/solutions/strategic-growth/cta-lines-right.svg"
        alt=""
        width={727}
        height={400}
        className="pointer-events-none absolute top-1/2 right-0 z-0 h-auto w-[min(727px,62vw)] max-w-none -translate-y-1/2 select-none"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(12,21,28,0.4)_0%,#4E5C6C_50%,rgba(12,21,28,0.4)_100%)]"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center gap-8 px-4 py-16 text-center sm:px-6 md:px-8 md:py-20 xl:gap-10">
        <div className="flex max-w-[680px] flex-col items-center gap-4">
          <h2 className="font-sans text-[1.75rem] leading-9 font-bold text-white sm:text-[2rem] sm:leading-10 md:text-[36px] md:leading-[44px]">
            Tell us what you are trying to build.
          </h2>
          <p className="max-w-[590px] font-sans text-base leading-6 font-normal text-white">
            The best sales organizations start with the right environment, define what &quot;good&quot;
            looks like, and constantly improve. I&apos;ll show you how to do all three.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex h-14 items-center justify-center gap-3 bg-white px-6 font-sans text-base font-semibold text-[#222222]"
        >
          <span className={labelClassName}>Get in touch</span>
          <Image
            src="/solutions/strategic-growth/icon-arrow-right.svg"
            alt=""
            width={20}
            height={20}
            className="size-5 shrink-0"
          />
        </Link>
      </div>
    </section>
  )
}
