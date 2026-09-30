import type { Payload } from 'payload'

const iconNamePattern = /(^|[-_])(icon|facebook|twitter|pinterest|instagram|dribbble|envelope|phone)([-_.]|$)/i

export function guessMediaKind(filename?: string | null, mimeType?: string | null): 'image' | 'icon' | 'file' {
  if (iconNamePattern.test(filename ?? '')) return 'icon'
  if (mimeType?.startsWith('image/')) return 'image'
  return 'file'
}

export async function classifyMedia(payload: Payload) {
  const result = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 500,
    pagination: false,
  })

  await Promise.all(
    result.docs.map(async (doc) => {
      if (doc.kind === 'image' || doc.kind === 'icon' || doc.kind === 'file') return
      await payload.update({
        collection: 'media',
        id: doc.id,
        data: {
          kind: guessMediaKind(doc.filename, doc.mimeType),
        },
        overrideAccess: true,
      })
    }),
  )
}
