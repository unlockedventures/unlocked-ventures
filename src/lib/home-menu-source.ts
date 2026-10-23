import type { Media, Navigation } from '@/payload-types'

export type MenuParent = NonNullable<Navigation['items']>[number]
export type MenuGroup = NonNullable<MenuParent['groups']>[number]

export type HomeGroupPresentation = {
  id?: string | null
  sourceGroupId?: string | null
  title?: string | null
  description?: string | null
  index?: string | null
  icon?: number | Media | null
  iconWidth?: number | null
  iconHeight?: number | null
  items?: { label: string; href: string; id?: string | null }[] | null
}

/** Only rendering/catalog data crosses this boundary, never the raw global document. */
export function menuCatalog(navigation: Navigation) {
  return (navigation.items ?? []).map((parent) => ({
    id: parent.id,
    label: parent.label,
    href: parent.href,
    groups: (parent.groups ?? []).map((group) => ({
      id: group.id,
      title: group.title ?? '',
      links: (group.links ?? []).map((link) => ({
        id: link.id,
        label: link.label,
        href: link.href,
        external: link.external === true,
      })),
    })),
  }))
}

export type MenuCatalog = ReturnType<typeof menuCatalog>

/** Build presentation rows from the source, preserving unused rows for later reuse. */
export function reconcileHomePresentation(
  sourceGroups: Pick<MenuGroup, 'id' | 'title'>[],
  rows: HomeGroupPresentation[],
  archive: HomeGroupPresentation[] = [],
) {
  const available = [...rows, ...archive]
  const used = new Set<HomeGroupPresentation>()
  const groups = sourceGroups.map((source) => {
    let existing = available.find((row) => row.sourceGroupId === source.id && !used.has(row))
    if (!existing && source.title) {
      const matches = available.filter((row) => !row.sourceGroupId && row.title === source.title)
      if (
        matches.length === 1 &&
        sourceGroups.filter((group) => group.title === source.title).length === 1
      ) {
        existing = matches[0]
      }
    }
    if (existing) used.add(existing)
    return {
      ...existing,
      sourceGroupId: source.id,
      title: existing?.title ?? '',
      iconWidth: existing?.iconWidth ?? 90,
      iconHeight: existing?.iconHeight ?? 90,
      items: existing?.items ?? [],
    }
  })
  return { groups, menuPresentationArchive: available.filter((row) => !used.has(row)) }
}

export function inheritedHomeGroups(
  navigation: Navigation,
  sourceId: string,
  presentation: HomeGroupPresentation[],
) {
  const parent = navigation.items?.find((item) => item.id === sourceId)
  return (parent?.groups ?? []).flatMap((group) => {
    const items = (group.links ?? []).flatMap((link) =>
      link.label && link.href
        ? [{ id: link.id, label: link.label, href: link.href, external: link.external === true }]
        : [],
    )
    if (!items.length) return []
    const appearance = presentation.find((row) => row.sourceGroupId === group.id)
    const icon = appearance?.icon
    return [
      {
        id: group.id,
        title: group.title ?? '',
        items,
        index: appearance?.index ?? '',
        description: appearance?.description || undefined,
        iconSrc: icon && typeof icon !== 'number' ? icon.url || undefined : undefined,
        iconWidth: appearance?.iconWidth || undefined,
        iconHeight: appearance?.iconHeight || undefined,
      },
    ]
  })
}
