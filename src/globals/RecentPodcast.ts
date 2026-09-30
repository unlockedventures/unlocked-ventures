import type { GlobalConfig } from 'payload'

export const RecentPodcast: GlobalConfig = {
  slug: 'recent-podcast',
  label: 'Recent Podcast',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'episodes',
      type: 'array',
      labels: {
        singular: 'Episode',
        plural: 'Episodes',
      },
      fields: [
        {
          name: 'meta',
          type: 'text',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'guests',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'imageAlt',
          type: 'text',
        },
      ],
    },
  ],
}
