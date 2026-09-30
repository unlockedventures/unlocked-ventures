import { adminGroupOrder, adminSlugOrder } from '@/admin/editor-guide'

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
      if (entity.admin?.hidden === true) continue
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
