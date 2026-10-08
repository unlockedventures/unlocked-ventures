import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { RecentPodcastSectionProps } from '@/components/site/recent-podcast/recent-podcast-section'
import { podcastEpisodePath, podcastSlugFromHref, slugifyPodcastTitle } from '@/lib/podcast-slug'

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

function episodeSlug(episode: { slug?: string | null; href?: string | null; title?: string | null }) {
  if (episode.slug?.trim()) return episode.slug.trim()
  if (episode.href) {
    const fromHref = podcastSlugFromHref(episode.href)
    if (fromHref) return fromHref
  }
  if (episode.title) return slugifyPodcastTitle(episode.title)
  return null
}

export async function getRecentPodcast(): Promise<RecentPodcastSectionProps | null> {
  const payload = await getPayload({ config: configPromise })
  const [section, result] = await Promise.all([
    payload.findGlobal({ slug: 'recent-podcast' }),
    payload.find({
      collection: 'podcast-episodes',
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
      where: {
        featured: {
          equals: true,
        },
      },
    }),
  ])

  if (!section.title) return null

  const episodes = result.docs.flatMap((episode) => {
    if (!episode.meta || !episode.title || !episode.guests) return []
    const slug = episodeSlug(episode)
    if (!slug) return []

    return [
      {
        meta: episode.meta,
        title: episode.title,
        guests: episode.guests,
        href: podcastEpisodePath(slug),
        imageSrc: mediaUrl(episode.image),
        imageAlt: episode.imageAlt || episode.title,
      },
    ]
  })

  if (!episodes.length) return null

  return {
    title: section.title,
    episodes,
  }
}
