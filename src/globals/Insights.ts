import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'

export const Insights: GlobalConfig = {
  slug: 'insights',
  label: 'Insights page',
  admin: {
    group: adminGroups.pages,
    description:
      'Heading and introduction for the Insights blog list. Articles themselves are edited under News and blogs.',
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
    { name: 'emptyLabel', type: 'text', label: 'Empty list message', required: true },
    { name: 'seeMoreLabel', type: 'text', label: 'See more button', required: true },
    {
      name: 'listTitle',
      type: 'text',
      label: 'Latest list heading',
      required: true,
      defaultValue: 'Latest news & blogs',
    },
    {
      name: 'sortLabel',
      type: 'text',
      label: 'Sort label',
      required: true,
      defaultValue: 'Sort category',
    },
    {
      name: 'sortAllLabel',
      type: 'text',
      label: 'Sort “All” option',
      required: true,
      defaultValue: 'All',
    },
    {
      name: 'readArticleLabel',
      type: 'text',
      label: 'Article link text',
      required: true,
      defaultValue: 'Read article',
    },
    {
      name: 'featuredTagLabel',
      type: 'text',
      label: 'Featured tag',
      required: true,
      defaultValue: 'Feature',
    },
    { name: 'tocTitle', type: 'text', label: 'Table of contents heading', required: true },
    { name: 'shareTitle', type: 'text', label: 'Share heading', required: true },
    { name: 'relatedTitle', type: 'text', label: 'Related articles heading', required: true },
  ],
}
