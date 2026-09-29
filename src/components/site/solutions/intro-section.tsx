import Image from 'next/image'
import Link from 'next/link'

export function ServiceIntroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative mx-auto mt-8 w-full max-w-[1440px] sm:mt-10 xl:mt-20">
        <Image
          src="/solutions/strategic-growth/hero-illustration.svg"
          alt=""
          width={1475}
          height={993}
          priority
          className="pointer-events-none absolute top-0 left-[calc(265/1440*100%)] z-0 h-auto w-[calc(1475/1440*100%)] max-w-none -translate-y-[calc(138/993*100%)] select-none"
        />
        <div className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-[72px] xl:px-[156px]">
            <div className="flex max-w-[800px] flex-col gap-6 xl:gap-12">
            <p className="font-sans text-base leading-[22px] font-normal text-[#222222]">
              <Link href="/" className="hover:text-[#1CACAE]">
                Home
              </Link>
              <span aria-hidden="true"> / </span>
              <Link href="/strategic-advisory" className="hover:text-[#1CACAE]">
                Our solutions
              </Link>
              <span aria-hidden="true"> / </span>
              <span>Strategic Growth</span>
            </p>
            <div className="flex flex-col gap-6">
              <h1 className="font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#33353F] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
                Advising that holds up once the plan meets the business
              </h1>
              <p className="max-w-[740px] font-sans text-base leading-6 font-normal tracking-[0.36px] text-[#23313C] md:text-lg md:leading-[27px]">
                Leading-edge AI and tech capabilities applied to your value creation plan at scale — from
                diligence through the first two years of ownership, with the same people in the room throughout.
              </p>
            </div>
            </div>
          </div>
      </div>
      <div className="relative mt-8 aspect-[1440/560] w-full overflow-hidden bg-[#E8E8E8] md:mt-10 xl:mt-12">
        <Image
          src="/solutions/strategic-growth/hero-photo.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_48%]"
        />
      </div>
    </section>
  )
}
