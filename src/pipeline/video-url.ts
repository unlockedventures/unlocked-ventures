export type VideoLink = {
  url?: string | null
}

export type VideoUrlResult = { ok: true; urls: string[] } | { ok: false; message: string }

export function validateVideoLinks(links: VideoLink[] | null | undefined): VideoUrlResult {
  if (!links || links.length === 0) {
    return { ok: false, message: 'Add at least one video link.' }
  }

  const urls: string[] = []
  for (let index = 0; index < links.length; index += 1) {
    const raw = links[index]?.url?.trim() ?? ''
    if (!raw) return { ok: false, message: `Video link ${index + 1} is empty.` }

    try {
      const parsed = new URL(raw)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { ok: false, message: `Video link ${index + 1} must start with http:// or https://.` }
      }
    } catch {
      return { ok: false, message: `Video link ${index + 1} must start with http:// or https://.` }
    }

    urls.push(raw)
  }

  return { ok: true, urls }
}
