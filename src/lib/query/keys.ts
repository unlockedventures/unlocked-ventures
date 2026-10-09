export const siteKeys = {
  all: ['site'] as const,
  site: () => [...siteKeys.all, 'meta'] as const,
  header: () => [...siteKeys.all, 'header'] as const,
  navigation: () => [...siteKeys.all, 'navigation'] as const,
  footer: () => [...siteKeys.all, 'footer'] as const,
  hero: () => [...siteKeys.all, 'hero'] as const,
  trustedBy: () => [...siteKeys.all, 'trusted-by'] as const,
  strategicAdvisory: () => [...siteKeys.all, 'strategic-advisory'] as const,
  digitalEngineering: () => [...siteKeys.all, 'digital-engineering'] as const,
  successStories: () => [...siteKeys.all, 'success-stories'] as const,
  awards: () => [...siteKeys.all, 'awards'] as const,
  awardsSection: () => [...siteKeys.all, 'awards-section'] as const,
  recentPodcast: () => [...siteKeys.all, 'recent-podcast'] as const,
  latestNews: () => [...siteKeys.all, 'latest-news'] as const,
  locations: () => [...siteKeys.all, 'locations'] as const,
  about: () => [...siteKeys.all, 'about'] as const,
  contact: () => [...siteKeys.all, 'contact'] as const,
  ourSuccesses: () => [...siteKeys.all, 'our-successes'] as const,
  caseStudies: () => [...siteKeys.all, 'case-studies'] as const,
  insights: () => [...siteKeys.all, 'insights'] as const,
  newsPosts: () => [...siteKeys.all, 'news-posts'] as const,
  podcastListing: () => [...siteKeys.all, 'podcast-listing'] as const,
  podcastPage: () => [...siteKeys.all, 'podcast-page'] as const,
  strategicGrowth: () => [...siteKeys.all, 'strategic-growth'] as const,
  solution: (slug: string) => [...siteKeys.all, 'solution', slug] as const,
  errorContent: () => [...siteKeys.all, 'error-content'] as const,
}

export type SiteResource =
  | 'meta'
  | 'header'
  | 'navigation'
  | 'footer'
  | 'hero'
  | 'trusted-by'
  | 'strategic-advisory'
  | 'digital-engineering'
  | 'success-stories'
  | 'awards'
  | 'awards-section'
  | 'recent-podcast'
  | 'latest-news'
  | 'locations'
  | 'about'
  | 'contact'
  | 'our-successes'
  | 'case-studies'
  | 'insights'
  | 'news-posts'
  | 'podcast-listing'
  | 'podcast-page'
  | 'strategic-growth'
  | 'error-content'
