import type { GlobalConfig } from 'payload'

export const LatestNews: GlobalConfig = {
  slug: 'latest-news',
  label: 'Latest News',
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
      name: 'posts',
      type: 'array',
      labels: {
        singular: 'Post',
        plural: 'Posts',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'excerpt',
          type: 'textarea',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
        {
          name: 'ctaLabel',
          type: 'text',
          defaultValue: 'Read More',
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
