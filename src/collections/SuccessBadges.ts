import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { adminGroups } from '@/admin/editor-guide'

function normalizeBadgeName(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function badgeNameKey(name: string): string {
  return name.toLocaleLowerCase()
}

export const SuccessBadges: CollectionConfig = {
  slug: 'success-badges',
  labels: {
    singular: 'Badge',
    plural: 'Badges',
  },
  admin: {
    group: adminGroups.successStories,
    hidden: true,
    hideAPIURL: true,
    useAsTitle: 'name',
    description: 'Unique badges for success stories. Create them from the Badge field (+).',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation, originalDoc, req }) => {
        if (!data) return data
        const name = normalizeBadgeName(data.name ?? originalDoc?.name)
        if (!name) {
          throw new APIError('Badge name is required.', 400)
        }
        const nameKey = badgeNameKey(name)
        const existing = await req.payload.find({
          collection: 'success-badges',
          where: {
            and: [
              { nameKey: { equals: nameKey } },
              ...(operation === 'update' && originalDoc?.id != null
                ? [{ id: { not_equals: originalDoc.id } }]
                : []),
            ],
          },
          limit: 1,
          depth: 0,
          overrideAccess: true,
          req,
        })
        if (existing.docs[0]) {
          throw new APIError(
            `A badge named "${existing.docs[0].name}" already exists (names are case-insensitive).`,
            400,
          )
        }
        data.name = name
        data.nameKey = nameKey
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Badge name',
      required: true,
      admin: {
        description: 'Shown on success story cards. Names are unique ignoring letter case (AI and ai are the same).',
      },
    },
    {
      name: 'nameKey',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { hidden: true },
    },
  ],
}

/** Resolve relationship or legacy string badge to display text. */
export function successBadgeLabel(
  value: number | string | { name?: string | null } | null | undefined,
): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || undefined
  }
  if (!value || typeof value === 'number') return undefined
  if (typeof value.name === 'string' && value.name.trim()) return value.name.trim()
  return undefined
}
