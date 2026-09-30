import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { LatestNewsSectionProps } from '@/components/site/latest-news/latest-news-section'

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

export async function getLatestNews(): Promise<LatestNewsSectionProps | null> {
  const payload = await getPayload({ config: configPromise })
  const [section, result] = await Promise.all([
    payload.findGlobal({ slug: 'latest-news' }),
    payload.find({
      collection: 'news-posts',
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
    }),
  ])

  if (!section.title) return null

  const posts = result.docs.flatMap((post) => {
    if (!post.title || !post.excerpt || !post.href) return []

    return [
      {
        title: post.title,
        excerpt: post.excerpt,
        href: post.href,
        ctaLabel: post.ctaLabel || 'Read More',
        imageSrc: mediaUrl(post.image),
        imageAlt: post.imageAlt || post.title,
      },
    ]
  })

  if (!posts.length) return null

  return {
    title: section.title,
    posts,
  }
}
