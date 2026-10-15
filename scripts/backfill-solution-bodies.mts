/**
 * Fill solutions.body from legacy engagement / how-we-work fields when empty.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

import { lexicalFromHeadingAndParagraphs } from '../src/lib/lexical-plain.ts'

async function main() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'solutions',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  let updated = 0
  for (const doc of result.docs) {
    if (doc.body && typeof doc.body === 'object' && (doc.body as { root?: { children?: unknown[] } }).root?.children?.length) {
      continue
    }

    const paragraphs: string[] = []
    for (const item of doc.engagementItems ?? []) {
      if (!item?.title || !item?.body) continue
      paragraphs.push(`${item.number ? `${item.number}. ` : ''}${item.title}`)
      paragraphs.push(item.body)
    }
    for (const step of doc.steps ?? []) {
      if (!step?.title || !step?.body) continue
      paragraphs.push(`${step.number ? `${step.number}. ` : ''}${step.title}`)
      paragraphs.push(step.body)
    }
    if (!paragraphs.length) continue

    await payload.update({
      collection: 'solutions',
      id: doc.id,
      data: {
        body: lexicalFromHeadingAndParagraphs(doc.engagementTitle || doc.howWeWorkTitle || 'Overview', paragraphs),
      },
      overrideAccess: true,
    })
    updated += 1
    console.log(`updated ${doc.slug}`)
  }

  console.log(`done, updated ${updated}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
