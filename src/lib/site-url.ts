/**
 * Absolute public site origin for SEO (robots, sitemap, canonicals).
 * Prefer an explicit env; fall back to Vercel / localhost for local work.
 */
export function getSiteURL(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SERVER_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim()

  if (explicit) return stripTrailingSlash(explicit)

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercelProduction) return `https://${stripTrailingSlash(vercelProduction)}`

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${stripTrailingSlash(vercel)}`

  return 'http://localhost:3000'
}

export function absoluteUrl(pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${getSiteURL()}${path === '/' ? '' : path}`
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}
