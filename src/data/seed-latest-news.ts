import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { latestNewsSeed } from '@/data/latest-news-seed'

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
    return
  }

  for (const [index, post] of latestNewsSeed.posts.entries()) {
    const filePath = path.join(process.cwd(), 'public', 'news', post.imageFile)
    const data = fs.readFileSync(filePath)
    const media = await payload.create({
      collection: 'media',
      data: { alt: post.title },
      file: {
        data,
        mimetype: 'image/png',
        name: post.imageFile,
        size: data.length,
      },
    })

    await payload.create({
      collection: 'news-posts',
      data: {
        title: post.title,
        excerpt: post.excerpt,
        href: post.href,
        ctaLabel: post.ctaLabel,
        image: media.id,
        imageAlt: post.title,
        featured: true,
        sortOrder: index,
      },
    })
  }
}
