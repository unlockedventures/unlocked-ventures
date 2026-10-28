'use client'

import { Button, useAuth, useAllFormFields, useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useRef, useState } from 'react'

import { audioButtonState } from '@/pipeline/audio-button-state'
import { parseStoredScriptJson } from '@/pipeline/generate-audio'

type PipelineResponse = {
  audioStatus?: string | null
  audioStatusMessage?: string | null
  error?: string
  message?: string
  errors?: { message?: string }[]
  mediaUrl?: string | null
  pendingAudioUrl?: string | null
  pendingAudio?: number | { id?: number } | null
  audio?: number | { id?: number } | null
  audioSource?: string | null
  meta?: string | null
}

type DispatchFields = ReturnType<typeof useAllFormFields>[1]

function fieldText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

/** Prefer live input values so a click before blur still sends what the editor typed. */
function readVoiceId(path: 'hostVoiceId' | 'guestVoiceId', formValue: string) {
  if (typeof document !== 'undefined') {
    const input = document.querySelector<HTMLInputElement>(`#field-${path}`)
    if (input) return input.value.trim()
  }
  return formValue.trim()
}

function errorFromBody(body: PipelineResponse | null, fallback: string) {
  if (!body) return fallback
  if (typeof body.error === 'string' && body.error.trim()) return body.error.trim()
  if (typeof body.message === 'string' && body.message.trim()) return body.message.trim()
  const first = body.errors?.[0]?.message
  if (typeof first === 'string' && first.trim()) return first.trim()
  return fallback
}

function normalizedAudioMessage(message: string | null | undefined) {
  const value = typeof message === 'string' ? message : ''
  return /\babort(?:ed)?\b/i.test(value) ? 'Audio generation stopped.' : value
}

function applyDoc(dispatchFields: DispatchFields, doc: PipelineResponse) {
  dispatchFields({ type: 'UPDATE', path: 'audioStatus', value: doc.audioStatus ?? 'idle' })
  dispatchFields({
    type: 'UPDATE',
    path: 'audioStatusMessage',
    value: normalizedAudioMessage(doc.audioStatusMessage),
  })
  if (typeof doc.mediaUrl === 'string' || doc.mediaUrl === null) {
    dispatchFields({ type: 'UPDATE', path: 'mediaUrl', value: doc.mediaUrl ?? '' })
  }
  if (typeof doc.pendingAudioUrl === 'string' || doc.pendingAudioUrl === null) {
    dispatchFields({
      type: 'UPDATE',
      path: 'pendingAudioUrl',
      value: doc.pendingAudioUrl ?? '',
    })
  }
  if (typeof doc.pendingAudio === 'number' || doc.pendingAudio === null) {
    dispatchFields({ type: 'UPDATE', path: 'pendingAudio', value: doc.pendingAudio })
  }
  if (typeof doc.audio === 'number' || doc.audio === null) {
    dispatchFields({ type: 'UPDATE', path: 'audio', value: doc.audio })
  }
  if (typeof doc.audioSource === 'string') {
    dispatchFields({ type: 'UPDATE', path: 'audioSource', value: doc.audioSource })
  }
  if (typeof doc.meta === 'string') {
    dispatchFields({ type: 'UPDATE', path: 'meta', value: doc.meta })
  }
}

function progressFromMessage(message: string) {
  const match = message.match(/\((\d{1,3})%\)/)
  if (!match) return null
  return Math.min(100, Math.max(0, Number(match[1])))
}

