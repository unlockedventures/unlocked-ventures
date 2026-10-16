import type { MetadataRoute } from 'next'

import { getCaseStudySlugs } from '@/data/get-case-study'
import { getNewsPostSlugs } from '@/data/get-news-post'
import { getPodcastEpisodeSlugs } from '@/data/get-podcast-episode'
import { getSolutionSlugs } from '@/data/get-solution'
import { absoluteUrl } from '@/lib/site-url'

type SitemapEntry = MetadataRoute.Sitemap[number]

const staticRoutes: Array<{
  path: string
  changeFrequency: SitemapEntry['changeFrequency']
  priority: number
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/podcast', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/insights', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/our-successes', changeFrequency: 'weekly', priority: 0.8 },
]

async function safeSlugs(loader: () => Promise<string[]>): Promise<string[]> {
  try {
    return await loader()
  } catch {
    // Keep the sitemap usable when Payload/DB is unavailable at build/runtime.
    return []
  }
}

/**
 * Serves /sitemap.xml with static marketing pages plus CMS-backed content URLs.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const [solutionSlugs, newsSlugs, caseStudySlugs, podcastSlugs] = await Promise.all([
    safeSlugs(getSolutionSlugs),
    safeSlugs(getNewsPostSlugs),
    safeSlugs(getCaseStudySlugs),
    safeSlugs(getPodcastEpisodeSlugs),
  ])

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const solutions: MetadataRoute.Sitemap = solutionSlugs.map((slug) => ({
    url: absoluteUrl(`/solutions/${slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const insights: MetadataRoute.Sitemap = newsSlugs.map((slug) => ({
    url: absoluteUrl(`/insights/${slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const successes: MetadataRoute.Sitemap = caseStudySlugs.map((slug) => ({
    url: absoluteUrl(`/our-successes/${slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const podcasts: MetadataRoute.Sitemap = podcastSlugs.map((slug) => ({
    url: absoluteUrl(`/podcast/${slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticEntries, ...solutions, ...insights, ...successes, ...podcasts]
}
