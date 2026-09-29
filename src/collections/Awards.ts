import type { CollectionConfig } from 'payload'

export const Awards: CollectionConfig = {
  slug: 'awards',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sortOrder'],
  },
  access: {
    read: () => true,
  },
  defaultSort: 'sortOrder',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'displayWidth',
      type: 'number',
      required: true,
      min: 1,
      admin: {
        description: 'Rendered width of the logo, in pixels.',
      },
    },
    {
      name: 'displayHeight',
      type: 'number',
      required: true,
      min: 1,
      admin: {
        description: 'Rendered height of the logo, in pixels.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
