import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { recentPodcastSeed } from '@/data/recent-podcast-seed'

export async function seedRecentPodcast(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'recent-podcast' })
  if (current.title) return

  const episodes = []

  for (const episode of recentPodcastSeed.episodes) {
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

    episodes.push({
      meta: episode.meta,
      title: episode.title,
      guests: episode.guests,
      href: episode.href,
      image: media.id,
      imageAlt: episode.title,
    })
  }

  await payload.updateGlobal({
    slug: 'recent-podcast',
    data: {
      title: recentPodcastSeed.title,
      episodes,
    },
  })
}
