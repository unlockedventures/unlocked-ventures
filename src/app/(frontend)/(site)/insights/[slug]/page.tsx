import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { InsightArticle } from '@/components/site/insights/insight-article'
import { getInsights } from '@/data/get-insights'
import { getNewsPostBySlug, getNewsPostSlugs } from '@/data/get-news-post'
import { buildPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await getNewsPostSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getNewsPostBySlug(slug)

  return buildPageMetadata({
    title: post?.metaTitle || post?.title || 'Insights',
    description: post?.metaDescription || post?.excerpt,
    path: `/insights/${slug}`,
    image: post?.imageSrc,
    imageAlt: post?.imageAlt || post?.title,
    tags: ['insights', 'article', ...(post?.tags ?? [])],
  })
}

export default async function InsightArticlePage({ params }: PageProps) {
  const { slug } = await params
  const [post, copy] = await Promise.all([getNewsPostBySlug(slug), getInsights()])

  if (!post || !copy) notFound()

  return <InsightArticle post={post} copy={copy} />
}
