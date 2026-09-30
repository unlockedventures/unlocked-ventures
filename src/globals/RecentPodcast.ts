import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { relatedItemsField } from '@/admin/editor-fields'

export const RecentPodcast: GlobalConfig = {
  slug: 'recent-podcast',
  label: 'Podcast',
  admin: {
    group: adminGroups.homepage,
    description: 'The heading above the podcast episodes. Each episode, including its picture, is listed below.',
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
      help: 'These episodes appear under the heading, in this order. Drag a row to move it. Open Change to replace a picture or edit the details, or remove an episode.',
    }),
  ],
}
