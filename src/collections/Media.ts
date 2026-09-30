import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'File',
    plural: 'Images and files',
  },
  admin: {
    group: adminGroups.library,
    description: 'Photos and logos used across the site. Each one needs a short description.',
    hideAPIURL: true,
  },
  access: {
    read: () => true,
  },
  fields: [
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
