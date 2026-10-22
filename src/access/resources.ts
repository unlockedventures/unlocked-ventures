/** Shared by the server access policy and the permission editor. */
export const permissionResources = [
  { slug: 'media', label: 'Media', kind: 'collection' },
  { slug: 'awards', label: 'Awards', kind: 'collection' },
  { slug: 'news-posts', label: 'News and blogs', kind: 'collection' },
  { slug: 'podcast-audio', label: 'Podcast audio', kind: 'collection' },
  { slug: 'podcast-channels', label: 'Podcast channels', kind: 'collection' },
  { slug: 'podcast-episodes', label: 'Podcast episodes', kind: 'collection' },
  { slug: 'case-studies', label: 'Case studies', kind: 'collection' },
  { slug: 'success-badges', label: 'Success badges', kind: 'collection' },
  { slug: 'solutions', label: 'Solutions', kind: 'collection' },
  { slug: 'trusted-logos', label: 'Trusted logos', kind: 'collection' },
  { slug: 'contact-messages', label: 'Contact messages (read only)', kind: 'inbox' },
  ...[
    ['about', 'About'],
    ['awards-section', 'Awards section'],
    ['hero', 'Hero'],
    ['navigation', 'Navigation'],
    ['digital-engineering', 'Digital engineering'],
    ['site-footer', 'Footer'],
    ['site-header', 'Header'],
    ['latest-news', 'Latest news'],
    ['locations', 'Locations'],
    ['recent-podcast', 'Recent podcast'],
    ['strategic-growth', 'Strategic growth'],
    ['strategic-advisory', 'Strategic advisory'],
    ['success-stories', 'Success stories'],
    ['our-successes', 'Our successes'],
    ['insights', 'Insights'],
    ['podcast-listing', 'Podcast listing'],
    ['podcast-page', 'Podcast page'],
    ['trusted-by', 'Trusted by'],
    ['contact', 'Contact'],
    ['site', 'Site settings'],
  ].map(([slug, label]) => ({ slug, label, kind: 'global' })),
] as const

export const operations = ['create', 'read', 'update', 'delete'] as const
export type Operation = (typeof operations)[number]
export type Permissions = Record<string, Partial<Record<Operation, boolean>>>

export function allowedOperations(kind: string): readonly Operation[] {
  return kind === 'global' ? ['read', 'update'] : kind === 'inbox' ? ['read'] : operations
}

export function validatePermissions(value: unknown): true | string {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return 'Choose a permission matrix.'
  for (const [slug, grants] of Object.entries(value)) {
    const resource = permissionResources.find((item) => item.slug === slug)
    if (!resource || !grants || typeof grants !== 'object' || Array.isArray(grants))
      return 'Invalid resource permissions.'
    for (const [operation, granted] of Object.entries(grants)) {
      if (
        !allowedOperations(resource.kind).includes(operation as Operation) ||
        typeof granted !== 'boolean'
      )
        return 'Invalid permission operation.'
    }
    if ((grants.create || grants.update || grants.delete) && !grants.read)
      return 'Read access is required before granting write access.'
  }
  return true
}
