import type { GlobalConfig } from 'payload'

export const Site: GlobalConfig = {
  slug: 'site',
  label: 'Site',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Default browser title.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Default meta description.',
      },
    },
    {
      name: 'notFoundMetaTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'notFoundLabel',
      type: 'text',
      required: true,
    },
    {
      name: 'notFoundTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'notFoundDescription',
      type: 'textarea',
      required: true,
    },
    {
      name: 'homeButtonLabel',
      type: 'text',
      required: true,
    },
  ],
}
