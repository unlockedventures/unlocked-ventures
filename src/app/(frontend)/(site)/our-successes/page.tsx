import type { Metadata } from 'next'

import { CaseStudiesListing } from '@/components/site/success-stories/case-studies-listing'
import { getCaseStudies } from '@/data/get-case-studies'
import { getOurSuccesses } from '@/data/get-our-successes'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getOurSuccesses()
  return {
    title: page?.metaTitle,
    description: page?.description,
  }
}

export default async function OurSuccessesPage() {
  const [stories, page] = await Promise.all([getCaseStudies(), getOurSuccesses()])
  if (!page) return null

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
        <CaseStudiesListing stories={stories} copy={page} />
      </div>
    </section>
  )
}
