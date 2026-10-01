import { DigitalEngineeringSection } from '@/components/site/digital-engineering/digital-engineering-section'
import { AwardsSection } from '@/components/site/awards/awards-section'
import { getAwards } from '@/data/get-awards'
import { getDigitalEngineering } from '@/data/get-digital-engineering'
import { getHero } from '@/data/get-hero'
import { getLatestNews } from '@/data/get-latest-news'
import { getLocations } from '@/data/get-locations'
import { getRecentPodcast } from '@/data/get-recent-podcast'
import { getTrustedBy } from '@/data/get-trusted-by'
import { getStrategicAdvisory } from '@/data/get-strategic-advisory'
import { getSuccessStories } from '@/data/get-success-stories'
import { HeroSection } from '@/components/site/hero/hero-section'
import { LocationsSection } from '@/components/site/locations/locations-section'
import { LatestNewsSection } from '@/components/site/latest-news/latest-news-section'
import { RecentPodcastSection } from '@/components/site/recent-podcast/recent-podcast-section'
import { StrategicAdvisorySection } from '@/components/site/strategic-advisory/strategic-advisory-section'
import { SuccessStoriesSection } from '@/components/site/success-stories/success-stories-section'
import { TrustedBySection } from '@/components/site/trusted-by/trusted-by-section'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [
    hero,
    awards,
    digitalEngineering,
    latestNews,
    locations,
    recentPodcast,
    strategicAdvisory,
    successStories,
    trustedBy,
  ] = await Promise.all([
    getHero(),
    getAwards(),
    getDigitalEngineering(),
    getLatestNews(),
    getLocations(),
    getRecentPodcast(),
    getStrategicAdvisory(),
    getSuccessStories(),
    getTrustedBy(),
  ])

  return (
    <>
      {hero ? <HeroSection {...hero} /> : null}
      {trustedBy ? <TrustedBySection {...trustedBy} /> : null}
      {strategicAdvisory ? <StrategicAdvisorySection {...strategicAdvisory} /> : null}
      {digitalEngineering ? <DigitalEngineeringSection {...digitalEngineering} /> : null}
      {successStories ? <SuccessStoriesSection {...successStories} /> : null}
      <AwardsSection awards={awards} flushTop={Boolean(successStories)} />
      {recentPodcast ? <RecentPodcastSection {...recentPodcast} /> : null}
      {latestNews ? <LatestNewsSection {...latestNews} /> : null}
      {locations ? <LocationsSection {...locations} /> : null}
    </>
  )
}
