import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { SolutionPageView } from '@/components/site/views/solution-page-view'
import { getSolution, getSolutionSlugs } from '@/data/get-solution'
import { getQueryClient } from '@/lib/query/get-query-client'
import { siteKeys } from '@/lib/query/keys'
import { prefetchSiteResources } from '@/lib/query/prefetch'
import { buildPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await getSolutionSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await getSolution(slug)
  const categoryLabel =
    page?.category === 'digital-engineering'
      ? 'Digital Engineering'
      : page?.category === 'strategic-advisory'
        ? 'Strategic Advisory'
        : undefined

  return buildPageMetadata({
    title: page?.current ?? 'Solution',
    description: page?.description,
    path: `/solutions/${slug}`,
    image: page?.article?.imageSrc,
    imageAlt: page?.article?.imageAlt || page?.current,
    tags: ['solutions', categoryLabel, page?.current, slug.replace(/-/g, ' ')],
  })
}

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params
  const queryClient = getQueryClient()

  const [solution] = await Promise.all([
    getSolution(slug),
    prefetchSiteResources(queryClient, ['navigation']),
  ])

  if (!solution) notFound()

  await queryClient.prefetchQuery({
    queryKey: siteKeys.solution(slug),
    queryFn: () => Promise.resolve(solution),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SolutionPageView slug={slug} />
    </HydrationBoundary>
  )
}
