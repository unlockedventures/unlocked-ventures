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
      name: 'image',
      type: 'upload',
      label: 'Photo',
      relationTo: 'media',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'imageAlt',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'groups',
      type: 'array',
      label: 'Service group presentation',
      admin: homeMenuPresentationAdmin,
      labels: {
        singular: 'Group',
        plural: 'Groups',
      },
      fields: [
        homeMenuGroupField,
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
          label: 'Previous group title (preserved)',
          admin: { hidden: true },
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
              'Preserved previous links. Current offerings come from the selected Header menu.',
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
