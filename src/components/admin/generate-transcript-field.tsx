'use client'

import { Button, useAllFormFields, useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

import { transcriptButtonState } from '@/pipeline/button-state'

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
  const [localMessage, setLocalMessage] = useState<string | null>(null)
  const status = fieldText(fields.status?.value) || 'idle'
  const statusMessage = fieldText(fields.statusMessage?.value)
  const button = transcriptButtonState({ saved: id != null && id !== '', status })

  useEffect(() => {
    if (status === 'processing') setWatching(true)
  }, [status])

  useEffect(() => {
    if (!watching || id == null || id === '') return
    let cancelled = false

    async function pull() {
      const response = await fetch(`/api/pipeline/${id}?depth=0`, { credentials: 'include' })
      if (!response.ok || cancelled) return
      const doc = (await response.json()) as PipelineResponse
      dispatchFields({ type: 'UPDATE', path: 'transcript', value: doc.transcript ?? '' })
      dispatchFields({ type: 'UPDATE', path: 'status', value: doc.status ?? 'idle' })
      dispatchFields({ type: 'UPDATE', path: 'statusMessage', value: doc.statusMessage ?? '' })
      if (doc.status === 'ready' || doc.status === 'error') setWatching(false)
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
    setWatching(true)
    const response = await fetch('/api/pipeline/transcribe', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const body = (await response.json().catch(() => null)) as PipelineResponse | null
    if (!response.ok) {
      setWatching(false)
      setLocalMessage(body?.error ?? 'Could not generate a transcript.')
    }
  }

  const detail = localMessage || button.hint || statusMessage

  return (
    <div className="field-type ui">
      <Button buttonStyle="primary" disabled={button.disabled} onClick={() => void onGenerate()}>
        Generate Transcript
      </Button>
      {detail ? <p>{detail}</p> : null}
    </div>
  )
}
