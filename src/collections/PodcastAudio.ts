import path from 'path'
import type { CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'

import { readAudioDuration } from '@/pipeline/audio-duration'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Local podcast audio files (disk for now; swap staticDir / storage adapter for S3 later).
 * Hidden from the main nav — editors upload through the Episode form.
 */
export const PodcastAudio: CollectionConfig = {
  slug: 'podcast-audio',
  labels: {
    singular: 'Podcast audio',
    plural: 'Podcast audio',
  },
  admin: {
    hidden: true,
    hideAPIURL: true,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      async ({ context, data, req }) => {
        if (
          context?.generatedAudioDuration === true &&
          typeof data.durationSeconds === 'number' &&
          Number.isFinite(data.durationSeconds) &&
          data.durationSeconds > 0
        ) {
          return data
        }
        const file = req.file
        if (!file?.data?.length) return data
        const duration = await readAudioDuration({
          buffer: file.data,
          mimeType: file.mimetype,
          size: file.size,
        })
        if (duration) data.durationSeconds = duration
        else req.payload.logger.warn('Could not read podcast audio duration')
        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Description',
      admin: { description: 'Optional label for this audio file.' },
    },
    {
      name: 'durationSeconds',
      type: 'number',
      label: 'Duration in seconds',
      admin: { hidden: true, readOnly: true },
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../media/podcast-audio'),
    mimeTypes: ['audio/*'],
  },
}
