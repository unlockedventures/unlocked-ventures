'use client'

import { CheckboxInput, toast, useAuth, useListQuery } from '@payloadcms/ui'
import type { DefaultCellComponentProps } from 'payload'
import { useEffect, useState } from 'react'

export function FeaturedCell({ cellData, collectionSlug, rowData }: DefaultCellComponentProps) {
  const { permissions } = useAuth()
  const canUpdate = Boolean(collectionSlug && permissions?.collections?.[collectionSlug]?.update)
  const saved = cellData === true
  const [pending, setPending] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const { query, refineListData } = useListQuery()
  const id =
    typeof rowData?.id === 'string' || typeof rowData?.id === 'number' ? String(rowData.id) : ''
  const checked = pending ?? saved

  useEffect(() => {
    setPending(null)
  }, [saved])

  async function onToggle(event: React.ChangeEvent<HTMLInputElement>) {
    event.stopPropagation()
    if (!id || saving || !canUpdate) return

    const next = !checked
    setPending(next)
    setSaving(true)
    try {
      const response = await fetch(`/api/${collectionSlug}/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: next }),
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
        id={`featured-${id}`}
        Label={null}
        onToggle={onToggle}
        readOnly={saving || !id || !canUpdate}
      />
    </div>
  )
}
