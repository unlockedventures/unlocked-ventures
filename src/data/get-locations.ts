import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { LocationsSectionProps } from '@/components/site/locations/locations-section'

export async function getLocations(): Promise<Omit<LocationsSectionProps, 'className'> | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({
    slug: 'locations',
    depth: 1,
  })

  const map = doc.map
  const mapSrc = map && typeof map !== 'number' ? (map.url ?? undefined) : undefined
  const stats = (doc.stats ?? []).flatMap((stat) =>
    stat.value && stat.label ? [{ value: stat.value, label: stat.label }] : [],
  )

  if (!mapSrc || !stats.length) return null

  return { stats, mapSrc }
}
