import type { Endpoint, PayloadRequest } from 'payload'

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

type EpisodeAiDoc = {
  id: number | string
  title?: string | null
  sourceTranscript?: string | null
  scriptJson?: string | null
  systemOpinion?: string | null
  hostGender?: string | null
  guestGender?: string | null
  hostVoiceId?: string | null
  guestVoiceId?: string | null
  videoLinks?: { url?: string | null }[] | null
  status?: string | null
  statusMessage?: string | null
  scriptStatus?: string | null
  audioStatus?: string | null
}

async function loadEpisode(req: PayloadRequest, id: number | string) {
  return req.payload
    .findByID({ collection: 'podcast-episodes', id, depth: 0, req })
    .catch(() => null) as Promise<EpisodeAiDoc | null>
}

/** AI transcript / script / audio endpoints — stored on podcast-episodes. */
export const episodeAiEndpoints: Endpoint[] = [
  {
    path: '/transcribe',
    method: 'post',
    handler: async (req) => {
      if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

      const body = (
        req.json ? await req.json().catch(() => null) : null
      ) as { id?: number | string; videoLinks?: { url?: string | null }[] | null } | null
      const id = body?.id
      if (id == null || id === '') {
        return Response.json({ error: 'Episode not found.' }, { status: 404 })
      }

      const doc = await loadEpisode(req, id)
      const others = await req.payload.find({
        collection: 'podcast-episodes',
        depth: 0,
        limit: 1,
        req,
        where: { and: [{ status: { equals: 'processing' } }, { id: { not_equals: id } }] },
      })

      const result = await handleTranscribeRequest({
        user: req.user,
        doc: doc
          ? ({
              id: doc.id,
              videoLinks: doc.videoLinks,
              transcript: doc.sourceTranscript,
              status: doc.status as PipelineDoc['status'],
              statusMessage: doc.statusMessage,
              scriptStatus: doc.scriptStatus,
            } satisfies PipelineDoc)
          : null,
        videoLinks: body?.videoLinks,
        otherProcessing: others.totalDocs > 0,
        save: async (data) => {
          await req.payload.update({
            collection: 'podcast-episodes',
            id,
            data: {
              sourceTranscript: data.transcript,
              status: data.status,
              statusMessage: data.statusMessage,
              ...(data.videoLinks ? { videoLinks: data.videoLinks } : {}),
            },
            depth: 0,
            req,
            context: { skipAiContentSync: true },
          })
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
  },
  {
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
  },
  {
    path: '/generate-script',
    method: 'post',
    handler: async (req) => {
      if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

      const body = (
        req.json ? await req.json().catch(() => null) : null
      ) as { id?: number | string; hostGender?: unknown; guestGender?: unknown } | null
      const id = body?.id
      if (id == null || id === '') {
        return Response.json({ error: 'Episode not found.' }, { status: 404 })
      }

      const doc = await loadEpisode(req, id)

      const result = await handleGenerateScriptRequest({
        user: req.user,
        doc: doc
          ? ({
              id: doc.id,
              transcript: doc.sourceTranscript,
              hostGender: doc.hostGender,
              guestGender: doc.guestGender,
              status: doc.status,
              scriptStatus: doc.scriptStatus as ScriptPipelineDoc['scriptStatus'],
            } satisfies ScriptPipelineDoc)
          : null,
        hostGender: body?.hostGender,
        guestGender: body?.guestGender,
        save: async (data) => {
          await req.payload.update({
            collection: 'podcast-episodes',
            id,
            data,
            depth: 0,
            req,
            context: { skipAiContentSync: true },
          })
        },
        generate: ({ transcript, hostGender, guestGender }) =>
          generateScriptFromTranscript({
            transcript,
            hostGender,
            guestGender,
            apiKey: process.env['GEMINI_API_KEY']?.trim() ?? '',
            model: process.env['GEMINI_MODEL']?.trim() || undefined,
          }),
      })

      return Response.json(result.body, { status: result.status })
    },
  },
  {
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
          return Response.json({ error: 'Episode not found.' }, { status: 404 })
        }

        const doc = await loadEpisode(req, id)
        const episodeId = typeof id === 'number' ? id : Number(id)

        const result = await handleGenerateAudioRequest({
          user: req.user,
          doc: doc
            ? ({
                id: doc.id,
                name: doc.title,
                scriptJson: doc.scriptJson,
                systemOpinion: doc.systemOpinion,
                hostVoiceId: doc.hostVoiceId,
                guestVoiceId: doc.guestVoiceId,
                episode: Number.isFinite(episodeId) ? episodeId : null,
                status: doc.status,
                scriptStatus: doc.scriptStatus,
                audioStatus: doc.audioStatus as AudioPipelineDoc['audioStatus'],
              } satisfies AudioPipelineDoc)
            : null,
          hostVoiceId: body?.hostVoiceId,
          guestVoiceId: body?.guestVoiceId,
          save: async (data) => {
            await req.payload.update({
              collection: 'podcast-episodes',
              id,
              data,
              depth: 0,
              req,
              context: { skipAiContentSync: true },
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
          attachToEpisode: ({ episodeId: targetId, buffer, filename, mimeType, title }) =>
            attachGeneratedAudioToEpisode({
              payload: req.payload,
              req,
              episodeId: targetId ?? (Number.isFinite(episodeId) ? episodeId : null),
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
  },
]
