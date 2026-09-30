import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { linkField } from '@/admin/editor-fields'

export const NewsPosts: CollectionConfig = {
  slug: 'news-posts',
  labels: {
    singular: 'News article',
    plural: 'News articles',
  },
  admin: {
    group: adminGroups.homepage,
    hidden: true,
    description: 'Articles shown under News and blogs. Add, replace, reorder, and remove them from News and blogs.',
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'sortOrder'],
  },
  access: {
    read: () => true,
  },
  defaultSort: 'sortOrder',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'excerpt', type: 'textarea', required: true },
    linkField(),
    { name: 'ctaLabel', type: 'text', label: 'Button text', required: true, defaultValue: 'Read More' },
    { name: 'image', type: 'upload', label: 'Picture', relationTo: 'media', admin: { description: 'The photo on this article. Choose a different file to replace it.' } },
    { name: 'imageAlt', type: 'text' },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Order',
      required: true,
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
  ],
}
