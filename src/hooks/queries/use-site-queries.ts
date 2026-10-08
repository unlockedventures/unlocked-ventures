'use client'

import { useQuery } from '@tanstack/react-query'

import type { AboutContent } from '@/components/site/about/about-content'
import type { Award } from '@/components/site/awards/awards-section'
import type { ContactPageContent } from '@/components/site/contact/conversation-section'
import type { DigitalEngineeringSectionProps } from '@/components/site/digital-engineering/digital-engineering-section'
import type { SiteFooterProps } from '@/components/site/footer/site-footer'
import type { HeroSectionProps } from '@/components/site/hero/hero-section'
import type { LatestNewsSectionProps } from '@/components/site/latest-news/latest-news-section'
import type { LocationsSectionProps } from '@/components/site/locations/locations-section'
import type { PodcastPageContent } from '@/components/site/podcast/podcast-page'
import type { RecentPodcastSectionProps } from '@/components/site/recent-podcast/recent-podcast-section'
import type { StrategicAdvisorySectionProps } from '@/components/site/strategic-advisory/strategic-advisory-section'
import type { CaseStudiesListingCopy } from '@/components/site/success-stories/case-studies-listing'
import type { SuccessStoriesSectionProps } from '@/components/site/success-stories/success-stories-section'
import type { TrustedBySectionProps } from '@/components/site/trusted-by/trusted-by-section'
import type { CaseStudyCard } from '@/data/get-case-studies'
import type { HeaderData } from '@/data/get-header'
import type { NavigationData } from '@/data/get-navigation'
import type { SiteContent } from '@/data/get-site'
import type { SolutionContent } from '@/data/get-solution'
import type { StrategicGrowthContent } from '@/data/get-strategic-growth'
import { fetchSiteResource, fetchSolution } from '@/lib/query/fetchers'
import { siteKeys } from '@/lib/query/keys'

export function useSite() {
  return useQuery({
    queryKey: siteKeys.site(),
    queryFn: () => fetchSiteResource<SiteContent | null>('meta'),
  })
}

export function useHeader() {
  return useQuery({
    queryKey: siteKeys.header(),
    queryFn: () => fetchSiteResource<HeaderData | null>('header'),
  })
}

export function useNavigation() {
  return useQuery({
    queryKey: siteKeys.navigation(),
    queryFn: () => fetchSiteResource<NavigationData | null>('navigation'),
  })
}

export function useFooter() {
  return useQuery({
    queryKey: siteKeys.footer(),
    queryFn: () => fetchSiteResource<SiteFooterProps | null>('footer'),
  })
}

export function useHero() {
  return useQuery({
    queryKey: siteKeys.hero(),
    queryFn: () => fetchSiteResource<HeroSectionProps | null>('hero'),
  })
}

export function useTrustedBy() {
  return useQuery({
    queryKey: siteKeys.trustedBy(),
    queryFn: () => fetchSiteResource<Omit<TrustedBySectionProps, 'className'> | null>('trusted-by'),
  })
}

export function useStrategicAdvisory() {
  return useQuery({
    queryKey: siteKeys.strategicAdvisory(),
    queryFn: () =>
      fetchSiteResource<Omit<StrategicAdvisorySectionProps, 'className'> | null>(
        'strategic-advisory',
      ),
  })
}

export function useDigitalEngineering() {
  return useQuery({
    queryKey: siteKeys.digitalEngineering(),
    queryFn: () =>
      fetchSiteResource<DigitalEngineeringSectionProps | null>('digital-engineering'),
  })
}

export function useSuccessStories() {
  return useQuery({
    queryKey: siteKeys.successStories(),
    queryFn: () =>
      fetchSiteResource<Omit<SuccessStoriesSectionProps, 'className'> | null>('success-stories'),
  })
}

export function useAwards() {
  return useQuery({
    queryKey: siteKeys.awards(),
    queryFn: () => fetchSiteResource<Award[]>('awards'),
  })
}

export function useAwardsSection() {
  return useQuery({
    queryKey: siteKeys.awardsSection(),
    queryFn: () => fetchSiteResource<{ title: string } | null>('awards-section'),
  })
}

export function useRecentPodcast() {
  return useQuery({
    queryKey: siteKeys.recentPodcast(),
    queryFn: () =>
      fetchSiteResource<RecentPodcastSectionProps | null>('recent-podcast'),
  })
}

export function useLatestNews() {
  return useQuery({
    queryKey: siteKeys.latestNews(),
    queryFn: () => fetchSiteResource<LatestNewsSectionProps | null>('latest-news'),
  })
}

export function useLocations() {
  return useQuery({
    queryKey: siteKeys.locations(),
    queryFn: () =>
      fetchSiteResource<Omit<LocationsSectionProps, 'className'> | null>('locations'),
  })
}

export function useAbout() {
  return useQuery({
    queryKey: siteKeys.about(),
    queryFn: () => fetchSiteResource<AboutContent | null>('about'),
  })
}

export function useContact() {
  return useQuery({
    queryKey: siteKeys.contact(),
    queryFn: () => fetchSiteResource<ContactPageContent | null>('contact'),
  })
}

export function useOurSuccesses() {
  return useQuery({
    queryKey: siteKeys.ourSuccesses(),
    queryFn: () => fetchSiteResource<CaseStudiesListingCopy | null>('our-successes'),
  })
}

export function useCaseStudies() {
  return useQuery({
    queryKey: siteKeys.caseStudies(),
    queryFn: () => fetchSiteResource<CaseStudyCard[]>('case-studies'),
  })
}

export function usePodcastPage() {
  return useQuery({
    queryKey: siteKeys.podcastPage(),
    queryFn: () => fetchSiteResource<PodcastPageContent | null>('podcast-page'),
  })
}

export function useStrategicGrowth() {
  return useQuery({
    queryKey: siteKeys.strategicGrowth(),
    queryFn: () => fetchSiteResource<StrategicGrowthContent | null>('strategic-growth'),
  })
}

export function useSolution(slug: string) {
  return useQuery({
    queryKey: siteKeys.solution(slug),
    queryFn: () => fetchSolution<SolutionContent>(slug),
    enabled: Boolean(slug),
  })
}

export function useErrorContent() {
  return useQuery({
    queryKey: siteKeys.errorContent(),
    queryFn: () => fetchSiteResource<Awaited<ReturnType<typeof import('@/data/get-error-content').getErrorContent>>>('error-content'),
  })
}
