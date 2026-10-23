import { hasCompletedTranscription, type VideoResource } from '@/pipeline/video-resources'

export type SourceSummaryDoc = {
  videoLinks?: VideoResource[] | null
  sourceTranscript?: string | null
  sourceSummary?: string | null
  currentSourceRevision?: string | null
  sourceSummaryRevision?: string | null
  sourceSummaryStatus?: string | null
}

export function sourceSummaryInput(doc: SourceSummaryDoc) {
  if (!doc.videoLinks?.length || !doc.videoLinks.every(hasCompletedTranscription)) {
    return { error: 'Complete transcription for every current video link before generating a source summary.' }
  }
  const transcript = doc.sourceTranscript?.trim() ?? ''
  if (!transcript) return { error: 'Generate a nonblank combined source transcript first.' }
  return { transcript }
}

/** Browser-safe identity; the server always computes its own trusted revision. */
export async function sourceRevision(doc: SourceSummaryDoc): Promise<string> {
  const canonical = JSON.stringify([
    doc.videoLinks?.map((row) => [
      row.url?.trim() ?? '',
      row.transcriptionStatus ?? '',
      row.transcribedUrl ?? '',
      row.videoTranscript?.trim() ?? '',
    ]) ?? [],
    doc.sourceTranscript?.trim() ?? '',
  ])
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function hasCurrentSourceSummary(doc: SourceSummaryDoc) {
  return (
    !sourceSummaryInput(doc).error &&
    doc.sourceSummaryStatus === 'ready' &&
    Boolean(doc.sourceSummary?.trim()) &&
    Boolean(doc.currentSourceRevision) &&
    doc.currentSourceRevision === doc.sourceSummaryRevision
  )
}

/** Reconstruct all current rows, including empty ones, rather than filtering invalid sources out. */
export function sourceFromFields(fields: Record<string, { value?: unknown; rows?: unknown[] } | undefined>) {
  const text = (path: string) => typeof fields[path]?.value === 'string' ? fields[path]!.value as string : ''
  const videoLinks: VideoResource[] = (fields.videoLinks?.rows ?? []).map((_, index) => ({
    url: text(`videoLinks.${index}.url`),
    transcriptionStatus: text(`videoLinks.${index}.transcriptionStatus`) as VideoResource['transcriptionStatus'],
    transcribedUrl: text(`videoLinks.${index}.transcribedUrl`),
    videoTranscript: text(`videoLinks.${index}.videoTranscript`),
  }))
  return {
    videoLinks,
    sourceTranscript: text('sourceTranscript'),
    sourceSummary: text('sourceSummary'),
    currentSourceRevision: text('currentSourceRevision'),
    sourceSummaryRevision: text('sourceSummaryRevision'),
    sourceSummaryStatus: text('sourceSummaryStatus'),
  }
}