export function GenerateAudioField() {
  const { id } = useDocumentInfo()
  const { permissions } = useAuth()
  const canGenerate =
    permissions?.collections?.['podcast-episodes']?.update === true &&
    permissions?.collections?.['podcast-audio']?.create === true
  const [fields, dispatchFields] = useAllFormFields()
  const [watching, setWatching] = useState(false)
  const [pending, setPending] = useState(false)
  const [saving, setSaving] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [localMessage, setLocalMessage] = useState<string | null>(null)
  const audioStatus = fieldText(fields.audioStatus?.value) || 'idle'
  const audioStatusMessage = normalizedAudioMessage(fieldText(fields.audioStatusMessage?.value))
  const transcriptStatus = fieldText(fields.status?.value) || 'idle'
  const scriptStatus = fieldText(fields.scriptStatus?.value) || 'idle'
  const scriptJson = fieldText(fields.scriptJson?.value)
  const systemOpinion = fieldText(fields.systemOpinion?.value)
  const hostVoiceId = fieldText(fields.hostVoiceId?.value)
  const guestVoiceId = fieldText(fields.guestVoiceId?.value)
  const mediaUrl = fieldText(fields.mediaUrl?.value)
  const pendingAudioUrl = fieldText(fields.pendingAudioUrl?.value)
  const statusRef = useRef(audioStatus)
  const seenProcessingRef = useRef(false)
  statusRef.current = audioStatus

  const hasValidScript = Boolean(parseStoredScriptJson(scriptJson))

  const button = audioButtonState({
    saved: id != null && id !== '',
    hasValidScript,
    hasSystemOpinion: systemOpinion.trim() !== '',
    hasHostVoiceId: hostVoiceId.trim() !== '',
    hasGuestVoiceId: guestVoiceId.trim() !== '',
    audioStatus,
    transcriptStatus,
    scriptStatus,
    pending: pending || fields.sourceSummaryStatus?.value === 'processing',
  })

  useEffect(() => {
    if (audioStatus === 'processing') setWatching(true)
    else {
      setStopping(false)
      setLocalMessage((message) => (message === 'Stopping audio generation…' ? null : message))
    }
  }, [audioStatus])

  useEffect(() => {
    if (!watching || id == null || id === '') return
    let cancelled = false

    async function pull() {
      try {
        const response = await fetch(`/api/podcast-episodes/${id}?depth=0`, {
          credentials: 'include',
        })
        if (!response.ok || cancelled) return
        const doc = (await response.json()) as PipelineResponse
        if (cancelled) return

        if (doc.audioStatus === 'processing') {
          seenProcessingRef.current = true
          applyDoc(dispatchFields, doc)
          return
        }

        if (
          (doc.audioStatus === 'ready' || doc.audioStatus === 'error') &&
          !seenProcessingRef.current
        ) {
          return
        }

        applyDoc(dispatchFields, doc)
        if (doc.audioStatus === 'ready' || doc.audioStatus === 'error') {
          setPending(false)
          setWatching(false)
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
    const nextHostVoiceId = readVoiceId('hostVoiceId', hostVoiceId)
    const nextGuestVoiceId = readVoiceId('guestVoiceId', guestVoiceId)
    if (!nextHostVoiceId || !nextGuestVoiceId) {
      setLocalMessage('Select Kokoro voices for the host and guest before generating audio.')
      return
    }
    setLocalMessage(null)
    setPending(true)
    seenProcessingRef.current = false
    setWatching(true)
    dispatchFields({ type: 'UPDATE', path: 'hostVoiceId', value: nextHostVoiceId })
    dispatchFields({ type: 'UPDATE', path: 'guestVoiceId', value: nextGuestVoiceId })
    dispatchFields({ type: 'UPDATE', path: 'audioStatus', value: 'processing' })
    dispatchFields({
      type: 'UPDATE',
      path: 'audioStatusMessage',
      value: 'Generating host and guest audio…',
    })
    try {
      const response = await fetch('/api/podcast-episodes/generate-audio', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          hostVoiceId: nextHostVoiceId,
          guestVoiceId: nextGuestVoiceId,
        }),
      })
      const body = (await response.json().catch(() => null)) as PipelineResponse | null
      if (!response.ok) {
        if (response.status === 409 && body?.error) {
          if (body.error === 'Podcast audio is already being generated.') {
            seenProcessingRef.current = true
            setWatching(true)
            setPending(true)
            return
          }
          setLocalMessage(body.error)
          setPending(false)
          setWatching(false)
          dispatchFields({ type: 'UPDATE', path: 'audioStatus', value: 'idle' })
          dispatchFields({ type: 'UPDATE', path: 'audioStatusMessage', value: '' })
          return
        }
        setLocalMessage(errorFromBody(body, 'Could not generate podcast audio.'))
        try {
          const refresh = await fetch(`/api/podcast-episodes/${id}?depth=0`, {
            credentials: 'include',
          })
          if (!refresh.ok) {
            if (statusRef.current !== 'processing') {
              setWatching(false)
              setPending(false)
            }
            return
          }
          const doc = (await refresh.json()) as PipelineResponse
          if (doc.audioStatus === 'processing') seenProcessingRef.current = true
          applyDoc(dispatchFields, doc)
          if (doc.audioStatus === 'processing') {
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

      seenProcessingRef.current = true
      try {
        const refresh = await fetch(`/api/podcast-episodes/${id}?depth=0`, {
          credentials: 'include',
        })
        if (refresh.ok) {
          const doc = (await refresh.json()) as PipelineResponse
          applyDoc(dispatchFields, doc)
        }
      } catch {
        // polling effect will catch up
      }
      setPending(false)
      setWatching(false)
    } catch {
      // Long TTS runs can time out the browser fetch while the server keeps working.
      setWatching(true)
      setPending(true)
    }
  }

  async function onSaveGeneratedAudio() {
    if (saving || !pendingAudioUrl || id == null) return
    setSaving(true)
    setLocalMessage(null)
    try {
      const response = await fetch('/api/podcast-episodes/save-generated-audio', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const body = (await response.json().catch(() => null)) as PipelineResponse | null
      if (!response.ok) {
        setLocalMessage(errorFromBody(body, 'Could not save generated audio.'))
        return
      }
      if (body) applyDoc(dispatchFields, body)
    } catch {
      setLocalMessage('Could not save generated audio.')
    } finally {
      setSaving(false)
    }
  }

  async function onStopGenerating() {
    if (stopping || id == null) return
    setStopping(true)
    setLocalMessage('Stopping audio generation…')
    try {
      const response = await fetch('/api/podcast-episodes/stop-audio-generation', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const body = (await response.json().catch(() => null)) as PipelineResponse | null
      if (!response.ok) {
        setLocalMessage(errorFromBody(body, 'Could not stop audio generation.'))
        setStopping(false)
      }
    } catch {
      setLocalMessage('Could not stop audio generation.')
      setStopping(false)
    }
  }

  if (!canGenerate) return null

  const detail = localMessage || button.hint || audioStatusMessage
  const progress = audioStatus === 'processing' ? (progressFromMessage(audioStatusMessage) ?? 0) : 0

  return (
    <div className="field-type ui">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <Button buttonStyle="primary" disabled={button.disabled} onClick={() => void onGenerate()}>
          {pendingAudioUrl ? 'Regenerate Audio' : 'Generate Podcast Audio'}
        </Button>
        {audioStatus === 'processing' ? (
          <Button
            buttonStyle="secondary"
            disabled={stopping}
            onClick={() => void onStopGenerating()}
          >
            {stopping ? 'Stopping…' : 'Stop Generating Audio'}
          </Button>
        ) : null}
        {pendingAudioUrl ? (
          <Button
            buttonStyle="secondary"
            disabled={saving || audioStatus === 'processing'}
            onClick={() => void onSaveGeneratedAudio()}
          >
            {saving ? 'Saving…' : 'Save Generated Audio'}
          </Button>
        ) : null}
      </div>
      {audioStatus === 'processing' ? (
        <div style={{ marginTop: 12 }} role="status" aria-live="polite">
          <div
            style={{
              width: '100%',
              height: 10,
              overflow: 'hidden',
              borderRadius: 999,
              background: 'var(--theme-elevation-100)',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                borderRadius: 999,
                background: 'var(--theme-success-500, #22c55e)',
                transition: 'width 250ms ease',
              }}
            />
          </div>
          <p style={{ marginTop: 8 }}>{progress}% complete</p>
        </div>
      ) : null}
      {detail ? <p>{detail}</p> : null}
      {pendingAudioUrl && audioStatus !== 'processing' ? (
        <div style={{ marginTop: 12 }}>
          <p>Preview generated audio</p>
          <audio controls preload="metadata" src={pendingAudioUrl} style={{ width: '100%' }}>
            Your browser does not support audio playback.
          </audio>
        </div>
      ) : null}
      {mediaUrl ? (
        <div style={{ marginTop: 12 }}>
          <p>Listen to currently saved audio</p>
          <audio controls preload="metadata" src={mediaUrl} style={{ width: '100%' }}>
            Your browser does not support audio playback.
          </audio>
        </div>
      ) : null}
    </div>
  )
}
