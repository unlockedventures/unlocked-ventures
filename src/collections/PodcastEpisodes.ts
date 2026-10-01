import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { linkField } from '@/admin/editor-fields'

export const PodcastEpisodes: CollectionConfig = {
  slug: 'podcast-episodes',
  labels: {
    singular: 'Episode',
    plural: 'Podcast',
  },
  admin: {
    group: adminGroups.podcast,
    description:
      'Every podcast episode. Check Show on the homepage to include an episode there. The box saves when you click it.',
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'featured', 'guests', 'image', 'sortOrder'],
  },
  access: {
    read: () => true,
  },
  defaultSort: 'sortOrder',
  fields: [
    { name: 'meta', type: 'text', label: 'Date and length', required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'guests', type: 'text', required: true },
    linkField(),
    { name: 'image', type: 'upload', label: 'Picture', relationTo: 'media', admin: { description: 'The photo on this episode. Choose a different file to replace it.' } },
    { name: 'imageAlt', type: 'text' },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Show on the homepage',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Turn this on to include this episode in the homepage Podcast section.',
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
