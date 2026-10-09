import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { seedInsightArticleBodies } from '@/data/insight-article-seed'
import { latestNewsSeed } from '@/data/latest-news-seed'

async function ensureMedia(payload: Payload, filePath: string, alt: string) {
  const data = fs.readFileSync(filePath)
  const name = path.basename(filePath)
  return payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data,
      mimetype: name.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
      name,
      size: data.length,
    },
  })
}

async function seedArticleMeta(payload: Payload) {
  const existing = await payload.find({ collection: 'news-posts', limit: 100, depth: 1 })

  for (const post of existing.docs) {
    const seed = latestNewsSeed.posts.find((item) => item.href === post.href)
    if (!seed || post.authorName) continue

    let authorImageId = typeof post.authorImage === 'object' && post.authorImage ? post.authorImage.id : undefined
    if (!authorImageId && seed.authorImageFile) {
      const authorPath = path.join(process.cwd(), 'public', 'about', seed.authorImageFile)
      if (fs.existsSync(authorPath)) {
        const media = await ensureMedia(payload, authorPath, seed.authorName)
        authorImageId = media.id
      }
    }

    await payload.update({
      collection: 'news-posts',
      id: post.id,
      data: {
        authorName: seed.authorName,
        authorImage: authorImageId,
        publishedAt: seed.publishedAt,
        readTime: seed.readTime,
        tags: seed.tags.map((label) => ({ label })),
      },
    })
  }
}

export async function seedLatestNews(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'latest-news' })
  if (!current.title) {
    await payload.updateGlobal({
      slug: 'latest-news',
      data: { title: latestNewsSeed.title },
    })
  }

  const existing = await payload.find({ collection: 'news-posts', limit: 100, depth: 0 })
  if (existing.totalDocs > 0) {
    if (!existing.docs.some((post) => post.featured)) {
      for (const post of existing.docs) {
        await payload.update({
          collection: 'news-posts',
          id: post.id,
          data: { featured: true },
        })
      }
    }
    await seedInsightArticleBodies(payload)
    await seedArticleMeta(payload)
    return
  }

  for (const [index, post] of latestNewsSeed.posts.entries()) {
    const filePath = path.join(process.cwd(), 'public', 'news', post.imageFile)
    const media = await ensureMedia(payload, filePath, post.title)

    let authorImageId: number | undefined
    if (post.authorImageFile) {
      const authorPath = path.join(process.cwd(), 'public', 'about', post.authorImageFile)
      if (fs.existsSync(authorPath)) {
        const authorMedia = await ensureMedia(payload, authorPath, post.authorName)
        authorImageId = authorMedia.id
      }
    }

    await payload.create({
      collection: 'news-posts',
      data: {
        title: post.title,
        excerpt: post.excerpt,
        href: post.href,
        ctaLabel: post.ctaLabel,
        image: media.id,
        imageAlt: post.title,
        authorName: post.authorName,
        authorImage: authorImageId,
        publishedAt: post.publishedAt,
        readTime: post.readTime,
        tags: post.tags.map((label) => ({ label })),
        featured: true,
        sortOrder: index,
      },
    })
  }

  await seedInsightArticleBodies(payload)
}
