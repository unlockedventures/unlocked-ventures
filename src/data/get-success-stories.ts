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
  const doc = await payload.findGlobal({
    slug: 'success-stories',
    depth: 1,
  })

  const feature = doc.feature
  if (
    !doc.title ||
    !doc.cta?.label ||
    !doc.cta.href ||
    !feature?.title ||
    !feature.ctaLabel ||
    !feature.href
  ) {
    return null
  }

  const stories = (doc.stories ?? []).flatMap((story) => {
    if (!story.title || !story.ctaLabel || !story.href) return []

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
    title: doc.title,
    cta: {
      label: doc.cta.label,
      href: doc.cta.href,
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
