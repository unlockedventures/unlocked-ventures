import type { GlobalConfig } from 'payload'

export const Hero: GlobalConfig = {
  slug: 'hero',
  label: 'Hero',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'textarea',
      required: true,
    },
    {
      name: 'description',
      type: 'array',
      labels: {
        singular: 'Paragraph',
        plural: 'Paragraphs',
      },
      fields: [
        {
          name: 'text',
          type: 'textarea',
          required: true,
        },
      ],
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
      name: 'primaryImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'secondaryImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'badgeImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'badgeAlt',
      type: 'text',
    },
  ],
}
