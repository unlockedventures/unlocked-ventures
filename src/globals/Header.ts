import type { GlobalConfig } from 'payload'

export const Header: GlobalConfig = {
  slug: 'site-header',
  label: 'Header',
  access: {
    read: () => true,
  },
  fields: [
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
}
