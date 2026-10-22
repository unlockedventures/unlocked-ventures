export type VideoResource = {
  id?: string | null
  url?: string | null
  transcriptionStatus?: 'pending' | 'processing' | 'completed' | 'failed' | null
  videoTranscript?: string | null
  transcribedUrl?: string | null
  transcriptionError?: string | null
}

export function hasCompletedTranscription(resource: VideoResource): boolean {
  return (
    resource.transcriptionStatus === 'completed' &&
    resource.url?.trim() === resource.transcribedUrl &&
    Boolean(resource.videoTranscript?.trim())
  )
}

/** Restore server-owned job fields on normal editor saves; reset a changed URL. */
export function reconcileVideoResources(
  incoming: VideoResource[],
  previous: VideoResource[] = [],
): VideoResource[] {
  return incoming.map((row) => {
    const url = row.url?.trim() ?? ''
    const saved = previous.find(
      (entry) => entry.url?.trim() === url && (!row.id || !entry.id || row.id === entry.id),
    )
    return {
      ...row,
      transcriptionStatus: saved?.transcriptionStatus ?? 'pending',
      videoTranscript: saved?.videoTranscript ?? '',
      transcribedUrl: saved?.transcribedUrl ?? '',
      transcriptionError: saved?.transcriptionError ?? '',
    }
  })
}
