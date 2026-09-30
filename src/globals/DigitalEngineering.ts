import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { buttonGroup, linkField } from '@/admin/editor-fields'

export const DigitalEngineering: GlobalConfig = {
  slug: 'digital-engineering',
  label: 'Digital Engineering',
  admin: {
    group: adminGroups.homepage,
    description: 'The homepage section with the photo and the list of engineering services.',
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
      relationTo: 'media',
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
          required: true,
          admin: {
            description: 'The small number beside the heading, such as 01.',
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
