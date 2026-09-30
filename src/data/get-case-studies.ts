import configPromise from '@payload-config'
import { getPayload } from 'payload'

export type CaseStudyCard = {
  id: number
  title: string
  href: string
  ctaLabel: string
  category?: string
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

    const category = story.category || story.badge || undefined

    return [
      {
        id: story.id,
        title: story.title,
        href: story.href,
        ctaLabel: story.ctaLabel,
        category: category || undefined,
        imageSrc: mediaUrl(story.image),
      },
    ]
  })
}
