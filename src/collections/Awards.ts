import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { sizeField } from '@/admin/editor-fields'

export const Awards: CollectionConfig = {
  slug: 'awards',
  labels: {
    singular: 'Award logo',
    plural: 'Awards & Recognitions',
  },
  admin: {
    group: adminGroups.homepage,
    description: 'The award logos under Awards & Recognitions on the homepage. Use Create New to add one, open a row to replace its image, and delete a row to remove it. Use Order to choose which logo comes first.',
    hideAPIURL: true,
    useAsTitle: 'name',
    defaultColumns: ['logo', 'name', 'sortOrder'],
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
      admin: {
        description: 'This picture is shown in the awards row. Choose a different file to replace it.',
      },
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
