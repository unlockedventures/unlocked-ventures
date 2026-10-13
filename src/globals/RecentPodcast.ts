import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { relatedItemsField } from '@/admin/editor-fields'

export const RecentPodcast: GlobalConfig = {
  slug: 'recent-podcast',
  label: 'Podcast',
  admin: {
    group: adminGroups.homepage,
    description: 'The heading above the podcast cards. Add, edit, reorder, or remove the cards below.',
    hideAPIURL: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Heading',
      required: true,
    },
    relatedItemsField({
      name: 'episodes',
      label: 'Episodes',
      collection: 'podcast-episodes',
      titleField: 'title',
      imageField: 'image',
      singular: 'episode',
      plural: 'episodes',
      help: 'Shows episodes marked Featured. Drag a row to change the order. Open Change to edit it, or remove it.',
      where: 'where[featured][equals]=true',
    }),
  ],
}
