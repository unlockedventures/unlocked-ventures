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

export async function handleTranscribeRequest(args: {
  user: unknown
  doc: PipelineDoc | null
  otherProcessing: boolean
  save: (data: PipelinePatch) => Promise<void>
  transcribe: (url: string) => Promise<TranscribeResult>
}): Promise<RunResult> {
  if (!args.user) return { status: 401, body: { error: 'Unauthorized' } }
  if (!args.doc) return { status: 404, body: { error: 'Pipeline document not found.' } }
  if (args.doc.status === 'processing') {
    return { status: 409, body: { error: 'This transcript is already being generated.' } }
  }
  if (args.otherProcessing) return { status: 409, body: { error: busyMessage } }

  const links = validateVideoLinks(args.doc.videoLinks)
  if (!links.ok) return { status: 400, body: { error: links.message } }

  let transcript = ''
  let failed = false
  for (let index = 0; index < links.urls.length; index += 1) {
    const url = links.urls[index]
    await args.save({
      transcript,
      status: 'processing',
      statusMessage: `Generating transcript for video ${index + 1} of ${links.urls.length}.`,
    })

    const result = await args.transcribe(url)
    if (result.ok) {
      transcript = appendTranscript(transcript, url, result.transcript)
      continue
    }

    if (result.busy && transcript === '') {
      await args.save({
        transcript: args.doc.transcript ?? '',
        status: args.doc.status ?? 'idle',
        statusMessage: args.doc.statusMessage ?? '',
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
