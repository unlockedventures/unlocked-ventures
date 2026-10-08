'use client'

import { CaseStudiesListing } from '@/components/site/success-stories/case-studies-listing'
import { useCaseStudies, useOurSuccesses } from '@/hooks/queries/use-site-queries'

export function OurSuccessesPageView() {
  const stories = useCaseStudies()
  const page = useOurSuccesses()
  const copy = page.data

  if (!copy) return null

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative mx-auto w-full min-[1440px]:max-w-[1440px]">
        <img
          src="/success-stories/listing-lines.svg"
          alt=""
          width={1174}
          height={756}
          className="pointer-events-none absolute top-10 left-[calc(266/1440*100%)] z-0 h-[756px] w-[1174px] max-w-none select-none xl:max-[1439px]:top-20 min-[1440px]:top-0 min-[1440px]:left-[266px]"
        />
        <CaseStudiesListing stories={stories.data ?? []} copy={copy} />
      </div>
    </section>
  )
}
