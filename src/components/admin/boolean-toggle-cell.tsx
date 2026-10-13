'use client'

import { CheckboxInput, toast, useListQuery } from '@payloadcms/ui'
import type { DefaultCellComponentProps } from 'payload'
import { useEffect, useState } from 'react'

export const LIST_FIELD_BULK_EVENT = 'uv-list-field-bulk'

export type ListFieldBulkDetail = {
  field: string
  ids: string[]
  value: boolean
}

/** List-view checkbox that PATCHes the cell's own field (e.g. featured, active). */
export function BooleanToggleCell({
  cellData,
  collectionSlug,
  field,
  rowData,
}: DefaultCellComponentProps) {
  const fieldName = typeof field?.name === 'string' ? field.name : 'featured'
  const saved = cellData === true
  const [pending, setPending] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const { query, refineListData } = useListQuery()
  const id = typeof rowData?.id === 'string' || typeof rowData?.id === 'number' ? String(rowData.id) : ''
  const checked = pending ?? saved

  useEffect(() => {
    setPending(null)
  }, [saved])

  useEffect(() => {
    if (!id) return

    const onBulk = (event: Event) => {
      const detail = (event as CustomEvent<ListFieldBulkDetail>).detail
      if (!detail || detail.field !== fieldName) return
      if (!detail.ids.includes(id)) return
      setPending(detail.value)
    }

    window.addEventListener(LIST_FIELD_BULK_EVENT, onBulk)
    return () => window.removeEventListener(LIST_FIELD_BULK_EVENT, onBulk)
  }, [fieldName, id])

  async function onToggle(event: React.ChangeEvent<HTMLInputElement>) {
    event.stopPropagation()
    if (!id || saving) return

    const next = !checked
    setPending(next)
    setSaving(true)
    try {
      const response = await fetch(`/api/${collectionSlug}/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [fieldName]: next }),
      })
      if (!response.ok) throw new Error('save failed')
      if (typeof refineListData === 'function' && query) {
        await refineListData(query).catch(() => undefined)
      }
    } catch {
      setPending(null)
      toast.error('This could not be saved. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="uv-featured-cell"
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <CheckboxInput
        checked={checked}
        id={`${fieldName}-${id}`}
        Label={null}
        onToggle={onToggle}
        readOnly={saving || !id}
      />
    </div>
  )
}
