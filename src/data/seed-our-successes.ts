import type { Payload } from 'payload'

const ourSuccessesSeed = {
  metaTitle: 'Our Success Stories',
  metaDescription: 'Case studies and outcomes from Unlocked Ventures engagements.',
  homeLabel: 'Home',
  homeHref: '/',
  currentLabel: 'Our success story',
  title: 'Our Success Stories',
  description:
    'Products, platforms and roadmaps we have built with operators, founders and portfolio companies, and what changed once they shipped.',
  categoryPrefix: 'Select category:',
  allLabel: 'All',
  emptyLabel: 'No stories in this category yet.',
  seeMoreLabel: 'See more',
}

export async function seedOurSuccesses(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'our-successes' })
  if (current.title) {
    if (!current.metaDescription) {
      await payload.updateGlobal({
        slug: 'our-successes',
        data: { metaDescription: ourSuccessesSeed.metaDescription },
      })
    }
    return
  }

  await payload.updateGlobal({
    slug: 'our-successes',
    data: ourSuccessesSeed,
  })
}
