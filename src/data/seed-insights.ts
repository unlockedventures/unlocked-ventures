import type { Payload } from 'payload'

const insightsSeed = {
  metaTitle: 'Insights',
  metaDescription: 'News, blogs, and thought leadership from Unlocked Ventures.',
  homeLabel: 'Home',
  homeHref: '/',
  currentLabel: 'Insights',
  title: 'News & blogs',
  description:
    'Practical writing from our team on product, engineering, AI adoption and the operational change that makes it stick.',
  emptyLabel: 'No articles yet.',
  seeMoreLabel: 'See more',
  listTitle: 'Latest news & blogs',
  sortLabel: 'Sort category',
  sortAllLabel: 'All',
  readArticleLabel: 'Read article',
  featuredTagLabel: 'Feature',
  tocTitle: 'In this article',
  shareTitle: 'Share',
  relatedTitle: 'Latest News & Blogs',
}

export async function seedInsights(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'insights' })

  if (current.title) {
    await payload.updateGlobal({
      slug: 'insights',
      data: {
        title: current.title === 'Insights' ? insightsSeed.title : current.title,
        description:
          current.description?.includes('Perspectives on AI')
            ? insightsSeed.description
            : current.description || insightsSeed.description,
        listTitle: current.listTitle || insightsSeed.listTitle,
        sortLabel: current.sortLabel || insightsSeed.sortLabel,
        sortAllLabel: current.sortAllLabel || insightsSeed.sortAllLabel,
        readArticleLabel: current.readArticleLabel || insightsSeed.readArticleLabel,
        featuredTagLabel: current.featuredTagLabel || insightsSeed.featuredTagLabel,
        tocTitle: current.tocTitle || insightsSeed.tocTitle,
        shareTitle: current.shareTitle || insightsSeed.shareTitle,
        relatedTitle:
          !current.relatedTitle || current.relatedTitle === 'Related insights'
            ? insightsSeed.relatedTitle
            : current.relatedTitle,
        seeMoreLabel: current.seeMoreLabel || insightsSeed.seeMoreLabel,
        emptyLabel: current.emptyLabel || insightsSeed.emptyLabel,
        metaDescription: current.metaDescription || insightsSeed.metaDescription,
      },
    })
    return
  }

  await payload.updateGlobal({
    slug: 'insights',
    data: insightsSeed,
  })
}
