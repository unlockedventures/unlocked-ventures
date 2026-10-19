import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { RelatedSolutionsSectionProps } from '@/components/site/solutions/related-solutions-section'
import type { SolutionArticleProps } from '@/components/site/solutions/solution-article'
import type { TryingToBuildSectionProps } from '@/components/site/solutions/trying-to-build-section'
import type { SuccessStoriesSectionProps } from '@/components/site/success-stories/success-stories-section'
import { successBadgeLabel } from '@/collections/SuccessBadges'
import { lexicalFromHeadingAndParagraphs } from '@/lib/lexical-plain'

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

function asEditorState(value: unknown): DefaultTypedEditorState | null {
  if (!value || typeof value !== 'object') return null
  const root = (value as { root?: unknown }).root
  if (!root || typeof root !== 'object') return null
  return value as DefaultTypedEditorState
}

function legacyBodyFromDoc(doc: {
  engagementTitle?: string | null
  engagementItems?: Array<{ number?: string | null; title?: string | null; body?: string | null }> | null
  howWeWorkTitle?: string | null
  steps?: Array<{ number?: string | null; title?: string | null; body?: string | null }> | null
}): DefaultTypedEditorState | null {
  const paragraphs: string[] = []

  for (const item of doc.engagementItems ?? []) {
    if (!item.title || !item.body) continue
    paragraphs.push(`${item.number ? `${item.number}. ` : ''}${item.title}`)
    paragraphs.push(item.body)
  }

  for (const step of doc.steps ?? []) {
    if (!step.title || !step.body) continue
    paragraphs.push(`${step.number ? `${step.number}. ` : ''}${step.title}`)
    paragraphs.push(step.body)
  }

  if (!paragraphs.length) return null

  const heading = doc.engagementTitle || doc.howWeWorkTitle || 'Overview'
  return lexicalFromHeadingAndParagraphs(heading, paragraphs)
}

export type SolutionContent = {
  slug: string
  category: 'strategic-advisory' | 'digital-engineering'
  current: string
  description: string
  metaTitle?: string
  metaDescription?: string
  article: SolutionArticleProps
  cta: TryingToBuildSectionProps
  related: RelatedSolutionsSectionProps
  successStories: Omit<SuccessStoriesSectionProps, 'className'> | null
}

function getRelatedSolutions(doc: {
  relatedTitle?: string | null
  related?: Array<{
    title?: string | null
    href?: string | null
    body?: string | null
    icon?: number | { url?: string | null } | null
    iconWidth?: number | null
    iconHeight?: number | null
  }> | null
}): RelatedSolutionsSectionProps {
  const title = doc.relatedTitle || 'Related solutions'
  const solutions = (doc.related ?? []).flatMap((solution) => {
    if (!solution.title || !solution.href || !solution.body) return []
    return [
      {
        title: solution.title,
        href: solution.href,
        body: solution.body,
        iconSrc: mediaUrl(solution.icon),
        iconWidth: solution.iconWidth || 80,
        iconHeight: solution.iconHeight || 80,
      },
    ]
  })

  return { title, solutions }
}

async function getSuccessStoriesForSolution(
  payload: Awaited<ReturnType<typeof getPayload>>,
  solutionHref: string,
): Promise<Omit<SuccessStoriesSectionProps, 'className'> | null> {
  const [section, result] = await Promise.all([
    payload.findGlobal({ slug: 'success-stories' }),
    payload.find({
      collection: 'case-studies',
      sort: 'sortOrder',
      limit: 100,
      depth: 1,
      where: {
        and: [
          { featured: { equals: true } },
          { headerNavChild: { equals: solutionHref } },
        ],
      },
    }),
  ])

  const docs = result.docs
  if (!section.title || !section.cta?.label || !section.cta.href || !docs.length) {
    return null
  }

  const feature = docs[0]
  if (!feature?.title || !feature.ctaLabel || !feature.href) return null

  const stories = docs.flatMap((story) => {
    if (story.id === feature.id || !story.title || !story.ctaLabel || !story.href) return []
    return [
      {
        title: story.title,
        href: story.href,
        ctaLabel: story.ctaLabel,
        imageSrc: mediaUrl(story.image),
        category: story.category || undefined,
      },
    ]
  })

  return {
    title: section.title,
    subtitle: section.subtitle || undefined,
    cta: {
      label: section.cta.label,
      href: section.cta.href,
    },
    feature: {
      title: feature.title,
      href: feature.href,
      ctaLabel: feature.ctaLabel,
      imageSrc: mediaUrl(feature.image),
      description: feature.description || undefined,
      badge: successBadgeLabel(feature.badge),
    },
    stories,
  }
}

export async function getSolution(slug: string): Promise<SolutionContent | null> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'solutions',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    // Depth 2 so Lexical upload nodes inside body resolve media URLs.
    depth: 2,
  })

  const doc = result.docs[0]
  if (!doc) return null

  if (
    !doc.slug ||
    !doc.category ||
    !doc.title ||
    !doc.description ||
    !doc.current ||
    !doc.ctaTitle ||
    !doc.ctaDescription ||
    !doc.cta?.label ||
    !doc.cta.href
  ) {
    return null
  }

  const breadcrumbs = (doc.breadcrumbs ?? []).flatMap((crumb) => {
    if (!crumb.label || !crumb.href) return []
    return [{ label: crumb.label, href: crumb.href }]
  })

  if (!breadcrumbs.length) return null

  const body = asEditorState(doc.body) ?? legacyBodyFromDoc(doc)
  const solutionHref = `/solutions/${doc.slug}`
  const related = getRelatedSolutions(doc)
  const successStories = await getSuccessStoriesForSolution(payload, solutionHref)

  return {
    slug: doc.slug,
    category: doc.category,
    current: doc.current,
    description: doc.description,
    metaTitle: doc.metaTitle || undefined,
    metaDescription: doc.metaDescription || undefined,
    article: {
      breadcrumbs,
      current: doc.current,
      title: doc.title,
      description: doc.description,
      imageSrc: mediaUrl(doc.heroImage),
      imageAlt: doc.heroImageAlt || doc.current || '',
      body,
    },
    cta: {
      title: doc.ctaTitle,
      description: doc.ctaDescription,
      cta: {
        label: doc.cta.label,
        href: doc.cta.href,
      },
    },
    related,
    successStories,
  }
}

export async function getSolutionSlugs(): Promise<string[]> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'solutions',
    limit: 100,
    depth: 0,
    select: {
      slug: true,
    },
  })

  return result.docs.flatMap((doc) => (doc.slug ? [doc.slug] : []))
}
