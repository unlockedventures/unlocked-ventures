import type { Metadata } from 'next'

import { EngagementSection } from '@/components/site/solutions/engagement-section'
import { HowWeWorkSection } from '@/components/site/solutions/how-we-work-section'
import { ServiceIntroSection } from '@/components/site/solutions/intro-section'
import { RelatedSolutionsSection } from '@/components/site/solutions/related-solutions-section'
import { TryingToBuildSection } from '@/components/site/solutions/trying-to-build-section'
import {
  homepageSuccessStories,
  SuccessStoriesSection,
} from '@/components/site/success-stories/success-stories-section'

export const metadata: Metadata = {
  title: 'Strategic Growth',
  description:
    'Leading-edge AI and tech capabilities applied to your value creation plan at scale.',
}

export default function StrategicGrowthPage() {
  return (
    <>
      <ServiceIntroSection />
      <EngagementSection />
      <HowWeWorkSection />
      <SuccessStoriesSection {...homepageSuccessStories} />
      <TryingToBuildSection />
      <RelatedSolutionsSection />
    </>
  )
}
