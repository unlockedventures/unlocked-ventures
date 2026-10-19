import type { Payload } from 'payload'

import { successStoriesSeed } from '@/data/success-stories-seed'

async function ensureBadgeId(payload: Payload, name: string): Promise<number | null> {
  const trimmed = name.trim()
  if (!trimmed) return null
  const nameKey = trimmed.toLocaleLowerCase()
  const existing = await payload.find({
    collection: 'success-badges',
    where: { nameKey: { equals: nameKey } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (typeof existing.docs[0]?.id === 'number') return existing.docs[0].id

  const created = await payload.create({
    collection: 'success-badges',
    data: { name: trimmed, nameKey },
    overrideAccess: true,
  })
  return typeof created.id === 'number' ? created.id : Number(created.id)
}

function relationId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'number' && Number.isFinite(id)) return id
  }
  return null
}

/**
 * Idempotent backfill for teammates who already have a DB and pull develop.
 * Safe to run on every boot — only fills missing fields / links.
 */
export async function migrateDevelopData(payload: Payload): Promise<void> {
  // —— Podcast episodes: draft/complete + editor mode defaults ——
  const episodes = await payload.find({
    collection: 'podcast-episodes',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  for (const episode of episodes.docs) {
    const data: Record<string, unknown> = {}
    if (!episode.episodeStatus) data.episodeStatus = 'complete'
    if (!episode.editorMode) data.editorMode = 'manual'
    if (typeof episode.meta !== 'string' || !episode.meta.trim()) data.meta = '—'
    if (typeof episode.guests !== 'string' || !episode.guests.trim()) data.guests = 'Host & Guest'
    if (Object.keys(data).length === 0) continue
    await payload.update({
      collection: 'podcast-episodes',
      id: episode.id,
      data,
      overrideAccess: true,
      context: { skipAiContentSync: true },
    })
  }

  // —— Success badges: seed known names, link stories missing badge ——
  const seedBadgeNames = new Set<string>()
  if (successStoriesSeed.feature.badge) seedBadgeNames.add(successStoriesSeed.feature.badge)
  for (const story of successStoriesSeed.stories) {
    if (story.category) seedBadgeNames.add(story.category)
  }
  for (const name of seedBadgeNames) {
    await ensureBadgeId(payload, name)
  }

  const stories = await payload.find({
    collection: 'case-studies',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })

  for (const story of stories.docs) {
    if (relationId(story.badge) != null) continue

    const fromSeed = successStoriesSeed.stories.find((item) => item.href === story.href)
    const fromFeature =
      story.href === successStoriesSeed.feature.href ? successStoriesSeed.feature.badge : undefined
    const fromCategory =
      typeof story.category === 'string' && story.category.trim() ? story.category.trim() : undefined
    const candidate = fromFeature || fromSeed?.category || fromCategory
    if (!candidate) continue

    const badgeId = await ensureBadgeId(payload, candidate)
    if (badgeId == null) continue

    await payload.update({
      collection: 'case-studies',
      id: story.id,
      data: { badge: badgeId },
      overrideAccess: true,
    })
  }
}
