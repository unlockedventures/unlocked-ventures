'use client'

import { useEffect, useState } from 'react'
import { hasCurrentSourceSummary, sourceFromFields, sourceRevision } from '@/pipeline/source-summary'

export function useSourceSummary(fields: Parameters<typeof sourceFromFields>[0]) {
  const source = sourceFromFields(fields)
  const snapshot = JSON.stringify({ videoLinks: source.videoLinks, sourceTranscript: source.sourceTranscript })
  const [identity, setIdentity] = useState({ snapshot: '', revision: '' })
  useEffect(() => {
    let cancelled = false
    void sourceRevision(JSON.parse(snapshot)).then((next) => {
      if (!cancelled) setIdentity({ snapshot, revision: next })
    }).catch(() => {
      if (!cancelled) setIdentity({ snapshot, revision: '' })
    })
    return () => { cancelled = true }
  }, [snapshot])
  const revision = identity.snapshot === snapshot ? identity.revision : ''
  return { source, revision, current: Boolean(revision) && hasCurrentSourceSummary({ ...source, currentSourceRevision: revision }) }
}
