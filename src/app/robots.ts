import type { MetadataRoute } from 'next'

import { getSiteURL } from '@/lib/site-url'

/**
 * Serves /robots.txt via the Next.js Metadata Route API.
 * Blocks CMS/admin/API surfaces; points crawlers at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  const siteURL = getSiteURL()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/studio', '/studio/'],
      },
    ],
    sitemap: `${siteURL}/sitemap.xml`,
    host: siteURL,
  }
}
