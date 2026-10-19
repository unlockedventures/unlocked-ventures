import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { CaseStudiesListingCopy } from '@/components/site/success-stories/case-studies-listing'

/** Badge names for the listing filter — live from success-badges. */
export async function getSuccessBadgeCategories(): Promise<string[]> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'success-badges',
    sort: 'name',
    limit: 200,
    depth: 0,
  })

  const seen = new Set<string>()
  const categories: string[] = []
  for (const doc of result.docs) {
    const name = typeof doc.name === 'string' ? doc.name.trim() : ''
    if (!name) continue
    const key = name.toLocaleLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    categories.push(name)
  }
  return categories
}

export async function getOurSuccesses(): Promise<CaseStudiesListingCopy | null> {
  const payload = await getPayload({ config: configPromise })
  const [doc, categories] = await Promise.all([
    payload.findGlobal({ slug: 'our-successes' }),
    getSuccessBadgeCategories(),
  ])

  if (
    !doc.metaTitle ||
    !doc.homeLabel ||
    !doc.homeHref ||
    !doc.currentLabel ||
    !doc.title ||
    !doc.description ||
    !doc.categoryPrefix ||
    !doc.allLabel ||
    !doc.emptyLabel ||
    !doc.seeMoreLabel
  ) {
    return null
  }

  return {
    metaTitle: doc.metaTitle,
    metaDescription: doc.metaDescription || doc.description,
    homeLabel: doc.homeLabel,
    homeHref: doc.homeHref,
    currentLabel: doc.currentLabel,
    title: doc.title,
    description: doc.description,
    categoryPrefix: doc.categoryPrefix,
    allLabel: doc.allLabel,
    emptyLabel: doc.emptyLabel,
    seeMoreLabel: doc.seeMoreLabel,
    categories,
  }
}
