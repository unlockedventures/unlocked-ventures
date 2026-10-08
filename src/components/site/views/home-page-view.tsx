'use client'

import { AwardsSection } from '@/components/site/awards/awards-section'
import { DigitalEngineeringSection } from '@/components/site/digital-engineering/digital-engineering-section'
import { HeroSection } from '@/components/site/hero/hero-section'
import { LatestNewsSection } from '@/components/site/latest-news/latest-news-section'
import { LocationsSection } from '@/components/site/locations/locations-section'
import { RecentPodcastSection, RecentPodcastSkeleton } from '@/components/site/recent-podcast/recent-podcast-section'
import { StrategicAdvisorySection } from '@/components/site/strategic-advisory/strategic-advisory-section'
import { SuccessStoriesSection } from '@/components/site/success-stories/success-stories-section'
import { TrustedBySection } from '@/components/site/trusted-by/trusted-by-section'
import {
  useAwards,
  useAwardsSection,
  useDigitalEngineering,
  useHero,
  useLatestNews,
  useLocations,
  useRecentPodcast,
  useStrategicAdvisory,
  useSuccessStories,
  useTrustedBy,
} from '@/hooks/queries/use-site-queries'

export function HomePageView() {
  const hero = useHero()
  const trustedBy = useTrustedBy()
  const strategicAdvisory = useStrategicAdvisory()
  const digitalEngineering = useDigitalEngineering()
  const successStories = useSuccessStories()
  const awards = useAwards()
  const awardsSection = useAwardsSection()
  const recentPodcast = useRecentPodcast()
  const latestNews = useLatestNews()
  const locations = useLocations()

  return (
    <>
      {hero.data ? <HeroSection {...hero.data} /> : null}
      {trustedBy.data ? <TrustedBySection {...trustedBy.data} /> : null}
      {strategicAdvisory.data ? (
        <StrategicAdvisorySection {...strategicAdvisory.data} flushTop={Boolean(trustedBy.data)} />
      ) : null}
      {digitalEngineering.data ? (
        <DigitalEngineeringSection
          {...digitalEngineering.data}
          flushTop={Boolean(strategicAdvisory.data)}
        />
      ) : null}
      {successStories.data ? (
        <SuccessStoriesSection {...successStories.data} flushTop={Boolean(digitalEngineering.data)} />
      ) : null}
      {awardsSection.data ? (
        <AwardsSection
          title={awardsSection.data.title}
          awards={awards.data ?? []}
          flushTop={Boolean(successStories.data)}
        />
      ) : null}
      {recentPodcast.isPending ? (
        <RecentPodcastSkeleton />
      ) : recentPodcast.data ? (
        <RecentPodcastSection {...recentPodcast.data} />
      ) : null}
      {latestNews.data ? <LatestNewsSection {...latestNews.data} /> : null}
      {locations.data ? <LocationsSection {...locations.data} /> : null}
    </>
  )
}
