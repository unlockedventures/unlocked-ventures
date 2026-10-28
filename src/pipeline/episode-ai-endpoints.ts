import type { Endpoint, PayloadRequest } from 'payload'
import { hasPermission } from '@/access/rbac'
import type { VideoResource } from '@/pipeline/video-resources'

import { generatePodcastAudioFromScript, pcmToWav } from '@/pipeline/generate-audio'
import { listKokoroVoices, synthesizeKokoroSpeech } from '@/pipeline/kokoro'
import { isVoicePreviewRole, voicePreviewText } from '@/pipeline/kokoro-voice-preview'
import { generateScriptFromTranscript } from '@/pipeline/generate-script'
import {
  generatePodcastScriptPrompt,
  generateSourceSummaryPrompt,
} from '@/pipeline/generate-editor-prompts'
import { podcastScriptPromptRevision } from '@/pipeline/prompt-revision'
import { validateEditorPrompt } from '@/pipeline/prompt-constraints'
import { isSpeakerGender } from '@/pipeline/script-schema'
import { requestTranscript } from '@/pipeline/request-transcript'
import {
  createGeneratedAudioPreview,
  handleGenerateAudioRequest,
  saveGeneratedAudioToEpisode,
  type AudioPipelineDoc,
} from '@/pipeline/run-generate-audio'
import { handleGenerateScriptRequest, type ScriptPipelineDoc } from '@/pipeline/run-generate-script'
import { handleTranscribeRequest, type PipelineDoc } from '@/pipeline/run-transcription'
import { generateSourceSummary } from '@/pipeline/generate-source-summary'
import { withEpisodeGenerationLock } from '@/pipeline/episode-generation-lock'
import {
  hasCurrentSourceSummary,
  sourceRevision,
  sourceSummaryInput,
  type SourceSummaryDoc,
} from '@/pipeline/source-summary'

type EpisodeAiDoc = SourceSummaryDoc & {
  id: number | string
  title?: string | null
  sourceTranscript?: string | null
  scriptJson?: string | null
  systemOpinion?: string | null
  hostGender?: string | null
  guestGender?: string | null
  hostVoiceId?: string | null
  guestVoiceId?: string | null
  videoLinks?: VideoResource[] | null
  status?: string | null
  statusMessage?: string | null
  scriptStatus?: string | null
  audioStatus?: string | null
  audio?: number | null
  mediaUrl?: string | null
  pendingAudio?: number | null
  pendingAudioUrl?: string | null
  sourceSummaryPrompt?: string | null
  sourceSummaryPromptRevision?: string | null
  scriptPrompt?: string | null
  scriptPromptRevision?: string | null
}

const activeAudioGenerations = new Map<string, AbortController>()

async function loadEpisode(req: PayloadRequest, id: number | string) {
  return req.payload
    .findByID({ collection: 'podcast-episodes', id, depth: 0, req, overrideAccess: false })
    .catch(() => null) as Promise<EpisodeAiDoc | null>
}

