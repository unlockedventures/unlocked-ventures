'use client'

import { FieldDescription, FieldError, FieldLabel, useConfig, useField } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type VoiceOption = { value: string; label: string }

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
  const { config } = useConfig()
  const [voices, setVoices] = useState<VoiceOption[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const api = config.routes?.api || '/api'
  const selectedValue = value || ''
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
      {message ? <p className="field-description">{message}</p> : null}
      <FieldDescription description={field.admin?.description} path={path} />
    </div>
  )
}
