import type { CollectionConfig } from 'payload'
import { superAdmin } from '@/access/rbac'
import { validatePermissions } from '@/access/resources'
import { adminGroups } from '@/admin/editor-guide'

export const Roles: CollectionConfig = {
  slug: 'roles',
  admin: {
    group: adminGroups.accounts,
    useAsTitle: 'name',
    description: 'Choose exactly which content each role can view and change.',
  },
  access: { create: superAdmin, read: superAdmin, update: superAdmin, delete: superAdmin },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'permissions',
      type: 'json',
      required: true,
      defaultValue: {},
      validate: validatePermissions,
      admin: { components: { Field: '@/components/admin/permissions-field#PermissionsField' } },
    },
  ],
}
