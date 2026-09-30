import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'

export const LatestNews: GlobalConfig = {
  slug: 'latest-news',
  label: 'News and blogs',
  admin: {
    group: adminGroups.homepage,
    description: 'The heading above the news cards. The articles themselves are edited under News articles.',
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
