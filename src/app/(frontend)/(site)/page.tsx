import { DigitalEngineeringSection } from '@/components/site/digital-engineering/digital-engineering-section'
import { AwardsSection } from '@/components/site/awards/awards-section'
import { getAwards } from '@/data/get-awards'
import { getDigitalEngineering } from '@/data/get-digital-engineering'
import { HeroSection, homepageHero } from '@/components/site/hero/hero-section'
import {
  homepageLocationStats,
  LocationsSection,
} from '@/components/site/locations/locations-section'
import {
  homepageNewsPosts,
  LatestNewsSection,
} from '@/components/site/latest-news/latest-news-section'
import {
  homepagePodcastEpisodes,
  RecentPodcastSection,
} from '@/components/site/recent-podcast/recent-podcast-section'
import {
  homepageStrategicAdvisory,
  StrategicAdvisorySection,
} from '@/components/site/strategic-advisory/strategic-advisory-section'
import {
  homepageSuccessStories,
  SuccessStoriesSection,
} from '@/components/site/success-stories/success-stories-section'
import {
  homepageTrustedLogos,
  TrustedBySection,
} from '@/components/site/trusted-by/trusted-by-section'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [awards, digitalEngineering] = await Promise.all([getAwards(), getDigitalEngineering()])

  return (
    <>
      <HeroSection {...homepageHero} />
      <TrustedBySection logos={homepageTrustedLogos} />
      <StrategicAdvisorySection {...homepageStrategicAdvisory} />
      {digitalEngineering ? <DigitalEngineeringSection {...digitalEngineering} /> : null}
      <SuccessStoriesSection {...homepageSuccessStories} />
      <AwardsSection awards={awards} />
      <RecentPodcastSection title="Recent Podcast" episodes={homepagePodcastEpisodes} />
      <LatestNewsSection title="Latest News & Blogs" posts={homepageNewsPosts} />
      <LocationsSection stats={homepageLocationStats} className="bg-white" />
    </>
  )
}
