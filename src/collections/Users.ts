import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Editor',
    plural: 'Editors',
  },
  admin: {
    group: adminGroups.accounts,
    description: 'People who can sign in and change the website.',
    hideAPIURL: true,
    useAsTitle: 'email',
  },
  auth: true,
  fields: [],
}
