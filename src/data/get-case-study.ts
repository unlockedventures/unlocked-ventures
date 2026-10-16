import configPromise from '@payload-config'
import { getPayload } from 'payload'

export type CaseStudyDetail = {
  id: number
  slug: string
  title: string
  href: string
  ctaLabel: string
  category?: string
  description?: string
  imageSrc?: string
  imageAlt: string
  metaTitle?: string
  metaDescription?: string
}

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

function slugFromHref(href: string) {
  const cleaned = href.replace(/\/+$/, '')
  const parts = cleaned.split('/')
  return parts[parts.length - 1] || ''
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudyDetail | null> {
  const payload = await getPayload({ config: configPromise })
  const href = `/our-successes/${slug}`

  const result = await payload.find({
    collection: 'case-studies',
    where: {
      href: {
        equals: href,
      },
    },
    limit: 1,
    depth: 1,
  })

  const doc = result.docs[0]
  if (!doc?.title || !doc.href || !doc.ctaLabel) return null

  return {
    id: doc.id,
    slug,
    title: doc.title,
    href: doc.href,
    ctaLabel: doc.ctaLabel,
    category: doc.category || doc.badge || undefined,
    description: doc.description || undefined,
    imageSrc: mediaUrl(doc.image),
    imageAlt: doc.title,
    metaTitle: doc.metaTitle || undefined,
    metaDescription: doc.metaDescription || undefined,
  }
}

export async function getCaseStudySlugs(): Promise<string[]> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'case-studies',
    limit: 100,
    depth: 0,
    select: {
      href: true,
    },
  })

  return result.docs.flatMap((doc) => {
    if (!doc.href?.startsWith('/our-successes/')) return []
    const slug = slugFromHref(doc.href)
    return slug ? [slug] : []
  })
}
