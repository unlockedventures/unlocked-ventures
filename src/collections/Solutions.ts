import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { buttonGroup, linkField, sizeField } from '@/admin/editor-fields'
import { articleEditor } from '@/fields/lexical/article-editor'

export const Solutions: CollectionConfig = {
  slug: 'solutions',
  labels: {
    singular: 'Solution',
    plural: 'Solutions',
  },
  admin: {
    group: adminGroups.solutions,
    description: 'Service articles linked from Strategic Advisory and Digital Engineering menus.',
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
          label: 'Article',
          fields: [
            {
              name: 'breadcrumbs',
              type: 'array',
              label: 'Breadcrumb path',
              labels: {
                singular: 'Step',
                plural: 'Steps',
              },
              admin: {
                description: 'Links above the title, such as Home and Digital Engineering.',
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
              label: 'Current breadcrumb',
              required: true,
              admin: {
                description: 'Last breadcrumb step (not a link). Usually the service name.',
              },
            },
            {
              name: 'title',
              type: 'textarea',
              label: 'Article title',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Short / key description',
              required: true,
              admin: {
                description: 'Shown under the title, before the image.',
              },
            },
            {
              name: 'heroImage',
              type: 'upload',
              label: 'Article image',
              relationTo: 'media',
              admin: {
                description: 'Main image under the short description.',
              },
            },
            {
              name: 'heroImageAlt',
              type: 'text',
              label: 'Article image alt text',
            },
            {
              name: 'body',
              type: 'richText',
              label: 'Article body',
              editor: articleEditor,
              admin: {
                description:
                  'Write the article here. Use Upload to add an image or video from your device, or insert Image / video link to paste a URL (including YouTube / Vimeo).',
              },
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
              defaultValue: 'Tell us what you are trying to build.',
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
              defaultValue: 'Related solutions',
            },
            {
              name: 'related',
              type: 'array',
              label: 'Related solutions',
              labels: {
                singular: 'Solution',
                plural: 'Solutions',
              },
              admin: {
                description: 'Only solutions related to this article. Shown at the bottom of the page.',
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
                },
                sizeField('iconWidth', 'Icon width (pixels)'),
                sizeField('iconHeight', 'Icon height (pixels)'),
              ],
            },
          ],
        },
      ],
    },
    // Legacy fields kept for existing rows; hidden from editors.
    {
      name: 'illustration',
      type: 'upload',
      relationTo: 'media',
      admin: { hidden: true },
    },
    {
      name: 'engagementTitle',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'engagementItems',
      type: 'array',
      admin: { hidden: true },
      fields: [
        { name: 'number', type: 'text' },
        { name: 'title', type: 'text' },
        { name: 'body', type: 'textarea' },
      ],
    },
    {
      name: 'howWeWorkTitle',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'steps',
      type: 'array',
      admin: { hidden: true },
      fields: [
        { name: 'number', type: 'text' },
        { name: 'title', type: 'text' },
        { name: 'body', type: 'textarea' },
      ],
    },
  ],
}
