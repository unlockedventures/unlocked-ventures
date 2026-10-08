import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CaseStudyPageView } from '@/components/site/views/case-study-page-view'
import { getCaseStudyBySlug, getCaseStudySlugs } from '@/data/get-case-study'
import { getOurSuccesses } from '@/data/get-our-successes'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await getCaseStudySlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const story = await getCaseStudyBySlug(slug)

  return {
    title: story?.title.replace(/\n/g, ' ') ?? 'Success story',
    description: story?.description,
  }
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params
  const [story, listing] = await Promise.all([getCaseStudyBySlug(slug), getOurSuccesses()])

  if (!story) notFound()

  return <CaseStudyPageView story={story} listingLabel={listing?.currentLabel} />
}
