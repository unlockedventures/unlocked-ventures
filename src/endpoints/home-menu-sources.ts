import type { PayloadHandler } from 'payload'

import { hasPermission } from '@/access/rbac'
import { menuCatalog } from '@/lib/home-menu-source'

/** Section editors need a narrow catalog, not additional Navigation privileges. */
export const homeMenuSourcesHandler: PayloadHandler = async (req) => {
  const allowed = await Promise.all(
    ['strategic-advisory', 'digital-engineering'].map((slug) => hasPermission(req, slug, 'read')),
  )
  if (!allowed.some(Boolean)) {
    return Response.json({ error: 'You cannot access home menu sources.' }, { status: 403 })
  }
  const navigation = await req.payload.findGlobal({
    slug: 'navigation',
    depth: 0,
    overrideAccess: true,
    req,
  })
  return Response.json(
    { items: menuCatalog(navigation) },
    {
      headers: { 'Cache-Control': 'private, no-store' },
    },
  )
}
