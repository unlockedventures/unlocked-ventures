import type { Payload, PayloadRequest } from 'payload'

import { formatAudioDuration } from '@/pipeline/audio-duration'
import {
  generatePodcastAudioFromScript,
  parseStoredScriptJson,
  type GeneratePodcastAudioResult,
} from '@/pipeline/generate-audio'

export type AudioStatus = 'idle' | 'processing' | 'ready' | 'error'

export type AudioPipelineDoc = {
  id: number | string
  name?: string | null
  scriptJson?: string | null
  systemOpinion?: string | null
  hostVoiceId?: string | null
  guestVoiceId?: string | null
  episode?: number | { id?: number } | null
  status?: string | null
  scriptStatus?: string | null
  audioStatus?: AudioStatus | null
  pendingAudio?: number | { id?: number } | null
}

export type AudioPipelinePatch = {
  hostVoiceId?: string
  guestVoiceId?: string
  audioStatus: AudioStatus
  audioStatusMessage: string
  pendingAudio?: number | null
  pendingAudioUrl?: string | null
}

export type AudioRunResult = {
  status: number
  body: { error: string } | { status: AudioStatus }
}

function relationId(value: number | { id?: number } | null | undefined): number | null {
  if (typeof value === 'number') return value
  return value && typeof value.id === 'number' ? value.id : null
}

export async function handleGenerateAudioRequest(args: {
  user: unknown
  doc: AudioPipelineDoc | null
  hostVoiceId?: unknown
  guestVoiceId?: unknown
  save: (data: AudioPipelinePatch) => Promise<void>
  generate: (args: {
    scriptJson: string
    hostVoiceId: string
    guestVoiceId: string
    title: string
    onProgress: (completedTurns: number, totalTurns: number) => Promise<void>
    signal?: AbortSignal
  }) => Promise<GeneratePodcastAudioResult>
  stageAudio: (args: {
    buffer: Buffer
    filename: string
    mimeType: string
    title: string
    durationSeconds: number
  }) => Promise<{ audioId: number; mediaUrl: string | null }>
  discardAudio?: (audioId: number) => Promise<void>
  signal?: AbortSignal
}): Promise<AudioRunResult> {
  if (!args.user) return { status: 401, body: { error: 'Unauthorized' } }
  if (!args.doc) return { status: 404, body: { error: 'Pipeline document not found.' } }
  if (args.doc.audioStatus === 'processing') {
    return { status: 409, body: { error: 'Podcast audio is already being generated.' } }
  }
  if (args.doc.status === 'processing') {
    return {
      status: 409,
      body: { error: 'Wait for the transcript to finish before generating podcast audio.' },
    }
  }
  if (args.doc.scriptStatus === 'processing') {
    return {
      status: 409,
      body: { error: 'Wait for the podcast script to finish before generating audio.' },
    }
  }

  const scriptJson = typeof args.doc.scriptJson === 'string' ? args.doc.scriptJson.trim() : ''
  if (!scriptJson || !parseStoredScriptJson(scriptJson)) {
    return {
      status: 400,
      body: { error: 'Generate a valid script.json before creating podcast audio.' },
    }
  }

  const systemOpinion =
    typeof args.doc.systemOpinion === 'string' ? args.doc.systemOpinion.trim() : ''
  if (!systemOpinion) {
    return {
      status: 400,
      body: { error: "Add the system's overall opinion before generating podcast audio." },
    }
  }

  const hostVoiceId =
    typeof args.hostVoiceId === 'string' && args.hostVoiceId.trim()
      ? args.hostVoiceId.trim()
      : typeof args.doc.hostVoiceId === 'string'
        ? args.doc.hostVoiceId.trim()
        : ''
  const guestVoiceId =
    typeof args.guestVoiceId === 'string' && args.guestVoiceId.trim()
      ? args.guestVoiceId.trim()
      : typeof args.doc.guestVoiceId === 'string'
        ? args.doc.guestVoiceId.trim()
        : ''

  if (!hostVoiceId || !guestVoiceId) {
    return {
      status: 400,
      body: { error: 'Select Kokoro voices for the host and guest before generating audio.' },
    }
  }

  const title = typeof args.doc.name === 'string' ? args.doc.name.trim() : ''

  await args.save({
    hostVoiceId,
    guestVoiceId,
    audioStatus: 'processing',
    audioStatusMessage: 'Generating host and guest audio…',
  })

  const result = await args.generate({
    scriptJson,
    hostVoiceId,
    guestVoiceId,
    title,
    signal: args.signal,
    onProgress: async (completedTurns, totalTurns) => {
      const percent = Math.round((completedTurns / totalTurns) * 100)
      await args.save({
        audioStatus: 'processing',
        audioStatusMessage: `Generating audio: ${completedTurns} of ${totalTurns} turns (${percent}%).`,
      })
    },
  })
  if (!result.ok) {
    await args.save({
      audioStatus: 'error',
      audioStatusMessage: result.error,
    })
    return { status: 200, body: { status: 'error' } }
  }

  try {
    const staged = await args.stageAudio({
      buffer: result.buffer,
      filename: result.filename,
      mimeType: result.mimeType,
      title: title || 'Podcast',
      durationSeconds: result.durationSeconds,
    })
    await args.save({
      audioStatus: 'ready',
      audioStatusMessage: `Generated ${result.turnCount} dialogue turns. Preview it, then save to publish.`,
      pendingAudio: staged.audioId,
      pendingAudioUrl: staged.mediaUrl,
    })
    const previousPreviewId = relationId(args.doc.pendingAudio)
    if (previousPreviewId != null && previousPreviewId !== staged.audioId) {
      try {
        await args.discardAudio?.(previousPreviewId)
      } catch {
        // The new preview remains valid; orphan cleanup can be retried operationally.
      }
    }
  } catch (error) {
    const message =
      error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
        ? error.message
        : 'Failed to save podcast audio to the episode.'
    await args.save({
      audioStatus: 'error',
      audioStatusMessage: message,
    })
    return { status: 200, body: { status: 'error' } }
  }

  return { status: 200, body: { status: 'ready' } }
}

