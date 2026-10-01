import type { Payload } from 'payload'

import { aboutSeed } from '@/data/about-seed'
import { uploadPublicFile } from '@/data/upload-public-file'

export async function seedAbout(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'about' })
  if (current.title) return

  const [badgeImage, heroImage, founderImage] = await Promise.all([
    uploadPublicFile(payload, aboutSeed.badgeFile, aboutSeed.badgeAlt),
    uploadPublicFile(payload, aboutSeed.heroFile, aboutSeed.heroImageAlt),
    uploadPublicFile(payload, aboutSeed.founderFile, aboutSeed.founderImageAlt),
  ])

  const logos = await Promise.all(
    aboutSeed.logos.map(async (logo) => {
      const image = await uploadPublicFile(payload, logo.file, logo.name)
      return {
        name: logo.name,
        image: image.id,
        displayWidth: logo.displayWidth,
        displayHeight: logo.displayHeight,
      }
    }),
  )

  const principles = await Promise.all(
    aboutSeed.principles.map(async (item) => {
      const icon = await uploadPublicFile(payload, item.file, item.title)
      return {
        title: item.title,
        body: item.body,
        icon: icon.id,
        iconWidth: item.iconWidth,
        iconHeight: item.iconHeight,
      }
    }),
  )

  await payload.updateGlobal({
    slug: 'about',
    data: {
      metaTitle: aboutSeed.metaTitle,
      metaDescription: aboutSeed.metaDescription,
      breadcrumbHomeLabel: aboutSeed.breadcrumbHomeLabel,
      breadcrumbHomeHref: aboutSeed.breadcrumbHomeHref,
      breadcrumbCurrent: aboutSeed.breadcrumbCurrent,
      title: aboutSeed.title,
      description: aboutSeed.description,
      badgeImage: badgeImage.id,
      badgeAlt: aboutSeed.badgeAlt,
      heroImage: heroImage.id,
      heroImageAlt: aboutSeed.heroImageAlt,
      logoTitle: aboutSeed.logoTitle,
      logos,
      deliveredTitle: aboutSeed.deliveredTitle,
      stats: aboutSeed.stats,
      founderRole: aboutSeed.founderRole,
      founderTitle: aboutSeed.founderTitle,
      founderSummary: aboutSeed.founderSummary,
      founderBio: aboutSeed.founderBio,
      founderImage: founderImage.id,
      founderImageAlt: aboutSeed.founderImageAlt,
      founderCtaLabel: aboutSeed.founderCtaLabel,
      founderCtaHref: aboutSeed.founderCtaHref,
      howWeWorkTitle: aboutSeed.howWeWorkTitle,
      principles,
    },
  })
}
