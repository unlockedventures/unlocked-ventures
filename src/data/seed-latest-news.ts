import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { latestNewsSeed } from '@/data/latest-news-seed'

export async function seedLatestNews(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'latest-news' })
  if (current.title) return

  const posts = []

  for (const post of latestNewsSeed.posts) {
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

    posts.push({
      title: post.title,
      excerpt: post.excerpt,
      href: post.href,
      ctaLabel: post.ctaLabel,
      image: media.id,
      imageAlt: post.title,
    })
  }

  await payload.updateGlobal({
    slug: 'latest-news',
    data: {
      title: latestNewsSeed.title,
      posts,
    },
  })
}
