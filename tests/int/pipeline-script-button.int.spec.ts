import { describe, expect, it } from 'vitest'

import { scriptButtonState } from '@/pipeline/script-button-state'

describe('scriptButtonState', () => {
  it('asks for a save before the document has an id', () => {
    expect(
      scriptButtonState({
        saved: false,
        hasTranscript: true,
        scriptStatus: 'idle',
      }),
    ).toEqual({
      disabled: true,
      hint: 'Save this Pipeline document before creating a podcast script.',
    })
  })

  it('asks for a transcript before generating a script', () => {
    expect(
      scriptButtonState({
        saved: true,
        hasTranscript: false,
        scriptStatus: 'idle',
      }),
    ).toEqual({
      disabled: true,
      hint: 'Generate a transcript before creating a podcast script.',
    })
  })

  it('disables while a transcript is generating', () => {
    expect(
      scriptButtonState({
        saved: true,
        hasTranscript: true,
        scriptStatus: 'idle',
        transcriptStatus: 'processing',
      }),
    ).toEqual({
      disabled: true,
      hint: 'Wait for the transcript to finish before creating a podcast script.',
    })
  })

  it('disables the button while a script run is in progress', () => {
    expect(
      scriptButtonState({
        saved: true,
        hasTranscript: true,
        scriptStatus: 'processing',
      }),
    ).toEqual({ disabled: true, hint: null })
  })

  it('enables the button when a transcript is set', () => {
    expect(
      scriptButtonState({
        saved: true,
        hasTranscript: true,
        scriptStatus: 'idle',
      }),
    ).toEqual({ disabled: false, hint: null })
  })
})
