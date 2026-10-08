import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { SiteShell } from '@/components/site/views/site-shell'
import { getQueryClient } from '@/lib/query/get-query-client'
import { prefetchSiteResources } from '@/lib/query/prefetch'

export default async function SiteLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const queryClient = getQueryClient()
  await prefetchSiteResources(queryClient, ['header', 'navigation', 'footer'])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SiteShell>{children}</SiteShell>
    </HydrationBoundary>
  )
}
