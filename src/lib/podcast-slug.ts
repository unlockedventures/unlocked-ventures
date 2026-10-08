export function slugifyPodcastTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function podcastEpisodePath(slug: string) {
  return `/podcast/${slug}`
}

export function podcastSlugFromHref(href: string) {
  const path = href.split('?')[0]?.split('#')[0]?.replace(/\/+$/, '') ?? ''
  try {
    const url = path.includes('://') ? new URL(path) : null
    const pathname = url?.pathname ?? path
    const parts = pathname.split('/').filter(Boolean)
    if (parts[0] !== 'podcast' || !parts[1]) return null
    return decodeURIComponent(parts[1])
  } catch {
    const parts = path.split('/').filter(Boolean)
    if (parts[0] !== 'podcast' || !parts[1]) return null
    return parts[1]
  }
}
