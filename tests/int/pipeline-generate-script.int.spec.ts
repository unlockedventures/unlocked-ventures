import { describe, expect, it } from 'vitest'

import { generateScriptFromTranscript } from '@/pipeline/generate-script'
import { handleGenerateScriptRequest, type ScriptPipelinePatch } from '@/pipeline/run-generate-script'

const geminiPayload = {
  script: {
    format: 'podcast_video',
    title: 'Episode',
    estimatedWordCount: 2200,
    estimatedDurationSeconds: 800,
    sections: [
      {
        id: 's1',
        heading: 'Open',
        narration: 'Welcome to the show.',
        visualCue: 'Host at desk',
        onScreenText: 'Welcome',
        durationHintSeconds: 20,
      },
    ],
  },
  summary: 'Summary text',
  mainPoints: ['One'],
  contrastingPoints: ['Contrast'],
  disagreementPoints: [],
  systemOpinion: 'Opinion text',
}

describe('generateScriptFromTranscript', () => {
  it('returns mapped fields on success', async () => {
    const result = await generateScriptFromTranscript({
      transcript: 'Raw transcript text',
      apiKey: 'key',
      generate: async () => JSON.stringify(geminiPayload),
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.summary).toBe('Summary text')
    expect(result.mainPoints).toEqual([{ point: 'One' }])
    expect(result.scriptJson).toContain('podcast_video')
  })

  it('fails when the API key is missing', async () => {
    const result = await generateScriptFromTranscript({
      transcript: 'Raw transcript text',
      apiKey: '',
    })
    expect(result).toEqual({ ok: false, error: 'Gemini is not configured.' })
  })

  it('fails when Gemini returns invalid JSON', async () => {
    const result = await generateScriptFromTranscript({
      transcript: 'Raw transcript text',
      apiKey: 'key',
      generate: async () => 'not-json',
    })
    expect(result).toEqual({ ok: false, error: 'Gemini returned invalid JSON.' })
  })

  it('retries a busy model and succeeds on a fallback', async () => {
    const calls: string[] = []
    const result = await generateScriptFromTranscript({
      transcript: 'Raw transcript text',
      apiKey: 'key',
      model: 'gemini-flash-latest',
      sleep: async () => undefined,
      generate: async ({ model }) => {
        calls.push(model)
        if (model === 'gemini-flash-latest') {
          throw new Error('[503 Service Unavailable] high demand')
        }
        return JSON.stringify(geminiPayload)
      },
    })
    expect(result.ok).toBe(true)
    expect(calls[0]).toBe('gemini-flash-latest')
    expect(calls.some((model) => model === 'gemini-3.1-flash-lite')).toBe(true)
  })
})

describe('handleGenerateScriptRequest', () => {
  it('saves ready fields after a successful generate', async () => {
    const saves: ScriptPipelinePatch[] = []
    const result = await handleGenerateScriptRequest({
      user: { id: 1 },
      doc: { id: 1, transcript: 'Raw text', scriptStatus: 'idle' },
      save: async (data) => {
        saves.push(data)
      },
      generate: async () => ({
        ok: true,
        scriptJson: '{"format":"podcast_video"}',
        summary: 'Summary',
        mainPoints: [{ point: 'One' }],
        contrastingPoints: [],
        disagreementPoints: [],
        systemOpinion: 'Opinion',
      }),
    })
    expect(result).toEqual({ status: 200, body: { status: 'ready' } })
    expect(saves[0]).toMatchObject({ scriptStatus: 'processing' })
    expect(saves.at(-1)).toMatchObject({
      scriptStatus: 'ready',
      summary: 'Summary',
      systemOpinion: 'Opinion',
    })
  })

  it('returns 400 when the transcript is empty', async () => {
    const result = await handleGenerateScriptRequest({
      user: { id: 1 },
      doc: { id: 1, transcript: '  ', scriptStatus: 'idle' },
      save: async () => undefined,
      generate: async () => ({ ok: false, error: 'nope' }),
    })
    expect(result).toEqual({
      status: 400,
      body: { error: 'Add a transcript before creating a podcast script.' },
    })
  })
})
