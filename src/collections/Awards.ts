import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { sizeField } from '@/admin/editor-fields'

export const Awards: CollectionConfig = {
  slug: 'awards',
  labels: {
    singular: 'Award logo',
    plural: 'Award logos',
  },
  admin: {
    group: adminGroups.homepage,
    description: 'The award logos on the homepage. Use Order to choose which logo comes first.',
    hideAPIURL: true,
    useAsTitle: 'name',
    defaultColumns: ['name', 'sortOrder'],
  },
  access: {
    read: () => true,
  },
  defaultSort: 'sortOrder',
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      label: 'Logo',
      relationTo: 'media',
      required: true,
    },
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
