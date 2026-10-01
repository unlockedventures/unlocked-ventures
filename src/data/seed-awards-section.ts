import type { Payload } from 'payload'

export async function seedAwardsSection(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'awards-section' })
  if (current.title) return

  await payload.updateGlobal({
    slug: 'awards-section',
    data: { title: 'Awards & Recognitions' },
  })
}
