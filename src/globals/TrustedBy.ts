import type { GlobalConfig } from 'payload'

export const TrustedBy: GlobalConfig = {
  slug: 'trusted-by',
  label: 'Trusted By',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Trusted by',
    },
    {
      name: 'logos',
      type: 'array',
      required: true,
      minRows: 1,
      labels: {
        singular: 'Logo',
        plural: 'Logos',
      },
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
      ],
    },
  ],
}
