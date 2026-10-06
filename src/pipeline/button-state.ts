export function transcriptButtonState(args: { saved: boolean; status: string | null | undefined }) {
  if (!args.saved) {
    return {
      disabled: true,
      hint: 'Save this Pipeline document before generating a transcript.',
    }
  }
  if (args.status === 'processing') return { disabled: true, hint: null }
  return { disabled: false, hint: null }
}
