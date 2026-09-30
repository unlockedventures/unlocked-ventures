import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { linkField, sizeField } from '@/admin/editor-fields'

export const Footer: GlobalConfig = {
  slug: 'site-footer',
  label: 'Footer',
  admin: {
    group: adminGroups.menus,
    description: 'The links, contact details, and social icons at the bottom of every page.',
    hideAPIURL: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'contacts',
      type: 'array',
      labels: {
        singular: 'Contact',
        plural: 'Contacts',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        linkField(),
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'pagesTitle',
      type: 'text',
      required: true,
      defaultValue: 'Pages',
    },
    {
      name: 'pages',
      type: 'array',
      labels: {
        singular: 'Page',
        plural: 'Pages',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        linkField(),
      ],
    },
    {
      name: 'newsletter',
      type: 'group',
      label: 'Newsletter',
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
          name: 'placeholder',
          type: 'text',
          required: true,
        },
        {
          name: 'buttonLabel',
          type: 'text',
          label: 'Button text',
          required: true,
        },
      ],
    },
    {
      name: 'copyright',
      type: 'text',
      label: 'Copyright line',
      required: true,
    },
    {
      name: 'socials',
      type: 'array',
      labels: {
        singular: 'Social',
        plural: 'Socials',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        sizeField('displayWidth', 'Icon width (pixels)'),
        sizeField('displayHeight', 'Icon height (pixels)'),
      ],
    },
  ],
}
