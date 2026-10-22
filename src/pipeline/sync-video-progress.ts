import type { VideoResource } from './video-resources'

/** Update only job fields; never replace URLs or rows the editor is changing. */
export function syncVideoProgress(
  fields: Record<string, { value?: unknown; rows?: unknown[] } | undefined>,
  resources: VideoResource[] | null | undefined,
  dispatch: (action: { type: 'UPDATE'; path: string; value: unknown }) => void,
) {
  fields.videoLinks?.rows?.forEach((_, index) => {
    const url = fields[`videoLinks.${index}.url`]?.value
    const resource = resources?.find(
      (row) => typeof url === 'string' && row.url?.trim() === url.trim(),
    )
    if (!resource) return
    for (const field of [
      'transcriptionStatus',
      'videoTranscript',
      'transcribedUrl',
      'transcriptionError',
    ] as const) {
      dispatch({
        type: 'UPDATE',
        path: `videoLinks.${index}.${field}`,
        value: resource[field] ?? (field === 'transcriptionStatus' ? 'pending' : ''),
      })
    }
  })
}
