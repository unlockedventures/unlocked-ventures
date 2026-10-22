import { describe, expect, it } from 'vitest'

import { transcriptButtonState } from '@/pipeline/button-state'

describe('transcriptButtonState', () => {
  it('asks for a save before the document has an id', () => {
    expect(transcriptButtonState({ saved: false, status: 'idle' })).toEqual({
      disabled: true,
      hint: 'Choose a channel, enter a title and video link, and add a thumbnail using Picture below. Then select Save video links to create a draft. You can generate the transcript after saving.',
    })
  })

  it('disables the button while a run is in progress', () => {
    expect(transcriptButtonState({ saved: true, status: 'processing' })).toEqual({
      disabled: true,
      hint: null,
    })
  })

  it('disables the button while a podcast script is generating', () => {
    expect(
      transcriptButtonState({ saved: true, status: 'ready', scriptStatus: 'processing' }),
    ).toEqual({
      disabled: true,
      hint: 'Wait for the podcast script to finish before generating a transcript.',
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
