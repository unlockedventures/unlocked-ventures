import type { Metadata } from 'next'

import { absoluteUrl } from '@/lib/site-url'

const DEFAULT_SITE_NAME = 'Unlocked Ventures'
const DEFAULT_DESCRIPTION =
  'Unlocked Ventures helps private equity sponsors and CFOs drive value through strategic advisory, digital engineering, data, and AI.'

const BASE_KEYWORDS = [
  'Unlocked Ventures',
  'private equity',
  'CFO advisory',
  'strategic advisory',
  'digital engineering',
  'AI consulting',
  'portfolio company',
]

export type PageSeoInput = {
  title?: string | null
  description?: string | null
  /** Extra keywords / tags for this page (merged with site defaults). */
  tags?: Array<string | null | undefined> | null
  /** Canonical path, e.g. `/about` or `/podcast/my-episode`. */
  path?: string
  image?: string | null
  imageAlt?: string | null
  noIndex?: boolean
}

function uniqueKeywords(tags: Array<string | null | undefined> | null | undefined) {
  const values = [...BASE_KEYWORDS, ...(tags ?? [])]
    .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
    .filter(Boolean)
  return [...new Set(values)]
}

function cleanText(value: string | null | undefined, fallback: string) {
  const text = typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
  return text || fallback
}

/**
 * Shared basic SEO metadata: title, description, keywords/tags, canonical, Open Graph, Twitter.
 */
export function buildPageMetadata(input: PageSeoInput = {}): Metadata {
  const title = cleanText(input.title, DEFAULT_SITE_NAME)
  const description = cleanText(input.description, DEFAULT_DESCRIPTION)
  const keywords = uniqueKeywords(input.tags)
  const canonical = input.path ? absoluteUrl(input.path) : undefined
  const image = input.image?.trim() || undefined

  return {
    title,
    description,
    keywords,
    authors: [{ name: DEFAULT_SITE_NAME }],
    creator: DEFAULT_SITE_NAME,
    publisher: DEFAULT_SITE_NAME,
    category: 'Business',
    alternates: canonical ? { canonical } : undefined,
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: 'website',
      siteName: DEFAULT_SITE_NAME,
      title,
      description,
      url: canonical,
      locale: 'en_US',
      ...(image
        ? {
            images: [
              {
                url: image.startsWith('http') ? image : absoluteUrl(image),
                alt: cleanText(input.imageAlt, title),
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image
        ? {
            images: [image.startsWith('http') ? image : absoluteUrl(image)],
          }
        : {}),
    },
  }
}
