import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { podcastEpisodePath, podcastSlugFromHref, slugifyPodcastTitle } from '@/lib/podcast-slug'

export const PodcastEpisodes: CollectionConfig = {
  slug: 'podcast-episodes',
  labels: {
    singular: 'Episode',
    plural: 'Podcast',
  },
  admin: {
    group: adminGroups.podcast,
    description:
      'Every podcast episode. A new episode appears as a homepage card. Uncheck Show on the homepage to hide it. The box saves when you click it.',
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'featured', 'guests', 'image', 'sortOrder'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        const title = typeof data.title === 'string' ? data.title : originalDoc?.title
        let slug = typeof data.slug === 'string' ? data.slug.trim() : ''
        if (!slug && typeof title === 'string') slug = slugifyPodcastTitle(title)
        if (!slug && typeof data.href === 'string') slug = podcastSlugFromHref(data.href) || ''
        if (!slug && typeof originalDoc?.slug === 'string') slug = originalDoc.slug
        if (!slug && typeof originalDoc?.href === 'string') {
          slug = podcastSlugFromHref(originalDoc.href) || slugifyPodcastTitle(originalDoc.title || '')
        }
        if (slug) {
          data.slug = slug
          data.href = podcastEpisodePath(slug)
        }

        if (operation !== 'create') return data
        if (typeof data.featured !== 'boolean') data.featured = true

        const highest = await req.payload.find({
          collection: 'podcast-episodes',
          depth: 0,
          limit: 1,
          overrideAccess: true,
          sort: '-sortOrder',
        })
        const maxOrder = highest.docs[0]?.sortOrder
        if (typeof data.sortOrder !== 'number' || data.sortOrder === 0) {
          data.sortOrder = typeof maxOrder === 'number' ? maxOrder + 1 : 0
        }
        return data
      },
    ],
  },
  defaultSort: 'sortOrder',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Card',
          description: 'The homepage card and the Listen next row.',
          fields: [
            {
              name: 'meta',
              type: 'text',
              label: 'Length',
              required: true,
              admin: { description: 'Shown on the thumbnail, for example 14:22.' },
            },
            { name: 'title', type: 'text', required: true },
            {
              name: 'slug',
              type: 'text',
              label: 'Page address',
              required: true,
              unique: true,
              admin: {
                description:
                  'Opens this episode at /podcast/your-text. Leave blank when creating and it is filled from the title. Put YouTube or audio links in Audio or video link on the Episode page tab.',
              },
            },
            { name: 'guests', type: 'text', required: true },
            {
              name: 'href',
              type: 'text',
              required: true,
              admin: { hidden: true },
            },
            {
              name: 'image',
              type: 'upload',
              label: 'Picture',
              relationTo: 'media',
              admin: { description: 'The photo on this episode. Choose a different file to replace it.' },
            },
            { name: 'imageAlt', type: 'text' },
          ],
        },
        {
          label: 'Episode page',
          description: 'What people see after they open this episode.',
          fields: [
            {
              name: 'category',
              type: 'text',
              label: 'Category',
              admin: { description: 'The small label above the title, for example Artificial Intelligence (AI).' },
            },
            {
              name: 'excerpt',
              type: 'textarea',
              label: 'List excerpt',
              admin: { description: 'Short summary on the podcast list hero and cards.' },
            },
            {
              name: 'stats',
              type: 'text',
              label: 'Plays and date',
              admin: { description: 'For example: 135K plays · 12 days ago' },
            },
            {
              name: 'heroFeatured',
              type: 'checkbox',
              label: 'Show as list hero',
              defaultValue: false,
              admin: { description: 'The large featured episode at the top of /podcast.' },
            },
            {
              name: 'mediaUrl',
              type: 'text',
              label: 'Audio or video link',
              admin: {
                description:
                  'Paste a file address, or a YouTube or Vimeo link. When this is filled in, the play button on the site plays it. Leave it empty to show the picture only.',
              },
            },
            {
              name: 'about',
              type: 'textarea',
              label: 'About this episode',
            },
            {
              name: 'reading',
              type: 'textarea',
              label: 'Where we agree and where we don\'t',
              admin: { description: 'The short introduction above the two columns.' },
            },
            {
              name: 'agree',
              type: 'array',
              label: 'We agree',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'body', type: 'textarea', required: true },
              ],
            },
            {
              name: 'disagree',
              type: 'array',
              label: 'We disagree',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'body', type: 'textarea', required: true },
              ],
            },
            {
              name: 'takeIntro',
              type: 'textarea',
              label: 'The Unlocked Ventures take',
              admin: { description: 'The paragraph under the heading.' },
            },
            {
              name: 'take',
              type: 'array',
              label: 'Steps',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'body', type: 'textarea', required: true },
              ],
            },
            {
              name: 'transcript',
              type: 'array',
              label: 'Transcript',
              admin: { description: 'Shown when someone clicks Transcript. Add one row per speaker turn.' },
              fields: [
                { name: 'time', type: 'text', label: 'Time', required: true, admin: { description: 'For example 2:14.' } },
                { name: 'speaker', type: 'text', required: true },
                { name: 'text', type: 'textarea', label: 'What they said', required: true },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Show on the homepage',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Uncheck this to hide the episode from the homepage.',
        components: {
          Cell: '@/components/admin/featured-cell#FeaturedCell',
        },
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Order',
      required: true,
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
  ],
}
