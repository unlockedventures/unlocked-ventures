import type { Payload } from 'payload'

import { navigationSeed } from '@/data/navigation-seed'

export async function seedNavigation(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'navigation' })
  if (current.items?.length) return

  await payload.updateGlobal({
    slug: 'navigation',
    data: navigationSeed,
  })
}
