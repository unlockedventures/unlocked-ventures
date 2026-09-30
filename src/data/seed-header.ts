import type { Payload } from 'payload'

import { headerSeed } from '@/data/header-seed'

export async function seedHeader(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'site-header' })
  if (current.cta?.label) return

  await payload.updateGlobal({
    slug: 'site-header',
    data: headerSeed,
  })
}
