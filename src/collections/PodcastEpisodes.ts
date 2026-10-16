import type { CollectionConfig, PayloadRequest } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { seoFields } from '@/admin/editor-fields'
import { podcastEpisodePath, podcastSlugFromHref, slugifyPodcastTitle } from '@/lib/podcast-slug'

async function channelTitle(
  req: PayloadRequest,
  channel: number | { id?: number; title?: string | null } | null | undefined,
): Promise<string | undefined> {
  if (!channel) return undefined
  if (typeof channel === 'object' && typeof channel.title === 'string' && channel.title.trim()) {
    return channel.title.trim()
  }
  const id = typeof channel === 'number' ? channel : channel.id
  if (typeof id !== 'number') return undefined
  try {
    const doc = await req.payload.findByID({
      collection: 'podcast-channels',
      id,
      depth: 0,
      overrideAccess: true,
    })
    return typeof doc?.title === 'string' ? doc.title.trim() : undefined
  } catch {
    return undefined
  }
}

export const PodcastEpisodes: CollectionConfig = {
  slug: 'podcast-episodes',
  labels: {
    singular: 'Episode',
    plural: 'Episodes',
  },
  admin: {
    group: adminGroups.podcast,
    description:
      'Every podcast episode belongs to a channel. Mark Featured to show it in the homepage Newest podcast section.',
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'channel', 'featured', 'guests'],
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

        const channelValue =
          data.channel !== undefined ? data.channel : (originalDoc?.channel as typeof data.channel)
        const fromChannel = await channelTitle(req, channelValue)
        if (fromChannel) data.category = fromChannel

        const imageSource =
          typeof data.imageSource === 'string'
            ? data.imageSource
            : typeof originalDoc?.imageSource === 'string'
              ? originalDoc.imageSource
              : 'upload'
        data.imageSource = imageSource === 'url' ? 'url' : 'upload'
        if (data.imageSource === 'url') {
          data.image = null
        } else if (typeof data.imageUrl === 'string' && !data.imageUrl.trim()) {
          data.imageUrl = null
        }

        const audioSource =
          typeof data.audioSource === 'string'
            ? data.audioSource
            : typeof originalDoc?.audioSource === 'string'
              ? originalDoc.audioSource
              : 'url'
        data.audioSource = audioSource === 'upload' ? 'upload' : 'url'
        if (data.audioSource === 'url') {
          data.audio = null
        } else {
          // Uploaded audio live on disk (podcast-audio); keep mediaUrl in sync for the site player.
          const audioValue = data.audio !== undefined ? data.audio : originalDoc?.audio
          const audioId = typeof audioValue === 'number' ? audioValue : audioValue?.id
          if (typeof audioId === 'number') {
            try {
              const audioDoc = await req.payload.findByID({
                collection: 'podcast-audio',
                id: audioId,
                depth: 0,
                overrideAccess: true,
              })
              if (typeof audioDoc?.url === 'string' && audioDoc.url) data.mediaUrl = audioDoc.url
            } catch {
              // leave mediaUrl unchanged if lookup fails
            }
          }
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
      name: 'channel',
      type: 'relationship',
      relationTo: 'podcast-channels',
      label: 'Channel',
      required: true,
      admin: {
        description: 'Required. Create channels under Podcast → Channels.',
      },
    },
    { name: 'title', type: 'text', required: true },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured',
      defaultValue: true,
      admin: {
        description:
          'Featured episodes appear in the homepage Newest podcast section.',
        components: {
          Cell: '@/components/admin/featured-cell#FeaturedCell',
        },
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Page address',
      required: true,
      unique: true,
      admin: { hidden: true },
    },
    {
      name: 'href',
      type: 'text',
      required: true,
      admin: { hidden: true },
    },
    {
      name: 'category',
      type: 'text',
      label: 'Category',
      admin: { hidden: true },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Order',
      required: true,
      defaultValue: 0,
      admin: { hidden: true },
    },
    {
      name: 'meta',
      type: 'text',
      label: 'Length',
      required: true,
      admin: { description: 'Shown on the thumbnail, for example 14:22.' },
    },
    { name: 'guests', type: 'text', required: true },
    {
      name: 'imageSource',
      type: 'radio',
      label: 'Picture',
      defaultValue: 'upload',
      options: [
        { label: 'Upload image', value: 'upload' },
        { label: 'Image URL', value: 'url' },
      ],
      admin: {
        layout: 'horizontal',
        description: 'Choose how to set the cover photo for the card and episode page.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      label: 'Upload image',
      relationTo: 'media',
      admin: {
        condition: (_data, siblingData) => siblingData?.imageSource !== 'url',
        description: 'Upload or drag and drop a cover photo.',
        components: {
          Field: '@/components/admin/direct-upload-field#DirectUploadField',
        },
        custom: {
          relationTo: 'media',
          accept: 'image/*',
          emptyLabel: 'Upload or drag and drop an image',
        },
      },
    },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Image URL',
      admin: {
        condition: (_data, siblingData) => siblingData?.imageSource === 'url',
        description: 'Paste a direct image address (https://…).',
      },
    },
    { name: 'imageAlt', type: 'text', label: 'Image alt' },
    {
      name: 'audioSource',
      type: 'radio',
      label: 'Audio',
      defaultValue: 'url',
      options: [
        { label: 'Upload', value: 'upload' },
        { label: 'URL', value: 'url' },
      ],
      admin: {
        layout: 'horizontal',
        description: 'Episode audio. Uploads are stored on this server for now (S3 later).',
      },
    },
    {
      name: 'audio',
      type: 'upload',
      label: 'Upload audio',
      relationTo: 'podcast-audio',
      admin: {
        condition: (_data, siblingData) => siblingData?.audioSource === 'upload',
        description: 'Upload or drag and drop an audio file (mp3, wav, m4a, …).',
        components: {
          Field: '@/components/admin/direct-upload-field#DirectUploadField',
        },
        custom: {
          relationTo: 'podcast-audio',
          accept: 'audio/*',
          emptyLabel: 'Upload or drag and drop an audio file',
        },
      },
    },
    {
      name: 'mediaUrl',
      type: 'text',
      label: 'Audio URL',
      admin: {
        condition: (_data, siblingData) => siblingData?.audioSource !== 'upload',
        description: 'Paste an audio file URL, or a YouTube / Vimeo link.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Short summary',
      admin: { description: 'Shown on the podcast list and cards.' },
    },
    {
      name: 'stats',
      type: 'text',
      label: 'Plays and date',
      admin: { hidden: true },
    },
    {
      name: 'heroFeatured',
      type: 'checkbox',
      label: 'Show as list hero',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Large featured episode at the top of /podcast.',
      },
    },

    {
      type: 'collapsible',
      label: 'About this episode',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'summary',
          type: 'textarea',
          label: 'Summary',
          admin: {
            description: 'Main About text. Prefer this over the fallback below.',
          },
        },
        {
          name: 'about',
          type: 'textarea',
          label: 'About (fallback)',
          admin: { description: 'Used only when Summary is empty.' },
        },
        {
          name: 'mainPoints',
          type: 'array',
          label: 'Main points',
          labels: { singular: 'Main point', plural: 'Main points' },
          maxRows: 10,
          fields: [{ name: 'point', type: 'text', required: true, label: 'Point' }],
        },
      ],
    },

    {
      type: 'collapsible',
      label: 'Agree, disagree, and take',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'reading',
          type: 'textarea',
          label: 'Where we agree and where we don’t',
          admin: { description: 'Short intro above the two columns.' },
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
      ],
    },

    {
      type: 'collapsible',
      label: 'Transcript',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'transcript',
          type: 'array',
          label: 'Transcript lines',
          admin: { description: 'One row per speaker turn.' },
          fields: [
            {
              name: 'time',
              type: 'text',
              label: 'Time',
              required: true,
              admin: { description: 'For example 2:14.' },
            },
            { name: 'speaker', type: 'text', required: true },
            { name: 'text', type: 'textarea', label: 'What they said', required: true },
          ],
        },
      ],
    },
    ...seoFields({
      initCollapsed: true,
    }),
  ],
}
