import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { strategicAdvisorySeed } from '@/data/strategic-advisory-seed'

export async function seedStrategicAdvisory(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'strategic-advisory' })
  if (current.title) return

  const groups = []

  for (const group of strategicAdvisorySeed.groups) {
    const filePath = path.join(process.cwd(), 'public', 'strategic-advisory', group.iconFile)
    const data = fs.readFileSync(filePath)
    const media = await payload.create({
      collection: 'media',
      data: { alt: group.title },
      file: {
        data,
        mimetype: 'image/png',
        name: group.iconFile,
        size: data.length,
      },
    })

    groups.push({
      title: group.title,
      icon: media.id,
      iconWidth: group.iconWidth,
      iconHeight: group.iconHeight,
      items: group.items,
    })
  }

  await payload.updateGlobal({
    slug: 'strategic-advisory',
    data: {
      title: strategicAdvisorySeed.title,
      description: strategicAdvisorySeed.description,
      cta: strategicAdvisorySeed.cta,
      groups,
    },
  })
}
