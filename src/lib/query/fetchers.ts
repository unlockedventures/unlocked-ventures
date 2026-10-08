import type { SiteResource } from '@/lib/query/keys'

export async function fetchSiteResource<T>(resource: SiteResource): Promise<T> {
  const response = await fetch(`/api/site/${resource}`, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Failed to load site resource "${resource}" (${response.status})`)
  }

  return (await response.json()) as T
}

export async function fetchSolution<T>(slug: string): Promise<T> {
  const response = await fetch(`/api/site/solutions/${encodeURIComponent(slug)}`, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Failed to load solution "${slug}" (${response.status})`)
  }

  return (await response.json()) as T
}
