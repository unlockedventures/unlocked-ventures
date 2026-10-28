'use client'

import {
  Button,
  FieldDescription,
  FieldError,
  FieldLabel,
  useAuth,
  useConfig,
  useField,
} from '@payloadcms/ui'
import { useEffect, useRef, useState } from 'react'

type VoiceOption = { value: string; label: string }
type VoiceRole = 'host' | 'guest'

const previewCache = new Map<string, Blob>()

type KokoroVoiceFieldProps = {
  field: {
    label?: Record<string, string> | string
    admin?: { description?: string }
  }
  path: string
  readOnly?: boolean
}

const selectStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '4px',
  border: '1px solid var(--theme-elevation-150)',
  background: 'var(--theme-input-bg)',
  color: 'var(--theme-text)',
  font: 'inherit',
}

function labelText(label: KokoroVoiceFieldProps['field']['label']) {
  if (!label) return ''
  if (typeof label === 'string') return label
  return Object.values(label)[0] || ''
}

export function KokoroVoiceField({ field, path, readOnly }: KokoroVoiceFieldProps) {
  const { value, setValue, showError } = useField<string>({ path })
  const { permissions } = useAuth()
  const { config } = useConfig()
  const [voices, setVoices] = useState<VoiceOption[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [previewing, setPreviewing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const previewAudioRef = useRef<HTMLAudioElement>(null)
  const api = config.routes?.api || '/api'
  const selectedValue = value || ''
  const role: VoiceRole = path === 'guestVoiceId' ? 'guest' : 'host'
  const canPreview = permissions?.collections?.['podcast-episodes']?.update === true
  const selectedVoiceIsUnavailable = Boolean(
    selectedValue && !voices.some((voice) => voice.value === selectedValue),
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setMessage('')
      try {
        const response = await fetch(`${api}/podcast-episodes/kokoro-voices`, {
          credentials: 'include',
        })
        const body = (await response.json().catch(() => null)) as {
          voices?: VoiceOption[]
          error?: string
        } | null
        if (cancelled) return
        if (!response.ok) throw new Error(body?.error || 'Could not load Kokoro voices.')
        setVoices(body?.voices ?? [])
        if (!body?.voices?.length) setMessage('No Kokoro voices are currently available.')
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : 'Could not load Kokoro voices.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [api])

  useEffect(() => {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current)
      return ''
    })
    setMessage('')
  }, [selectedValue])

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )

  async function testVoice() {
    const voiceId = selectedValue.trim()
    if (!voiceId || previewing) return
    setPreviewing(true)
    setMessage('Generating voice preview…')
    try {
      const cacheKey = `${role}:${voiceId}`
      let audio = previewCache.get(cacheKey)
      if (!audio) {
        const response = await fetch(`${api}/podcast-episodes/preview-kokoro-voice`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voiceId, role }),
        })
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null
          throw new Error(body?.error || 'Could not generate the voice preview.')
        }
        audio = await response.blob()
        previewCache.set(cacheKey, audio)
      }
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current)
        return URL.createObjectURL(audio)
      })
      setMessage(`${role === 'host' ? 'Host' : 'Guest'} voice preview ready.`)
      requestAnimationFrame(() => {
        void previewAudioRef.current?.play().catch(() => {})
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not generate the voice preview.')
    } finally {
      setPreviewing(false)
    }
  }

  return (
    <div className={`field-type select${showError ? ' error' : ''}`}>
      <FieldLabel label={labelText(field.label)} path={path} />
      <FieldError path={path} />
      <select
        id={`field-${path}`}
        style={selectStyle}
        value={selectedValue}
        disabled={readOnly || loading}
        onChange={(event) => setValue(event.target.value)}
      >
        <option value="" disabled>
          {loading ? 'Loading Kokoro voices…' : 'Select a Kokoro voice'}
        </option>
        {selectedVoiceIsUnavailable ? (
          <option value={selectedValue}>{selectedValue} (currently unavailable)</option>
        ) : null}
        {voices.map((voice) => (
          <option key={voice.value} value={voice.value}>
            {voice.label}
          </option>
        ))}
      </select>
      {canPreview ? (
        <div style={{ marginTop: 10 }}>
          <Button
            type="button"
            buttonStyle="secondary"
            disabled={readOnly || loading || previewing || !selectedValue}
            onClick={() => void testVoice()}
          >
            {previewing
              ? 'Generating Preview…'
              : `Test ${role === 'host' ? 'Host' : 'Guest'} Voice`}
          </Button>
        </div>
      ) : null}
      {previewUrl ? (
        <audio
          ref={previewAudioRef}
          controls
          preload="metadata"
          src={previewUrl}
          style={{ marginTop: 10, width: '100%' }}
        >
          Your browser does not support audio playback.
        </audio>
      ) : null}
      {message ? <p className="field-description">{message}</p> : null}
      <FieldDescription description={field.admin?.description} path={path} />
    </div>
  )
}
