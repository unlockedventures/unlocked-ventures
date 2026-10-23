import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { digitalEngineeringSeed } from '@/data/digital-engineering-seed'
import { uploadPublicFile } from '@/data/upload-public-file'

async function iconFor(payload: Payload, title: string) {
  const group = digitalEngineeringSeed.groups.find(
    (item) => item.title.toLowerCase() === title.toLowerCase(),
  )
  if (!group) return null

  const media = await uploadPublicFile(
    payload,
    `digital-engineering/${group.iconFile}`,
    group.title,
  )
  return {
    icon: media.id,
    iconWidth: group.iconWidth,
    iconHeight: group.iconHeight,
  }
}

export async function seedDigitalEngineering(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'digital-engineering' })

  if (current.title) {
    // Source-driven presentation is optional; do not backfill editor choices.
    if (current.menuSource) return
    const groups = current.groups ?? []
    if (!groups.some((group) => !group.icon)) return

    const nextGroups = []
    for (const group of groups) {
      if (group.icon) {
        nextGroups.push(group)
        continue
      }
      const icon = group.title ? await iconFor(payload, group.title) : null
      nextGroups.push(icon ? { ...group, ...icon } : group)
    }

    await payload.updateGlobal({
      slug: 'digital-engineering',
      data: { groups: nextGroups },
    })
    return
  }

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

  const groups = []
  for (const group of digitalEngineeringSeed.groups) {
    const icon = await iconFor(payload, group.title)
    groups.push({
      index: group.index,
      title: group.title,
      description: group.description,
      items: group.items,
      ...icon,
    })
  }

  await payload.updateGlobal({
    slug: 'digital-engineering',
    data: {
      title: digitalEngineeringSeed.title,
      description: digitalEngineeringSeed.description,
      cta: digitalEngineeringSeed.cta,
      image: media.id,
      groups,
    },
  })
}
