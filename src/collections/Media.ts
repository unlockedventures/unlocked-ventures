import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'File',
    plural: 'All files',
  },
  admin: {
    group: adminGroups.library,
    description:
      'Every photo and logo already uploaded. Change a picture on its section. Open a file here to reuse it, update its description, or delete one that is no longer used.',
    hideAPIURL: true,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'kind', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      label: 'Type',
      required: true,
      defaultValue: 'image',
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Icon', value: 'icon' },
        { label: 'File', value: 'file' },
      ],
      admin: {
        position: 'sidebar',
        description: 'This chooses the All files submenu: Images, Icons, or Files.',
      },
    },
    {
      name: 'alt',
      type: 'text',
      label: 'Description',
      required: true,
      admin: {
        description: 'A short sentence describing the picture, for people who cannot see it.',
      },
    },
  ],
  upload: true,
}
