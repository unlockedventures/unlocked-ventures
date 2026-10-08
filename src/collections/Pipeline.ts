import type { CollectionConfig, Endpoint } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { generateScriptFromTranscript } from '@/pipeline/generate-script'
import { requestTranscript } from '@/pipeline/request-transcript'
import { handleGenerateScriptRequest, type ScriptPipelineDoc } from '@/pipeline/run-generate-script'
import { handleTranscribeRequest, type PipelineDoc } from '@/pipeline/run-transcription'

const transcribeEndpoint: Endpoint = {
  path: '/transcribe',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = (
      req.json ? await req.json().catch(() => null) : null
    ) as { id?: number | string; videoLinks?: { url?: string | null }[] | null } | null
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
      videoLinks: body?.videoLinks,
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

const progressEndpoint: Endpoint = {
  path: '/progress',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const endpoint = process.env.TRANSCRIBER_URL ?? ''
    const secret = process.env.TRANSCRIBER_SECRET ?? ''
    if (!endpoint || !secret) {
      return Response.json({ percent: 0 })
    }

    try {
      const response = await fetch(`${endpoint}/progress`, {
        headers: { Authorization: `Bearer ${secret}` },
        cache: 'no-store',
      })
      if (!response.ok) return Response.json({ percent: 0 })
      const body = (await response.json()) as { percent?: number }
      const percent = typeof body.percent === 'number' ? body.percent : 0
      return Response.json({ percent })
    } catch {
      return Response.json({ percent: 0 })
    }
  },
}

const generateScriptEndpoint: Endpoint = {
  path: '/generate-script',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = (
      req.json ? await req.json().catch(() => null) : null
    ) as { id?: number | string; hostGender?: unknown; guestGender?: unknown } | null
    const id = body?.id
    if (id == null || id === '') {
      return Response.json({ error: 'Pipeline document not found.' }, { status: 404 })
    }

    const doc = await req.payload
      .findByID({ collection: 'pipeline', id, depth: 0, req })
      .catch(() => null)

    const result = await handleGenerateScriptRequest({
      user: req.user,
      doc: doc as ScriptPipelineDoc | null,
      hostGender: body?.hostGender,
      guestGender: body?.guestGender,
      save: async (data) => {
        await req.payload.update({ collection: 'pipeline', id, data, depth: 0, req })
      },
      generate: ({ transcript, hostGender, guestGender }) =>
        generateScriptFromTranscript({
          transcript,
          hostGender,
          guestGender,
          // Read at request time so a key added after boot is visible.
          apiKey: process.env['GEMINI_API_KEY']?.trim() ?? '',
          model: process.env['GEMINI_MODEL']?.trim() || undefined,
        }),
    })

    return Response.json(result.body, { status: result.status })
  },
}

export const Pipeline: CollectionConfig = {
  slug: 'pipeline',
  labels: { singular: 'Podcast', plural: 'Podcast' },
  admin: {
    group: adminGroups.pipeline,
    description: 'Paste public video links and generate a transcript.',
    hideAPIURL: true,
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'scriptStatus'],
    components: {
      edit: {
        SaveButton: '@/components/admin/pipeline-save-button#PipelineSaveButton',
      },
    },
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  endpoints: [transcribeEndpoint, progressEndpoint, generateScriptEndpoint],
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
      name: 'hostGender',
      type: 'select',
      label: 'Host gender',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
      ],
      admin: {
        description: 'Voice/persona for the podcast host in script.json.',
      },
    },
    {
      name: 'guestGender',
      type: 'select',
      label: 'Guest gender',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
      ],
      admin: {
        description: 'Voice/persona for the podcast guest in script.json.',
      },
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
          'Two-person (host/guest) podcast-video script JSON for a later video generation step. You can edit it.',
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Summary',
      admin: {
        description:
          'Episode summary (at least 3 sentences, 30 words, and 150 characters without whitespace).',
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
      admin: {
        description:
          'Disagreements or debate points from the source. Inferred when the source has no explicit disagreements.',
      },
      fields: [{ name: 'point', type: 'text', required: true, label: 'Point' }],
    },
    {
      name: 'systemOpinion',
      type: 'textarea',
      label: "System's overall opinion",
      admin: { description: 'Overall assessment of the material.' },
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
    {
      name: 'scriptStatus',
      type: 'select',
      defaultValue: 'idle',
      label: 'Script status',
      options: [
        { label: 'Idle', value: 'idle' },
        { label: 'Processing', value: 'processing' },
        { label: 'Ready', value: 'ready' },
        { label: 'Error', value: 'error' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'scriptStatusMessage',
      type: 'text',
      label: 'Script status detail',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
