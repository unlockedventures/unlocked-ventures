import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { linkField } from '@/admin/editor-fields'

export const NewsPosts: CollectionConfig = {
  slug: 'news-posts',
  labels: {
    singular: 'Article',
    plural: 'News and blogs',
  },
  admin: {
    group: adminGroups.news,
    description:
      'Every news article. Check Show on the homepage to include an article there. The box saves when you click it.',
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'featured', 'sortOrder'],
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
      name: 'featured',
      type: 'checkbox',
      label: 'Show on the homepage',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Turn this on to include this article in the homepage News and blogs section.',
        components: {
          Cell: '@/components/admin/featured-cell#FeaturedCell',
        },
      },
    },
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
