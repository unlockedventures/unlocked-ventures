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
    description: 'Episodes shown on the homepage. The heading is edited under Podcast.',
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
