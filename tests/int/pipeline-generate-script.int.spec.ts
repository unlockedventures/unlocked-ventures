import { describe, expect, it } from 'vitest'

import { generateScriptFromTranscript } from '@/pipeline/generate-script'
import { handleGenerateScriptRequest, type ScriptPipelinePatch } from '@/pipeline/run-generate-script'

const geminiPayload = {
  script: {
    format: 'podcast_video',
    title: 'Episode',
    speakers: {
      host: { role: 'host', gender: 'male' },
      guest: { role: 'guest', gender: 'female' },
    },
    estimatedWordCount: 2200,
    estimatedDurationSeconds: 800,
    sections: [
      {
        id: 's1',
        heading: 'Open',
        visualCue: 'Host at desk',
        onScreenText: 'Welcome',
        durationHintSeconds: 20,
        turns: [
          { speaker: 'host', text: 'Welcome to the show.' },
          { speaker: 'guest', text: 'Thanks for having me.' },
        ],
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
  it('returns mapped fields on success and keeps admin genders', async () => {
    const result = await generateScriptFromTranscript({
      transcript: 'Raw transcript text',
      apiKey: 'key',
      hostGender: 'female',
      guestGender: 'male',
      generate: async () => JSON.stringify(geminiPayload),
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.summary).toBe('Summary text')
    expect(result.mainPoints).toEqual([{ point: 'One' }])
    expect(result.scriptJson).toContain('podcast_video')
    expect(result.scriptJson).toContain('"gender": "female"')
    expect(result.scriptJson).toContain('"speaker": "host"')
  })

  it('fails when the API key is missing', async () => {
    const result = await generateScriptFromTranscript({
      transcript: 'Raw transcript text',
      apiKey: '',
      hostGender: 'male',
      guestGender: 'female',
    })
    expect(result).toEqual({ ok: false, error: 'Gemini is not configured.' })
  })

  it('fails when Gemini returns invalid JSON', async () => {
    const result = await generateScriptFromTranscript({
      transcript: 'Raw transcript text',
      apiKey: 'key',
      hostGender: 'male',
      guestGender: 'female',
      generate: async () => 'not-json',
    })
    expect(result).toEqual({ ok: false, error: 'Gemini returned invalid JSON.' })
  })

  it('retries a busy model and succeeds on a fallback', async () => {
    const calls: string[] = []
    const result = await generateScriptFromTranscript({
      transcript: 'Raw transcript text',
      apiKey: 'key',
      hostGender: 'male',
      guestGender: 'female',
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
      doc: {
        id: 1,
        transcript: 'Raw text',
        hostGender: 'male',
        guestGender: 'female',
        scriptStatus: 'idle',
      },
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
      doc: {
        id: 1,
        transcript: '  ',
        hostGender: 'male',
        guestGender: 'female',
        scriptStatus: 'idle',
      },
      save: async () => undefined,
      generate: async () => ({ ok: false, error: 'nope' }),
    })
    expect(result).toEqual({
      status: 400,
      body: { error: 'Add a transcript before creating a podcast script.' },
    })
  })

  it('returns 400 when genders are missing', async () => {
    const result = await handleGenerateScriptRequest({
      user: { id: 1 },
      doc: { id: 1, transcript: 'Raw text', scriptStatus: 'idle' },
      save: async () => undefined,
      generate: async () => ({ ok: false, error: 'nope' }),
    })
    expect(result).toEqual({
      status: 400,
      body: { error: 'Choose a host gender and a guest gender before creating a podcast script.' },
    })
  })

  it('accepts genders from the request body when the document has none', async () => {
    const saves: ScriptPipelinePatch[] = []
    const result = await handleGenerateScriptRequest({
      user: { id: 1 },
      doc: { id: 1, transcript: 'Raw text', scriptStatus: 'idle' },
      hostGender: 'female',
      guestGender: 'male',
      save: async (data) => {
        saves.push(data)
      },
      generate: async ({ hostGender, guestGender }) => {
        expect(hostGender).toBe('female')
        expect(guestGender).toBe('male')
        return {
          ok: true,
          scriptJson: '{"format":"podcast_video"}',
          summary: 'Summary',
          mainPoints: [],
          contrastingPoints: [],
          disagreementPoints: [],
          systemOpinion: 'Opinion',
        }
      },
    })
    expect(result).toEqual({ status: 200, body: { status: 'ready' } })
    expect(saves[0]).toMatchObject({
      hostGender: 'female',
      guestGender: 'male',
      scriptStatus: 'processing',
    })
  })
})
