import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { PodcastListingCopy, PodcastListEpisode } from '@/components/site/podcast/podcast-listing'
import { podcastCoverSrc } from '@/lib/podcast-cover'

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

function channelLabel(
  channel: number | { title?: string | null } | null | undefined,
  category: string | null | undefined,
  uncategorizedLabel: string,
) {
  if (channel && typeof channel === 'object' && channel.title?.trim()) return channel.title.trim()
  return category?.trim() || uncategorizedLabel
}

function mapEpisode(
  doc: {
    title?: string | null
    meta?: string | null
    href?: string | null
    category?: string | null
    channel?: number | { title?: string | null } | null
    excerpt?: string | null
    about?: string | null
    heroFeatured?: boolean | null
    featured?: boolean | null
    imageSource?: string | null
    imageUrl?: string | null
    image?: number | { url?: string | null } | null
    imageAlt?: string | null
  },
  uncategorizedLabel: string,
): PodcastListEpisode | null {
  if (!doc.title || !doc.href) return null
  return {
    title: doc.title,
    href: doc.href,
    duration: doc.meta || '',
    category: channelLabel(doc.channel, doc.category, uncategorizedLabel),
    excerpt: doc.excerpt || doc.about || '',
    stats: '',
    imageSrc: podcastCoverSrc(doc),
    imageAlt: doc.imageAlt || doc.title,
    heroFeatured: Boolean(doc.heroFeatured),
    featured: Boolean(doc.featured),
  }
}

export async function getPodcastListing(): Promise<PodcastListingCopy | null> {
  const payload = await getPayload({ config: configPromise })
  const [doc, episodesResult] = await Promise.all([
    payload.findGlobal({ slug: 'podcast-listing', depth: 1 }),
    payload.find({
      collection: 'podcast-episodes',
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
    }),
  ])

  if (
    !doc.metaTitle ||
    !doc.homeLabel ||
    !doc.homeHref ||
    !doc.currentLabel ||
    !doc.title ||
    !doc.description ||
    !doc.watchNowLabel ||
    !doc.browseTitle ||
    !doc.viewAllCategoriesLabel ||
    !doc.featuredTitle ||
    !doc.exploreTitle ||
    !doc.sortLabel ||
    !doc.sortAllLabel ||
    !doc.uncategorizedLabel ||
    !doc.previousCategoriesLabel ||
    !doc.nextCategoriesLabel ||
    !doc.seeMoreLabel ||
    !doc.emptyLabel ||
    !doc.subscribeTitle ||
    !doc.subscribeDescription
  ) {
    return null
  }

  const categories = (doc.categories ?? []).flatMap((item) => (item.label ? [item.label] : []))
  const subscribe = (doc.subscribe ?? []).flatMap((platform) => {
    const logoSrc = mediaUrl(platform.logo)
    if (!platform.name || !platform.href || !logoSrc || platform.width == null || platform.height == null) {
      return []
    }
    return [{ name: platform.name, href: platform.href, logoSrc, width: platform.width, height: platform.height }]
  })

  const episodes = episodesResult.docs.flatMap((item) => {
    const mapped = mapEpisode(item, doc.uncategorizedLabel)
    return mapped ? [mapped] : []
  })

  return {
    metaTitle: doc.metaTitle,
    homeLabel: doc.homeLabel,
    homeHref: doc.homeHref,
    currentLabel: doc.currentLabel,
    title: doc.title,
    description: doc.description,
    watchNowLabel: doc.watchNowLabel,
    browseTitle: doc.browseTitle,
    viewAllCategoriesLabel: doc.viewAllCategoriesLabel,
    categories,
    featuredTitle: doc.featuredTitle,
    exploreTitle: doc.exploreTitle,
    sortLabel: doc.sortLabel,
    sortAllLabel: doc.sortAllLabel,
    uncategorizedLabel: doc.uncategorizedLabel,
    previousCategoriesLabel: doc.previousCategoriesLabel,
    nextCategoriesLabel: doc.nextCategoriesLabel,
    seeMoreLabel: doc.seeMoreLabel,
    emptyLabel: doc.emptyLabel,
    subscribeTitle: doc.subscribeTitle,
    subscribeDescription: doc.subscribeDescription,
    subscribe,
    episodes,
  }
}
