import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { strategicGrowthSeed } from '@/data/strategic-growth-seed'

const assetDir = path.join(process.cwd(), 'public', 'solutions', 'strategic-growth')

async function uploadAsset(payload: Payload, file: string, alt: string) {
  const filePath = path.join(assetDir, file)
  if (!fs.existsSync(filePath)) return null

  const data = fs.readFileSync(filePath)
  const media = await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data,
      mimetype: file.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
      name: file,
      size: data.length,
    },
  })

  return media.id
}

export async function seedStrategicGrowth(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'strategic-growth' })
  if (current.title) return

  const illustration = await uploadAsset(
    payload,
    strategicGrowthSeed.illustrationFile,
    strategicGrowthSeed.title,
  )
  const heroImage = await uploadAsset(
    payload,
    strategicGrowthSeed.heroImageFile,
    strategicGrowthSeed.title,
  )

  const related = []

  for (const solution of strategicGrowthSeed.related) {
    const icon = await uploadAsset(payload, solution.iconFile, solution.title)
    related.push({
      title: solution.title,
      href: solution.href,
      body: solution.body,
      icon,
      iconWidth: solution.iconWidth,
      iconHeight: solution.iconHeight,
    })
  }

  await payload.updateGlobal({
    slug: 'strategic-growth',
    data: {
      breadcrumbs: strategicGrowthSeed.breadcrumbs,
      current: strategicGrowthSeed.current,
      title: strategicGrowthSeed.title,
      description: strategicGrowthSeed.description,
      illustration,
      heroImage,
      engagementTitle: strategicGrowthSeed.engagementTitle,
      engagementItems: strategicGrowthSeed.engagementItems,
      howWeWorkTitle: strategicGrowthSeed.howWeWorkTitle,
      steps: strategicGrowthSeed.steps,
      ctaTitle: strategicGrowthSeed.ctaTitle,
      ctaDescription: strategicGrowthSeed.ctaDescription,
      cta: strategicGrowthSeed.cta,
      relatedTitle: strategicGrowthSeed.relatedTitle,
      related,
    },
  })
}
