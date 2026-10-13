import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { ensurePodcastChannel } from '@/data/ensure-podcast-channel'
import { recentPodcastSeed } from '@/data/recent-podcast-seed'
import { podcastEpisodePath } from '@/lib/podcast-slug'

export async function seedRecentPodcast(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'recent-podcast' })
  if (!current.title) {
    await payload.updateGlobal({
      slug: 'recent-podcast',
      data: { title: recentPodcastSeed.title },
    })
  }

  const channelId = await ensurePodcastChannel(payload, 'General')

  const existing = await payload.find({
    collection: 'podcast-episodes',
    depth: 0,
    limit: 100,
    pagination: false,
  })
  const savedSlugs = new Set(
    existing.docs.flatMap((episode) => {
      if (episode.slug) return [episode.slug]
      return []
    }),
  )

  for (const [index, episode] of recentPodcastSeed.episodes.entries()) {
    if (savedSlugs.has(episode.slug)) continue
    const filePath = path.join(process.cwd(), 'public', 'podcast', episode.imageFile)
    const data = fs.readFileSync(filePath)
    const media = await payload.create({
      collection: 'media',
      data: { alt: episode.title },
      file: {
        data,
        mimetype: 'image/png',
        name: episode.imageFile,
        size: data.length,
      },
    })

    await payload.create({
      collection: 'podcast-episodes',
      data: {
        channel: channelId,
        meta: episode.meta,
        title: episode.title,
        guests: episode.guests,
        slug: episode.slug,
        href: podcastEpisodePath(episode.slug),
        image: media.id,
        imageAlt: episode.title,
        featured: true,
        sortOrder: index,
      },
    })
  }
}
