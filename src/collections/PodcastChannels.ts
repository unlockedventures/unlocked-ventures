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
    description:
      'Show or topic for podcast episodes. Channels cannot be deleted — turn Active off to hide a channel (and its episodes) on the site.',
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'active', 'description'],
    components: {
      beforeListTable: ['@/components/admin/channel-bulk-active-actions#ChannelBulkActiveActions'],
    },
  },
  access: {
    read: () => true,
    delete: () => false,
  },
  disableBulkDelete: true,
  disableBulkEdit: true,
  hooks: {
    beforeDelete: [
      () => {
        throw new Error('Channels cannot be deleted. Set Active to off to hide the channel on the site.')
      },
    ],
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        const title = typeof data.title === 'string' ? data.title : originalDoc?.title
        let slug = typeof data.slug === 'string' ? data.slug.trim() : ''
        if (!slug && typeof title === 'string') slug = slugifyPodcastTitle(title)
        if (!slug && typeof originalDoc?.slug === 'string') slug = originalDoc.slug
        if (slug) data.slug = slug

        if (typeof data.active !== 'boolean' && typeof originalDoc?.active !== 'boolean') {
          data.active = true
        }

        if (operation === 'create') {
          if (typeof data.active !== 'boolean') data.active = true
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
      name: 'active',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description:
          'When off, this channel and its episodes are hidden on the public site. Channels cannot be deleted.',
        components: {
          Cell: '@/components/admin/boolean-toggle-cell#BooleanToggleCell',
        },
      },
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
