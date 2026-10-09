import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { NewsPost } from '@/components/site/latest-news/latest-news-section'

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
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

export async function getNewsPosts(): Promise<NewsPost[]> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'news-posts',
    sort: 'sortOrder',
    limit: 100,
    depth: 1,
  })

  return result.docs.flatMap((post) => {
    if (!post.title || !post.excerpt || !post.href) return []

    const tags = (post.tags ?? []).flatMap((tag) => (tag.label ? [tag.label] : []))

    return [
      {
        title: post.title,
        excerpt: post.excerpt,
        href: post.href,
        ctaLabel: post.ctaLabel || 'Read More',
        imageSrc: mediaUrl(post.image),
        imageAlt: post.imageAlt || post.title,
        featured: Boolean(post.featured),
        authorName: post.authorName || undefined,
        authorImageSrc: mediaUrl(post.authorImage),
        publishedAt: formatPublishedAt(post.publishedAt),
        readTime: post.readTime || undefined,
        tags,
      },
    ]
  })
}
