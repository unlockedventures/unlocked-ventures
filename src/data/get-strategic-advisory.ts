import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { StrategicAdvisorySectionProps } from '@/components/site/strategic-advisory/strategic-advisory-section'

export async function getStrategicAdvisory(): Promise<
  Omit<StrategicAdvisorySectionProps, 'className'> | null
> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({
    slug: 'strategic-advisory',
    depth: 1,
  })

  if (!doc.title || !doc.description || !doc.cta?.label || !doc.cta.href) return null

  const groups = (doc.groups ?? []).flatMap((group) => {
    const icon = group.icon
    if (
      !group.title ||
      typeof icon === 'number' ||
      !icon?.url ||
      !group.iconWidth ||
      !group.iconHeight
    ) {
      return []
    }

    const items = (group.items ?? []).flatMap((item) =>
      item.label && item.href ? [{ label: item.label, href: item.href }] : [],
    )
    if (!items.length) return []

    return [
      {
        title: group.title,
        iconSrc: icon.url,
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
    groups,
  }
}
