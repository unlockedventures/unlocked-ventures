import type { QueryClient } from '@tanstack/react-query'

import type { SiteResource } from '@/lib/query/keys'
import { siteLoaders, siteResourceKeys } from '@/lib/query/loaders'

export async function prefetchSiteResources(
  queryClient: QueryClient,
  resources: readonly SiteResource[],
) {
  await Promise.all(
    resources.map((resource) =>
      queryClient.prefetchQuery({
        queryKey: siteResourceKeys[resource],
        queryFn: siteLoaders[resource],
      }),
    ),
  )
}
