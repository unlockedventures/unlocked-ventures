import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { relatedItemsField } from '@/admin/editor-fields'

export const LatestNews: GlobalConfig = {
  slug: 'latest-news',
  label: 'News and blogs',
  admin: {
    group: adminGroups.homepage,
    description: 'The heading above the news cards. Each article, including its picture, is listed below.',
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
      help: 'These articles appear under the heading, in this order. Drag a row to move it. Open Change to replace a picture or edit the words, or remove an article.',
    }),
  ],
}
