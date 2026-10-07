'use client'

import { Button, useAllFormFields, useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useRef, useState } from 'react'

import { transcriptButtonState } from '@/pipeline/button-state'
import { collectVideoLinksFromForm } from '@/pipeline/form-video-links'
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

export function GenerateTranscriptField() {
  const { id } = useDocumentInfo()
  const [fields, dispatchFields] = useAllFormFields()
  const [watching, setWatching] = useState(false)
  const [pending, setPending] = useState(false)
  const [localMessage, setLocalMessage] = useState<string | null>(null)
  const [stagePercent, setStagePercent] = useState<number | null>(null)
  const status = fieldText(fields.status?.value) || 'idle'
  const statusMessage = fieldText(fields.statusMessage?.value)
  const scriptStatus = fieldText(fields.scriptStatus?.value) || 'idle'
  const statusRef = useRef(status)
  /** Ignore stale ready/error from a previous run until this run has been processing on the server. */
  const seenProcessingRef = useRef(false)
  statusRef.current = status
  const button = transcriptButtonState({
    saved: id != null && id !== '',
    status,
    scriptStatus,
    pending,
  })
  const waiting = /waiting for another transcript/i.test(statusMessage)
  const overall = overallTranscriptPercent({ statusMessage, stagePercent })
  const percent =
    !(status === 'processing' || watching) || waiting
      ? null
      : overall != null
        ? overall
        : stagePercent != null && stagePercent > 0
          ? Math.min(99, Math.max(0, Math.round(stagePercent)))
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
          fetch(`/api/pipeline/${id}?depth=0`, { credentials: 'include', cache: 'no-store' }),
          fetch('/api/pipeline/progress', { credentials: 'include', cache: 'no-store' }),
        ])
        if (!docResponse.ok || cancelled) return
        const doc = (await docResponse.json()) as PipelineResponse
        if (cancelled) return

        if (progressResponse.ok) {
          const progress = (await progressResponse.json()) as { percent?: number }
          if (!cancelled && typeof progress.percent === 'number') {
            setStagePercent(progress.percent)
          }
        }

        if (doc.status === 'processing') {
          seenProcessingRef.current = true
          dispatchFields({ type: 'UPDATE', path: 'transcript', value: doc.transcript ?? '' })
          dispatchFields({ type: 'UPDATE', path: 'status', value: doc.status })
          dispatchFields({ type: 'UPDATE', path: 'statusMessage', value: doc.statusMessage ?? '' })
          return
        }

        // Ignore stale/non-processing docs until this run has been processing on the server.
        if (!seenProcessingRef.current) return

        dispatchFields({ type: 'UPDATE', path: 'transcript', value: doc.transcript ?? '' })
        dispatchFields({ type: 'UPDATE', path: 'status', value: doc.status ?? 'idle' })
        dispatchFields({ type: 'UPDATE', path: 'statusMessage', value: doc.statusMessage ?? '' })
        if (doc.status === 'ready' || doc.status === 'error') {
          setPending(false)
          setWatching(false)
          setStagePercent(null)
        }
      } catch {
        if (cancelled) return
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
    const urls = collectVideoLinksFromForm(fields)
    if (urls.length === 0) {
      setLocalMessage('Add at least one video link.')
      return
    }
    const total = urls.length
    setLocalMessage(null)
    setPending(true)
    seenProcessingRef.current = false
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
        body: JSON.stringify({
          id,
          videoLinks: urls.map((url) => ({ url })),
        }),
      })
      const body = (await response.json().catch(() => null)) as PipelineResponse | null
      if (!response.ok) {
        if (
          response.status === 409 &&
          body?.error === 'Wait for the podcast script to finish before generating a transcript.'
        ) {
          setLocalMessage(body.error)
          setPending(false)
          setWatching(false)
          setStagePercent(null)
          dispatchFields({ type: 'UPDATE', path: 'status', value: 'idle' })
          dispatchFields({ type: 'UPDATE', path: 'statusMessage', value: '' })
          return
        }
        if (
          response.status === 409 &&
          (body?.error === 'This transcript is already being generated.' ||
            body?.error === 'Another transcript is already being generated. Try again when it finishes.')
        ) {
          seenProcessingRef.current = true
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
          if (doc.status === 'processing') seenProcessingRef.current = true
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

      seenProcessingRef.current = true
      try {
        const refresh = await fetch(`/api/pipeline/${id}?depth=0`, {
          credentials: 'include',
          cache: 'no-store',
        })
        if (refresh.ok) {
          const doc = (await refresh.json()) as PipelineResponse
          dispatchFields({ type: 'UPDATE', path: 'transcript', value: doc.transcript ?? '' })
          dispatchFields({ type: 'UPDATE', path: 'status', value: doc.status ?? 'idle' })
          dispatchFields({ type: 'UPDATE', path: 'statusMessage', value: doc.statusMessage ?? '' })
          if (doc.status === 'ready' || doc.status === 'error') {
            setPending(false)
            setWatching(false)
            setStagePercent(null)
            return
          }
        }
      } catch {
        // polling effect will catch up if needed
      }
      // Keep polling if the long POST finished while the doc is still settling.
      setPending(true)
      setWatching(true)
    } catch {
      // Long Whisper runs can time out the browser fetch while the server keeps working.
      setWatching(true)
      setPending(true)
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
