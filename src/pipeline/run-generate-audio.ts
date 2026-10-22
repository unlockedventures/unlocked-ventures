import type { Payload, PayloadRequest } from 'payload'

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
}

export type AudioPipelinePatch = {
  hostVoiceId?: string
  guestVoiceId?: string
  audioStatus: AudioStatus
  audioStatusMessage: string
}

export type AudioRunResult = {
  status: number
  body: { error: string } | { status: AudioStatus }
}

function relationId(value: number | { id?: number } | null | undefined): number | null {
  if (typeof value === 'number') return value
  if (value && typeof value.id === 'number') return value.id
  return null
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
  }) => Promise<GeneratePodcastAudioResult>
  attachToEpisode: (args: {
    episodeId: number | null
    buffer: Buffer
    filename: string
    mimeType: string
    title: string
  }) => Promise<number | null>
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
      body: { error: 'Paste ElevenLabs voice IDs for the host and guest before generating audio.' },
    }
  }

  const title = typeof args.doc.name === 'string' ? args.doc.name.trim() : ''

  await args.save({
    hostVoiceId,
    guestVoiceId,
    audioStatus: 'processing',
    audioStatusMessage: 'Generating host and guest audio…',
  })

  const result = await args.generate({ scriptJson, hostVoiceId, guestVoiceId, title })
  if (!result.ok) {
    await args.save({
      audioStatus: 'error',
      audioStatusMessage: result.error,
    })
    return { status: 200, body: { status: 'error' } }
  }

  try {
    await args.attachToEpisode({
      episodeId: relationId(args.doc.episode),
      buffer: result.buffer,
      filename: result.filename,
      mimeType: result.mimeType,
      title: title || 'Podcast',
    })
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

  await args.save({
    audioStatus: 'ready',
    audioStatusMessage: `Generated ${result.turnCount} dialogue turns.`,
  })
  return { status: 200, body: { status: 'ready' } }
}

/** Upload WAV to podcast-audio and point the linked episode at it. */
export async function attachGeneratedAudioToEpisode(args: {
  payload: Payload
  req?: PayloadRequest
  episodeId: number | null
  buffer: Buffer
  filename: string
  mimeType: string
  title: string
}): Promise<number | null> {
  const audioDoc = await args.payload.create({
    collection: 'podcast-audio',
    data: { alt: `${args.title} — host & guest` },
    file: {
      data: args.buffer,
      mimetype: args.mimeType,
      name: args.filename,
      size: args.buffer.length,
    },
    depth: 0,
    overrideAccess: !args.req?.user,
    req: args.req,
  })

  const audioId = typeof audioDoc.id === 'number' ? audioDoc.id : Number(audioDoc.id)
  const mediaUrl = typeof audioDoc.url === 'string' ? audioDoc.url : undefined
  if (args.episodeId == null) return audioId

  await args.payload.update({
    collection: 'podcast-episodes',
    id: args.episodeId,
    data: {
      audioSource: 'upload',
      audio: audioId,
      ...(mediaUrl ? { mediaUrl } : {}),
    },
    depth: 0,
    overrideAccess: !args.req?.user,
    req: args.req,
  })

  return audioId
}
