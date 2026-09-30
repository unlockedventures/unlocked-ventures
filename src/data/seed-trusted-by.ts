import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { trustedBySeed } from '@/data/trusted-by-seed'

export async function seedTrustedBy(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'trusted-by' })
  if (!current.title) {
    await payload.updateGlobal({
      slug: 'trusted-by',
      data: { title: trustedBySeed.title },
    })
  }

  const existing = await payload.count({ collection: 'trusted-logos' })
  if (existing.totalDocs > 0) return

  for (const [index, logo] of trustedBySeed.logos.entries()) {
    const filePath = path.join(process.cwd(), 'public', 'logos', 'partners', logo.file)
    const data = fs.readFileSync(filePath)
    const media = await payload.create({
      collection: 'media',
      data: { alt: logo.name },
      file: {
        data,
        mimetype: 'image/svg+xml',
        name: logo.file,
        size: data.length,
      },
    })

    await payload.create({
      collection: 'trusted-logos',
      data: {
        name: logo.name,
        logo: media.id,
        displayWidth: logo.displayWidth,
        displayHeight: logo.displayHeight,
        sortOrder: index,
      },
    })
  }
}
