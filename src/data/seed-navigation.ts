import type { Payload } from 'payload'

import { navigationSeed } from '@/data/navigation-seed'

const homeSectionHrefs: Record<string, string> = {
  'Strategic Advisory': '/#strategic-advisory',
  'Digital Engineering': '/#digital-engineering',
}

export async function seedNavigation(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'navigation' })
  if (current.items?.length) {
    const needsUpdate = current.items.some((item) => homeSectionHrefs[item.label] && item.href !== homeSectionHrefs[item.label])
    if (!needsUpdate) return

    await payload.updateGlobal({
      slug: 'navigation',
      data: {
        items: current.items.map((item) => {
          const href = homeSectionHrefs[item.label]
          return href ? { ...item, href } : item
        }),
      },
    })
    return
  }

  await payload.updateGlobal({
    slug: 'navigation',
    data: navigationSeed,
  })
}
