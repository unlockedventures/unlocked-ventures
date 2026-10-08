import { adminGroupOrder, adminGroups, adminSlugOrder } from '@/admin/editor-guide'

const hiddenFromNav = new Set(['trusted-logos'])

export type AdminLink = {
  slug: string
  label: string
  href: string
  description: string
}

export type AdminSection = {
  label: string
  links: AdminLink[]
}

export type AdminNavItem =
  | {
      kind: 'link'
      link: AdminLink
    }
  | {
      kind: 'group'
      label: string
      defaultOpen?: boolean
      items: AdminNavItem[]
    }

type AdminSource = {
  slug: string
  label?: unknown
  labels?: {
    plural?: unknown
  }
  admin?: {
    group?: unknown
    description?: unknown
    hidden?: unknown
  }
}

function readText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function slugRank(slug: string) {
  const index = adminSlugOrder.indexOf(slug)
  return index === -1 ? adminSlugOrder.length : index
}

export function buildAdminSections(args: {
  adminRoute: string
  collections: AdminSource[]
  globals: AdminSource[]
  canRead: (kind: 'collection' | 'global', slug: string) => boolean
}): AdminSection[] {
  const grouped = new Map<string, AdminLink[]>()

  const add = (kind: 'collection' | 'global', entities: AdminSource[]) => {
    for (const entity of entities) {
      if (entity.admin?.hidden === true || hiddenFromNav.has(entity.slug)) continue
      if (!args.canRead(kind, entity.slug)) continue

      const group = readText(entity.admin?.group)
      if (!group) continue

      const label =
        readText(kind === 'collection' ? entity.labels?.plural : entity.label) || entity.slug
      const path = kind === 'collection' ? `/collections/${entity.slug}` : `/globals/${entity.slug}`
      const links = grouped.get(group) ?? []
      links.push({
        slug: entity.slug,
        label,
        href: `${args.adminRoute}${path}`,
        description: readText(entity.admin?.description),
      })
      grouped.set(group, links)
    }
  }

  add('collection', args.collections)
  add('global', args.globals)

  const names = [
    ...adminGroupOrder.filter((name) => grouped.has(name)),
    ...[...grouped.keys()].filter((name) => !adminGroupOrder.includes(name as (typeof adminGroupOrder)[number])),
  ]

  return names.map((label) => ({
    label,
    links: (grouped.get(label) ?? []).slice().sort((a, b) => slugRank(a.slug) - slugRank(b.slug)),
  }))
}

export function buildAdminNav(sections: AdminSection[]): AdminNavItem[] {
  const byLabel = new Map(sections.map((section) => [section.label, section]))
  const home = byLabel.get(adminGroups.homepage)
  const pages = byLabel.get(adminGroups.pages)
  const pageItems: AdminNavItem[] = []

  if (home && home.links.length > 0) {
    pageItems.push({
      kind: 'group',
      label: 'Home',
      items: home.links.map((link) => ({ kind: 'link', link })),
    })
  }

  for (const link of pages?.links ?? []) {
    pageItems.push({ kind: 'link', link })
  }

  const nav: AdminNavItem[] = []

  if (pageItems.length > 0) {
    nav.push({
      kind: 'group',
      label: adminGroups.pages,
      defaultOpen: true,
      items: pageItems,
    })
  }

  const dynamicZoneItems: AdminNavItem[] = []
  for (const label of [adminGroups.podcast, adminGroups.news, adminGroups.successStories] as const) {
    const section = byLabel.get(label)
    if (!section || section.links.length === 0) continue
    if (section.links.length === 1) {
      const [link] = section.links
      dynamicZoneItems.push({
        kind: 'link',
        link: {
          ...link,
          label,
        },
      })
      continue
    }
    dynamicZoneItems.push({
      kind: 'group',
      label,
      items: section.links.map((link) => ({ kind: 'link', link })),
    })
  }
  if (dynamicZoneItems.length > 0) {
    nav.push({
      kind: 'group',
      label: adminGroups.dynamicZone,
      items: dynamicZoneItems,
    })
  }

  for (const section of sections) {
    if (
      section.label === adminGroups.homepage ||
      section.label === adminGroups.pages ||
      section.label === adminGroups.podcast ||
      section.label === adminGroups.news ||
      section.label === adminGroups.successStories ||
      section.label === adminGroups.dynamicZone
    ) {
      continue
    }
    if (section.label === adminGroups.library && section.links.length === 1) {
      const [fileLibrary] = section.links
      const base = fileLibrary.href
      nav.push({
        kind: 'group',
        label: 'All files',
        items: [
          {
            kind: 'link',
            link: {
              slug: 'media',
              label: 'All',
              href: base,
              description: 'Every photo, icon, and other file already uploaded.',
            },
          },
          {
            kind: 'link',
            link: {
              slug: 'media-images',
              label: 'Images',
              href: `${base}?where[kind][equals]=image`,
              description: 'Photos used on the site, such as banners, stories, and news.',
            },
          },
          {
            kind: 'link',
            link: {
              slug: 'media-icons',
              label: 'Icons',
              href: `${base}?where[kind][equals]=icon`,
              description: 'Small icons, such as social icons and the icons on cards.',
            },
          },
          {
            kind: 'link',
            link: {
              slug: 'media-files',
              label: 'Files',
              href: `${base}?where[kind][equals]=file`,
              description: 'Documents and other uploads that are not photos or icons.',
            },
          },
        ],
      })
      continue
    }
    const label = section.label === adminGroups.pipeline ? 'Podcast' : section.label
    nav.push({
      kind: 'group',
      label,
      items: section.links.map((link) => ({
        kind: 'link',
        link: section.label === adminGroups.pipeline ? { ...link, label: 'Podcast' } : link,
      })),
    })
  }

  return nav
}
