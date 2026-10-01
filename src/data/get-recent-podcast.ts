import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { RecentPodcastSectionProps } from '@/components/site/recent-podcast/recent-podcast-section'

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
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
    if (!episode.meta || !episode.title || !episode.guests || !episode.href) return []

    return [
      {
        meta: episode.meta,
        title: episode.title,
        guests: episode.guests,
        href: episode.href,
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
