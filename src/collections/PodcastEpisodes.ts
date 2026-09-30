import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { linkField } from '@/admin/editor-fields'

export const PodcastEpisodes: CollectionConfig = {
  slug: 'podcast-episodes',
  labels: {
    singular: 'Podcast episode',
    plural: 'Podcast episodes',
  },
  admin: {
    group: adminGroups.homepage,
    hidden: true,
    description: 'Episodes shown under Podcast. Add, replace, reorder, and remove them from Podcast.',
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'sortOrder'],
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
      name: 'sortOrder',
      type: 'number',
      label: 'Order',
      required: true,
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
  ],
}
