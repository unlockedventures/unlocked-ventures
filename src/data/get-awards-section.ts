import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function getAwardsSection(): Promise<{ title: string } | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({ slug: 'awards-section' })
  if (!doc.title) return null
  return { title: doc.title }
}
