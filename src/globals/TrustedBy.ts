import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { relatedItemsField } from '@/admin/editor-fields'

export const TrustedBy: GlobalConfig = {
  slug: 'trusted-by',
  label: 'Trusted by',
  admin: {
    group: adminGroups.homepage,
    description: 'The heading above the row of company logos. Add, replace, or remove the logos below.',
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
    relatedItemsField({
      name: 'logos',
      label: 'Logos',
      collection: 'trusted-logos',
      titleField: 'name',
      imageField: 'logo',
      singular: 'logo',
      plural: 'logos',
      help: 'These logos appear in the Trusted by row, in this order. Drag a row to move it. Open Change to replace its image, or remove it.',
    }),
  ],
}
