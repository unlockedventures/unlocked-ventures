import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { SuccessStoriesSectionProps } from '@/components/site/success-stories/success-stories-section'

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

export async function getSuccessStories(): Promise<
  Omit<SuccessStoriesSectionProps, 'className'> | null
> {
  const payload = await getPayload({ config: configPromise })
  const [section, result] = await Promise.all([
    payload.findGlobal({ slug: 'success-stories' }),
    payload.find({
      collection: 'case-studies',
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

  const feature = result.docs[0]
  if (!section.title || !section.cta?.label || !section.cta.href || !feature?.title || !feature.ctaLabel || !feature.href) {
    return null
  }

  const stories = result.docs.flatMap((story) => {
    if (story.id === feature.id || !story.title || !story.ctaLabel || !story.href) return []

    return [
      {
        title: story.title,
        href: story.href,
        ctaLabel: story.ctaLabel,
        imageSrc: mediaUrl(story.image),
        category: story.category || undefined,
      },
    ]
  })

  return {
    title: section.title,
    cta: {
      label: section.cta.label,
      href: section.cta.href,
    },
    feature: {
      title: feature.title,
      href: feature.href,
      ctaLabel: feature.ctaLabel,
      imageSrc: mediaUrl(feature.image),
      description: feature.description || undefined,
      badge: feature.badge || undefined,
    },
    stories,
  }
}
