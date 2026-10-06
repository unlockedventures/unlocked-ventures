import type { GenerateScriptResult } from '@/pipeline/generate-script'
import { isSpeakerGender, type SpeakerGender } from '@/pipeline/script-schema'

export type ScriptStatus = 'idle' | 'processing' | 'ready' | 'error'

export type ScriptPipelineDoc = {
  id: number | string
  transcript?: string | null
  hostGender?: string | null
  guestGender?: string | null
  status?: string | null
  scriptStatus?: ScriptStatus | null
}

export type ScriptPipelinePatch = {
  scriptJson?: string
  summary?: string
  mainPoints?: { point: string }[]
  contrastingPoints?: { point: string }[]
  disagreementPoints?: { point: string }[]
  systemOpinion?: string
  scriptStatus: ScriptStatus
  scriptStatusMessage: string
}

export type ScriptRunResult = {
  status: number
  body: { error: string } | { status: ScriptStatus }
}

export async function handleGenerateScriptRequest(args: {
  user: unknown
  doc: ScriptPipelineDoc | null
  /** Optional genders from the request body (preferred over unsaved form/DB values). */
  hostGender?: unknown
  guestGender?: unknown
  save: (data: ScriptPipelinePatch & { hostGender?: SpeakerGender; guestGender?: SpeakerGender }) => Promise<void>
  generate: (args: {
    transcript: string
    hostGender: SpeakerGender
    guestGender: SpeakerGender
  }) => Promise<GenerateScriptResult>
}): Promise<ScriptRunResult> {
  if (!args.user) return { status: 401, body: { error: 'Unauthorized' } }
  if (!args.doc) return { status: 404, body: { error: 'Pipeline document not found.' } }
  if (args.doc.scriptStatus === 'processing') {
    return { status: 409, body: { error: 'This podcast script is already being generated.' } }
  }
  if (args.doc.status === 'processing') {
    return {
      status: 409,
      body: { error: 'Wait for the transcript to finish before creating a podcast script.' },
    }
  }

  const transcript = typeof args.doc.transcript === 'string' ? args.doc.transcript.trim() : ''
  if (!transcript) {
    return { status: 400, body: { error: 'Add a transcript before creating a podcast script.' } }
  }

  const hostGender = isSpeakerGender(args.hostGender)
    ? args.hostGender
    : isSpeakerGender(args.doc.hostGender)
      ? args.doc.hostGender
      : null
  const guestGender = isSpeakerGender(args.guestGender)
    ? args.guestGender
    : isSpeakerGender(args.doc.guestGender)
      ? args.doc.guestGender
      : null

  if (!hostGender || !guestGender) {
    return {
      status: 400,
      body: { error: 'Choose a host gender and a guest gender before creating a podcast script.' },
    }
  }

  await args.save({
    hostGender,
    guestGender,
    scriptStatus: 'processing',
    scriptStatusMessage: 'Generating podcast script…',
  })

  const result = await args.generate({ transcript, hostGender, guestGender })
  if (!result.ok) {
    await args.save({
      scriptStatus: 'error',
      scriptStatusMessage: result.error,
    })
    return { status: 200, body: { status: 'error' } }
  }

  await args.save({
    scriptJson: result.scriptJson,
    summary: result.summary,
    mainPoints: result.mainPoints,
    contrastingPoints: result.contrastingPoints,
    disagreementPoints: result.disagreementPoints,
    systemOpinion: result.systemOpinion,
    scriptStatus: 'ready',
    scriptStatusMessage: '',
  })
  return { status: 200, body: { status: 'ready' } }
}
