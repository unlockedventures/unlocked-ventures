import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { trustedBySeed } from '@/data/trusted-by-seed'
import type { TrustedBy } from '@/payload-types'

export async function seedTrustedBy(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'trusted-by' })
  if (current.logos?.length) return

  const logos: TrustedBy['logos'] = []

  for (const logo of trustedBySeed.logos) {
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

    logos.push({
      name: logo.name,
      logo: media.id,
      displayWidth: logo.displayWidth,
      displayHeight: logo.displayHeight,
    })
  }

  await payload.updateGlobal({
    slug: 'trusted-by',
    data: {
      title: trustedBySeed.title,
      logos,
    },
  })
}
