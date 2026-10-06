import { describe, expect, it } from 'vitest'

import {
  formatScriptJson,
  fromPointRows,
  parseScriptEnvelope,
  ScriptValidationError,
  toPointRows,
} from '@/pipeline/script-schema'

const validEnvelope = {
  script: {
    format: 'podcast_video',
    title: 'Cost reduction story',
    estimatedWordCount: 2200,
    estimatedDurationSeconds: 900,
    sections: [
      {
        id: 's1',
        heading: 'The problem',
        narration: 'A company faced rising website costs.',
        visualCue: 'Wide shot of a busy office.',
        onScreenText: 'Rising costs',
        durationHintSeconds: 40,
      },
    ],
  },
  summary: 'A short summary of the episode.',
  mainPoints: ['Point one', 'Point two'],
  contrastingPoints: ['Old process vs new platform'],
  disagreementPoints: [],
  systemOpinion: 'The source makes a strong efficiency case.',
}

describe('parseScriptEnvelope', () => {
  it('accepts a valid envelope', () => {
    const parsed = parseScriptEnvelope(validEnvelope)
    expect(parsed.script.title).toBe('Cost reduction story')
    expect(parsed.disagreementPoints).toEqual([])
    expect(formatScriptJson(parsed.script)).toContain('"format": "podcast_video"')
  })

  it('rejects more than 10 main points', () => {
    expect(() =>
      parseScriptEnvelope({
        ...validEnvelope,
        mainPoints: Array.from({ length: 11 }, (_, i) => `Point ${i + 1}`),
      }),
    ).toThrow(ScriptValidationError)
  })

  it('allows empty disagreement points', () => {
    const parsed = parseScriptEnvelope(validEnvelope)
    expect(parsed.disagreementPoints).toEqual([])
  })

  it('maps point rows both ways', () => {
    expect(toPointRows(['A', 'B'])).toEqual([{ point: 'A' }, { point: 'B' }])
    expect(fromPointRows([{ point: 'A' }, { point: '  ' }, { point: 'B' }])).toEqual(['A', 'B'])
  })
})
