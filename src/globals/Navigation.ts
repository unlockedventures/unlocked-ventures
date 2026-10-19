import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { linkField } from '@/admin/editor-fields'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Header menu',
  admin: {
    group: adminGroups.menus,
    description: 'The links in the header. This is what people use to move around the site.',
    hideAPIURL: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'exploreLabel',
      type: 'text',
      label: 'Word on the menu button',
      required: true,
      defaultValue: 'Explore',
      admin: {
        description: 'The word people click to open the menu.',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Menu items',
      required: true,
      labels: {
        singular: 'Menu item',
        plural: 'Menu items',
      },
      admin: {
        description: 'These appear across the top of the site, in this order.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'published',
          type: 'checkbox',
          label: 'Published in header',
          defaultValue: true,
          admin: {
            description:
              'When on, this item appears in the site header. Turn off to hide it without deleting it.',
          },
        },
        linkField(),
        {
          name: 'groups',
          type: 'array',
          label: 'Dropdown sections',
          labels: {
            singular: 'Section',
            plural: 'Sections',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'links',
              type: 'array',
              labels: {
                singular: 'Link',
                plural: 'Links',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
                linkField(),
                {
                  name: 'external',
                  type: 'checkbox',
                  label: 'Opens another website',
                  defaultValue: false,
                  admin: {
                    description: 'Turn this on for LinkedIn, YouTube, and other sites outside Unlocked Ventures.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
