import type { CollectionConfig, PayloadRequest } from 'payload'
import { APIError } from 'payload'
import { resolvePrincipal, superAdmin } from '@/access/rbac'
import { adminGroups } from '@/admin/editor-guide'

async function protectLastAdmin(req: PayloadRequest, id: string | number) {
  const doc = await req.payload.findByID({
    collection: 'users',
    id,
    depth: 0,
    overrideAccess: true,
    req,
  })
  if (!doc.isSuperAdmin || !doc.active) return
  const { totalDocs } = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
    req,
    where: {
      and: [
        { isSuperAdmin: { equals: true } },
        { active: { equals: true } },
        { id: { not_equals: id } },
      ],
    },
  })
  if (!totalDocs)
    throw new APIError('The last active Super Admin cannot be removed or disabled.', 400)
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Portal user', plural: 'Portal users' },
  admin: {
    group: adminGroups.accounts,
    description: 'Manage portal accounts and assign roles. Only Super Admins can change access.',
    hideAPIURL: true,
    useAsTitle: 'email',
    defaultColumns: ['email', 'isSuperAdmin', 'role', 'active'],
  },
  auth: true,
  access: {
    admin: async ({ req }) => Boolean(await resolvePrincipal(req)),
    create: superAdmin,
    read: async ({ req }) =>
      (await superAdmin({ req }))
        ? true
        : req.user && (await resolvePrincipal(req))
          ? { id: { equals: req.user.id } }
          : false,
    update: async ({ req }) =>
      (await superAdmin({ req }))
        ? true
        : req.user && (await resolvePrincipal(req))
          ? { id: { equals: req.user.id } }
          : false,
    delete: superAdmin,
    unlock: superAdmin,
  },
  hooks: {
    beforeDelete: [
      async ({ req, id }) => {
        await protectLastAdmin(req, id)
      },
    ],
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        if (
          operation === 'update' &&
          originalDoc &&
          (data.isSuperAdmin === false || data.active === false)
        )
          await protectLastAdmin(req, originalDoc.id)
        // Fresh databases can bootstrap only the explicitly designated owner.
        if (operation === 'create' && !req.user) {
          const { totalDocs } = await req.payload.count({
            collection: 'users',
            overrideAccess: true,
            req,
          })
          if (totalDocs !== 0 || data.email?.toLowerCase() !== 'abir@yopmail.com')
            throw new APIError('Ask a Super Admin to create your account.', 403)
          data.isSuperAdmin = true
          data.active = true
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'isSuperAdmin',
      label: 'Super Admin',
      type: 'checkbox',
      defaultValue: false,
      access: {
        create: async ({ req }) => Boolean(await superAdmin({ req })),
        update: async ({ req }) => Boolean(await superAdmin({ req })),
      },
      admin: { description: 'Full access, including user and role management.' },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      access: {
        create: async ({ req }) => Boolean(await superAdmin({ req })),
        update: async ({ req }) => Boolean(await superAdmin({ req })),
      },
      admin: { description: 'Disable to revoke portal access on subsequent requests.' },
    },
    {
      name: 'role',
      type: 'relationship',
      relationTo: 'roles',
      access: {
        create: async ({ req }) => Boolean(await superAdmin({ req })),
        update: async ({ req }) => Boolean(await superAdmin({ req })),
      },
      admin: {
        description: 'Assign a role to grant content permissions. No role means no content access.',
      },
    },
  ],
}
