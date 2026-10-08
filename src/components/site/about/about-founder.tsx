import type { AboutContent } from '@/components/site/about/about-content'
import { SiteOutlineButton } from '@/components/site/site-outline-button'

export function AboutFounder({
  content,
}: {
  content: Pick<
    AboutContent,
    | 'founderRole'
    | 'founderTitle'
    | 'founderSummary'
    | 'founderBio'
    | 'founderImageSrc'
    | 'founderImageAlt'
    | 'founderCtaLabel'
    | 'founderCtaHref'
  >
}) {
  return (
    <section id="meet-the-mind" className="scroll-mt-24 bg-white py-16 md:py-20 lg:py-[100px]">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[156px]">
        <div className="overflow-hidden bg-[#F3F4F9] lg:grid lg:min-h-[676px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end min-[1440px]:grid-cols-[minmax(0,545px)_minmax(0,1fr)]">
          {content.founderImageSrc ? (
            <div className="flex justify-center lg:justify-start lg:self-end">
              <img
                src={content.founderImageSrc}
                alt={content.founderImageAlt}
                width={545}
                height={627}
                className="h-auto w-full max-w-[420px] object-contain object-bottom lg:mt-12 lg:max-w-none lg:w-full min-[1440px]:w-[545px]"
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-6 px-6 py-10 lg:max-w-[528px] lg:justify-center lg:px-0 lg:py-16 lg:pr-12 lg:pl-9 min-[1440px]:justify-end">
            <div className="flex flex-col gap-4">
              <p className="font-sans text-base leading-5 font-normal text-[#3B3B3B]">{content.founderRole}</p>
              <h2 className="font-sans text-[2rem] leading-[2.5rem] font-normal tracking-[-1px] whitespace-pre-line text-[#33353F] lg:text-[2.25rem] lg:leading-[44px]">
                {content.founderTitle}
              </h2>
            </div>
            <p className="font-sans text-lg leading-[30px] font-normal text-[#3B3B3B] lg:text-[22px]">
              {content.founderSummary}
            </p>
            <p className="font-sans text-base leading-6 font-normal text-[#222222]">{content.founderBio}</p>
            <SiteOutlineButton
              href={content.founderCtaHref}
              text={content.founderCtaLabel}
              icon={
                <img
                  src="/contact/icon-arrow-up-right.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="size-6 shrink-0 transition-transform duration-300 ease-out group-hover:rotate-45 group-focus-visible:rotate-45"
                />
              }
              className="group mt-4 h-12 w-fit border-0 bg-[#484D56] px-5 text-base text-white hover:bg-[#3c4149] sm:h-12 sm:px-5 sm:text-base lg:h-12 lg:px-5 lg:text-base 2xl:h-12 2xl:px-5 2xl:text-base"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
