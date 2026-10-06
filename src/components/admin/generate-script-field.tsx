'use client'

import { Button, useAllFormFields, useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useRef, useState } from 'react'

import { scriptButtonState } from '@/pipeline/script-button-state'

type PointRow = { id?: string | null; point?: string | null }

type PipelineResponse = {
  scriptJson?: string | null
  summary?: string | null
  mainPoints?: PointRow[] | null
  contrastingPoints?: PointRow[] | null
  disagreementPoints?: PointRow[] | null
  systemOpinion?: string | null
  scriptStatus?: string | null
  scriptStatusMessage?: string | null
  transcript?: string | null
  error?: string
}

type DispatchFields = (action: Record<string, unknown>) => void

function fieldText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function rowCount(fields: Record<string, { rows?: unknown[] } | undefined>, path: string) {
  return fields[path]?.rows?.length ?? 0
}

function syncPointArray(dispatchFields: DispatchFields, path: string, points: PointRow[], currentCount: number) {
  for (let index = currentCount - 1; index >= 0; index -= 1) {
    dispatchFields({ type: 'REMOVE_ROW', path, rowIndex: index })
  }

  points.forEach((row, rowIndex) => {
    const point = typeof row.point === 'string' ? row.point : ''
    const id = typeof row.id === 'string' ? row.id : undefined
    dispatchFields({
      type: 'ADD_ROW',
      path,
      rowIndex,
      subFieldState: {
        point: { value: point, initialValue: point, valid: true },
        ...(id ? { id: { value: id, initialValue: id, valid: true } } : {}),
      },
    })
  })
}

function applyDoc(
  dispatchFields: DispatchFields,
  fields: Record<string, { rows?: unknown[] } | undefined>,
  doc: PipelineResponse,
) {
  dispatchFields({ type: 'UPDATE', path: 'scriptJson', value: doc.scriptJson ?? '' })
  dispatchFields({ type: 'UPDATE', path: 'summary', value: doc.summary ?? '' })
  dispatchFields({ type: 'UPDATE', path: 'systemOpinion', value: doc.systemOpinion ?? '' })
  dispatchFields({ type: 'UPDATE', path: 'scriptStatus', value: doc.scriptStatus ?? 'idle' })
  dispatchFields({
    type: 'UPDATE',
    path: 'scriptStatusMessage',
    value: doc.scriptStatusMessage ?? '',
  })

  syncPointArray(dispatchFields, 'mainPoints', doc.mainPoints ?? [], rowCount(fields, 'mainPoints'))
  syncPointArray(
    dispatchFields,
    'contrastingPoints',
    doc.contrastingPoints ?? [],
    rowCount(fields, 'contrastingPoints'),
  )
  syncPointArray(
    dispatchFields,
    'disagreementPoints',
    doc.disagreementPoints ?? [],
    rowCount(fields, 'disagreementPoints'),
  )
}

export function GenerateScriptField() {
  const { id } = useDocumentInfo()
  const [fields, dispatchFields] = useAllFormFields()
  const [watching, setWatching] = useState(false)
  const [pending, setPending] = useState(false)
  const [localMessage, setLocalMessage] = useState<string | null>(null)
  const scriptStatus = fieldText(fields.scriptStatus?.value) || 'idle'
  const scriptStatusMessage = fieldText(fields.scriptStatusMessage?.value)
  const transcript = fieldText(fields.transcript?.value)
  const statusRef = useRef(scriptStatus)
  const fieldsRef = useRef(fields)
  statusRef.current = scriptStatus
  fieldsRef.current = fields
  const button = scriptButtonState({
    saved: id != null && id !== '',
    hasTranscript: transcript.trim() !== '',
    scriptStatus,
    pending,
  })

  useEffect(() => {
    if (scriptStatus === 'processing') setWatching(true)
  }, [scriptStatus])

  useEffect(() => {
    if (!watching || id == null || id === '') return
    let cancelled = false

    async function pull() {
      try {
        const response = await fetch(`/api/pipeline/${id}?depth=0`, { credentials: 'include' })
        if (!response.ok || cancelled) return
        const doc = (await response.json()) as PipelineResponse
        if (cancelled) return
        applyDoc(dispatchFields, fieldsRef.current, doc)
        if (doc.scriptStatus === 'ready' || doc.scriptStatus === 'error') {
          setPending(false)
          setWatching(false)
        }
      } catch {
        if (cancelled) return
        if (statusRef.current === 'processing') return
        setLocalMessage('Could not generate a podcast script.')
        setPending(false)
        setWatching(false)
      }
    }

    void pull()
    const timer = setInterval(() => void pull(), 3000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [dispatchFields, id, watching])

  async function onGenerate() {
    if (button.disabled || id == null) return
    setLocalMessage(null)
    setPending(true)
    setWatching(true)
    dispatchFields({ type: 'UPDATE', path: 'scriptStatus', value: 'processing' })
    dispatchFields({
      type: 'UPDATE',
      path: 'scriptStatusMessage',
      value: 'Generating podcast script…',
    })
    try {
      const response = await fetch('/api/pipeline/generate-script', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const body = (await response.json().catch(() => null)) as PipelineResponse | null
      if (!response.ok) {
        if (
          response.status === 409 &&
          body?.error === 'This podcast script is already being generated.'
        ) {
          return
        }
        setLocalMessage(body?.error ?? 'Could not generate a podcast script.')
        try {
          const refresh = await fetch(`/api/pipeline/${id}?depth=0`, { credentials: 'include' })
          if (!refresh.ok) {
            if (statusRef.current !== 'processing') {
              setWatching(false)
              setPending(false)
            }
            return
          }
          const doc = (await refresh.json()) as PipelineResponse
          applyDoc(dispatchFields, fieldsRef.current, doc)
          if (doc.scriptStatus === 'processing') {
            setWatching(true)
            setPending(true)
          } else {
            setWatching(false)
            setPending(false)
          }
        } catch {
          if (statusRef.current !== 'processing') {
            setWatching(false)
            setPending(false)
          }
        }
        return
      }
      setPending(false)
      try {
        const refresh = await fetch(`/api/pipeline/${id}?depth=0`, { credentials: 'include' })
        if (refresh.ok) {
          const doc = (await refresh.json()) as PipelineResponse
          applyDoc(dispatchFields, fieldsRef.current, doc)
        }
      } catch {
        // polling effect will catch up if needed
      }
      setWatching(false)
    } catch {
      if (statusRef.current === 'processing') return
      setLocalMessage('Could not generate a podcast script.')
      setWatching(false)
      setPending(false)
    }
  }

  const detail = localMessage || button.hint || scriptStatusMessage

  return (
    <div className="field-type ui">
      <Button buttonStyle="primary" disabled={button.disabled} onClick={() => void onGenerate()}>
        Generate Podcast Script
      </Button>
      {detail ? <p>{detail}</p> : null}
    </div>
  )
}
