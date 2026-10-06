export function scriptButtonState(args: {
  saved: boolean
  hasTranscript: boolean
  hasHostGender: boolean
  hasGuestGender: boolean
  scriptStatus: string | null | undefined
  pending?: boolean
}) {
  if (!args.saved) {
    return {
      disabled: true,
      hint: 'Save this Pipeline document before creating a podcast script.',
    }
  }
  if (!args.hasTranscript) {
    return {
      disabled: true,
      hint: 'Generate a transcript before creating a podcast script.',
    }
  }
  if (!args.hasHostGender || !args.hasGuestGender) {
    return {
      disabled: true,
      hint: 'Choose a host gender and a guest gender before creating a podcast script.',
    }
  }
  if (args.pending || args.scriptStatus === 'processing') {
    return { disabled: true, hint: null }
  }
  return { disabled: false, hint: null }
}
