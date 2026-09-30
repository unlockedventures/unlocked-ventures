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
    description: 'Articles shown in News and blogs on the homepage. The heading is edited under News and blogs.',
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
    { name: 'image', type: 'upload', relationTo: 'media' },
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
