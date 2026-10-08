'use client'

import { EngagementSection } from '@/components/site/solutions/engagement-section'
import { HowWeWorkSection } from '@/components/site/solutions/how-we-work-section'
import { ServiceIntroSection } from '@/components/site/solutions/intro-section'
import { RelatedSolutionsSection } from '@/components/site/solutions/related-solutions-section'
import { TryingToBuildSection } from '@/components/site/solutions/trying-to-build-section'
import { SuccessStoriesSection } from '@/components/site/success-stories/success-stories-section'
import { useSolution, useSuccessStories } from '@/hooks/queries/use-site-queries'

export function SolutionPageView({ slug }: { slug: string }) {
  const page = useSolution(slug)
  const successStories = useSuccessStories()
  const content = page.data

  if (!content) return null

  return (
    <>
      <ServiceIntroSection {...content.intro} />
      <EngagementSection {...content.engagement} />
      <HowWeWorkSection {...content.howWeWork} />
      {successStories.data ? <SuccessStoriesSection {...successStories.data} /> : null}
      <TryingToBuildSection {...content.cta} />
      <RelatedSolutionsSection {...content.related} />
    </>
  )
}
