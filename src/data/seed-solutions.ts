import type { Payload } from 'payload'

import {
  iconKeyFor,
  relatedBodyFor,
  solutionsAssetPaths,
  solutionsSeed,
} from '@/data/solutions-seed'
import { uploadPublicFile } from '@/data/upload-public-file'

export async function seedSolutions(payload: Payload) {
  const existing = await payload.find({
    collection: 'solutions',
    limit: 200,
    depth: 0,
  })
  const existingSlugs = new Set(existing.docs.map((doc) => doc.slug).filter(Boolean))
  const missing = solutionsSeed.filter((item) => !existingSlugs.has(item.slug))
  if (missing.length === 0) return

  const illustration = await uploadPublicFile(
    payload,
    solutionsAssetPaths.illustration,
    'Solution illustration',
  )
  const heroImage = await uploadPublicFile(
    payload,
    solutionsAssetPaths.heroImage,
    'Solution hero photo',
  )

  const iconIds = {
    'product-strategy': (
      await uploadPublicFile(
        payload,
        solutionsAssetPaths.icons['product-strategy'].file,
        'Product Strategy',
      )
    ).id,
    'market-positioning': (
      await uploadPublicFile(
        payload,
        solutionsAssetPaths.icons['market-positioning'].file,
        'Market Positioning',
      )
    ).id,
    'engineering-as-a-service': (
      await uploadPublicFile(
        payload,
        solutionsAssetPaths.icons['engineering-as-a-service'].file,
        'Engineering as a Service',
      )
    ).id,
  } as const

  const bySlug = new Map(solutionsSeed.map((item) => [item.slug, item]))

  for (const item of missing) {
    const related = item.relatedSlugs.flatMap((relatedSlug) => {
      const relatedItem = bySlug.get(relatedSlug)
      if (!relatedItem) return []

      const iconKey = iconKeyFor(relatedSlug)
      const iconMeta = solutionsAssetPaths.icons[iconKey]

      return [
        {
          title: relatedItem.current,
          href: `/solutions/${relatedSlug}`,
          body: relatedBodyFor(relatedSlug),
          icon: iconIds[iconKey],
          iconWidth: iconMeta.width,
          iconHeight: iconMeta.height,
        },
      ]
    })

    await payload.create({
      collection: 'solutions',
      data: {
        slug: item.slug,
        category: item.category,
        breadcrumbs: [
          { label: 'Home', href: '/' },
          {
            label: item.category === 'digital-engineering' ? 'Digital Engineering' : 'Strategic Advisory',
            href: item.category === 'digital-engineering' ? '/#digital-engineering' : '/#strategic-advisory',
          },
        ],
        current: item.current,
        title: item.title,
        description: item.description,
        illustration: illustration.id,
        heroImage: heroImage.id,
        heroImageAlt: item.current,
        engagementTitle: item.engagementTitle,
        engagementItems: [...item.engagementItems],
        howWeWorkTitle: item.howWeWorkTitle,
        steps: [...item.steps],
        ctaTitle: item.ctaTitle,
        ctaDescription: item.ctaDescription,
        cta: item.cta,
        relatedTitle: item.relatedTitle,
        related,
      },
    })
  }
}
