'use client'

import {
  ArrayField,
  Button,
  FieldError,
  FieldLabel,
  useConfig,
  useField,
  useForm,
  useFormFields,
} from '@payloadcms/ui'
import { useEffect, useState } from 'react'
import type { ArrayFieldClientComponent } from 'payload'

import {
  reconcileHomePresentation,
  type HomeGroupPresentation,
  type MenuCatalog,
} from '@/lib/home-menu-source'

type FieldProps = { path: string; field: { label?: unknown } }

function useMenuCatalog() {
  const { config } = useConfig()
  const [items, setItems] = useState<MenuCatalog>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)
    setItems([])
    void fetch(`${config.routes.api}/home-menu-sources`, {
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Menu sources unavailable')
        const body = (await response.json()) as { items: MenuCatalog }
        if (!controller.signal.aborted) setItems(body.items)
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [config.routes.api, revision])
  return { items, loading, error, retry: () => setRevision((value) => value + 1) }
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

export function HomeMenuSourceField({ path, field }: FieldProps) {
  const { config } = useConfig()
  const { value, setValue, showError } = useField<string>({ path })
  const { items, loading, error, retry } = useMenuCatalog()
  const { getData, reset, setModified, setProcessing } = useForm()
  const [syncError, setSyncError] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const selected = items.find((item) => item.id === value)
  const usable = selected?.groups.some((group) => group.links.length > 0)
  useEffect(() => {
    if (!selected) return
    const data = getData()
    const rows = (data.groups ?? []) as HomeGroupPresentation[]
    const archive = (data.menuPresentationArchive ?? []) as HomeGroupPresentation[]
    if (
      rows.length === selected.groups.length &&
      rows.every((row, index) => row.sourceGroupId === selected.groups[index].id)
    )
      return
    const presentation = reconcileHomePresentation(selected.groups, rows, archive)
    setSyncing(true)
    setSyncError(false)
    setProcessing(true)
    void reset({ ...data, ...presentation })
      .then(() => {
        setModified(true)
      })
      .catch(() => setSyncError(true))
      .finally(() => {
        setSyncing(false)
        setProcessing(false)
      })
  }, [selected, getData, reset, setModified, setProcessing])
  return (
    <div className="field-type" style={{ marginBottom: 24 }}>
      <FieldLabel
        path={path}
        label={typeof field.label === 'string' ? field.label : 'Header menu source'}
      />
      <FieldError path={path} showError={showError} />
      <select
        id={`field-${path}`}
        style={selectStyle}
        value={value || ''}
        disabled={loading || error || syncing}
        aria-describedby={`${path}-help`}
        onChange={(event) => setValue(event.target.value || null)}
      >
        <option value="">
          {loading ? 'Loading Header menus…' : 'Select a Header menu parent'}
        </option>
        {value && !selected ? <option value={value}>Saved source (unavailable)</option> : null}
        {items.map((item, index) => (
          <option key={item.id} value={item.id ?? ''}>
            {item.label} — {item.href} ({index + 1})
          </option>
        ))}
      </select>
      <p id={`${path}-help`}>
        Names, links and ordering come from{' '}
        <a href={`${config.routes.admin}/globals/navigation`}>Header menu</a>. “Published in header”
        does not control this homepage section.
      </p>
      {syncing ? <p role="status">Creating presentation groups…</p> : null}
      {syncError ? (
        <p role="alert">
          Could not update the presentation controls. Reload the editor and try again.
        </p>
      ) : null}
      {error ? (
        <div role="alert">
          Could not load Header menus. Your saved choice is unchanged.{' '}
          <Button buttonStyle="secondary" onClick={retry}>
            Retry
          </Button>
        </div>
      ) : null}
      {!loading && !error && value && !selected ? (
        <p role="status">
          This source was removed. Select a replacement; the public section is hidden.
        </p>
      ) : null}
      {!loading && !error && selected ? (
        <div
          style={{ padding: 16, border: '1px solid var(--theme-elevation-150)', borderRadius: 4 }}
        >
          <strong>Inherited menu — read only</strong>
          {!usable ? (
            <p role="status">This parent has no dropdown links. The public section is hidden.</p>
          ) : null}
          {selected.groups.map((group) => (
            <div key={group.id} style={{ marginTop: 16 }}>
              {group.title ? <strong>{group.title}</strong> : null}
              <ul>
                {group.links.map((link) => (
                  <li key={link.id}>
                    {link.label} — {link.href}
                    {link.external ? ' (external)' : ''}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
      {!value ? <p>Existing offerings stay visible until you select a source.</p> : null}
    </div>
  )
}

export function HomeMenuGroupField({ path, field }: FieldProps) {
  const sourceId = useFormFields(([fields]) => fields.menuSource?.value) as string | undefined
  const { value } = useField<string>({ path })
  const { items } = useMenuCatalog()
  const groups = items.find((item) => item.id === sourceId)?.groups ?? []
  return (
    <div className="field-type">
      <FieldLabel
        path={path}
        label={typeof field.label === 'string' ? field.label : 'Header menu group'}
      />
      <p id={`field-${path}`}>
        <strong>{groups.find((group) => group.id === value)?.title || 'Untitled group'}</strong>
      </p>
    </div>
  )
}

/** Keep the native icon/description controls, with source-owned row count and order. */
export const HomeMenuPresentationField: ArrayFieldClientComponent = (props) => {
  const sourceId = useFormFields(([fields]) => fields.menuSource?.value)
  const count = useFormFields(([fields]) => fields[props.path]?.value) as number | undefined
  if (!sourceId || !count) return null
  return (
    <ArrayField
      {...props}
      field={{
        ...props.field,
        minRows: count,
        maxRows: count,
        admin: {
          ...props.field.admin,
          isSortable: false,
          initCollapsed: props.field.admin?.initCollapsed === true,
        },
      }}
    />
  )
}
