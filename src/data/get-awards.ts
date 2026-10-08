import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Award } from '@/components/site/awards/awards-section'

export async function getAwards(): Promise<Award[]> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'awards',
    sort: 'sortOrder',
    limit: 100,
    depth: 1,
  })

  return result.docs.flatMap((award) => {
    const logo = award.logo
    const href = award.href?.trim()
    if (typeof logo === 'number' || !logo.url || !href) return []

    return [
      {
        name: award.name,
        src: logo.url,
        width: award.displayWidth,
        height: award.displayHeight,
        href,
      },
    ]
  })
}
