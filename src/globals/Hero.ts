import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { buttonGroup } from '@/admin/editor-fields'

export const Hero: GlobalConfig = {
  slug: 'hero',
  label: 'Opening banner',
  admin: {
    group: adminGroups.homepage,
    description: 'The first thing people see on the homepage: the heading, short text, button, and photos.',
    hideAPIURL: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'textarea',
      label: 'Heading',
      required: true,
      admin: {
        description: 'Press Enter to start a new line. The line break is kept on the site.',
      },
    },
    {
      name: 'description',
      type: 'array',
      label: 'Intro text',
      labels: {
        singular: 'Paragraph',
        plural: 'Paragraphs',
      },
      fields: [
        {
          name: 'text',
          type: 'textarea',
          label: 'Paragraph',
          required: true,
        },
      ],
    },
    buttonGroup(),
    {
      name: 'primaryImage',
      type: 'upload',
      label: 'Large photo',
      relationTo: 'media',
      admin: {
        description: 'Choose a different file to replace this photo.',
      },
    },
    {
      name: 'secondaryImage',
      type: 'upload',
      label: 'Smaller photo',
      relationTo: 'media',
      admin: {
        description: 'Choose a different file to replace this photo.',
      },
    },
    {
      name: 'badgeImage',
      type: 'upload',
      label: 'Badge',
      relationTo: 'media',
      admin: {
        description: 'Choose a different file to replace this badge.',
      },
    },
    {
      name: 'badgeAlt',
      type: 'text',
      label: 'Badge description',
      admin: {
        description: 'Read aloud for people who cannot see the badge.',
      },
    },
  ],
}
