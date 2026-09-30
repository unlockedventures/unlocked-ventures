import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { contactSeed } from '@/data/contact-seed'

async function uploadContactFile(payload: Payload, file: string, alt: string) {
  const filePath = path.join(process.cwd(), 'public', 'contact', file)
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

export async function seedContact(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'contact' })
  if (current.title) return

  const illustration = await uploadContactFile(payload, contactSeed.illustrationFile, contactSeed.title)
  const cards = []

  for (const card of contactSeed.cards) {
    const icon = await uploadContactFile(payload, card.icon, card.label)
    cards.push({
      label: card.label,
      value: card.value,
      href: card.href,
      icon: icon.id,
      displayWidth: card.displayWidth,
      displayHeight: card.displayHeight,
    })
  }

  await payload.updateGlobal({
    slug: 'contact',
    data: {
      metaTitle: contactSeed.metaTitle,
      metaDescription: contactSeed.metaDescription,
      breadcrumbHomeLabel: contactSeed.breadcrumbHomeLabel,
      breadcrumbHomeHref: contactSeed.breadcrumbHomeHref,
      breadcrumbCurrent: contactSeed.breadcrumbCurrent,
      title: contactSeed.title,
      illustration: illustration.id,
      cards,
      helpTitle: contactSeed.helpTitle,
      form: contactSeed.form,
    },
  })
}
