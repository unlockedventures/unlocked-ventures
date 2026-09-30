import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { RecentPodcastSectionProps } from '@/components/site/recent-podcast/recent-podcast-section'

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

export async function getRecentPodcast(): Promise<RecentPodcastSectionProps | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({
    slug: 'recent-podcast',
    depth: 1,
  })

  if (!doc.title) return null

  const episodes = (doc.episodes ?? []).flatMap((episode) => {
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
    title: doc.title,
    episodes,
  }
}
