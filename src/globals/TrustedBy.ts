import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'

export const TrustedBy: GlobalConfig = {
  slug: 'trusted-by',
  label: 'Trusted by',
  admin: {
    group: adminGroups.homepage,
    description: 'The heading above the row of company logos. The logos themselves are edited under Company logos.',
    hideAPIURL: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Trusted by',
    },
  ],
}
