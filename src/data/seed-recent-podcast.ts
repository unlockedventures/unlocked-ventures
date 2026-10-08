import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { recentPodcastSeed } from '@/data/recent-podcast-seed'

export async function seedRecentPodcast(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'recent-podcast' })
  if (!current.title) {
    await payload.updateGlobal({
      slug: 'recent-podcast',
      data: { title: recentPodcastSeed.title },
    })
  }

  const existing = await payload.find({
    collection: 'podcast-episodes',
    depth: 0,
    limit: 100,
    pagination: false,
  })
  const savedHrefs = new Set(existing.docs.map((episode) => episode.href))

  for (const [index, episode] of recentPodcastSeed.episodes.entries()) {
    if (savedHrefs.has(episode.href)) continue
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
        meta: episode.meta,
        title: episode.title,
        guests: episode.guests,
        href: episode.href,
        image: media.id,
        imageAlt: episode.title,
        featured: true,
        sortOrder: index,
      },
    })
  }
}
