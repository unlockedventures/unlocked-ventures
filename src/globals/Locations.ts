import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'

export const Locations: GlobalConfig = {
  slug: 'locations',
  label: 'Locations',
  admin: {
    group: adminGroups.homepage,
    description: 'The map and the numbers at the bottom of the homepage.',
    hideAPIURL: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'map',
      type: 'upload',
      label: 'Map',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Numbers',
      required: true,
      minRows: 1,
      labels: {
        singular: 'Number',
        plural: 'Numbers',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          label: 'Number',
          required: true,
        },
        {
          name: 'label',
          type: 'textarea',
          label: 'Caption',
          required: true,
        },
      ],
    },
  ],
}
