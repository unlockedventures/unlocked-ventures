import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { TrustedBySectionProps } from '@/components/site/trusted-by/trusted-by-section'

export async function getTrustedBy(): Promise<Omit<TrustedBySectionProps, 'className'> | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({
    slug: 'trusted-by',
    depth: 1,
  })

  const logos = (doc.logos ?? []).flatMap((item) => {
    const logo = item.logo
    if (
      !item.name ||
      !item.displayWidth ||
      !item.displayHeight ||
      typeof logo === 'number' ||
      !logo?.url
    ) {
      return []
    }

    return [
      {
        name: item.name,
        src: logo.url,
        width: item.displayWidth,
        height: item.displayHeight,
      },
    ]
  })

  if (!doc.title || !logos.length) return null

  return {
    title: doc.title,
    logos,
  }
}
