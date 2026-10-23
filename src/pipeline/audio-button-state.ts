export function audioButtonState(args: {
  saved: boolean
  hasValidScript: boolean
  hasSystemOpinion: boolean
  hasHostVoiceId: boolean
  hasGuestVoiceId: boolean
  audioStatus: string | null | undefined
  /** Block while transcript or script generation is running. */
  transcriptStatus?: string | null
  scriptStatus?: string | null
  pending?: boolean
}) {
  if (!args.saved) {
    return {
      disabled: true,
      hint: 'Save this Pipeline document before generating podcast audio.',
    }
  }
  if (args.transcriptStatus === 'processing') {
    return {
      disabled: true,
      hint: 'Wait for the transcript to finish before generating podcast audio.',
    }
  }
  if (args.scriptStatus === 'processing') {
    return {
      disabled: true,
      hint: 'Wait for the podcast script to finish before generating audio.',
    }
  }
  if (!args.hasValidScript) {
    return {
      disabled: true,
      hint: 'Generate a valid script.json before creating podcast audio.',
    }
  }
  if (!args.hasSystemOpinion) {
    return {
      disabled: true,
      hint: 'Add UV takes before generating podcast audio.',
    }
  }
  if (!args.hasHostVoiceId || !args.hasGuestVoiceId) {
    return {
      disabled: true,
      hint: 'Paste ElevenLabs voice IDs for the host and guest before generating audio.',
    }
  }
  if (args.pending || args.audioStatus === 'processing') {
    return { disabled: true, hint: null }
  }
  return { disabled: false, hint: null }
}
