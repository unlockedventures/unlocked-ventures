/** Resolve episode cover from upload or external image URL. */
export function podcastCoverSrc(doc: {
  imageSource?: string | null
  imageUrl?: string | null
  image?: number | { url?: string | null } | null
}): string | undefined {
  const external = typeof doc.imageUrl === 'string' ? doc.imageUrl.trim() : ''
  const uploaded =
    doc.image && typeof doc.image === 'object' && doc.image.url ? doc.image.url : undefined

  if (doc.imageSource === 'url') return external || undefined
  return uploaded || external || undefined
}

/** Resolve playable audio from upload or URL (mediaUrl). */
export function podcastAudioSrc(doc: {
  audioSource?: string | null
  mediaUrl?: string | null
  audio?: number | { url?: string | null } | null
}): string {
  const url = typeof doc.mediaUrl === 'string' ? doc.mediaUrl.trim() : ''
  const uploaded =
    doc.audio && typeof doc.audio === 'object' && doc.audio.url ? doc.audio.url.trim() : ''

  if (doc.audioSource === 'upload') return uploaded || url
  return url || uploaded
}
