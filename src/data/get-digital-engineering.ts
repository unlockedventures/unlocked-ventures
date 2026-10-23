import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { DigitalEngineeringSectionProps } from '@/components/site/digital-engineering/digital-engineering-section'
import { inheritedHomeGroups } from '@/lib/home-menu-source'

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

export async function getDigitalEngineering(): Promise<DigitalEngineeringSectionProps | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({
    slug: 'digital-engineering',
    depth: 1,
  })

  if (!doc.title || !doc.description || !doc.cta?.label || !doc.cta.href) return null

  const image = doc.image
  const imageSrc = image && typeof image !== 'number' ? (image.url ?? undefined) : undefined

  const groups = doc.menuSource
    ? inheritedHomeGroups(
        await payload.findGlobal({ slug: 'navigation', depth: 0 }),
        doc.menuSource,
        doc.groups ?? [],
      )
    : (doc.groups ?? []).flatMap((group) => {
        if (!group.title) return []

        const items = group.items?.length
          ? group.items.flatMap((item) =>
              item.label && item.href ? [{ label: item.label, href: item.href }] : [],
            )
          : undefined

        return [
          {
            index: group.index ?? '',
            title: group.title,
            description: group.description || undefined,
            iconSrc: mediaUrl(group.icon),
            iconWidth: group.iconWidth,
            iconHeight: group.iconHeight,
            items,
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
