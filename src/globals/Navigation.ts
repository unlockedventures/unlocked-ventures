import type { GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'exploreLabel',
      type: 'text',
      required: true,
      defaultValue: 'Explore',
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      labels: {
        singular: 'Item',
        plural: 'Items',
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
            },
            {
              name: 'links',
              type: 'array',
              labels: {
                singular: 'Link',
                plural: 'Links',
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
                {
                  name: 'external',
                  type: 'checkbox',
                  defaultValue: false,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
