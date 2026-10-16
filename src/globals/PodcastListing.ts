import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { seoFields } from '@/admin/editor-fields'

export const PodcastListing: GlobalConfig = {
  slug: 'podcast-listing',
  label: 'Podcast list page',
  admin: {
    group: adminGroups.pages,
    description:
      'Heading, browse chips, and subscribe row for /podcast. Episode filters use Channels; keep browse chips in sync with channel names if you use them.',
    hideAPIURL: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    ...seoFields({ required: true }),
    { name: 'homeLabel', type: 'text', required: true },
    { name: 'homeHref', type: 'text', required: true },
    { name: 'currentLabel', type: 'text', label: 'Current page name', required: true },
    { name: 'title', type: 'text', label: 'Heading', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'watchNowLabel', type: 'text', label: 'Hero button', required: true, defaultValue: 'Watch now' },
    { name: 'browseTitle', type: 'text', label: 'Browse heading', required: true },
    { name: 'viewAllCategoriesLabel', type: 'text', required: true },
    {
      name: 'categories',
      type: 'array',
      label: 'Browse categories',
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    { name: 'featuredTitle', type: 'text', label: 'Featured heading', required: true },
    { name: 'exploreTitle', type: 'text', label: 'Explore heading', required: true },
    { name: 'sortLabel', type: 'text', required: true, defaultValue: 'Select category' },
    { name: 'sortAllLabel', type: 'text', required: true, defaultValue: 'All' },
    {
      name: 'uncategorizedLabel',
      type: 'text',
      label: 'Fallback category label',
      required: true,
      defaultValue: 'Podcast',
      admin: { description: 'Used when an episode has no category set.' },
    },
    {
      name: 'previousCategoriesLabel',
      type: 'text',
      label: 'Previous categories button label',
      required: true,
      defaultValue: 'Previous categories',
    },
    {
      name: 'nextCategoriesLabel',
      type: 'text',
      label: 'Next categories button label',
      required: true,
      defaultValue: 'Next categories',
    },
    { name: 'seeMoreLabel', type: 'text', required: true, defaultValue: 'See more' },
    { name: 'emptyLabel', type: 'text', required: true, defaultValue: 'No episodes yet.' },
    { name: 'subscribeTitle', type: 'text', required: true },
    { name: 'subscribeDescription', type: 'text', required: true },
    {
      name: 'subscribe',
      type: 'array',
      label: 'Subscribe platforms',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
        { name: 'logo', type: 'upload', relationTo: 'media', required: true },
        { name: 'width', type: 'number', required: true },
        { name: 'height', type: 'number', required: true },
      ],
    },
  ],
}
