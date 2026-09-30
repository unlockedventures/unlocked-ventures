import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { SiteFooterProps } from '@/components/site/footer/site-footer'

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

export async function getFooter(): Promise<SiteFooterProps | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({
    slug: 'site-footer',
    depth: 1,
  })

  if (!doc.description || !doc.pagesTitle || !doc.copyright || !doc.newsletter?.title) return null

  const contacts = (doc.contacts ?? []).flatMap((contact) => {
    const iconSrc = mediaUrl(contact.icon)
    if (!iconSrc) return []
    return [{ label: contact.label, href: contact.href, iconSrc }]
  })

  const socials = (doc.socials ?? []).flatMap((social) => {
    const src = mediaUrl(social.icon)
    if (!src) return []
    return [
      {
        label: social.label,
        src,
        width: social.displayWidth,
        height: social.displayHeight,
      },
    ]
  })

  return {
    description: doc.description,
    contacts,
    pagesTitle: doc.pagesTitle,
    pages: (doc.pages ?? []).map((page) => ({
      label: page.label,
      href: page.href,
    })),
    newsletter: {
      title: doc.newsletter.title,
      description: doc.newsletter.description,
      placeholder: doc.newsletter.placeholder,
      buttonLabel: doc.newsletter.buttonLabel,
    },
    copyright: doc.copyright,
    socials,
  }
}
