import configPromise from '@payload-config'
import { getPayload } from 'payload'

export type HeaderData = {
  cta: {
    label: string
    href: string
  }
}

export async function getHeader(): Promise<HeaderData | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({ slug: 'site-header' })

  if (!doc.cta?.label || !doc.cta.href) return null

  return {
    cta: {
      label: doc.cta.label,
      href: doc.cta.href,
    },
  }
}
