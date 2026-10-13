import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { slugifyPodcastTitle } from '@/lib/podcast-slug'

export const PodcastChannels: CollectionConfig = {
  slug: 'podcast-channels',
  labels: {
    singular: 'Channel',
    plural: 'Channels',
  },
  admin: {
    group: adminGroups.podcast,
    description: 'Show or topic for podcast episodes. Every episode must belong to one channel.',
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'description'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        const title = typeof data.title === 'string' ? data.title : originalDoc?.title
        let slug = typeof data.slug === 'string' ? data.slug.trim() : ''
        if (!slug && typeof title === 'string') slug = slugifyPodcastTitle(title)
        if (!slug && typeof originalDoc?.slug === 'string') slug = originalDoc.slug
        if (slug) data.slug = slug

        if (operation === 'create') {
          if (typeof data.sortOrder !== 'number' || data.sortOrder === 0) {
            const highest = await req.payload.find({
              collection: 'podcast-channels',
              depth: 0,
              limit: 1,
              overrideAccess: true,
              sort: '-sortOrder',
            })
            const maxOrder = highest.docs[0]?.sortOrder
            data.sortOrder = typeof maxOrder === 'number' ? maxOrder + 1 : 0
          }
        }
        return data
      },
    ],
  },
  defaultSort: 'sortOrder',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Channel name',
      required: true,
      admin: { description: 'Shown on episode cards and filters, for example Artificial Intelligence.' },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Address',
      unique: true,
      admin: { hidden: true },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Short description',
      admin: { description: 'Optional. Helps editors know what belongs in this channel.' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Order',
      required: true,
      defaultValue: 0,
      admin: { hidden: true },
    },
  ],
}
