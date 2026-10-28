import { describe, expect, it } from 'vitest'

import { audioButtonState } from '@/pipeline/audio-button-state'

describe('audioButtonState', () => {
  it('asks for a save before the document has an id', () => {
    expect(
      audioButtonState({
        saved: false,
        hasValidScript: true,
        hasSystemOpinion: true,
        hasHostVoiceId: true,
        hasGuestVoiceId: true,
        audioStatus: 'idle',
      }),
    ).toEqual({
      disabled: true,
      hint: 'Save this Pipeline document before generating podcast audio.',
    })
  })

  it('asks for a valid script.json', () => {
    expect(
      audioButtonState({
        saved: true,
        hasValidScript: false,
        hasSystemOpinion: true,
        hasHostVoiceId: true,
        hasGuestVoiceId: true,
        audioStatus: 'idle',
      }),
    ).toEqual({
      disabled: true,
      hint: 'Generate a valid script.json before creating podcast audio.',
    })
  })

  it('asks for UV takes', () => {
    expect(
      audioButtonState({
        saved: true,
        hasValidScript: true,
        hasSystemOpinion: false,
        hasHostVoiceId: true,
        hasGuestVoiceId: true,
        audioStatus: 'idle',
      }),
    ).toEqual({
      disabled: true,
      hint: 'Add UV takes before generating podcast audio.',
    })
  })

  it('asks for host and guest voice IDs', () => {
    expect(
      audioButtonState({
        saved: true,
        hasValidScript: true,
        hasSystemOpinion: true,
        hasHostVoiceId: false,
        hasGuestVoiceId: true,
        audioStatus: 'idle',
      }),
    ).toEqual({
      disabled: true,
      hint: 'Select Kokoro voices for the host and guest before generating audio.',
    })
  })

  it('disables while a script is generating', () => {
    expect(
      audioButtonState({
        saved: true,
        hasValidScript: true,
        hasSystemOpinion: true,
        hasHostVoiceId: true,
        hasGuestVoiceId: true,
        audioStatus: 'idle',
        scriptStatus: 'processing',
      }),
    ).toEqual({
      disabled: true,
      hint: 'Wait for the podcast script to finish before generating audio.',
    })
  })

  it('disables while audio is generating', () => {
    expect(
      audioButtonState({
        saved: true,
        hasValidScript: true,
        hasSystemOpinion: true,
        hasHostVoiceId: true,
        hasGuestVoiceId: true,
        audioStatus: 'processing',
      }),
    ).toEqual({ disabled: true, hint: null })
  })

  it('enables when script, opinion, and voices are ready', () => {
    expect(
      audioButtonState({
        saved: true,
        hasValidScript: true,
        hasSystemOpinion: true,
        hasHostVoiceId: true,
        hasGuestVoiceId: true,
        audioStatus: 'idle',
      }),
    ).toEqual({ disabled: false, hint: null })
  })
})
