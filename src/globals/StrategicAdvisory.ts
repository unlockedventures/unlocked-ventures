import type { GlobalConfig } from 'payload'

export const StrategicAdvisory: GlobalConfig = {
  slug: 'strategic-advisory',
  label: 'Strategic Advisory',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'cta',
      type: 'group',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'groups',
      type: 'array',
      labels: {
        singular: 'Group',
        plural: 'Groups',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'iconWidth',
          type: 'number',
          required: true,
          min: 1,
          admin: {
            description: 'Intrinsic width of the group icon, in pixels.',
          },
        },
        {
          name: 'iconHeight',
          type: 'number',
          required: true,
          min: 1,
          admin: {
            description: 'Intrinsic height of the group icon, in pixels.',
          },
        },
        {
          name: 'items',
          type: 'array',
          required: true,
          minRows: 1,
          labels: {
            singular: 'Offering',
            plural: 'Offerings',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'href',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
