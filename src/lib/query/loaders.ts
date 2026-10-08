import { getAbout } from '@/data/get-about'
import { getAwards } from '@/data/get-awards'
import { getAwardsSection } from '@/data/get-awards-section'
import { getCaseStudies } from '@/data/get-case-studies'
import { getContact } from '@/data/get-contact'
import { getDigitalEngineering } from '@/data/get-digital-engineering'
import { getErrorContent } from '@/data/get-error-content'
import { getFooter } from '@/data/get-footer'
import { getHeader } from '@/data/get-header'
import { getHero } from '@/data/get-hero'
import { getLatestNews } from '@/data/get-latest-news'
import { getLocations } from '@/data/get-locations'
import { getNavigation } from '@/data/get-navigation'
import { getOurSuccesses } from '@/data/get-our-successes'
import { getPodcastPage } from '@/data/get-podcast-page'
import { getRecentPodcast } from '@/data/get-recent-podcast'
import { getSite } from '@/data/get-site'
import { getStrategicAdvisory } from '@/data/get-strategic-advisory'
import { getStrategicGrowth } from '@/data/get-strategic-growth'
import { getSuccessStories } from '@/data/get-success-stories'
import { getTrustedBy } from '@/data/get-trusted-by'
import type { SiteResource } from '@/lib/query/keys'
import { siteKeys } from '@/lib/query/keys'

type Loader = () => Promise<unknown>

export const siteLoaders: Record<SiteResource, Loader> = {
  meta: getSite,
  header: getHeader,
  navigation: getNavigation,
  footer: getFooter,
  hero: getHero,
  'trusted-by': getTrustedBy,
  'strategic-advisory': getStrategicAdvisory,
  'digital-engineering': getDigitalEngineering,
  'success-stories': getSuccessStories,
  awards: getAwards,
  'awards-section': getAwardsSection,
  'recent-podcast': getRecentPodcast,
  'latest-news': getLatestNews,
  locations: getLocations,
  about: getAbout,
  contact: getContact,
  'our-successes': getOurSuccesses,
  'case-studies': getCaseStudies,
  'podcast-page': getPodcastPage,
  'strategic-growth': getStrategicGrowth,
  'error-content': getErrorContent,
}

export const siteResourceKeys: Record<SiteResource, readonly unknown[]> = {
  meta: siteKeys.site(),
  header: siteKeys.header(),
  navigation: siteKeys.navigation(),
  footer: siteKeys.footer(),
  hero: siteKeys.hero(),
  'trusted-by': siteKeys.trustedBy(),
  'strategic-advisory': siteKeys.strategicAdvisory(),
  'digital-engineering': siteKeys.digitalEngineering(),
  'success-stories': siteKeys.successStories(),
  awards: siteKeys.awards(),
  'awards-section': siteKeys.awardsSection(),
  'recent-podcast': siteKeys.recentPodcast(),
  'latest-news': siteKeys.latestNews(),
  locations: siteKeys.locations(),
  about: siteKeys.about(),
  contact: siteKeys.contact(),
  'our-successes': siteKeys.ourSuccesses(),
  'case-studies': siteKeys.caseStudies(),
  'podcast-page': siteKeys.podcastPage(),
  'strategic-growth': siteKeys.strategicGrowth(),
  'error-content': siteKeys.errorContent(),
}

export function isSiteResource(value: string): value is SiteResource {
  return value in siteLoaders
}
