import type { Block } from 'payload'

export const MediaEmbedBlock: Block = {
  slug: 'mediaEmbed',
  labels: {
    singular: 'Image / video link',
    plural: 'Image / video links',
  },
  interfaceName: 'MediaEmbedBlock',
  fields: [
    {
      name: 'url',
      type: 'text',
      label: 'Image or video URL',
      required: true,
      admin: {
        description:
          'Paste a direct image link, a video file link, or a YouTube / Vimeo URL. To upload from your device, use Upload instead.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
      admin: {
        description: 'Optional text shown under the media.',
      },
    },
  ],
}
