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
  if (!current.title || !current.cta?.label || !current.cta?.href) {
    await payload.updateGlobal({
      slug: 'success-stories',
      data: {
        title: current.title || successStoriesSeed.title,
        cta: {
          label: current.cta?.label || successStoriesSeed.cta.label,
          href: current.cta?.href || successStoriesSeed.cta.href,
        },
      },
    })
  }

  const existing = await payload.find({ collection: 'case-studies', limit: 100, depth: 0 })
  const hrefs = new Set(existing.docs.map((story) => story.href))
  const homepageHrefs = new Set(successStoriesSeed.stories.slice(0, 4).map((story) => story.href))

  for (const story of existing.docs) {
    if (!story.href || !homepageHrefs.has(story.href) || story.featured) continue

    await payload.update({
      collection: 'case-studies',
      id: story.id,
      data: { featured: true },
    })
  }

  if (!hrefs.has(successStoriesSeed.feature.href)) {
    const featureImage = await uploadStoryImage(
      payload,
      successStoriesSeed.feature.imageFile,
      successStoriesSeed.feature.title,
    )

    await payload.create({
      collection: 'case-studies',
      data: {
        title: successStoriesSeed.feature.title,
        href: successStoriesSeed.feature.href,
        ctaLabel: successStoriesSeed.feature.ctaLabel,
        badge: successStoriesSeed.feature.badge,
        description: successStoriesSeed.feature.description,
        image: featureImage.id,
        featured: true,
        sortOrder: 0,
      },
    })
  }

  for (const [index, story] of successStoriesSeed.stories.entries()) {
    if (hrefs.has(story.href)) continue

    const image = await uploadStoryImage(payload, story.imageFile, story.title)
    await payload.create({
      collection: 'case-studies',
      data: {
        title: story.title,
        href: story.href,
        ctaLabel: story.ctaLabel,
        category: story.category,
        image: image.id,
        featured: index < 4,
        sortOrder: index + 1,
      },
    })
  }
}
