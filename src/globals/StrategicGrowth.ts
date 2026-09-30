import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { buttonGroup, linkField, sizeField } from '@/admin/editor-fields'

export const StrategicGrowth: GlobalConfig = {
  slug: 'strategic-growth',
  label: 'Strategic Growth',
  admin: {
    group: adminGroups.pages,
    description: 'The Strategic Growth page. Each tab is a part of that page, from top to bottom.',
    hideAPIURL: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Top of the page',
          fields: [
            {
              name: 'breadcrumbs',
              type: 'array',
              label: 'Page path',
              labels: {
                singular: 'Step',
                plural: 'Steps',
              },
              admin: {
                description: 'The small links above the title, such as Home and Our solutions.',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  label: 'Text',
                  required: true,
                },
                linkField(),
              ],
            },
            {
              name: 'current',
              type: 'text',
              required: true,
              admin: {
                description: 'The last step in the path. This is the page people are on, so it is not a link.',
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
          label: 'Closing button',
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
            buttonGroup(),
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
                linkField(),
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
                sizeField('iconWidth', 'Icon width (pixels)'),
                sizeField('iconHeight', 'Icon height (pixels)'),
              ],
            },
          ],
        },
      ],
    },
  ],
}