/** Upload a generated WAV as a preview without changing the public episode audio. */
export async function createGeneratedAudioPreview(args: {
  payload: Payload
  req?: PayloadRequest
  buffer: Buffer
  filename: string
  mimeType: string
  title: string
  durationSeconds: number
}): Promise<{ audioId: number; mediaUrl: string | null }> {
  const audioDoc = await args.payload.create({
    collection: 'podcast-audio',
    data: {
      alt: `${args.title} — host & guest`,
      durationSeconds: args.durationSeconds,
    },
    file: {
      data: args.buffer,
      mimetype: args.mimeType,
      name: args.filename,
      size: args.buffer.length,
    },
    depth: 0,
    overrideAccess: !args.req?.user,
    req: args.req,
    context: { generatedAudioDuration: true },
  })

  const audioId = typeof audioDoc.id === 'number' ? audioDoc.id : Number(audioDoc.id)
  const mediaUrl = typeof audioDoc.url === 'string' ? audioDoc.url : null
  return { audioId, mediaUrl }
}

/** Commit a generated preview to the episode. This is the public-audio boundary. */
export async function saveGeneratedAudioToEpisode(args: {
  payload: Payload
  req: PayloadRequest
  episodeId: number | string
  audioId: number
}): Promise<{ mediaUrl: string; duration: string }> {
  const audioDoc = await args.payload.findByID({
    collection: 'podcast-audio',
    id: args.audioId,
    depth: 0,
    req: args.req,
    overrideAccess: true,
  })
  const mediaUrl = typeof audioDoc.url === 'string' ? audioDoc.url : ''
  if (!mediaUrl) throw new Error('Generated audio URL is unavailable.')
  const duration = formatAudioDuration(audioDoc.durationSeconds)
  await args.payload.update({
    collection: 'podcast-episodes',
    id: args.episodeId,
    data: {
      audioSource: 'upload',
      audio: args.audioId,
      mediaUrl,
      meta: duration,
      pendingAudio: null,
      pendingAudioUrl: null,
      audioStatus: 'ready',
      audioStatusMessage: 'Generated audio saved. The public podcast now uses this audio.',
    },
    depth: 0,
    overrideAccess: false,
    req: args.req,
    context: { skipAiContentSync: true, audioPreviewUpdate: true },
  })
  return { mediaUrl, duration }
}
