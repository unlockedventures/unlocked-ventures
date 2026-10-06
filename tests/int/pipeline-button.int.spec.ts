import { describe, expect, it } from 'vitest'

import { transcriptButtonState } from '@/pipeline/button-state'

describe('transcriptButtonState', () => {
  it('asks for a save before the document has an id', () => {
    expect(transcriptButtonState({ saved: false, status: 'idle' })).toEqual({
      disabled: true,
      hint: 'Save this Pipeline document before generating a transcript.',
    })
  })

  it('disables the button while a run is in progress', () => {
    expect(transcriptButtonState({ saved: true, status: 'processing' })).toEqual({
      disabled: true,
      hint: null,
    })
  })

  it('enables the button for a saved idle document', () => {
    expect(transcriptButtonState({ saved: true, status: 'idle' })).toEqual({
      disabled: false,
      hint: null,
    })
  })

  it('disables the button while the request is pending', () => {
    expect(transcriptButtonState({ saved: true, status: 'idle', pending: true })).toEqual({
      disabled: true,
      hint: null,
    })
  })
})
