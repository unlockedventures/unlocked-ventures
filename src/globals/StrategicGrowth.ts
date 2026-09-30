import type { GlobalConfig } from 'payload'

export const StrategicGrowth: GlobalConfig = {
  slug: 'strategic-growth',
  label: 'Strategic Growth',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Intro',
          fields: [
            {
              name: 'breadcrumbs',
              type: 'array',
              labels: {
                singular: 'Breadcrumb',
                plural: 'Breadcrumbs',
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
            {
              name: 'current',
              type: 'text',
              required: true,
              admin: {
                description: 'Current page label shown at the end of the breadcrumb.',
              },
            },
            {
              name: 'title',
              type: 'textarea',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              required: true,
            },
            {
              name: 'illustration',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'heroImageAlt',
              type: 'text',
            },
          ],
        },
        {
          label: 'Engagement',
          fields: [
            {
              name: 'engagementTitle',
              type: 'text',
              required: true,
            },
            {
              name: 'engagementItems',
              type: 'array',
              labels: {
                singular: 'Item',
                plural: 'Items',
              },
              fields: [
                {
                  name: 'number',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'body',
                  type: 'textarea',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'How we work',
          fields: [
            {
              name: 'howWeWorkTitle',
              type: 'text',
              required: true,
            },
            {
              name: 'steps',
              type: 'array',
              labels: {
                singular: 'Step',
                plural: 'Steps',
              },
              fields: [
                {
                  name: 'number',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'body',
                  type: 'textarea',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Call to action',
          fields: [
            {
              name: 'ctaTitle',
              type: 'text',
              required: true,
            },
            {
              name: 'ctaDescription',
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
          ],
        },
        {
          label: 'Related solutions',
          fields: [
            {
              name: 'relatedTitle',
              type: 'text',
              required: true,
            },
            {
              name: 'related',
              type: 'array',
              labels: {
                singular: 'Solution',
                plural: 'Solutions',
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'href',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'body',
                  type: 'textarea',
                  required: true,
                },
                {
                  name: 'icon',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'iconWidth',
                  type: 'number',
                  required: true,
                  min: 1,
                },
                {
                  name: 'iconHeight',
                  type: 'number',
                  required: true,
                  min: 1,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
