import type { Payload } from 'payload'

import { siteSeed } from '@/data/site-seed'

export async function seedSite(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'site' })
  if (current.title) return

  await payload.updateGlobal({
    slug: 'site',
    data: siteSeed,
  })
}
