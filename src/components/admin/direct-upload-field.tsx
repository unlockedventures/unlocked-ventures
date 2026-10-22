'use client'

import {
  FieldDescription,
  FieldError,
  FieldLabel,
  toast,
  useConfig,
  useField,
} from '@payloadcms/ui'
import { useEffect, useRef, useState } from 'react'

type DirectUploadFieldProps = {
  field: {
    label?: Record<string, string> | string
    admin?: {
      description?: string
      custom?: {
        relationTo?: string
        accept?: string
        emptyLabel?: string
      }
    }
  }
  path: string
  readOnly?: boolean
}

function labelText(label: DirectUploadFieldProps['field']['label']) {
  if (!label) return ''
  if (typeof label === 'string') return label
  return Object.values(label)[0] || ''
}

export function DirectUploadField(props: DirectUploadFieldProps) {
  const { field, path, readOnly } = props
  const { value, setValue, showError } = useField<number | string | null>({ path })
  const { config } = useConfig()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [fileLabel, setFileLabel] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const relationTo = field.admin?.custom?.relationTo || 'media'
  const accept = field.admin?.custom?.accept || 'image/*'
  const emptyLabel = field.admin?.custom?.emptyLabel || 'Upload or drag and drop a file'
  const api = config.routes?.api || '/api'
  const isImage = accept.startsWith('image')

  useEffect(() => {
    if (value == null || value === '') {
      setFileLabel('')
      setPreviewUrl('')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${api}/${relationTo}/${value}?depth=0`, { credentials: 'include' })
        if (!res.ok) return
        const doc = (await res.json()) as { filename?: string; url?: string }
        if (cancelled) return
        setFileLabel(doc.filename || String(value))
        setPreviewUrl(doc.url || '')
      } catch {
        // ignore lookup errors
      }
    })()
    return () => {
      cancelled = true
    }
  }, [api, relationTo, value])

  async function uploadFile(file: File) {
    if (readOnly || busy) return
    setBusy(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const payload: Record<string, unknown> = {
        alt: file.name.replace(/\.[^.]+$/, '') || file.name,
      }
      if (relationTo === 'media') {
        payload.kind = isImage ? 'image' : 'file'
      }
      form.append('_payload', JSON.stringify(payload))
      const res = await fetch(`${api}/${relationTo}`, {
        method: 'POST',
        body: form,
        credentials: 'include',
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          errors?: { message?: string }[]
        } | null
        throw new Error(body?.errors?.[0]?.message || 'Upload failed')
      }
      const doc = (await res.json()) as {
        doc?: { id?: number | string; filename?: string; url?: string }
      }
      const id = doc.doc?.id
      if (id == null) throw new Error('Upload failed')
      setValue(id)
      setFileLabel(doc.doc?.filename || file.name)
      setPreviewUrl(doc.doc?.url || '')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function onFiles(files: FileList | null) {
    const file = files?.[0]
    if (file) void uploadFile(file)
  }

  return (
    <div className={`field-type upload uv-direct-upload-field${showError ? ' error' : ''}`}>
      <FieldLabel label={labelText(field.label)} path={path} />
      <FieldError path={path} />
      {value != null && value !== '' ? (
        <div className="uv-direct-upload-field__preview">
          {isImage && previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="uv-direct-upload-field__thumb" />
          ) : null}
          <div className="uv-direct-upload-field__meta">
            <span>{fileLabel || `File #${value}`}</span>
            {!readOnly ? (
              <button
                type="button"
                className="uv-direct-upload-field__clear"
                onClick={() => {
                  setValue(null)
                  setFileLabel('')
                  setPreviewUrl('')
                }}
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <label
          className={`uv-direct-upload-field__drop${busy ? ' is-busy' : ''}${readOnly ? ' is-readonly' : ''}`}
          onDragOver={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
          onDrop={(event) => {
            event.preventDefault()
            event.stopPropagation()
            if (!readOnly) onFiles(event.dataTransfer.files)
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            disabled={readOnly || busy}
            className="uv-direct-upload-field__input"
            onChange={(event) => onFiles(event.target.files)}
          />
          <span>{busy ? 'Uploading…' : emptyLabel}</span>
        </label>
      )}
      <FieldDescription description={field.admin?.description} path={path} />
    </div>
  )
}
