import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { buttonGroup, linkField, sizeField } from '@/admin/editor-fields'

export const StrategicAdvisory: GlobalConfig = {
  slug: 'strategic-advisory',
  label: 'Strategic Advisory',
  admin: {
    group: adminGroups.homepage,
    description: 'The two large cards on the homepage, Enterprise and Early-stage.',
    hideAPIURL: true,
  },
  access: {
    read: () => true,
  },
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
    buttonGroup(),
    {
      name: 'groups',
      type: 'array',
      label: 'Cards',
      labels: {
        singular: 'Card',
        plural: 'Cards',
      },
      admin: {
        description: 'Enterprise and Early-stage.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        sizeField('iconWidth', 'Icon width (pixels)'),
        sizeField('iconHeight', 'Icon height (pixels)'),
        {
          name: 'items',
          type: 'array',
          required: true,
          minRows: 1,
          labels: {
            singular: 'Offering',
            plural: 'Offerings',
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
      ],
    },
  ],
}
