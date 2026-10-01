import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'

export const OurSuccesses: GlobalConfig = {
  slug: 'our-successes',
  label: 'Our successes page',
  admin: {
    group: adminGroups.successStories,
    description: 'Heading, introduction, and filter labels for the success stories page. The stories themselves are edited under Case studies.',
    hideAPIURL: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'metaTitle', type: 'text', label: 'Browser tab title', required: true },
    { name: 'homeLabel', type: 'text', required: true },
    { name: 'homeHref', type: 'text', required: true },
    { name: 'currentLabel', type: 'text', label: 'Current page name', required: true },
    { name: 'title', type: 'text', label: 'Heading', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'categoryPrefix', type: 'text', label: 'Category filter label', required: true },
    { name: 'allLabel', type: 'text', label: 'All categories label', required: true },
    { name: 'emptyLabel', type: 'text', label: 'Empty category message', required: true },
    { name: 'seeMoreLabel', type: 'text', label: 'See more button', required: true },
  ],
}
