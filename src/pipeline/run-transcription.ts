import { failureBody, updateVideoTranscript } from '@/pipeline/transcript'
import { validateVideoLinks } from '@/pipeline/video-url'
import {
  hasCompletedTranscription,
  reconcileVideoResources,
  type VideoResource,
} from '@/pipeline/video-resources'

export type PipelineStatus = 'idle' | 'processing' | 'ready' | 'error'

export type PipelineDoc = {
  id: number | string
  videoLinks?: VideoResource[] | null
  transcript?: string | null
  status?: PipelineStatus | null
  statusMessage?: string | null
  scriptStatus?: string | null
}

export type PipelinePatch = {
  transcript: string
  status: PipelineStatus
  statusMessage: string
  videoLinks?: VideoResource[]
}

export type TranscribeResult =
  { ok: true; transcript: string } | { ok: false; error: string; stop: boolean; busy?: boolean }

export type RunResult = {
  status: number
  body: { error: string } | { status: PipelineStatus }
}

const busyMessage = 'Another transcript is already being generated. Try again when it finishes.'
const busyRetryLimit = 40
const busyRetryDelayMs = 3000

export async function handleTranscribeRequest(args: {
  user: unknown
  doc: PipelineDoc | null
  otherProcessing: boolean
  /** Optional links from the request body (preferred over unsaved form/DB values). */
  videoLinks?: { url?: string | null }[] | null
  save: (data: PipelinePatch) => Promise<void>
  transcribe: (url: string) => Promise<TranscribeResult>
  wait?: (ms: number) => Promise<void>
}): Promise<RunResult> {
  if (!args.user) return { status: 401, body: { error: 'Unauthorized' } }
  if (!args.doc) return { status: 404, body: { error: 'Pipeline document not found.' } }
  if (args.doc.status === 'processing') {
    return { status: 409, body: { error: 'This transcript is already being generated.' } }
  }
  if (args.doc.scriptStatus === 'processing') {
    return {
      status: 409,
      body: { error: 'Wait for the podcast script to finish before generating a transcript.' },
    }
  }
  if (args.otherProcessing) return { status: 409, body: { error: busyMessage } }

  const links = validateVideoLinks(args.videoLinks ?? args.doc.videoLinks)
  if (!links.ok) return { status: 400, body: { error: links.message } }

  const uniqueUrls = [...new Set(links.urls)]
  const persistedLinks = reconcileVideoResources(
    uniqueUrls.map((url) => ({ url })),
    args.doc.videoLinks ?? [],
  ).map((row) => {
    const existing = args.doc!.videoLinks?.find((entry) => entry.url?.trim() === row.url)
    return { ...row, ...(existing?.id ? { id: existing.id } : {}) }
  })
  const save = async (data: PipelinePatch) =>
    args.save({ ...data, videoLinks: persistedLinks.map((row) => ({ ...row })) })
  let transcript = args.doc.transcript ?? ''
  const pendingResources = persistedLinks.filter((row) => !hasCompletedTranscription(row))
  if (pendingResources.length === 0) {
    await save({
      transcript,
      status: 'ready',
      statusMessage: 'All video links already have transcripts.',
    })
    return { status: 200, body: { status: 'ready' } }
  }
  const wait = args.wait ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)))
  let failed = false
  for (let index = 0; index < pendingResources.length; index += 1) {
    const resource = pendingResources[index]
    const url = resource.url!
    resource.transcriptionStatus = 'processing'
    resource.transcriptionError = ''
    await save({
      transcript,
      status: 'processing',
      statusMessage: `Generating transcript for video ${index + 1} of ${pendingResources.length}.`,
    })

    const result = await transcribeWithBusyRetry({
      url,
      transcript,
      total: pendingResources.length,
      index,
      save,
      transcribe: args.transcribe,
      wait,
    })
    if (result.ok) {
      resource.transcriptionStatus = 'completed'
      resource.videoTranscript = result.transcript
      resource.transcribedUrl = url
      transcript = updateVideoTranscript(transcript, url, result.transcript)
      await save({
        transcript,
        status: 'processing',
        statusMessage: `Finished video ${index + 1} of ${pendingResources.length}.`,
      })
      continue
    }

    if (result.busy) {
      resource.transcriptionStatus = 'pending'
      resource.transcriptionError = busyMessage
      await save({
        transcript,
        status: 'idle',
        statusMessage: busyMessage,
      })
      return { status: 409, body: { error: busyMessage } }
    }

    resource.transcriptionStatus = 'failed'
    resource.transcriptionError = result.error
    if (result.stop) {
      await save({ transcript, status: 'error', statusMessage: result.error })
      return { status: 200, body: { status: 'error' } }
    }

    failed = true
    transcript = updateVideoTranscript(transcript, url, failureBody(result.error))
    await save({ transcript, status: 'processing', statusMessage: result.error })
  }

  await save({
    transcript,
    status: failed ? 'error' : 'ready',
    statusMessage: failed ? 'Some videos could not be transcribed.' : '',
  })
  return { status: 200, body: { status: failed ? 'error' : 'ready' } }
}

async function transcribeWithBusyRetry(args: {
  url: string
  transcript: string
  total: number
  index: number
  save: (data: PipelinePatch) => Promise<void>
  transcribe: (url: string) => Promise<TranscribeResult>
  wait: (ms: number) => Promise<void>
}): Promise<TranscribeResult> {
  for (let attempt = 0; attempt <= busyRetryLimit; attempt += 1) {
    let result: TranscribeResult
    try {
      result = await args.transcribe(args.url)
    } catch {
      return { ok: false, error: 'Transcription failed. Try again.', stop: true }
    }
    if (result.ok && !result.transcript.trim()) {
      return { ok: false, error: 'No transcript text was returned for this video.', stop: false }
    }
    if (!(result.ok === false && result.busy)) return result
    if (attempt === busyRetryLimit) return result

    await args.save({
      transcript: args.transcript,
      status: 'processing',
      statusMessage: 'Waiting for another transcript to finish.',
    })
    await args.wait(busyRetryDelayMs)
    await args.save({
      transcript: args.transcript,
      status: 'processing',
      statusMessage: `Generating transcript for video ${args.index + 1} of ${args.total}.`,
    })
  }

  return { ok: false, error: busyMessage, stop: true, busy: true }
}
