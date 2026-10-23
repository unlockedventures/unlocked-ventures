'use client'

import { useFormFields } from '@payloadcms/ui'

/** Shared editorial fields keep their flat paths in both episode creation modes. */
export function EpisodePodcastLabel() {
  const editorMode = useFormFields(([fields]) => fields.editorMode?.value)
  return <span>{editorMode === 'ai' ? 'Generate podcast' : 'About this episode'}</span>
}
