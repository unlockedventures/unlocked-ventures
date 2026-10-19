import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { successBadgeLabel } from '@/collections/SuccessBadges'

export type CaseStudyCard = {
  id: number
  title: string
  href: string
  ctaLabel: string
  /** Display chip — prefers badge from DB, then optional category label. */
  category?: string
  /** Badge name from success-badges (used by category filter). */
  badge?: string
  imageSrc?: string
}

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

export async function getCaseStudies(): Promise<CaseStudyCard[]> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'case-studies',
    sort: 'sortOrder',
    limit: 100,
    depth: 1,
  })

  return result.docs.flatMap((story) => {
    if (!story.title || !story.ctaLabel || !story.href) return []

    const badge = successBadgeLabel(story.badge)
    const categoryLabel =
      typeof story.category === 'string' && story.category.trim() ? story.category.trim() : undefined

    return [
      {
        id: story.id,
        title: story.title,
        href: story.href,
        ctaLabel: story.ctaLabel,
        badge,
        category: badge || categoryLabel,
        imageSrc: mediaUrl(story.image),
      },
    ]
  })
}
