export function transcriptButtonState(args: {
  saved: boolean
  status: string | null | undefined
  scriptStatus?: string | null
  pending?: boolean
}) {
  if (!args.saved) {
    return {
      disabled: true,
      hint: 'Choose a channel, enter a title and video link, and add a thumbnail using Picture below. Then select Save video links to create a draft. You can generate the transcript after saving.',
    }
  }
  if (args.scriptStatus === 'processing') {
    return {
      disabled: true,
      hint: 'Wait for the podcast script to finish before generating a transcript.',
    }
  }
  if (args.pending || args.status === 'processing') return { disabled: true, hint: null }
  return { disabled: false, hint: null }
}
