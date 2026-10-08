import { NextResponse } from 'next/server'

import { isSiteResource, siteLoaders } from '@/lib/query/loaders'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ resource: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { resource } = await context.params
  if (!isSiteResource(resource)) {
    return NextResponse.json({ error: 'Unknown resource' }, { status: 404 })
  }

  const data = await siteLoaders[resource]()
  return NextResponse.json(data ?? null)
}
