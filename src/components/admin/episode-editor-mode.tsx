'use client'

import { useAllFormFields, useOperation } from '@payloadcms/ui'
import { useLayoutEffect } from 'react'

const STORAGE_KEY = 'uv-episode-editor-mode'

export function readEpisodeCreateMode(): 'ai' | 'manual' {
  if (typeof window === 'undefined') return 'manual'
  const fromQuery = new URLSearchParams(window.location.search).get('mode')
  if (fromQuery === 'ai' || fromQuery === 'manual') return fromQuery
  const stored = window.sessionStorage.getItem(STORAGE_KEY)
  if (stored === 'ai' || stored === 'manual') return stored
  return 'manual'
}

export function rememberEpisodeCreateMode(mode: 'ai' | 'manual') {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(STORAGE_KEY, mode)
}

/** On create, set editorMode from ?mode= or sessionStorage so the matching fields show. */
export function EpisodeEditorModeBootstrap() {
  const operation = useOperation()
  const [fields, dispatchFields] = useAllFormFields()
  const current = typeof fields.editorMode?.value === 'string' ? fields.editorMode.value : ''

  useLayoutEffect(() => {
    if (operation !== 'create') return
    const next = readEpisodeCreateMode()
    if (current === next) return
    dispatchFields({ type: 'UPDATE', path: 'editorMode', value: next })
  }, [current, dispatchFields, operation])

  return null
}
