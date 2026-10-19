'use client'

import type { DefaultCellComponentProps } from 'payload'

/** List cell: draft → Draft, complete → Complete. */
export function EpisodeStatusCell({ cellData }: DefaultCellComponentProps) {
  const value = typeof cellData === 'string' ? cellData : ''
  if (value === 'complete') return <span>Complete</span>
  if (value === 'draft') return <span>Draft</span>
  return <span>{value || 'Draft'}</span>
}
