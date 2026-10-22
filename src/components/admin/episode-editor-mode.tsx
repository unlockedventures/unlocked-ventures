'use client'

import { useAllFormFields, useForm, useFormInitializing, useOperation } from '@payloadcms/ui'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const STORAGE_KEY = 'uv-episode-editor-mode'

export function readEpisodeCreateMode(): 'ai' | 'manual' {
  if (typeof window === 'undefined') return 'manual'
  const fromQuery = new URLSearchParams(window.location.search).get('mode')
  if (fromQuery === 'ai' || fromQuery === 'manual') return fromQuery
  let stored: string | null = null
  try {
    stored = window.sessionStorage.getItem(STORAGE_KEY)
  } catch {
    // The URL still selects the mode when browser storage is unavailable.
  }
  if (stored === 'ai' || stored === 'manual') return stored
  return 'manual'
}

export function rememberEpisodeCreateMode(mode: 'ai' | 'manual') {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // Creation links also carry the mode in their query string.
  }
}

/** On create, set editorMode from ?mode= or sessionStorage so the matching fields show. */
export function EpisodeEditorModeBootstrap() {
  const operation = useOperation()
  const initializing = useFormInitializing()
  const { setModified } = useForm()
  const queryMode = useSearchParams().get('mode')
  const [fields, dispatchFields] = useAllFormFields()
  const current = typeof fields.editorMode?.value === 'string' ? fields.editorMode.value : ''

  useEffect(() => {
    if (operation !== 'create' || initializing || !fields.editorMode) return
    const next = queryMode === 'ai' || queryMode === 'manual' ? queryMode : readEpisodeCreateMode()
    if (current === next) return
    dispatchFields({ type: 'UPDATE', path: 'editorMode', value: next })
    // Payload refreshes server-evaluated field conditions only for modified forms.
    setModified(true)
  }, [current, dispatchFields, fields.editorMode, initializing, operation, queryMode, setModified])

  return null
}
