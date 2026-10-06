import type { CollectionConfig, Endpoint } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { requestTranscript } from '@/pipeline/request-transcript'
import { handleTranscribeRequest, type PipelineDoc } from '@/pipeline/run-transcription'

const transcribeEndpoint: Endpoint = {
  path: '/transcribe',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = (
      req.json ? await req.json().catch(() => null) : null
    ) as { id?: number | string } | null
    const id = body?.id
    if (id == null || id === '') {
      return Response.json({ error: 'Pipeline document not found.' }, { status: 404 })
    }

    const doc = await req.payload
      .findByID({ collection: 'pipeline', id, depth: 0, req })
      .catch(() => null)
    const others = await req.payload.find({
      collection: 'pipeline',
      depth: 0,
      limit: 1,
      req,
      where: { and: [{ status: { equals: 'processing' } }, { id: { not_equals: id } }] },
    })

    const result = await handleTranscribeRequest({
      user: req.user,
      doc: doc as PipelineDoc | null,
      otherProcessing: others.totalDocs > 0,
      save: async (data) => {
        await req.payload.update({ collection: 'pipeline', id, data, depth: 0, req })
      },
      transcribe: (url) =>
        requestTranscript({
          url,
          endpoint: process.env.TRANSCRIBER_URL ?? '',
          secret: process.env.TRANSCRIBER_SECRET ?? '',
        }),
    })

    return Response.json(result.body, { status: result.status })
  },
}

export const Pipeline: CollectionConfig = {
  slug: 'pipeline',
  labels: { singular: 'Pipeline', plural: 'Pipeline' },
  admin: {
    group: adminGroups.pipeline,
    description: 'Paste public video links and generate a transcript.',
    hideAPIURL: true,
    useAsTitle: 'name',
    defaultColumns: ['name', 'status'],
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  endpoints: [transcribeEndpoint],
  fields: [
    { name: 'name', type: 'text', required: true },
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
      name: 'transcript',
      type: 'textarea',
      label: 'Transcript',
      admin: { description: 'Generated text. You can edit it before saving.' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'idle',
      options: [
        { label: 'Idle', value: 'idle' },
        { label: 'Processing', value: 'processing' },
        { label: 'Ready', value: 'ready' },
        { label: 'Error', value: 'error' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'statusMessage',
      type: 'text',
      label: 'Status detail',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
