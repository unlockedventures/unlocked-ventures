import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'

export const PodcastPage: GlobalConfig = {
  slug: 'podcast-page',
  label: 'Podcast page',
  admin: {
    group: adminGroups.pages,
    description: 'The featured episode, chapters, and subscribe links on the podcast page.',
    hideAPIURL: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'breadcrumbHomeLabel', type: 'text', required: true },
    { name: 'breadcrumbHomeHref', type: 'text', required: true },
    { name: 'breadcrumbPodcastLabel', type: 'text', required: true },
    { name: 'breadcrumbPodcastHref', type: 'text', required: true },
    { name: 'category', type: 'text', required: true },
    { name: 'title', type: 'text', label: 'Episode title', required: true },
    { name: 'meta', type: 'text', label: 'Episode details', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'cover', type: 'upload', relationTo: 'media', required: true },
    { name: 'coverAlt', type: 'text', required: true },
    { name: 'timeLabel', type: 'text', label: 'Time shown on the player', required: true },
    { name: 'progress', type: 'number', label: 'Playback progress', required: true, min: 0, max: 1 },
    { name: 'shareLabel', type: 'text', required: true },
    { name: 'saveLabel', type: 'text', required: true },
    { name: 'likeLabel', type: 'text', required: true },
    { name: 'transcriptLabel', type: 'text', required: true },
    { name: 'chaptersTitle', type: 'text', required: true },
    {
      name: 'chapters',
      type: 'array',
      fields: [
        { name: 'time', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
      ],
    },
    { name: 'listenNextTitle', type: 'text', required: true },
    {
      name: 'listenNext',
      type: 'array',
      fields: [
        { name: 'meta', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    { name: 'allEpisodesLabel', type: 'text', required: true },
    { name: 'allEpisodesHref', type: 'text', required: true },
    { name: 'subscribeTitle', type: 'text', required: true },
    {
      name: 'subscribe',
      type: 'array',
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
