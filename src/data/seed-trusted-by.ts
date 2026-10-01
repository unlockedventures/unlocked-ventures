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

  const existing = await payload.find({ collection: 'trusted-logos', limit: 100, depth: 0 })
  const byName = new Map(existing.docs.map((logo) => [logo.name, logo]))

  for (const [index, logo] of trustedBySeed.logos.entries()) {
    const current = byName.get(logo.name)
    if (current) {
      if (current.sortOrder !== index || current.displayWidth !== logo.displayWidth || current.displayHeight !== logo.displayHeight) {
        await payload.update({
          collection: 'trusted-logos',
          id: current.id,
          data: {
            sortOrder: index,
            displayWidth: logo.displayWidth,
            displayHeight: logo.displayHeight,
          },
        })
      }
      continue
    }

    const filePath = path.join(process.cwd(), 'public', 'logos', 'partners', logo.file)
    const data = fs.readFileSync(filePath)
    const media = await payload.create({
      collection: 'media',
      data: { alt: logo.name },
      file: {
        data,
        mimetype: logo.file.endsWith('.png') ? 'image/png' : 'image/svg+xml',
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
