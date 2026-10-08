import Link from 'next/link'

import type { CaseStudyDetail } from '@/data/get-case-study'

export function CaseStudyPageView({
  story,
  listingLabel = 'Our success story',
}: {
  story: CaseStudyDetail
  listingLabel?: string
}) {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-12 pb-16 sm:px-6 md:px-8 md:pt-16 md:pb-20 xl:px-14 xl:pt-20 xl:pb-[100px]">
        <div className="flex max-w-[820px] flex-col gap-8 md:gap-12">
          <p className="font-sans text-base leading-[22px] font-normal text-[#222222]">
            <Link href="/" className="hover:text-[#1CACAE]">
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <Link href="/our-successes" className="hover:text-[#1CACAE]">
              {listingLabel}
            </Link>
            <span aria-hidden="true"> / </span>
            <span>{story.title.replace(/\n/g, ' ')}</span>
          </p>

          <div className="flex flex-col gap-4">
            {story.category ? (
              <p className="inline-flex h-8 w-fit items-center bg-[#F3F4F9] px-3 font-sans text-xs leading-4 font-normal text-[#231F20] uppercase">
                {story.category}
              </p>
            ) : null}
            <h1 className="whitespace-pre-line font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#33353F] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
              {story.title}
            </h1>
            {story.description ? (
              <p className="font-sans text-base leading-6 font-normal tracking-[0.36px] text-[#23313C] md:text-lg md:leading-[27px]">
                {story.description}
              </p>
            ) : null}
          </div>
        </div>

        {story.imageSrc ? (
          <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden bg-[#F3F4F9] md:mt-12">
            <img
              src={story.imageSrc}
              alt={story.imageAlt}
              className="absolute inset-0 size-full object-cover"
            />
          </div>
        ) : null}

        <div className="mt-10 md:mt-12">
          <Link
            href="/our-successes"
            className="inline-flex h-12 items-center gap-2.5 border border-[#484D56] bg-white px-5 font-sans text-base leading-6 font-normal text-[#484D56] transition-colors duration-300 hover:bg-[#484D56] hover:text-white"
          >
            Back to all stories
          </Link>
        </div>
      </div>
    </section>
  )
}
