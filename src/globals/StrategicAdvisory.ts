import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { buttonGroup, linkField, sizeField } from '@/admin/editor-fields'
import {
  homeMenuGroupField,
  homeMenuSourceField,
  homeMenuPresentationArchive,
  homeMenuPresentationAdmin,
} from '@/admin/home-menu-fields'
import { protectHomeMenuSource } from '@/hooks/home-menu-source'

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
  hooks: { beforeValidate: [protectHomeMenuSource] },
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
    homeMenuSourceField,
    homeMenuPresentationArchive,
    {
      name: 'groups',
      type: 'array',
      label: 'Card presentation',
      labels: {
        singular: 'Card',
        plural: 'Cards',
      },
      admin: homeMenuPresentationAdmin,
      fields: [
        homeMenuGroupField,
        {
          name: 'title',
          type: 'text',
          label: 'Previous card title (preserved)',
          admin: { hidden: true },
        },
        {
          name: 'icon',
          type: 'upload',
          label: 'Icon',
          relationTo: 'media',
          admin: {
            description: 'The icon on this card. Choose a different file to replace it.',
          },
        },
        { ...sizeField('iconWidth', 'Icon width (pixels)'), defaultValue: 90 },
        { ...sizeField('iconHeight', 'Icon height (pixels)'), defaultValue: 90 },
        {
          name: 'items',
          type: 'array',
          admin: {
            hidden: true,
            description:
              'Previous offerings are preserved. Select a Header menu source to inherit current links.',
          },
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
