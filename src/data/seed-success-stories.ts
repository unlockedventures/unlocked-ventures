import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { successStoriesSeed } from '@/data/success-stories-seed'

async function uploadStoryImage(payload: Payload, file: string, alt: string) {
  const filePath = path.join(process.cwd(), 'public', 'success-stories', file)
  const data = fs.readFileSync(filePath)

  return payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data,
      mimetype: 'image/png',
      name: file,
      size: data.length,
    },
  })
}

export async function seedSuccessStories(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'success-stories' })
  if (current.title) return

  const featureImage = await uploadStoryImage(
    payload,
    successStoriesSeed.feature.imageFile,
    successStoriesSeed.feature.title,
  )

  const stories = []
  for (const story of successStoriesSeed.stories) {
    const image = await uploadStoryImage(payload, story.imageFile, story.title)
    stories.push({
      category: story.category,
      title: story.title,
      ctaLabel: story.ctaLabel,
      href: story.href,
      image: image.id,
    })
  }

  await payload.updateGlobal({
    slug: 'success-stories',
    data: {
      title: successStoriesSeed.title,
      cta: successStoriesSeed.cta,
      feature: {
        badge: successStoriesSeed.feature.badge,
        title: successStoriesSeed.feature.title,
        description: successStoriesSeed.feature.description,
        ctaLabel: successStoriesSeed.feature.ctaLabel,
        href: successStoriesSeed.feature.href,
        image: featureImage.id,
      },
      stories,
    },
  })
}
