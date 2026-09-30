import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { heroSeed } from '@/data/hero-seed'

async function uploadHeroImage(payload: Payload, file: string, alt: string) {
  const filePath = path.join(process.cwd(), 'public', 'hero', file)
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

export async function seedHero(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'hero' })
  if (current.title) return

  const [primaryImage, secondaryImage, badgeImage] = await Promise.all([
    uploadHeroImage(payload, heroSeed.primaryFile, 'Hero primary photo'),
    uploadHeroImage(payload, heroSeed.secondaryFile, 'Hero secondary photo'),
    uploadHeroImage(payload, heroSeed.badgeFile, heroSeed.badgeAlt),
  ])

  await payload.updateGlobal({
    slug: 'hero',
    data: {
      title: heroSeed.title,
      description: heroSeed.description.map((text) => ({ text })),
      cta: heroSeed.cta,
      primaryImage: primaryImage.id,
      secondaryImage: secondaryImage.id,
      badgeImage: badgeImage.id,
      badgeAlt: heroSeed.badgeAlt,
    },
  })
}
