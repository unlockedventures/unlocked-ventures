'use client'

import {
  Button,
  FieldDescription,
  FieldError,
  FieldLabel,
  Modal,
  toast,
  useConfig,
  useField,
  useModal,
} from '@payloadcms/ui'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import './success-badge-field.css'

type BadgeOption = {
  id: number
  name: string
}

export function SuccessBadgeField({
  path,
  field,
}: {
  path: string
  field: { label?: unknown; required?: boolean | ((...args: unknown[]) => boolean); admin?: { description?: unknown } }
}) {
  const { config } = useConfig()
  const { value, setValue, showError } = useField<number | null>({ path })
  const { openModal, closeModal, isModalOpen } = useModal()
  const modalSlug = useId().replace(/:/g, '')
  const modalId = `uv-create-badge-${modalSlug}`
  const inputRef = useRef<HTMLInputElement>(null)
  const modalOpen = isModalOpen(modalId)

  const [options, setOptions] = useState<BadgeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const label = typeof field.label === 'string' ? field.label : 'Badge'
  const required = typeof field.required === 'boolean' ? field.required : false
  const description =
    typeof field.admin?.description === 'string' ? field.admin.description : undefined

  const loadBadges = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `${config.routes.api}/success-badges?limit=200&depth=0&sort=name`,
        { credentials: 'include' },
      )
      if (!response.ok) throw new Error('Failed to load badges')
      const body = (await response.json()) as { docs?: Array<{ id?: number; name?: string | null }> }
      const next = (body.docs ?? []).flatMap((doc) => {
        if (typeof doc.id !== 'number' || typeof doc.name !== 'string' || !doc.name.trim()) return []
        return [{ id: doc.id, name: doc.name.trim() }]
      })
      setOptions(next)
    } catch {
      setOptions([])
    } finally {
      setLoading(false)
    }
  }, [config.routes.api])

  useEffect(() => {
    void loadBadges()
  }, [loadBadges])

  function openCreateModal() {
    setDraftName('')
    setFormError(null)
    openModal(modalId)
  }

  useEffect(() => {
    if (!modalOpen) return
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [modalOpen])

  function closeCreateModal() {
    if (creating) return
    closeModal(modalId)
    setDraftName('')
    setFormError(null)
  }

  async function submitCreate() {
    if (creating) return
    const name = draftName.trim()
    if (!name) {
      setFormError('Badge name cannot be empty.')
      inputRef.current?.focus()
      return
    }

    setCreating(true)
    setFormError(null)
    try {
      const response = await fetch(`${config.routes.api}/success-badges`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const body = (await response.json().catch(() => null)) as
        | {
            doc?: { id?: number | string; name?: string | null }
            errors?: Array<{ message?: string }>
            message?: string
          }
        | null
      if (!response.ok) {
        setFormError(
          body?.errors?.[0]?.message ||
            body?.message ||
            'Could not create badge. Names must be unique (case-insensitive).',
        )
        return
      }
      const createdId =
        typeof body?.doc?.id === 'number'
          ? body.doc.id
          : typeof body?.doc?.id === 'string' && body.doc.id.trim()
            ? Number(body.doc.id)
            : NaN
      if (!Number.isFinite(createdId)) {
        setFormError('Could not create badge.')
        return
      }
      await loadBadges()
      setValue(createdId)
      closeModal(modalId)
      setDraftName('')
      toast.success(`Badge “${body?.doc?.name ?? name}” created.`)
    } catch {
      setFormError('Could not create badge.')
    } finally {
      setCreating(false)
    }
  }

  const selectedId = typeof value === 'number' ? value : null

  return (
    <div className="field-type">
      <FieldLabel label={label} path={path} required={required} />
      <div className="field-type__wrap">
        <FieldError path={path} showError={showError} />
        <div className="uv-badge-field__row">
          <select
            id={`field-${path}`}
            value={selectedId ?? ''}
            disabled={loading || creating}
            required={required}
            className="uv-badge-field__select"
            onChange={(event) => {
              const next = event.target.value
              setValue(next ? Number(next) : null)
            }}
          >
            <option value="">{loading ? 'Loading badges…' : 'Select a badge'}</option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="uv-badge-field__add"
            aria-label="Create new badge"
            title="Create new badge"
            disabled={creating}
            onClick={openCreateModal}
          >
            +
          </button>
        </div>
      </div>
      {description ? <FieldDescription description={description} path={path} /> : null}

      {modalOpen ? (
        <Modal className="uv-badge-modal" closeOnBlur={!creating} slug={modalId}>
          <div
            className="uv-badge-modal__card"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${modalId}-title`}
          >
            <div className="uv-badge-modal__header">
              <h2 id={`${modalId}-title`}>Create badge</h2>
              <p>Names are unique ignoring letter case — AI and ai are treated as the same.</p>
            </div>

            <label className="uv-badge-modal__field" htmlFor={`${modalId}-name`}>
              <span>Badge name</span>
              <input
                ref={inputRef}
                id={`${modalId}-name`}
                type="text"
                value={draftName}
                disabled={creating}
                placeholder="e.g. AR"
                autoComplete="off"
                onChange={(event) => {
                  setDraftName(event.target.value)
                  if (formError) setFormError(null)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    void submitCreate()
                  }
                  if (event.key === 'Escape') {
                    event.preventDefault()
                    closeCreateModal()
                  }
                }}
              />
            </label>

            {formError ? <p className="uv-badge-modal__error">{formError}</p> : null}

            <div className="uv-badge-modal__actions">
              <Button buttonStyle="secondary" disabled={creating} onClick={closeCreateModal} type="button">
                Cancel
              </Button>
              <Button disabled={creating} onClick={() => void submitCreate()} type="button">
                {creating ? 'Creating…' : 'Create badge'}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
