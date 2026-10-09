import type { AboutContent } from '@/components/site/about/about-content'

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
  >
}) {
  return (
    <section id="meet-the-mind" className="scroll-mt-24 bg-white py-16 md:py-20 xl:py-[100px]">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[156px]">
        <div className="overflow-hidden bg-[#F3F4F9] lg:grid lg:min-h-[676px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch min-[1440px]:grid-cols-[545px_minmax(0,1fr)]">
          {content.founderImageSrc ? (
            <div className="relative min-h-[320px] bg-[#E8E8E8] sm:min-h-[420px] lg:min-h-0">
              <img
                src={content.founderImageSrc}
                alt={content.founderImageAlt}
                width={545}
                height={676}
                className="absolute inset-0 size-full object-cover object-top grayscale"
              />
            </div>
          ) : null}
          <div className="flex flex-col justify-center gap-5 px-6 py-10 sm:gap-6 sm:px-8 sm:py-12 lg:max-w-[528px] lg:gap-6 lg:px-10 lg:py-16 xl:px-12 xl:py-[72px]">
            <div className="flex flex-col gap-3 sm:gap-4">
              <p className="font-sans text-xs leading-4 font-normal tracking-[0.48px] text-[#696969] uppercase sm:text-sm sm:leading-5">
                {content.founderRole}
              </p>
              <h2 className="font-sans text-[1.75rem] leading-9 font-normal tracking-[-1px] whitespace-pre-line text-[#33353F] sm:text-[2rem] sm:leading-[2.5rem] lg:text-[2.25rem] lg:leading-[44px]">
                {content.founderTitle}
              </h2>
            </div>
            <p className="font-sans text-lg leading-[28px] font-normal text-[#3B3B3B] lg:text-[22px] lg:leading-[30px]">
              {content.founderSummary}
            </p>
            <p className="font-sans text-base leading-6 font-normal text-[#222222]">{content.founderBio}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
