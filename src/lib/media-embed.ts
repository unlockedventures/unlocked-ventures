export type MediaEmbedKind = 'image' | 'youtube' | 'vimeo' | 'video' | 'unknown'

export function classifyMediaUrl(url: string): MediaEmbedKind {
  const trimmed = url.trim()
  if (!trimmed) return 'unknown'

  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
    const path = parsed.pathname.toLowerCase()

    if (host === 'youtu.be' || host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      return 'youtube'
    }
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      return 'vimeo'
    }
    if (/\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(path)) {
      return 'image'
    }
    if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(path)) {
      return 'video'
    }
  } catch {
    return 'unknown'
  }

  return 'unknown'
}

export function youtubeEmbedSrc(url: string): string | null {
  try {
    const parsed = new URL(url.trim())
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
    let id = ''

    if (host === 'youtu.be') {
      id = parsed.pathname.split('/').filter(Boolean)[0] || ''
    } else if (host.includes('youtube')) {
      id = parsed.searchParams.get('v') || ''
      if (!id && parsed.pathname.startsWith('/embed/')) {
        id = parsed.pathname.split('/')[2] || ''
      }
      if (!id && parsed.pathname.startsWith('/shorts/')) {
        id = parsed.pathname.split('/')[2] || ''
      }
    }

    if (!id) return null
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`
  } catch {
    return null
  }
}

export function vimeoEmbedSrc(url: string): string | null {
  try {
    const parsed = new URL(url.trim())
    const parts = parsed.pathname.split('/').filter(Boolean)
    const id = parts.find((part) => /^\d+$/.test(part))
    if (!id) return null
    return `https://player.vimeo.com/video/${id}`
  } catch {
    return null
  }
}
