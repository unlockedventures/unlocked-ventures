import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { buttonGroup, linkField, sizeField } from '@/admin/editor-fields'

export const DigitalEngineering: GlobalConfig = {
  slug: 'digital-engineering',
  label: 'Digital Engineering',
  admin: {
    group: adminGroups.homepage,
    description: 'The homepage section with Enterprise and Early-stage.',
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
      name: 'image',
      type: 'upload',
      label: 'Photo',
      relationTo: 'media',
      admin: {
        description: 'The picture beside the service list. Choose a different file to replace it.',
      },
    },
    {
      name: 'imageAlt',
      type: 'text',
    },
    {
      name: 'groups',
      type: 'array',
      label: 'Service groups',
      labels: {
        singular: 'Group',
        plural: 'Groups',
      },
      fields: [
        {
          name: 'index',
          type: 'text',
          label: 'Number',
          admin: {
            hidden: true,
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'icon',
          type: 'upload',
          label: 'Icon',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'The icon on this card. Choose a different file to replace it.',
          },
        },
        sizeField('iconWidth', 'Icon width (pixels)'),
        sizeField('iconHeight', 'Icon height (pixels)'),
        {
          name: 'items',
          type: 'array',
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
