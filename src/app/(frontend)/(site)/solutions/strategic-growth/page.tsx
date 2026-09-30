import type { Metadata } from 'next'

import { EngagementSection } from '@/components/site/solutions/engagement-section'
import { HowWeWorkSection } from '@/components/site/solutions/how-we-work-section'
import { ServiceIntroSection } from '@/components/site/solutions/intro-section'
import { RelatedSolutionsSection } from '@/components/site/solutions/related-solutions-section'
import { TryingToBuildSection } from '@/components/site/solutions/trying-to-build-section'
import { getStrategicGrowth } from '@/data/get-strategic-growth'
import { getSuccessStories } from '@/data/get-success-stories'
import { SuccessStoriesSection } from '@/components/site/success-stories/success-stories-section'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStrategicGrowth()

  return {
    title: page?.current ?? 'Strategic Growth',
    description: page?.description,
  }
}

export default async function StrategicGrowthPage() {
  const [page, successStories] = await Promise.all([getStrategicGrowth(), getSuccessStories()])
  if (!page) return null

  return (
    <>
      <ServiceIntroSection {...page.intro} />
      <EngagementSection {...page.engagement} />
      <HowWeWorkSection {...page.howWeWork} />
      {successStories ? <SuccessStoriesSection {...successStories} /> : null}
      <TryingToBuildSection {...page.cta} />
      <RelatedSolutionsSection {...page.related} />
    </>
  )
}