/** AI transcript / script / audio endpoints — stored on podcast-episodes. */
const episodeGenerationEndpoints: Endpoint[] = [
  {
    path: '/kokoro-voices',
    method: 'get',
    handler: async (req) => {
      if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
      if (!(await hasPermission(req, 'podcast-episodes', 'read'))) {
        return Response.json({ error: 'Permission denied.' }, { status: 403 })
      }
      try {
        const voices = await listKokoroVoices({
          baseUrl: process.env.KOKORO_BASE_URL?.trim() ?? '',
          timeoutMs: Number(process.env.KOKORO_TIMEOUT_MS || 10_000),
        })
        return Response.json({
          voices: voices.map((voice) => ({ value: voice.voiceId, label: voice.name })),
        })
      } catch (error) {
        req.payload.logger.error({ err: error }, 'kokoro voice discovery failed')
        return Response.json(
          { error: 'Could not load Kokoro voices. Check the Kokoro service and try again.' },
          { status: 502 },
        )
      }
    },
  },
  {
    path: '/preview-kokoro-voice',
    method: 'post',
    handler: async (req) => {
      if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
      if (
        !(await hasPermission(req, 'podcast-episodes', 'read')) ||
        !(await hasPermission(req, 'podcast-episodes', 'update'))
      ) {
        return Response.json({ error: 'Permission denied.' }, { status: 403 })
      }
      const body = (req.json ? await req.json().catch(() => null) : null) as {
        voiceId?: unknown
        role?: unknown
      } | null
      const voiceId = typeof body?.voiceId === 'string' ? body.voiceId.trim() : ''
      if (!voiceId || voiceId.length > 100 || !isVoicePreviewRole(body?.role)) {
        return Response.json({ error: 'Select a valid Kokoro voice to test.' }, { status: 400 })
      }
      const baseUrl = process.env.KOKORO_BASE_URL?.trim() ?? ''
      const configuredTimeout = Number(process.env.KOKORO_TIMEOUT_MS || 30_000)
      const timeoutMs = Number.isFinite(configuredTimeout)
        ? Math.min(Math.max(configuredTimeout, 1_000), 30_000)
        : 30_000
      try {
        const voices = await listKokoroVoices({ baseUrl, timeoutMs: 10_000 })
        if (!voices.some((voice) => voice.voiceId === voiceId)) {
          return Response.json(
            { error: 'The selected Kokoro voice is not available.' },
            { status: 400 },
          )
        }
        const pcm = await synthesizeKokoroSpeech({
          baseUrl,
          voiceId,
          text: voicePreviewText(body.role),
          modelId: process.env.KOKORO_MODEL?.trim() || undefined,
          speed: Number(process.env.KOKORO_SPEED || 1),
          timeoutMs,
        })
        const wav = pcmToWav(pcm)
        return new Response(new Uint8Array(wav), {
          headers: {
            'Cache-Control': 'no-store',
            'Content-Disposition': 'inline; filename="kokoro-voice-preview.wav"',
            'Content-Type': 'audio/wav',
          },
        })
      } catch (error) {
        req.payload.logger.error({ err: error }, 'kokoro voice preview failed')
        return Response.json(
          { error: 'Could not generate the voice preview. Check Kokoro and try again.' },
          { status: 502 },
        )
      }
    },
  },
  {
    path: '/generate-source-summary-prompt',
    method: 'post',
    handler: async (req) => {
      const body = (req.json ? await req.json().catch(() => null) : null) as {
        id?: number | string
      } | null
      if (body?.id == null || body.id === '') {
        return Response.json({ error: 'Episode not found.' }, { status: 404 })
      }
      const doc = await loadEpisode(req, body.id)
      if (!doc) return Response.json({ error: 'Episode not found.' }, { status: 404 })
      const input = sourceSummaryInput(doc)
      if (input.error || !input.transcript) {
        return Response.json({ error: input.error }, { status: 400 })
      }
      const revision = await sourceRevision(doc)
      try {
        const prompt = await generateSourceSummaryPrompt({
          transcript: input.transcript,
          apiKey: process.env.GEMINI_API_KEY?.trim() ?? '',
          model: process.env.GEMINI_MODEL?.trim() || undefined,
        })
        const current = await loadEpisode(req, body.id)
        if (!current || (await sourceRevision(current)) !== revision) {
          return Response.json(
            { error: 'Sources changed. Regenerate the prompt.' },
            { status: 409 },
          )
        }
        await req.payload.update({
          collection: 'podcast-episodes',
          id: body.id,
          data: { sourceSummaryPrompt: prompt, sourceSummaryPromptRevision: revision },
          depth: 0,
          req,
          overrideAccess: false,
          context: { skipAiContentSync: true, promptRevisionUpdate: true },
        })
        return Response.json({
          sourceSummaryPrompt: prompt,
          sourceSummaryPromptRevision: revision,
          currentSourceRevision: revision,
        })
      } catch (error) {
        req.payload.logger.error({ err: error }, 'source-summary prompt generation failed')
        return Response.json(
          { error: 'Could not generate the source-summary prompt.' },
          { status: 502 },
        )
      }
    },
  },
  {
    path: '/generate-source-summary',
    method: 'post',
    handler: async (req) => {
      const body = (await req.json!()) as {
        id: string | number
        sourceSummaryPrompt?: unknown
        sourceSummaryPromptRevision?: unknown
      }
      const id = body.id as string | number
      const doc = await loadEpisode(req, id)
      if (!doc) return Response.json({ error: 'Episode not found.' }, { status: 404 })
      const input = sourceSummaryInput(doc)
      if (input.error || !input.transcript) {
        return Response.json({ error: input.error }, { status: 400 })
      }
      const revision = await sourceRevision(doc)
      const editorPrompt =
        typeof body.sourceSummaryPrompt === 'string' ? body.sourceSummaryPrompt.trim() : ''
      const promptValidation = validateEditorPrompt(editorPrompt)
      if ('error' in promptValidation) {
        return Response.json({ error: promptValidation.error }, { status: 400 })
      }
      if (body.sourceSummaryPromptRevision !== revision) {
        return Response.json(
          { error: 'Generate or update a current source-summary prompt first.' },
          { status: 400 },
        )
      }
      const save = async (data: Record<string, unknown>) =>
        req.payload.update({
          collection: 'podcast-episodes',
          id,
          data,
          req,
          depth: 0,
          overrideAccess: false,
          context: {
            skipAiContentSync: true,
            sourceSummaryUpdate: true,
            promptRevisionUpdate: true,
            expectedSourceRevision: 'sourceSummaryRevision' in data ? revision : undefined,
          },
        })
      await save({
        sourceSummaryPrompt: promptValidation.prompt,
        sourceSummaryPromptRevision: revision,
        sourceSummaryStatus: 'processing',
        sourceSummaryMessage: 'Summarizing all current video transcripts…',
      })
      try {
        const sourceSummary = await generateSourceSummary(input.transcript, promptValidation.prompt)
        const current = await loadEpisode(req, id)
        if (
          !current ||
          (await sourceRevision(current)) !== revision ||
          sourceSummaryInput(current).error
        ) {
          await save({
            sourceSummaryStatus: 'error',
            sourceSummaryMessage:
              'Sources changed during generation. Generate the source summary again.',
          })
          return Response.json(
            { error: 'Sources changed. Generate the source summary again.' },
            { status: 409 },
          )
        }
        await save({
          sourceSummary,
          sourceSummaryRevision: revision,
          sourceSummaryPrompt: promptValidation.prompt,
          sourceSummaryPromptRevision: revision,
          sourceSummaryStatus: 'ready',
          sourceSummaryMessage: '',
        })
        return Response.json({
          sourceSummary,
          sourceSummaryRevision: revision,
          currentSourceRevision: revision,
          sourceSummaryStatus: 'ready',
        })
      } catch {
        // Provider exceptions can contain source text or credentials; expose only a fixed message.
        const error =
          'Could not generate the source summary. Check Gemini configuration and try again.'
        await save({ sourceSummaryStatus: 'error', sourceSummaryMessage: error })
        return Response.json({ error }, { status: 502 })
      }
    },
  },
  {
    path: '/transcribe',
    method: 'post',
    handler: async (req) => {
      if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
      if (
        !(await hasPermission(req, 'podcast-episodes', 'update')) ||
        !(await hasPermission(req, 'podcast-episodes', 'read'))
      )
        return Response.json({ error: 'Permission denied.' }, { status: 403 })

      const body = (req.json ? await req.json().catch(() => null) : null) as {
        id?: number | string
        videoLinks?: { url?: string | null }[] | null
      } | null
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
        overrideAccess: false,
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
            overrideAccess: false,
            context: { skipAiContentSync: true, transcriptionUpdate: true },
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
      if (
        !(await hasPermission(req, 'podcast-episodes', 'update')) ||
        !(await hasPermission(req, 'podcast-episodes', 'read'))
      )
        return Response.json({ error: 'Permission denied.' }, { status: 403 })

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
    path: '/generate-script-prompt',
    method: 'post',
    handler: async (req) => {
      const body = (req.json ? await req.json().catch(() => null) : null) as {
        id?: number | string
        hostGender?: unknown
        guestGender?: unknown
        sourceSummary?: unknown
        sourceSummaryRevision?: unknown
      } | null
      if (body?.id == null || body.id === '') {
        return Response.json({ error: 'Episode not found.' }, { status: 404 })
      }
      const doc = await loadEpisode(req, body.id)
      if (
        !doc ||
        !hasCurrentSourceSummary({ ...doc, currentSourceRevision: await sourceRevision(doc) }) ||
        body.sourceSummaryRevision !== doc.sourceSummaryRevision
      ) {
        return Response.json({ error: 'Generate a current source summary first.' }, { status: 400 })
      }
      const sourceSummary = typeof body.sourceSummary === 'string' ? body.sourceSummary.trim() : ''
      if (
        !sourceSummary ||
        !isSpeakerGender(body.hostGender) ||
        !isSpeakerGender(body.guestGender)
      ) {
        return Response.json(
          { error: 'Add a source summary and choose host and guest genders first.' },
          { status: 400 },
        )
      }
      const promptRevision = podcastScriptPromptRevision({
        sourceSummary,
        hostGender: body.hostGender,
        guestGender: body.guestGender,
      })
      try {
        const prompt = await generatePodcastScriptPrompt({
          sourceSummary,
          hostGender: body.hostGender,
          guestGender: body.guestGender,
          apiKey: process.env.GEMINI_API_KEY?.trim() ?? '',
          model: process.env.GEMINI_MODEL?.trim() || undefined,
        })
        const current = await loadEpisode(req, body.id)
        if (
          !current ||
          current.sourceSummaryRevision !== body.sourceSummaryRevision ||
          !hasCurrentSourceSummary({
            ...current,
            currentSourceRevision: await sourceRevision(current),
          })
        ) {
          return Response.json(
            { error: 'The source summary changed. Regenerate the prompt.' },
            { status: 409 },
          )
        }
        await req.payload.update({
          collection: 'podcast-episodes',
          id: body.id,
          data: {
            sourceSummary,
            hostGender: body.hostGender,
            guestGender: body.guestGender,
            scriptPrompt: prompt,
            scriptPromptRevision: promptRevision,
          },
          depth: 0,
          req,
          overrideAccess: false,
          context: {
            skipAiContentSync: true,
            sourceSummaryUpdate: true,
            promptRevisionUpdate: true,
          },
        })
        return Response.json({ scriptPrompt: prompt, scriptPromptRevision: promptRevision })
      } catch (error) {
        req.payload.logger.error({ err: error }, 'podcast-script prompt generation failed')
        return Response.json(
          { error: 'Could not generate the podcast-script prompt.' },
          { status: 502 },
        )
      }
    },
  },
  {
    path: '/generate-script',
    method: 'post',
    handler: async (req) => {
      if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
      if (
        !(await hasPermission(req, 'podcast-episodes', 'update')) ||
        !(await hasPermission(req, 'podcast-episodes', 'read'))
      )
        return Response.json({ error: 'Permission denied.' }, { status: 403 })

      const body = (req.json ? await req.json().catch(() => null) : null) as {
        id?: number | string
        hostGender?: unknown
        guestGender?: unknown
        sourceSummary?: unknown
        sourceSummaryRevision?: unknown
        scriptPrompt?: unknown
        scriptPromptRevision?: unknown
      } | null
      const id = body?.id
      if (id == null || id === '') {
        return Response.json({ error: 'Episode not found.' }, { status: 404 })
      }

      const doc = await loadEpisode(req, id)

      if (
        !doc ||
        !hasCurrentSourceSummary({ ...doc, currentSourceRevision: await sourceRevision(doc) }) ||
        body?.sourceSummaryRevision !== doc.sourceSummaryRevision
      ) {
        return Response.json(
          { error: 'Generate a current source summary before creating a podcast script.' },
          { status: 400 },
        )
      }
      const sourceSummary = typeof body?.sourceSummary === 'string' ? body.sourceSummary.trim() : ''
      if (!sourceSummary) {
        return Response.json(
          { error: 'Add a nonblank source summary before creating a podcast script.' },
          { status: 400 },
        )
      }
      const revision = doc.sourceSummaryRevision
      const editorPrompt = typeof body?.scriptPrompt === 'string' ? body.scriptPrompt.trim() : ''
      const promptValidation = validateEditorPrompt(editorPrompt)
      if ('error' in promptValidation) {
        return Response.json({ error: promptValidation.error }, { status: 400 })
      }
      const expectedPromptRevision = podcastScriptPromptRevision({
        sourceSummary,
        hostGender: isSpeakerGender(body?.hostGender) ? body.hostGender : (doc.hostGender ?? ''),
        guestGender: isSpeakerGender(body?.guestGender)
          ? body.guestGender
          : (doc.guestGender ?? ''),
      })
      if (body?.scriptPromptRevision !== expectedPromptRevision) {
        return Response.json(
          { error: 'Generate or update a current podcast-script prompt first.' },
          { status: 400 },
        )
      }
      await req.payload.update({
        collection: 'podcast-episodes',
        id,
        data: {
          sourceSummary,
          scriptPrompt: promptValidation.prompt,
          scriptPromptRevision: expectedPromptRevision,
        },
        depth: 0,
        req,
        overrideAccess: false,
        context: {
          skipAiContentSync: true,
          sourceSummaryUpdate: true,
          promptRevisionUpdate: true,
        },
      })

      const result = await handleGenerateScriptRequest({
        user: req.user,
        doc: doc
          ? ({
              id: doc.id,
              transcript: sourceSummary,
              hostGender: doc.hostGender,
              guestGender: doc.guestGender,
              status: doc.status,
              scriptStatus: doc.scriptStatus as ScriptPipelineDoc['scriptStatus'],
            } satisfies ScriptPipelineDoc)
          : null,
        hostGender: body?.hostGender,
        guestGender: body?.guestGender,
        save: async (data) => {
          if (data.scriptStatus === 'ready') {
            const current = await loadEpisode(req, id)
            if (
              !current ||
              (await sourceRevision(current)) !== revision ||
              current.sourceSummary?.trim() !== sourceSummary
            ) {
              await req.payload.update({
                collection: 'podcast-episodes',
                id,
                data: {
                  scriptStatus: 'error',
                  scriptStatusMessage:
                    'Sources changed during generation. Generate a current source summary and retry.',
                },
                req,
                overrideAccess: false,
                context: { skipAiContentSync: true },
              })
              throw new Error('Sources changed during podcast generation.')
            }
          }
          await req.payload.update({
            collection: 'podcast-episodes',
            id,
            data,
            depth: 0,
            req,
            overrideAccess: false,
            context: {
              // A completed script must refresh the public transcript and other derived fields.
              // Processing/error-only patches must not rewrite published episode content.
              skipAiContentSync: data.scriptStatus !== 'ready',
              expectedSourceRevision: data.scriptStatus === 'ready' ? revision : undefined,
            },
          })
        },
        generate: ({ transcript, hostGender, guestGender }) =>
          generateScriptFromTranscript({
            transcript,
            sourceKind: 'source summary',
            hostGender,
            guestGender,
            apiKey: process.env['GEMINI_API_KEY']?.trim() ?? '',
            model: process.env['GEMINI_MODEL']?.trim() || undefined,
            editorPrompt: promptValidation.prompt,
          }),
      })

      return Response.json(result.body, { status: result.status })
    },
  },
  {
    path: '/stop-audio-generation',
    method: 'post',
    handler: async (req) => {
      if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
      if (
        !(await hasPermission(req, 'podcast-episodes', 'update')) ||
        !(await hasPermission(req, 'podcast-episodes', 'read'))
      )
        return Response.json({ error: 'Permission denied.' }, { status: 403 })
      const body = (req.json ? await req.json().catch(() => null) : null) as {
        id?: number | string
      } | null
      if (body?.id == null || body.id === '') {
        return Response.json({ error: 'Episode not found.' }, { status: 404 })
      }
      const controller = activeAudioGenerations.get(String(body.id))
      if (!controller) {
        return Response.json({ error: 'No active audio generation was found.' }, { status: 409 })
      }
      controller.abort()
      return Response.json({ status: 'stopping' })
    },
  },
  {
    path: '/save-generated-audio',
    method: 'post',
    handler: async (req) => {
      if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
      if (
        !(await hasPermission(req, 'podcast-episodes', 'update')) ||
        !(await hasPermission(req, 'podcast-episodes', 'read'))
      )
        return Response.json({ error: 'Permission denied.' }, { status: 403 })

      const body = (req.json ? await req.json().catch(() => null) : null) as {
        id?: number | string
      } | null
      if (body?.id == null || body.id === '') {
        return Response.json({ error: 'Episode not found.' }, { status: 404 })
      }
      const doc = await loadEpisode(req, body.id)
      const pendingAudioId = typeof doc?.pendingAudio === 'number' ? doc.pendingAudio : null
      if (!doc || pendingAudioId == null) {
        return Response.json({ error: 'Generate audio before saving it.' }, { status: 409 })
      }
      try {
        const saved = await saveGeneratedAudioToEpisode({
          payload: req.payload,
          req,
          episodeId: body.id,
          audioId: pendingAudioId,
        })
        return Response.json({
          status: 'ready',
          audioStatus: 'ready',
          mediaUrl: saved.mediaUrl,
          audio: pendingAudioId,
          audioSource: 'upload',
          meta: saved.duration,
          pendingAudio: null,
          audioStatusMessage: 'Generated audio saved. The public podcast now uses this audio.',
          pendingAudioUrl: null,
        })
      } catch (error) {
        req.payload.logger.error({ err: error }, 'save-generated-audio failed')
        return Response.json({ error: 'Could not save generated audio.' }, { status: 500 })
      }
    },
  },
  {
    path: '/generate-audio',
    method: 'post',
    handler: async (req) => {
      if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
      if (
        !(await hasPermission(req, 'podcast-episodes', 'update')) ||
        !(await hasPermission(req, 'podcast-episodes', 'read'))
      )
        return Response.json({ error: 'Permission denied.' }, { status: 403 })

      if (!(await hasPermission(req, 'podcast-audio', 'create')))
        return Response.json({ error: 'Audio upload permission required.' }, { status: 403 })
      let generationKey: string | null = null
      let controller: AbortController | null = null
      try {
        const body = (req.json ? await req.json().catch(() => null) : null) as {
          id?: number | string
          hostVoiceId?: unknown
          guestVoiceId?: unknown
        } | null
        const id = body?.id
        if (id == null || id === '') {
          return Response.json({ error: 'Episode not found.' }, { status: 404 })
        }

        const doc = await loadEpisode(req, id)
        const episodeId = typeof id === 'number' ? id : Number(id)
        generationKey = String(id)
        const requestController = new AbortController()
        controller = requestController
        activeAudioGenerations.set(generationKey, requestController)

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
                pendingAudio: doc.pendingAudio,
              } satisfies AudioPipelineDoc)
            : null,
          hostVoiceId: body?.hostVoiceId,
          guestVoiceId: body?.guestVoiceId,
          signal: requestController.signal,
          save: async (data) => {
            await req.payload.update({
              collection: 'podcast-episodes',
              id,
              data,
              depth: 0,
              req,
              overrideAccess: false,
              context: { skipAiContentSync: true, audioPreviewUpdate: true },
            })
          },
          generate: ({ scriptJson, hostVoiceId, guestVoiceId, title, onProgress }) =>
            generatePodcastAudioFromScript({
              scriptJson,
              hostVoiceId,
              guestVoiceId,
              title,
              baseUrl: process.env.KOKORO_BASE_URL?.trim() ?? '',
              modelId: process.env.KOKORO_MODEL?.trim() || undefined,
              speed: Number(process.env.KOKORO_SPEED || 1),
              timeoutMs: Number(process.env.KOKORO_TIMEOUT_MS || 120_000),
              onProgress,
              signal: requestController.signal,
            }),
          stageAudio: ({ buffer, filename, mimeType, title, durationSeconds }) =>
            createGeneratedAudioPreview({
              payload: req.payload,
              req,
              buffer,
              filename,
              mimeType,
              title,
              durationSeconds,
            }),
          discardAudio: async (audioId) => {
            await req.payload.delete({
              collection: 'podcast-audio',
              id: audioId,
              req,
              overrideAccess: true,
            })
          },
        })

        return Response.json(result.body, { status: result.status })
      } catch (error) {
        const message =
          error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof error.message === 'string'
            ? error.message
            : 'Could not generate podcast audio.'
        req.payload.logger.error({ err: error }, 'generate-audio failed')
        return Response.json({ error: message }, { status: 500 })
      } finally {
        if (
          generationKey &&
          controller &&
          activeAudioGenerations.get(generationKey) === controller
        ) {
          activeAudioGenerations.delete(generationKey)
        }
      }
    },
  },
]

export const episodeAiEndpoints: Endpoint[] = episodeGenerationEndpoints.map((endpoint) =>
  endpoint.method === 'post' &&
  endpoint.path !== '/stop-audio-generation' &&
  endpoint.path !== '/preview-kokoro-voice'
    ? { ...endpoint, handler: withEpisodeGenerationLock(endpoint.handler) }
    : endpoint,
) as Endpoint[]
