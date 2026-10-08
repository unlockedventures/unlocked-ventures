import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { digitalEngineeringSeed } from '@/data/digital-engineering-seed'

export async function seedDigitalEngineering(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'digital-engineering' })
  if (current.title) return

  const filePath = path.join(
    process.cwd(),
    'public',
    'digital-engineering',
    digitalEngineeringSeed.imageFile,
  )
  const data = fs.readFileSync(filePath)
  const media = await payload.create({
    collection: 'media',
    data: { alt: digitalEngineeringSeed.title },
    file: {
      data,
      mimetype: 'image/png',
      name: digitalEngineeringSeed.imageFile,
      size: data.length,
    },
  })

  await payload.updateGlobal({
    slug: 'digital-engineering',
    data: {
      title: digitalEngineeringSeed.title,
      description: digitalEngineeringSeed.description,
      cta: digitalEngineeringSeed.cta,
      image: media.id,
      groups: digitalEngineeringSeed.groups.map(
        ({ iconFile: _iconFile, iconWidth: _iconWidth, iconHeight: _iconHeight, ...group }) => group,
      ),
    },
  })
}
