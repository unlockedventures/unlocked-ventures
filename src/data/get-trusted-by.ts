import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { TrustedBySectionProps } from '@/components/site/trusted-by/trusted-by-section'

export async function getTrustedBy(): Promise<Omit<TrustedBySectionProps, 'className'> | null> {
  const payload = await getPayload({ config: configPromise })
  const [section, result] = await Promise.all([
    payload.findGlobal({ slug: 'trusted-by' }),
    payload.find({
      collection: 'trusted-logos',
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
    }),
  ])

  const logos = result.docs.flatMap((item) => {
    const logo = item.logo
    if (typeof logo === 'number' || !logo?.url) return []

    return [
      {
        name: item.name,
        src: logo.url,
        width: item.displayWidth,
        height: item.displayHeight,
      },
    ]
  })

  if (!section.title || !logos.length) return null

  return {
    title: section.title,
    logos,
  }
}
