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
  if (!current.title || !current.cta?.label || !current.cta?.href || !current.subtitle) {
    await payload.updateGlobal({
      slug: 'success-stories',
      data: {
        title: current.title || successStoriesSeed.title,
        subtitle: current.subtitle || successStoriesSeed.subtitle,
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

    let badgeId: number | undefined
    const badgeName = successStoriesSeed.feature.badge?.trim()
    if (badgeName) {
      const nameKey = badgeName.toLocaleLowerCase()
      const existingBadge = await payload.find({
        collection: 'success-badges',
        where: { nameKey: { equals: nameKey } },
        limit: 1,
        depth: 0,
      })
      if (existingBadge.docs[0]?.id) {
        badgeId = existingBadge.docs[0].id
      } else {
        const created = await payload.create({
          collection: 'success-badges',
          data: { name: badgeName, nameKey },
        })
        badgeId = typeof created.id === 'number' ? created.id : Number(created.id)
      }
    }

    await payload.create({
      collection: 'case-studies',
      data: {
        title: successStoriesSeed.feature.title,
        href: successStoriesSeed.feature.href,
        ctaLabel: successStoriesSeed.feature.ctaLabel,
        ...(badgeId != null ? { badge: badgeId } : {}),
        description: successStoriesSeed.feature.description,
        image: featureImage.id,
        featured: true,
        sortOrder: 0,
      },
    })
  }

  async function ensureBadgeId(name: string | undefined): Promise<number | undefined> {
    const badgeName = name?.trim()
    if (!badgeName) return undefined
    const nameKey = badgeName.toLocaleLowerCase()
    const found = await payload.find({
      collection: 'success-badges',
      where: { nameKey: { equals: nameKey } },
      limit: 1,
      depth: 0,
    })
    if (typeof found.docs[0]?.id === 'number') return found.docs[0].id
    const created = await payload.create({
      collection: 'success-badges',
      data: { name: badgeName, nameKey },
    })
    return typeof created.id === 'number' ? created.id : Number(created.id)
  }

  for (const [index, story] of successStoriesSeed.stories.entries()) {
    if (hrefs.has(story.href)) continue

    const image = await uploadStoryImage(payload, story.imageFile, story.title)
    const badgeId = await ensureBadgeId(story.category)
    await payload.create({
      collection: 'case-studies',
      data: {
        title: story.title,
        href: story.href,
        ctaLabel: story.ctaLabel,
        category: story.category,
        ...(badgeId != null ? { badge: badgeId } : {}),
        description: story.description,
        image: image.id,
        featured: index < 4,
        sortOrder: index + 1,
      },
    })
  }

  for (const story of successStoriesSeed.stories) {
    const existingStory = existing.docs.find((doc) => doc.href === story.href)
    if (!existingStory) continue

    const data: Record<string, unknown> = {}
    if (!existingStory.description && story.description) data.description = story.description
    const hasBadge =
      typeof existingStory.badge === 'number' ||
      (existingStory.badge && typeof existingStory.badge === 'object')
    if (!hasBadge && story.category) {
      const badgeId = await ensureBadgeId(story.category)
      if (badgeId != null) data.badge = badgeId
    }
    if (Object.keys(data).length === 0) continue

    await payload.update({
      collection: 'case-studies',
      id: existingStory.id,
      data,
    })
  }
}
