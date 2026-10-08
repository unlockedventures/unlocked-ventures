import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { awardSeed } from '@/data/award-seed'

export async function seedAwards(payload: Payload) {
  const existing = await payload.count({ collection: 'awards' })
  if (existing.totalDocs > 0) return

  for (const [index, award] of awardSeed.entries()) {
    const filePath = path.join(process.cwd(), 'public', 'awards', award.file)
    const data = fs.readFileSync(filePath)
    const media = await payload.create({
      collection: 'media',
      data: { alt: award.name },
      file: {
        data,
        mimetype: 'image/png',
        name: award.file,
        size: data.length,
      },
    })

    await payload.create({
      collection: 'awards',
      data: {
        name: award.name,
        href: award.href,
        logo: media.id,
        displayWidth: award.displayWidth,
        displayHeight: award.displayHeight,
        sortOrder: index,
      },
    })
  }
}
