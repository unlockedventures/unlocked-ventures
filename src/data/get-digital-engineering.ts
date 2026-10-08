import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { DigitalEngineeringSectionProps } from '@/components/site/digital-engineering/digital-engineering-section'
import { digitalEngineeringSeed } from '@/data/digital-engineering-seed'

const groupIcons = Object.fromEntries(
  digitalEngineeringSeed.groups.map((group) => [
    group.title.toLowerCase(),
    {
      iconSrc: `/digital-engineering/${group.iconFile}`,
      iconWidth: group.iconWidth,
      iconHeight: group.iconHeight,
    },
  ]),
)

export async function getDigitalEngineering(): Promise<DigitalEngineeringSectionProps | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({
    slug: 'digital-engineering',
    depth: 1,
  })

  if (!doc.title || !doc.description || !doc.cta?.label || !doc.cta.href) return null

  const image = doc.image
  const imageSrc = image && typeof image !== 'number' ? (image.url ?? undefined) : undefined

  const groups = (doc.groups ?? []).flatMap((group) => {
    if (!group.title) return []

    const icon = groupIcons[group.title.toLowerCase()]
    if (!icon) return []

    return [
      {
        index: group.index,
        title: group.title,
        description: group.description || undefined,
        ...icon,
        items: group.items?.length
          ? group.items.map((item) => ({
              label: item.label,
              href: item.href,
            }))
          : undefined,
      },
    ]
  })

  if (!groups.length) return null

  return {
    title: doc.title,
    description: doc.description,
    cta: {
      label: doc.cta.label,
      href: doc.cta.href,
    },
    imageSrc,
    imageAlt: doc.imageAlt ?? '',
    groups,
  }
}
