import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { NavItem, NavLink } from '@/config/navigation'

export type NavigationData = {
  exploreLabel: string
  items: NavItem[]
}

export async function getNavigation(): Promise<NavigationData | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({ slug: 'navigation' })

  if (!doc.items?.length) return null

  // Treat missing published as true so existing menu rows stay visible.
  const items: NavItem[] = doc.items
    .filter((item) => item.published !== false)
    .map((item) => ({
      label: item.label,
      href: item.href,
      groups: (item.groups ?? []).map((group) => ({
        title: group.title || undefined,
        links: (group.links ?? []).map((link): NavLink => ({
          label: link.label,
          href: link.href,
          ...(link.external ? { external: true } : {}),
        })),
      })),
    }))

  if (!items.length) return null

  return {
    exploreLabel: doc.exploreLabel || 'Explore',
    items,
  }
}
