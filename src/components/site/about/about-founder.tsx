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
    <section id="meet-the-mind" className="scroll-mt-24 bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[156px]">
        <div className="bg-[#F3F4F9] lg:grid lg:min-h-[676px] lg:grid-cols-[minmax(0,545px)_minmax(0,1fr)] lg:items-end">
          {content.founderImageSrc ? (
            <img
              src={content.founderImageSrc}
              alt={content.founderImageAlt}
              width={545}
              height={627}
              className="mx-auto h-auto w-full max-w-[420px] object-contain object-bottom lg:mx-0 lg:-ml-9 lg:mt-12 lg:max-w-none lg:w-[545px]"
            />
          ) : null}
          <div className="flex flex-col gap-6 px-6 py-10 lg:max-w-[528px] lg:px-0 lg:pt-16 lg:pr-12 lg:pb-16 lg:pl-9">
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
              className="group mt-4 h-12 w-fit gap-2.5 border-0 bg-[#484D56] px-5 text-base text-white hover:bg-[#3c4149] sm:h-12 sm:px-5 sm:text-base lg:h-12 lg:px-5 lg:text-base 2xl:h-12 2xl:px-5 2xl:text-base"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
