import type { Payload } from 'payload'

import { siteSeed } from '@/data/site-seed'

export async function seedSite(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'site' })
  if (current.title) {
    if (!current.errorTitle) {
      await payload.updateGlobal({
        slug: 'site',
        data: {
          errorMetaTitle: siteSeed.errorMetaTitle,
          errorLabel: siteSeed.errorLabel,
          errorTitle: siteSeed.errorTitle,
          errorDescription: siteSeed.errorDescription,
        },
      })
    }
    return
  }

  await payload.updateGlobal({
    slug: 'site',
    data: siteSeed,
  })
}
