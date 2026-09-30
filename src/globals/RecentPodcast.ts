import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'

export const RecentPodcast: GlobalConfig = {
  slug: 'recent-podcast',
  label: 'Podcast',
  admin: {
    group: adminGroups.homepage,
    description: 'The heading above the podcast episodes. The episodes themselves are edited under Podcast episodes.',
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
  ],
}
