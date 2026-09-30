import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { LatestNewsSectionProps } from '@/components/site/latest-news/latest-news-section'

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

export async function getLatestNews(): Promise<LatestNewsSectionProps | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({
    slug: 'latest-news',
    depth: 1,
  })

  if (!doc.title) return null

  const posts = (doc.posts ?? []).flatMap((post) => {
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
    title: doc.title,
    posts,
  }
}
