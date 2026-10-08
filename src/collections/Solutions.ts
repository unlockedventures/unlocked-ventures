import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { buttonGroup, linkField, sizeField } from '@/admin/editor-fields'

export const Solutions: CollectionConfig = {
  slug: 'solutions',
  labels: {
    singular: 'Solution',
    plural: 'Solutions',
  },
  admin: {
    group: adminGroups.pages,
    description: 'Service detail pages linked from Strategic Advisory and Digital Engineering menus.',
    hideAPIURL: true,
    useAsTitle: 'current',
    defaultColumns: ['current', 'slug', 'category', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL path after /solutions/, such as strategic-growth.',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Strategic Advisory', value: 'strategic-advisory' },
        { label: 'Digital Engineering', value: 'digital-engineering' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
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
              label: 'Illustration',
              relationTo: 'media',
              admin: {
                description: 'Choose a different file to replace this picture.',
              },
            },
            {
              name: 'heroImage',
              type: 'upload',
              label: 'Photo',
              relationTo: 'media',
              admin: {
                description: 'Choose a different file to replace this photo.',
              },
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
                  label: 'Icon',
                  relationTo: 'media',
                  admin: {
                    description:
                      'Choose a different file to replace this icon. Add or remove a solution with the controls on this list.',
                  },
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
