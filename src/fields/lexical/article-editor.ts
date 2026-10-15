import {
  BlocksFeature,
  FixedToolbarFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { MediaEmbedBlock } from '@/blocks/media-embed'

/** Rich text for solution articles: device uploads + image/video URL embeds. */
export const articleEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    FixedToolbarFeature(),
    UploadFeature({
      collections: {
        media: {
          fields: [
            {
              name: 'caption',
              type: 'text',
              label: 'Caption',
            },
          ],
        },
      },
    }),
    BlocksFeature({
      blocks: [MediaEmbedBlock],
    }),
  ],
})
