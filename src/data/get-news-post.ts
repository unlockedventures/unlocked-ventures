import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { NewsPost } from '@/components/site/latest-news/latest-news-section'

export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; title: string; id: string }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; alt: string }

export type NewsPostDetail = {
  id: number
  slug: string
  title: string
  excerpt: string
  href: string
  ctaLabel: string
  imageSrc?: string
  imageAlt: string
  authorName?: string
  authorImageSrc?: string
  publishedAt?: string
  readTime?: string
  tags: string[]
  body: ArticleBlock[]
  related: NewsPost[]
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

function headingId(title: string, index: number) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return base || `section-${index}`
}

function formatPublishedAt(value: string | null | undefined) {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function mapBody(
  blocks: {
    blockType: string
    text?: string | null
    title?: string | null
    attribution?: string | null
    items?: { text?: string | null }[] | null
    image?: number | { url?: string | null } | null
    imageAlt?: string | null
  }[] | null | undefined,
): ArticleBlock[] {
  let headingIndex = 0
  return (blocks ?? []).flatMap((block) => {
    if (block.blockType === 'paragraph' && block.text) {
      return [{ type: 'paragraph' as const, text: block.text }]
    }
    if (block.blockType === 'heading' && block.title) {
      headingIndex += 1
      return [{ type: 'heading' as const, title: block.title, id: headingId(block.title, headingIndex) }]
    }
    if (block.blockType === 'quote' && block.text) {
      return [
        {
          type: 'quote' as const,
          text: block.text,
          attribution: block.attribution || undefined,
        },
      ]
    }
    if (block.blockType === 'list') {
      const items = (block.items ?? []).flatMap((item) => (item.text ? [item.text] : []))
      return items.length ? [{ type: 'list' as const, items }] : []
    }
    if (block.blockType === 'image') {
      const src = mediaUrl(block.image)
      if (!src) return []
      return [{ type: 'image' as const, src, alt: block.imageAlt || '' }]
    }
    return []
  })
}

function mapCard(doc: {
  title?: string | null
  excerpt?: string | null
  href?: string | null
  ctaLabel?: string | null
  image?: number | { url?: string | null } | null
  imageAlt?: string | null
}): NewsPost | null {
  if (!doc.title || !doc.excerpt || !doc.href) return null
  return {
    title: doc.title,
    excerpt: doc.excerpt,
    href: doc.href,
    ctaLabel: doc.ctaLabel || 'Read More',
    imageSrc: mediaUrl(doc.image),
    imageAlt: doc.imageAlt || doc.title,
  }
}

export async function getNewsPostBySlug(slug: string): Promise<NewsPostDetail | null> {
  const payload = await getPayload({ config: configPromise })
  const href = `/insights/${slug}`

  const [match, all] = await Promise.all([
    payload.find({
      collection: 'news-posts',
      where: { href: { equals: href } },
      limit: 1,
      depth: 1,
    }),
    payload.find({
      collection: 'news-posts',
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
    }),
  ])

  const doc = match.docs[0]
  if (!doc?.title || !doc.excerpt || !doc.href) return null

  const related = all.docs
    .flatMap((item) => {
      if (item.id === doc.id) return []
      const card = mapCard(item)
      return card ? [card] : []
    })
    .slice(0, 3)

  const tags = (doc.tags ?? []).flatMap((tag) => (tag.label ? [tag.label] : []))

  return {
    id: doc.id,
    slug,
    title: doc.title,
    excerpt: doc.excerpt,
    href: doc.href,
    ctaLabel: doc.ctaLabel || 'Read More',
    imageSrc: mediaUrl(doc.image),
    imageAlt: doc.imageAlt || doc.title,
    authorName: doc.authorName || undefined,
    authorImageSrc: mediaUrl(doc.authorImage),
    publishedAt: formatPublishedAt(doc.publishedAt),
    readTime: doc.readTime || undefined,
    tags,
    body: mapBody(doc.body),
    related,
  }
}

export async function getNewsPostSlugs(): Promise<string[]> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'news-posts',
    limit: 100,
    depth: 0,
    select: { href: true },
  })

  return result.docs.flatMap((doc) => {
    if (!doc.href?.startsWith('/insights/')) return []
    const slug = slugFromHref(doc.href)
    return slug ? [slug] : []
  })
}
