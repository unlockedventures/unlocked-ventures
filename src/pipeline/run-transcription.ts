import { appendTranscript, failureBody } from '@/pipeline/transcript'
import { validateVideoLinks } from '@/pipeline/video-url'

export type PipelineStatus = 'idle' | 'processing' | 'ready' | 'error'

export type PipelineDoc = {
  id: number | string
  videoLinks?: { url?: string | null }[] | null
  transcript?: string | null
  status?: PipelineStatus | null
  statusMessage?: string | null
}

export type PipelinePatch = {
  transcript: string
  status: PipelineStatus
  statusMessage: string
}

export type TranscribeResult =
  | { ok: true; transcript: string }
  | { ok: false; error: string; stop: boolean; busy?: boolean }

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
  save: (data: PipelinePatch) => Promise<void>
  transcribe: (url: string) => Promise<TranscribeResult>
  wait?: (ms: number) => Promise<void>
}): Promise<RunResult> {
  if (!args.user) return { status: 401, body: { error: 'Unauthorized' } }
  if (!args.doc) return { status: 404, body: { error: 'Pipeline document not found.' } }
  if (args.doc.status === 'processing') {
    return { status: 409, body: { error: 'This transcript is already being generated.' } }
  }
  if (args.otherProcessing) return { status: 409, body: { error: busyMessage } }

  const links = validateVideoLinks(args.doc.videoLinks)
  if (!links.ok) return { status: 400, body: { error: links.message } }

  const wait = args.wait ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)))
  let transcript = ''
  let failed = false
  for (let index = 0; index < links.urls.length; index += 1) {
    const url = links.urls[index]
    await args.save({
      transcript,
      status: 'processing',
      statusMessage: `Generating transcript for video ${index + 1} of ${links.urls.length}.`,
    })

    const result = await transcribeWithBusyRetry({
      url,
      transcript,
      total: links.urls.length,
      index,
      save: args.save,
      transcribe: args.transcribe,
      wait,
    })
    if (result.ok) {
      transcript = appendTranscript(transcript, url, result.transcript)
      continue
    }

    if (result.busy && transcript === '') {
      await args.save({
        transcript: args.doc.transcript ?? '',
        status: 'idle',
        statusMessage: busyMessage,
      })
      return { status: 409, body: { error: busyMessage } }
    }

    if (result.stop) {
      await args.save({ transcript, status: 'error', statusMessage: result.error })
      return { status: 200, body: { status: 'error' } }
    }

    failed = true
    transcript = appendTranscript(transcript, url, failureBody(result.error))
  }

  await args.save({
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
    const result = await args.transcribe(args.url)
    if (!(result.ok === false && result.busy && args.transcript === '')) return result
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
