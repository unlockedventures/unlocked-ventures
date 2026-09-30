import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { sizeField } from '@/admin/editor-fields'

export const TrustedLogos: CollectionConfig = {
  slug: 'trusted-logos',
  labels: {
    singular: 'Company logo',
    plural: 'Company logos',
  },
  admin: {
    group: adminGroups.homepage,
    hidden: true,
    description: 'The logos in the Trusted by row. Add, replace, remove, and reorder them from Trusted by.',
    hideAPIURL: true,
    useAsTitle: 'name',
    defaultColumns: ['name', 'sortOrder'],
  },
  access: {
    read: () => true,
  },
  defaultSort: 'sortOrder',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'logo', type: 'upload', label: 'Logo', relationTo: 'media', required: true, admin: { description: 'This picture is shown in the Trusted by row. Choose a different file to replace it.' } },
    sizeField('displayWidth', 'Width on the site (pixels)'),
    sizeField('displayHeight', 'Height on the site (pixels)'),
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Order',
      required: true,
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first.',
      },
    },
  ],
}
