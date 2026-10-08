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
      'Every podcast episode. A new episode appears as a homepage card. Uncheck Show on the homepage to hide it. The box saves when you click it.',
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'featured', 'guests', 'image', 'sortOrder'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        if (typeof data.featured !== 'boolean') data.featured = true

        const highest = await req.payload.find({
          collection: 'podcast-episodes',
          depth: 0,
          limit: 1,
          overrideAccess: true,
          sort: '-sortOrder',
        })
        const maxOrder = highest.docs[0]?.sortOrder
        if (typeof data.sortOrder !== 'number' || data.sortOrder === 0) {
          data.sortOrder = typeof maxOrder === 'number' ? maxOrder + 1 : 0
        }
        return data
      },
    ],
  },
  defaultSort: 'sortOrder',
  fields: [
    {
      name: 'meta',
      type: 'text',
      label: 'Length',
      required: true,
      admin: { description: 'Shown on the thumbnail, for example 14:22.' },
    },
    { name: 'title', type: 'text', required: true },
    { name: 'guests', type: 'text', required: true },
    linkField(),
    { name: 'image', type: 'upload', label: 'Picture', relationTo: 'media', admin: { description: 'The photo on this episode. Choose a different file to replace it.' } },
    { name: 'imageAlt', type: 'text' },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Show on the homepage',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Uncheck this to hide the episode from the homepage.',
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
