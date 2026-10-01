import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { relatedItemsField } from '@/admin/editor-fields'

export const LatestNews: GlobalConfig = {
  slug: 'latest-news',
  label: 'News and blogs',
  admin: {
    group: adminGroups.homepage,
    description: 'The heading above the news cards. Articles marked Show on the homepage are listed below.',
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
      name: 'articles',
      label: 'Articles',
      collection: 'news-posts',
      titleField: 'title',
      imageField: 'image',
      singular: 'article',
      plural: 'articles',
      help: 'Only articles marked Show on the homepage appear here and on the site, in this order. Turn that on from News and blogs.',
      readOnly: true,
      manageLabel: 'News and blogs',
      where: 'where[featured][equals]=true',
    }),
  ],
}
