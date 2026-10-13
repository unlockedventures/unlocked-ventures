import type { CollectionConfig, Endpoint } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { generatePodcastAudioFromScript } from '@/pipeline/generate-audio'
import { generateScriptFromTranscript } from '@/pipeline/generate-script'
import { requestTranscript } from '@/pipeline/request-transcript'
import {
  attachGeneratedAudioToEpisode,
  handleGenerateAudioRequest,
  type AudioPipelineDoc,
} from '@/pipeline/run-generate-audio'
import { handleGenerateScriptRequest, type ScriptPipelineDoc } from '@/pipeline/run-generate-script'
import { handleTranscribeRequest, type PipelineDoc } from '@/pipeline/run-transcription'
import { syncPipelineToEpisode } from '@/pipeline/sync-episode'

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

const generateAudioEndpoint: Endpoint = {
  path: '/generate-audio',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    try {
      const body = (
        req.json ? await req.json().catch(() => null) : null
      ) as { id?: number | string; hostVoiceId?: unknown; guestVoiceId?: unknown } | null
      const id = body?.id
      if (id == null || id === '') {
        return Response.json({ error: 'Pipeline document not found.' }, { status: 404 })
      }

      const doc = await req.payload
        .findByID({ collection: 'pipeline', id, depth: 0, req })
        .catch(() => null)

      const result = await handleGenerateAudioRequest({
        user: req.user,
        doc: doc as AudioPipelineDoc | null,
        hostVoiceId: body?.hostVoiceId,
        guestVoiceId: body?.guestVoiceId,
        save: async (data) => {
          await req.payload.update({
            collection: 'pipeline',
            id,
            data,
            depth: 0,
            req,
            context: { skipEpisodeSync: true },
          })
        },
        generate: ({ scriptJson, hostVoiceId, guestVoiceId, title }) =>
          generatePodcastAudioFromScript({
            scriptJson,
            hostVoiceId,
            guestVoiceId,
            title,
            apiKey: process.env['ELEVENLABS_API_KEY']?.trim() ?? '',
            modelId: process.env['ELEVENLABS_MODEL_ID']?.trim() || undefined,
          }),
        attachToEpisode: ({ episodeId, buffer, filename, mimeType, title }) =>
          attachGeneratedAudioToEpisode({
            payload: req.payload,
            req,
            episodeId,
            buffer,
            filename,
            mimeType,
            title,
          }),
      })

      return Response.json(result.body, { status: result.status })
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
          ? error.message
          : 'Could not generate podcast audio.'
      req.payload.logger.error({ err: error }, 'generate-audio failed')
      return Response.json({ error: message }, { status: 500 })
    }
  },
}

export const Pipeline: CollectionConfig = {
  slug: 'pipeline',
  labels: { singular: 'Podcast', plural: 'Podcast' },
  admin: {
    group: adminGroups.pipeline,
    description:
      'Paste public video links and generate a transcript. Saving creates or updates the matching episode under the selected channel.',
    hideAPIURL: true,
    useAsTitle: 'name',
    defaultColumns: ['name', 'channel', 'status', 'scriptStatus'],
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
  hooks: {
    afterChange: [
      async ({ doc, req, context }) => {
        if (context?.skipEpisodeSync) return doc
        try {
          const episodeId = await syncPipelineToEpisode(req, doc)
          const currentEpisodeId =
            typeof doc.episode === 'number'
              ? doc.episode
              : doc.episode && typeof doc.episode === 'object'
                ? doc.episode.id
                : null
          if (episodeId != null && episodeId !== currentEpisodeId) {
            await req.payload.update({
              collection: 'pipeline',
              id: doc.id,
              data: { episode: episodeId },
              depth: 0,
              overrideAccess: true,
              context: { skipEpisodeSync: true },
              req,
            })
            return { ...doc, episode: episodeId }
          }
        } catch (error) {
          req.payload.logger.error({ err: error, pipeline: doc.id }, 'Failed to wire pipeline podcast to episode')
        }
        return doc
      },
    ],
  },
  endpoints: [transcribeEndpoint, progressEndpoint, generateScriptEndpoint, generateAudioEndpoint],
  fields: [
    {
      name: 'channel',
      type: 'relationship',
      relationTo: 'podcast-channels',
      label: 'Channel',
      required: true,
      admin: {
        description: 'Required. The generated episode is published under this channel.',
      },
      filterOptions: {
        active: { equals: true },
      },
    },
    { name: 'name', type: 'text', required: true },
    {
      name: 'episode',
      type: 'relationship',
      relationTo: 'podcast-episodes',
      label: 'Linked episode',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Created automatically when you save this podcast.',
      },
    },
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
      name: 'hostVoiceId',
      type: 'text',
      label: 'Host ElevenLabs voice ID',
      admin: {
        description: 'Paste the ElevenLabs voice ID used for host turns in script.json.',
      },
    },
    {
      name: 'guestVoiceId',
      type: 'text',
      label: 'Guest ElevenLabs voice ID',
      admin: {
        description: 'Paste the ElevenLabs voice ID used for guest turns in script.json.',
      },
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
    {
      name: 'audioStatus',
      type: 'select',
      defaultValue: 'idle',
      label: 'Audio status',
      options: [
        { label: 'Idle', value: 'idle' },
        { label: 'Processing', value: 'processing' },
        { label: 'Ready', value: 'ready' },
        { label: 'Error', value: 'error' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'audioStatusMessage',
      type: 'text',
      label: 'Audio status detail',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
