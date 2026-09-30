import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { locationsSeed } from '@/data/locations-seed'

export async function seedLocations(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'locations' })
  if (current.stats?.length) return

  const filePath = path.join(process.cwd(), 'public', 'contact', locationsSeed.mapFile)
  const data = fs.readFileSync(filePath)
  const map = await payload.create({
    collection: 'media',
    data: { alt: 'World map' },
    file: {
      data,
      mimetype: 'image/svg+xml',
      name: locationsSeed.mapFile,
      size: data.length,
    },
  })

  await payload.updateGlobal({
    slug: 'locations',
    data: {
      map: map.id,
      stats: locationsSeed.stats,
    },
  })
}
