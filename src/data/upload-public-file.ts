import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

function mimetype(name: string) {
  if (name.endsWith('.png')) return 'image/png'
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg'
  if (name.endsWith('.webp')) return 'image/webp'
  return 'image/svg+xml'
}

export async function uploadPublicFile(payload: Payload, publicPath: string, alt: string) {
  const relative = publicPath.replace(/^\//, '')
  const filePath = path.join(process.cwd(), 'public', relative)
  const data = fs.readFileSync(filePath)
  const name = path.basename(relative)

  return payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data,
      mimetype: mimetype(name),
      name,
      size: data.length,
    },
  })
}
