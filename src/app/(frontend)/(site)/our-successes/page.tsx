import type { Metadata } from 'next'

import { CaseStudiesListing } from '@/components/site/success-stories/case-studies-listing'
import { getCaseStudies } from '@/data/get-case-studies'

export const dynamic = 'force-dynamic'

const description =
  'Products, platforms and roadmaps we have built with operators, founders and portfolio companies, and what changed once they shipped.'

export const metadata: Metadata = {
  title: 'Our Success Stories',
  description,
}

export default async function OurSuccessesPage() {
  const stories = await getCaseStudies()

  return (
    <section className="relative overflow-hidden bg-white">
      <img
        src="/success-stories/listing-lines.svg"
        alt=""
        width={1174}
        height={756}
        className="pointer-events-none absolute top-10 left-[calc(266/1440*100%)] z-0 h-[756px] w-[1174px] max-w-none select-none xl:top-20"
      />
      <CaseStudiesListing stories={stories} />
    </section>
  )
}
