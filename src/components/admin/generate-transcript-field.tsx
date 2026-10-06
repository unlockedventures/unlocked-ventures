'use client'

import { Button, useAllFormFields, useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useRef, useState } from 'react'

import { transcriptButtonState } from '@/pipeline/button-state'
import { overallTranscriptPercent } from '@/pipeline/progress'

type PipelineResponse = {
  transcript?: string | null
  status?: string | null
  statusMessage?: string | null
  error?: string
}

function fieldText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function videoLinkCount(value: unknown) {
  if (!Array.isArray(value)) return 1
  const count = value.filter((row) => {
    if (!row || typeof row !== 'object') return false
    const url = (row as { url?: unknown }).url
    return typeof url === 'string' && url.trim() !== ''
  }).length
  return Math.max(1, count)
}

export function GenerateTranscriptField() {
  const { id } = useDocumentInfo()
  const [fields, dispatchFields] = useAllFormFields()
  const [watching, setWatching] = useState(false)
  const [pending, setPending] = useState(false)
  const [localMessage, setLocalMessage] = useState<string | null>(null)
  const [stagePercent, setStagePercent] = useState<number | null>(null)
  const status = fieldText(fields.status?.value) || 'idle'
  const statusMessage = fieldText(fields.statusMessage?.value)
  const statusRef = useRef(status)
  statusRef.current = status
  const button = transcriptButtonState({ saved: id != null && id !== '', status, pending })
  const overall = overallTranscriptPercent({ statusMessage, stagePercent })
  const percent =
    status === 'processing' || watching
      ? (overall ?? (stagePercent != null ? Math.min(99, Math.max(0, Math.round(stagePercent))) : 0))
      : null

  useEffect(() => {
    if (status === 'processing') setWatching(true)
  }, [status])

  useEffect(() => {
    if (!watching || id == null || id === '') return
    let cancelled = false

    async function pull() {
      try {
        const [docResponse, progressResponse] = await Promise.all([
          fetch(`/api/pipeline/${id}?depth=0`, { credentials: 'include' }),
          fetch('/api/pipeline/progress', { credentials: 'include' }),
        ])
        if (!docResponse.ok || cancelled) return
        const doc = (await docResponse.json()) as PipelineResponse
        if (cancelled) return
        dispatchFields({ type: 'UPDATE', path: 'transcript', value: doc.transcript ?? '' })
        dispatchFields({ type: 'UPDATE', path: 'status', value: doc.status ?? 'idle' })
        dispatchFields({ type: 'UPDATE', path: 'statusMessage', value: doc.statusMessage ?? '' })
        if (progressResponse.ok) {
          const progress = (await progressResponse.json()) as { percent?: number }
          if (!cancelled && typeof progress.percent === 'number') {
            setStagePercent(progress.percent)
          }
        }
        if (doc.status === 'ready' || doc.status === 'error') {
          setPending(false)
          setWatching(false)
          setStagePercent(null)
        }
      } catch {
        if (cancelled) return
        if (statusRef.current === 'processing') return
        setLocalMessage('Could not generate a transcript.')
        setPending(false)
        setWatching(false)
        setStagePercent(null)
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
    const total = videoLinkCount(fields.videoLinks?.value)
    setLocalMessage(null)
    setPending(true)
    setWatching(true)
    setStagePercent(0)
    dispatchFields({ type: 'UPDATE', path: 'status', value: 'processing' })
    dispatchFields({
      type: 'UPDATE',
      path: 'statusMessage',
      value: `Generating transcript for video 1 of ${total}.`,
    })
    try {
      const response = await fetch('/api/pipeline/transcribe', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const body = (await response.json().catch(() => null)) as PipelineResponse | null
      if (!response.ok) {
        if (
          response.status === 409 &&
          (body?.error === 'This transcript is already being generated.' ||
            body?.error === 'Another transcript is already being generated. Try again when it finishes.')
        ) {
          setWatching(true)
          setPending(true)
          return
        }
        setLocalMessage(body?.error ?? 'Could not generate a transcript.')
        try {
          const refresh = await fetch(`/api/pipeline/${id}?depth=0`, { credentials: 'include' })
          if (!refresh.ok) {
            if (statusRef.current !== 'processing') {
              setWatching(false)
              setPending(false)
              setStagePercent(null)
            }
            return
          }
          const doc = (await refresh.json()) as PipelineResponse
          dispatchFields({ type: 'UPDATE', path: 'transcript', value: doc.transcript ?? '' })
          dispatchFields({ type: 'UPDATE', path: 'status', value: doc.status ?? 'idle' })
          dispatchFields({ type: 'UPDATE', path: 'statusMessage', value: doc.statusMessage ?? '' })
          if (doc.status === 'processing') {
            setWatching(true)
            setPending(true)
          } else {
            setWatching(false)
            setPending(false)
            setStagePercent(null)
          }
        } catch {
          if (statusRef.current !== 'processing') {
            setWatching(false)
            setPending(false)
            setStagePercent(null)
          }
        }
        return
      }
      setPending(false)
      setStagePercent(null)
    } catch {
      if (statusRef.current === 'processing') return
      setLocalMessage('Could not generate a transcript.')
      setWatching(false)
      setPending(false)
      setStagePercent(null)
    }
  }

  const detail = localMessage || button.hint || statusMessage

  return (
    <div className="field-type ui">
      <Button buttonStyle="primary" disabled={button.disabled} onClick={() => void onGenerate()}>
        Generate Transcript
      </Button>
      {detail ? <p>{detail}</p> : null}
      {percent != null ? <p>{percent}%</p> : null}
    </div>
  )
}
