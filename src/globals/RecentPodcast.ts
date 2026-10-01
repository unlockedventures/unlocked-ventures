import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { relatedItemsField } from '@/admin/editor-fields'

export const RecentPodcast: GlobalConfig = {
  slug: 'recent-podcast',
  label: 'Podcast',
  admin: {
    group: adminGroups.homepage,
    description: 'The heading above the podcast episodes. Episodes marked Show on the homepage are listed below.',
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
      help: 'Only episodes marked Show on the homepage appear here and on the site, in this order. Turn that on from Podcast.',
      readOnly: true,
      manageLabel: 'Podcast',
      where: 'where[featured][equals]=true',
    }),
  ],
}
