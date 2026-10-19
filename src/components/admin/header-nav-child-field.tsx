'use client'

import { FieldDescription, FieldError, FieldLabel, useConfig, useField } from '@payloadcms/ui'
import { useEffect, useMemo, useState } from 'react'

type NavChildOption = {
  value: string
  label: string
  parentLabel: string
  groupTitle?: string
}

type NavigationDoc = {
  items?: Array<{
    label?: string | null
    href?: string | null
    groups?: Array<{
      title?: string | null
      links?: Array<{
        id?: string | null
        label?: string | null
        href?: string | null
      }> | null
    }> | null
  }> | null
}

/** Every Header menu item (and its nested links) as success-category options. */
function buildOptions(doc: NavigationDoc | null): NavChildOption[] {
  if (!doc?.items?.length) return []

  const options: NavChildOption[] = []
  const seen = new Set<string>()

  const push = (option: NavChildOption) => {
    if (seen.has(option.value)) return
    seen.add(option.value)
    options.push(option)
  }

  for (const item of doc.items) {
    const parentLabel = typeof item.label === 'string' ? item.label.trim() : ''
    if (!parentLabel) continue

    const parentHref = typeof item.href === 'string' ? item.href.trim() : ''
    if (parentHref) {
      push({
        value: parentHref,
        label: parentLabel,
        parentLabel,
      })
    }

    for (const group of item.groups ?? []) {
      const groupTitle = typeof group.title === 'string' ? group.title.trim() : ''
      for (const link of group.links ?? []) {
        const label = typeof link.label === 'string' ? link.label.trim() : ''
        const href = typeof link.href === 'string' ? link.href.trim() : ''
        if (!label || !href) continue
        push({
          value: href,
          label,
          parentLabel,
          ...(groupTitle ? { groupTitle } : {}),
        })
      }
    }
  }
  return options
}

export function HeaderNavChildField({
  path,
  field,
}: {
  path: string
  field: { label?: unknown; required?: boolean | ((...args: unknown[]) => boolean); admin?: { description?: unknown } }
}) {
  const { config } = useConfig()
  const { value, setValue, showError } = useField<string>({ path })
  const [options, setOptions] = useState<NavChildOption[]>([])
  const [loading, setLoading] = useState(true)

  const label = typeof field.label === 'string' ? field.label : 'Success category'
  const required = typeof field.required === 'boolean' ? field.required : true
  const description =
    typeof field.admin?.description === 'string' ? field.admin.description : undefined

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const response = await fetch(`${config.routes.api}/globals/navigation?depth=0`, {
          credentials: 'include',
        })
        if (!response.ok) throw new Error('Failed to load navigation')
        const doc = (await response.json()) as NavigationDoc
        if (!cancelled) setOptions(buildOptions(doc))
      } catch {
        if (!cancelled) setOptions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [config.routes.api])

  const grouped = useMemo(() => {
    const map = new Map<string, NavChildOption[]>()
    for (const option of options) {
      const groupKey = option.groupTitle
        ? `${option.parentLabel} · ${option.groupTitle}`
        : option.parentLabel
      const list = map.get(groupKey) ?? []
      list.push(option)
      map.set(groupKey, list)
    }
    return [...map.entries()]
  }, [options])

  return (
    <div className="field-type">
      <FieldLabel label={label} path={path} required={required} />
      <div className="field-type__wrap">
        <FieldError path={path} showError={showError} />
        <select
          id={`field-${path}`}
          value={value || ''}
          disabled={loading}
          required={required}
          onChange={(event) => setValue(event.target.value || null)}
        >
          <option value="">{loading ? 'Loading categories…' : 'Select a success category'}</option>
          {grouped.map(([groupLabel, children]) => (
            <optgroup key={groupLabel} label={groupLabel}>
              {children.map((child) => (
                <option key={`${groupLabel}-${child.value}`} value={child.value}>
                  {child.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      {description ? <FieldDescription description={description} path={path} /> : null}
    </div>
  )
}
