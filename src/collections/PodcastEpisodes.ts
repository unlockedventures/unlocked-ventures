import type { CollectionConfig, PayloadRequest } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { seoFields } from '@/admin/editor-fields'
import { podcastEpisodePath, podcastSlugFromHref, slugifyPodcastTitle } from '@/lib/podcast-slug'
import { applyAiContentToEpisode } from '@/pipeline/apply-ai-content'
import { episodeAiEndpoints } from '@/pipeline/episode-ai-endpoints'

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

const isAiMode = (_data: unknown, siblingData: { editorMode?: string } | undefined) =>
  siblingData?.editorMode === 'ai'

const isManualMode = (_data: unknown, siblingData: { editorMode?: string } | undefined) =>
  siblingData?.editorMode !== 'ai'

export const PodcastEpisodes: CollectionConfig = {
  slug: 'podcast-episodes',
  labels: {
    singular: 'Episode',
    plural: 'Episodes',
  },
  admin: {
    group: adminGroups.podcast,
    description:
      'Create with AI (video links → transcript/script) or Create Manually. Save as Draft or Save as Complete. Only Complete episodes appear on the site.',
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'channel', 'editorMode', 'episodeStatus', 'featured', 'guests'],
    components: {
      beforeList: ['@/components/admin/episode-create-actions#EpisodeCreateActions'],
      edit: {
        SaveButton: '@/components/admin/episode-save-buttons#EpisodeSaveButtons',
      },
    },
  },
  access: {
    read: () => true,
  },
  endpoints: episodeAiEndpoints,
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req, context }) => {
        if (!data.episodeStatus) {
          data.episodeStatus =
            typeof originalDoc?.episodeStatus === 'string' ? originalDoc.episodeStatus : 'draft'
        }
        if (!data.editorMode) {
          data.editorMode =
            typeof originalDoc?.editorMode === 'string' ? originalDoc.editorMode : 'manual'
        }

        const title = typeof data.title === 'string' ? data.title : originalDoc?.title
        let slug = typeof data.slug === 'string' ? data.slug.trim() : ''
        if (!slug && typeof title === 'string') slug = slugifyPodcastTitle(title)
        if (!slug && typeof data.href === 'string') slug = podcastSlugFromHref(data.href) || ''
        if (!slug && typeof originalDoc?.slug === 'string') slug = originalDoc.slug
        if (!slug && typeof originalDoc?.href === 'string') {
          slug = podcastSlugFromHref(originalDoc.href) || slugifyPodcastTitle(originalDoc.title || '')
        }
        if (!slug) slug = `episode-${Date.now()}`
        data.slug = slug
        data.href = podcastEpisodePath(slug)

        const channelValue =
          data.channel !== undefined ? data.channel : (originalDoc?.channel as typeof data.channel)
        const fromChannel = await channelTitle(req, channelValue)
        if (fromChannel) data.category = fromChannel

        if (typeof data.meta !== 'string' || !data.meta.trim()) {
          const prior = typeof originalDoc?.meta === 'string' ? originalDoc.meta : ''
          data.meta = prior.trim() || '—'
        }
        if (typeof data.guests !== 'string' || !data.guests.trim()) {
          const prior = typeof originalDoc?.guests === 'string' ? originalDoc.guests : ''
          data.guests = prior.trim() || (data.editorMode === 'ai' ? 'Host & Guest' : 'TBD')
        }

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

        if (!context?.skipAiContentSync && data.editorMode === 'ai') {
          const merged = {
            sourceTranscript:
              data.sourceTranscript !== undefined
                ? data.sourceTranscript
                : originalDoc?.sourceTranscript,
            scriptJson: data.scriptJson !== undefined ? data.scriptJson : originalDoc?.scriptJson,
            summary: data.summary !== undefined ? data.summary : originalDoc?.summary,
            systemOpinion:
              data.systemOpinion !== undefined ? data.systemOpinion : originalDoc?.systemOpinion,
            mainPoints: data.mainPoints !== undefined ? data.mainPoints : originalDoc?.mainPoints,
            contrastingPoints:
              data.contrastingPoints !== undefined
                ? data.contrastingPoints
                : originalDoc?.contrastingPoints,
            disagreementPoints:
              data.disagreementPoints !== undefined
                ? data.disagreementPoints
                : originalDoc?.disagreementPoints,
            videoLinks: data.videoLinks !== undefined ? data.videoLinks : originalDoc?.videoLinks,
          }
          Object.assign(data, applyAiContentToEpisode(merged))
          // Prefer uploaded/generated audio over first video link when already set.
          if (
            originalDoc?.audioSource === 'upload' ||
            data.audioSource === 'upload' ||
            (typeof originalDoc?.audio === 'number' && originalDoc.audio > 0)
          ) {
            data.audioSource = 'upload'
            if (originalDoc?.audio != null && data.audio === undefined) data.audio = originalDoc.audio
            if (typeof originalDoc?.mediaUrl === 'string' && originalDoc.mediaUrl) {
              data.mediaUrl = originalDoc.mediaUrl
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
      name: 'editorModeBootstrap',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/episode-editor-mode#EpisodeEditorModeBootstrap',
        },
      },
    },
    {
      name: 'editorMode',
      type: 'select',
      label: 'Created by',
      defaultValue: 'manual',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'AI Generated', value: 'ai' },
      ],
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Set by Create with AI vs Create Manually.',
      },
    },
    {
      name: 'episodeStatus',
      type: 'select',
      label: 'Status',
      defaultValue: 'draft',
      required: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Complete', value: 'complete' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Only Complete episodes appear on the public site.',
        components: {
          Cell: '@/components/admin/episode-status-cell#EpisodeStatusCell',
        },
      },
    },
    {
      name: 'channel',
      type: 'relationship',
      relationTo: 'podcast-channels',
      label: 'Channel',
      required: true,
      admin: {
        description: 'Required. Create channels under Podcast → Channels.',
      },
      filterOptions: {
        active: { equals: true },
      },
    },
    { name: 'title', type: 'text', required: true },

    // —— AI create (same table) ——
    {
      type: 'collapsible',
      label: 'Create with AI',
      admin: {
        initCollapsed: false,
        condition: isAiMode,
      },
      fields: [
        {
          name: 'videoLinks',
          type: 'array',
          label: 'Video links',
          labels: { singular: 'Video link', plural: 'Video links' },
          fields: [
            {
              name: 'url',
              type: 'text',
              label: 'Video link',
              admin: {
                description: 'A public video address, such as YouTube, Vimeo, or Bilibili.',
              },
            },
          ],
        },
        {
          name: 'generateTranscript',
          type: 'ui',
          admin: {
            components: {
              Field: '@/components/admin/generate-transcript-field#GenerateTranscriptField',
            },
          },
        },
        {
          name: 'sourceTranscript',
          type: 'textarea',
          label: 'Source transcript',
          admin: { description: 'Generated text. You can edit it before saving.' },
        },
        {
          name: 'hostGender',
          type: 'select',
          label: 'Host gender',
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ],
        },
        {
          name: 'guestGender',
          type: 'select',
          label: 'Guest gender',
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ],
        },
        {
          name: 'generateScript',
          type: 'ui',
          admin: {
            components: {
              Field: '@/components/admin/generate-script-field#GenerateScriptField',
            },
          },
        },
        {
          name: 'scriptJson',
          type: 'textarea',
          label: 'script.json',
          admin: {
            description:
              'Two-person (host/guest) podcast-video script JSON. You can edit it.',
          },
        },
        {
          name: 'contrastingPoints',
          type: 'array',
          label: 'Contrasting points',
          labels: { singular: 'Contrasting point', plural: 'Contrasting points' },
          fields: [{ name: 'point', type: 'text', required: true, label: 'Point' }],
        },
        {
          name: 'disagreementPoints',
          type: 'array',
          label: 'Disagreement points',
          labels: { singular: 'Disagreement point', plural: 'Disagreement points' },
          fields: [{ name: 'point', type: 'text', required: true, label: 'Point' }],
        },
        {
          name: 'systemOpinion',
          type: 'textarea',
          label: "System's overall opinion",
        },
        {
          name: 'hostVoiceId',
          type: 'text',
          label: 'Host ElevenLabs voice ID',
        },
        {
          name: 'guestVoiceId',
          type: 'text',
          label: 'Guest ElevenLabs voice ID',
        },
        {
          name: 'generateAudio',
          type: 'ui',
          admin: {
            components: {
              Field: '@/components/admin/generate-audio-field#GenerateAudioField',
            },
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'idle',
      label: 'Transcript job',
      options: [
        { label: 'Idle', value: 'idle' },
        { label: 'Processing', value: 'processing' },
        { label: 'Ready', value: 'ready' },
        { label: 'Error', value: 'error' },
      ],
      admin: { position: 'sidebar', readOnly: true, condition: isAiMode },
    },
    {
      name: 'statusMessage',
      type: 'text',
      label: 'Transcript detail',
      admin: { position: 'sidebar', readOnly: true, condition: isAiMode },
    },
    {
      name: 'scriptStatus',
      type: 'select',
      defaultValue: 'idle',
      label: 'Script job',
      options: [
        { label: 'Idle', value: 'idle' },
        { label: 'Processing', value: 'processing' },
        { label: 'Ready', value: 'ready' },
        { label: 'Error', value: 'error' },
      ],
      admin: { position: 'sidebar', readOnly: true, condition: isAiMode },
    },
    {
      name: 'scriptStatusMessage',
      type: 'text',
      label: 'Script detail',
      admin: { position: 'sidebar', readOnly: true, condition: isAiMode },
    },
    {
      name: 'audioStatus',
      type: 'select',
      defaultValue: 'idle',
      label: 'Audio job',
      options: [
        { label: 'Idle', value: 'idle' },
        { label: 'Processing', value: 'processing' },
        { label: 'Ready', value: 'ready' },
        { label: 'Error', value: 'error' },
      ],
      admin: { position: 'sidebar', readOnly: true, condition: isAiMode },
    },
    {
      name: 'audioStatusMessage',
      type: 'text',
      label: 'Audio detail',
      admin: { position: 'sidebar', readOnly: true, condition: isAiMode },
    },

    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured',
      defaultValue: true,
      admin: {
        description: 'Featured episodes appear in the homepage Newest podcast section.',
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
      type: 'collapsible',
      label: 'Guest, topic, and duration',
      admin: {
        initCollapsed: false,
        description:
          'Optional block on the episode page, shown above About this episode when enabled.',
      },
      fields: [
        {
          name: 'showDetailsSection',
          type: 'checkbox',
          label: 'Show Guest / Topic / Duration on episode page',
          defaultValue: false,
          admin: {
            description:
              'Turn on to show Guest name, Topic, and Duration above About this episode. Leave off to hide the section.',
          },
        },
        {
          name: 'guests',
          type: 'text',
          label: 'Guest name',
          admin: {
            description: 'Shown in the optional details section and on cards when set.',
          },
        },
        {
          name: 'topic',
          type: 'text',
          label: 'Topic',
          admin: {
            description: 'Short topic line for the optional details section.',
          },
        },
        {
          name: 'meta',
          type: 'text',
          label: 'Duration',
          admin: {
            description: 'Episode length, for example 14:22. Also used on cards and listings.',
          },
        },
      ],
    },
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
        condition: isManualMode,
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
        condition: (_data, siblingData) =>
          isManualMode(_data, siblingData) && siblingData?.imageSource !== 'url',
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
        condition: (_data, siblingData) =>
          isManualMode(_data, siblingData) && siblingData?.imageSource === 'url',
        description: 'Paste a direct image address (https://…).',
      },
    },
    {
      name: 'imageAlt',
      type: 'text',
      label: 'Image alt',
      admin: { condition: isManualMode },
    },
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
        condition: isManualMode,
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
        condition: (_data, siblingData) =>
          isManualMode(_data, siblingData) && siblingData?.audioSource === 'upload',
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
        condition: (_data, siblingData) =>
          isManualMode(_data, siblingData) && siblingData?.audioSource !== 'upload',
        description: 'Paste an audio file URL, or a YouTube / Vimeo link.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Short summary',
      admin: {
        condition: isManualMode,
        description: 'Shown on the podcast list and cards.',
      },
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
        condition: isManualMode,
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
            description:
              'Main About text. Filled by AI script generation when using Create with AI.',
          },
        },
        {
          name: 'about',
          type: 'textarea',
          label: 'About (fallback)',
          admin: {
            condition: isManualMode,
            description: 'Used only when Summary is empty.',
          },
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
      admin: { initCollapsed: true, condition: isManualMode },
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
      admin: { initCollapsed: true, condition: isManualMode },
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
