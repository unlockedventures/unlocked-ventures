import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'site-footer',
  label: 'Footer',
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
        {
          name: 'href',
          type: 'text',
          required: true,
        },
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
        {
          name: 'href',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'newsletter',
      type: 'group',
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
          required: true,
        },
      ],
    },
    {
      name: 'copyright',
      type: 'text',
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
        {
          name: 'displayWidth',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'displayHeight',
          type: 'number',
          required: true,
          min: 1,
        },
      ],
    },
  ],
}
