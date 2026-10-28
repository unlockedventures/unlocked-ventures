import { describe, expect, it } from 'vitest'

import { generateScriptFromTranscript, resolveScriptDuration } from '@/pipeline/generate-script'
import { applyAiContentToEpisode } from '@/pipeline/apply-ai-content'
import {
  handleGenerateScriptRequest,
  type ScriptPipelinePatch,
} from '@/pipeline/run-generate-script'

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
  summary:
    'This episode opens with a clear look at the core story from the source video. The host and guest trade perspectives on what matters most for listeners. They close by connecting the main tensions to practical takeaways teams can use.',
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
    expect(result.summary).toContain('This episode opens')
    expect(result.mainPoints).toEqual([{ point: 'One' }])
    expect(result.scriptJson).toContain('podcast_video')
    expect(result.scriptJson).toContain('"gender": "female"')
    expect(result.scriptJson).toContain('"speaker": "host"')
    expect(applyAiContentToEpisode({ scriptJson: result.scriptJson }).transcript).toEqual([
      { time: '0:00', speaker: 'Host', text: 'Welcome to the show.' },
      { time: '0:10', speaker: 'Guest', text: 'Thanks for having me.' },
    ])
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

  it('combines an edited brief with fixed script requirements', async () => {
    let sentPrompt = ''
    const result = await generateScriptFromTranscript({
      transcript: 'Raw transcript text',
      editorPrompt:
        'Create a 6-minute conversation for a skeptical executive audience and end with three takeaways.',
      apiKey: 'key',
      hostGender: 'male',
      guestGender: 'female',
      generate: async ({ prompt }) => {
        sentPrompt = prompt
        return JSON.stringify(geminiPayload)
      },
    })
    expect(result.ok).toBe(true)
    expect(sentPrompt).toContain('skeptical executive audience')
    expect(sentPrompt).toContain('fixed structural, grounding and safety requirements')
    expect(sentPrompt).toContain('6 minutes (360 seconds) and 900 spoken words')
    expect(sentPrompt).toContain('highest-priority creative requirement')
    expect(sentPrompt).toContain('<source_data>')
  })

  it('uses a three-minute fallback when the editable prompt has no duration', async () => {
    let sentPrompt = ''
    await generateScriptFromTranscript({
      transcript: 'Raw transcript text',
      editorPrompt: 'Use a warm, practical tone.',
      apiKey: 'key',
      hostGender: 'male',
      guestGender: 'female',
      generate: async ({ prompt }) => {
        sentPrompt = prompt
        return JSON.stringify(geminiPayload)
      },
    })
    expect(sentPrompt).toContain('3 minutes (180 seconds) and 450 spoken words')
    expect(sentPrompt).toContain('product fallback of 3 minutes')
  })

  it('recognizes common explicit duration wording', () => {
    expect(resolveScriptDuration('Make it 6-minute long')).toEqual({
      seconds: 360,
      explicit: true,
    })
    expect(resolveScriptDuration('Target 1.5 hours')).toEqual({
      seconds: 5400,
      explicit: true,
    })
    expect(resolveScriptDuration('No duration requested')).toEqual({
      seconds: 180,
      explicit: false,
    })
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

  it('returns 409 when a transcript is generating', async () => {
    const result = await handleGenerateScriptRequest({
      user: { id: 1 },
      doc: {
        id: 1,
        transcript: 'Raw text',
        hostGender: 'male',
        guestGender: 'female',
        status: 'processing',
        scriptStatus: 'idle',
      },
      save: async () => undefined,
      generate: async () => ({ ok: false, error: 'nope' }),
    })
    expect(result).toEqual({
      status: 409,
      body: { error: 'Wait for the transcript to finish before creating a podcast script.' },
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
