import type { GlobalConfig } from 'payload'

export const Locations: GlobalConfig = {
  slug: 'locations',
  label: 'Locations',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'map',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'stats',
      type: 'array',
      required: true,
      minRows: 1,
      labels: {
        singular: 'Stat',
        plural: 'Stats',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
        },
        {
          name: 'label',
          type: 'textarea',
          required: true,
        },
      ],
    },
  ],
}
