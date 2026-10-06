import type { GenerateScriptResult } from '@/pipeline/generate-script'

export type ScriptStatus = 'idle' | 'processing' | 'ready' | 'error'

export type ScriptPipelineDoc = {
  id: number | string
  transcript?: string | null
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
  save: (data: ScriptPipelinePatch) => Promise<void>
  generate: (transcript: string) => Promise<GenerateScriptResult>
}): Promise<ScriptRunResult> {
  if (!args.user) return { status: 401, body: { error: 'Unauthorized' } }
  if (!args.doc) return { status: 404, body: { error: 'Pipeline document not found.' } }
  if (args.doc.scriptStatus === 'processing') {
    return { status: 409, body: { error: 'This podcast script is already being generated.' } }
  }

  const transcript = typeof args.doc.transcript === 'string' ? args.doc.transcript.trim() : ''
  if (!transcript) {
    return { status: 400, body: { error: 'Add a transcript before creating a podcast script.' } }
  }

  await args.save({
    scriptStatus: 'processing',
    scriptStatusMessage: 'Generating podcast script…',
  })

  const result = await args.generate(transcript)
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
