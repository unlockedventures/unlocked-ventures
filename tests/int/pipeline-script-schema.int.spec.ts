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
    speakers: {
      host: { role: 'host', gender: 'male' },
      guest: { role: 'guest', gender: 'female' },
    },
    estimatedWordCount: 2200,
    estimatedDurationSeconds: 900,
    sections: [
      {
        id: 's1',
        heading: 'The problem',
        visualCue: 'Wide shot of a busy office.',
        onScreenText: 'Rising costs',
        durationHintSeconds: 40,
        turns: [
          { speaker: 'host', text: 'Welcome — today we look at rising website costs.' },
          { speaker: 'guest', text: 'A company faced rising website costs across markets.' },
        ],
      },
    ],
  },
  summary:
    'This episode explores rising website costs across global markets and why teams feel stuck. The host and guest unpack how legacy tooling no longer scales for modern delivery. They finish with practical steps leaders can take to cut spend without slowing the business.',
  mainPoints: ['Point one', 'Point two'],
  contrastingPoints: ['Old process vs new platform'],
  disagreementPoints: [],
  systemOpinion: 'The source makes a strong efficiency case.',
}

describe('parseScriptEnvelope', () => {
  it('accepts a valid host/guest envelope', () => {
    const parsed = parseScriptEnvelope(validEnvelope)
    expect(parsed.script.title).toBe('Cost reduction story')
    // Legacy speakers.*.gender values are accepted and dropped.
    expect(parsed.script.speakers).toEqual({ host: { role: 'host' }, guest: { role: 'guest' } })
    expect(parsed.script.sections[0]?.turns).toHaveLength(2)
    expect(parsed.disagreementPoints).toEqual([])
    expect(formatScriptJson(parsed.script)).toContain('"speaker": "host"')
  })

  it('rejects narration-based sections', () => {
    expect(() =>
      parseScriptEnvelope({
        ...validEnvelope,
        script: {
          ...validEnvelope.script,
          sections: [
            {
              id: 's1',
              heading: 'Open',
              narration: 'Old style',
              visualCue: 'Desk',
              onScreenText: '',
              durationHintSeconds: 10,
              turns: [{ speaker: 'host', text: 'Hi' }],
            },
          ],
        },
      }),
    ).toThrow(/narration is not allowed/)
  })

  it('rejects invalid speaker roles on turns', () => {
    expect(() =>
      parseScriptEnvelope({
        ...validEnvelope,
        script: {
          ...validEnvelope.script,
          sections: [
            {
              ...validEnvelope.script.sections[0],
              turns: [{ speaker: 'narrator', text: 'Nope' }],
            },
          ],
        },
      }),
    ).toThrow(ScriptValidationError)
  })

  it('rejects more than 10 main points', () => {
    expect(() =>
      parseScriptEnvelope({
        ...validEnvelope,
        mainPoints: Array.from({ length: 11 }, (_, i) => `Point ${i + 1}`),
      }),
    ).toThrow(ScriptValidationError)
  })

  it('rejects a summary that is too short', () => {
    expect(() =>
      parseScriptEnvelope({
        ...validEnvelope,
        summary: 'Too short.',
      }),
    ).toThrow(/summary must have at least 3 sentences/)
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
