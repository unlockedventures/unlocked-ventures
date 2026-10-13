import path from 'path'
import type { CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'

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
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Description',
      admin: { description: 'Optional label for this audio file.' },
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../media/podcast-audio'),
    mimeTypes: ['audio/*'],
  },
}
