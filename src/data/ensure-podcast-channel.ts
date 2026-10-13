import type { Payload } from 'payload'

import { slugifyPodcastTitle } from '@/lib/podcast-slug'

/** Find or create a podcast channel by title. Used by seeds and migrations. */
export async function ensurePodcastChannel(payload: Payload, title: string): Promise<number> {
  const name = title.trim() || 'General'
  const existing = await payload.find({
    collection: 'podcast-channels',
    where: { title: { equals: name } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existing.docs[0]?.id) return existing.docs[0].id

  const created = await payload.create({
    collection: 'podcast-channels',
    data: {
      title: name,
      slug: slugifyPodcastTitle(name) || 'general',
      sortOrder: 0,
    },
    overrideAccess: true,
  })
  return created.id
}
