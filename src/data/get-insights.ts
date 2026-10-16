import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { InsightsListingCopy } from '@/components/site/insights/insights-listing'

export async function getInsights(): Promise<InsightsListingCopy | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({ slug: 'insights' })

  if (
    !doc.metaTitle ||
    !doc.homeLabel ||
    !doc.homeHref ||
    !doc.currentLabel ||
    !doc.title ||
    !doc.description ||
    !doc.emptyLabel ||
    !doc.seeMoreLabel ||
    !doc.tocTitle ||
    !doc.shareTitle ||
    !doc.relatedTitle
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
    emptyLabel: doc.emptyLabel,
    seeMoreLabel: doc.seeMoreLabel,
    listTitle: doc.listTitle || 'Latest news & blogs',
    sortLabel: doc.sortLabel || 'Sort category',
    sortAllLabel: doc.sortAllLabel || 'All',
    readArticleLabel: doc.readArticleLabel || 'Read article',
    featuredTagLabel: doc.featuredTagLabel || 'Feature',
    tocTitle: doc.tocTitle,
    shareTitle: doc.shareTitle,
    relatedTitle: doc.relatedTitle,
  }
}
