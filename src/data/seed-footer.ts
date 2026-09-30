import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { footerSeed } from '@/data/footer-seed'

async function uploadFooterIcon(payload: Payload, file: string, alt: string) {
  const filePath = path.join(process.cwd(), 'public', 'footer', 'footer-icons', file)
  const data = fs.readFileSync(filePath)

  return payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data,
      mimetype: 'image/svg+xml',
      name: file,
      size: data.length,
    },
  })
}

export async function seedFooter(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'site-footer' })
  if (current.description) return

  const contacts = []
  for (const contact of footerSeed.contacts) {
    const icon = await uploadFooterIcon(payload, contact.icon, contact.label)
    contacts.push({
      label: contact.label,
      href: contact.href,
      icon: icon.id,
    })
  }

  const socials = []
  for (const social of footerSeed.socials) {
    const icon = await uploadFooterIcon(payload, social.icon, social.label)
    socials.push({
      label: social.label,
      icon: icon.id,
      displayWidth: social.displayWidth,
      displayHeight: social.displayHeight,
    })
  }

  await payload.updateGlobal({
    slug: 'site-footer',
    data: {
      description: footerSeed.description,
      contacts,
      pagesTitle: footerSeed.pagesTitle,
      pages: footerSeed.pages,
      newsletter: footerSeed.newsletter,
      copyright: footerSeed.copyright,
      socials,
    },
  })
}
