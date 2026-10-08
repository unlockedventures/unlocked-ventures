import { getSolution, type SolutionContent } from '@/data/get-solution'

/** @deprecated Prefer getSolution('strategic-growth'). Kept for existing query keys. */
export type StrategicGrowthContent = Omit<SolutionContent, 'slug' | 'category'>

export async function getStrategicGrowth(): Promise<StrategicGrowthContent | null> {
  const solution = await getSolution('strategic-growth')
  if (!solution) return null

  const { slug: _slug, category: _category, ...content } = solution
  return content
}
