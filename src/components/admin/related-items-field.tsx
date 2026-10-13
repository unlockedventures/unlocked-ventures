'use client'

import { Link, useConfig, useDocumentDrawer } from '@payloadcms/ui'
import { useCallback, useEffect, useState } from 'react'

type MediaValue = {
  url?: string | null
  alt?: string | null
}

type ItemDoc = {
  id: number | string
} & Record<string, unknown>

type RelatedItemsCustom = {
  collection: string
  titleField: string
  imageField: string
  singular: string
  plural: string
  help: string
  where?: string
  readOnly?: boolean
  manageLabel?: string
}

type FieldProps = {
  field: {
    label?: unknown
    admin?: {
      custom?: Partial<RelatedItemsCustom>
    }
  }
}

function readCustom(field: FieldProps['field']): RelatedItemsCustom | null {
  const custom = field.admin?.custom
  if (!custom?.collection || !custom.titleField || !custom.imageField || !custom.singular || !custom.plural || !custom.help) {
    return null
  }
  return custom as RelatedItemsCustom
}

function readTitle(item: ItemDoc, titleField: string) {
  const value = item[titleField]
  return typeof value === 'string' && value.trim() ? value : 'Untitled'
}

function readImage(item: ItemDoc, imageField: string) {
  const value = item[imageField]
  if (!value || typeof value !== 'object') return null
  const media = value as MediaValue
  return media.url ? media : null
}

function ReadOnlyRelatedItemRow({
  title,
  imageUrl,
  imageAlt,
}: {
  title: string
  imageUrl: string | null
  imageAlt: string
}) {
  return (
    <li className="uv-related-items__row is-readonly">
      {imageUrl ? (
        <img src={imageUrl} alt={imageAlt} />
      ) : (
        <span className="uv-related-items__placeholder">No image</span>
      )}
      <span className="uv-related-items__title">{title}</span>
    </li>
  )
}

function RelatedItemRow({
  collection,
  singular,
  title,
  imageUrl,
  imageAlt,
  id,
  dragging,
  over,
  onChange,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: {
  collection: string
  singular: string
  title: string
  imageUrl: string | null
  imageAlt: string
  id: number | string
  dragging: boolean
  over: boolean
  onChange: () => void
  onDragStart: () => void
  onDragEnd: () => void
  onDragOver: () => void
  onDrop: (fromId: string) => void
}) {
  const [DocumentDrawer, , { openDrawer }] = useDocumentDrawer({
    collectionSlug: collection,
    id,
  })
  const [confirming, setConfirming] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [removeError, setRemoveError] = useState('')

  async function removeItem() {
    setRemoving(true)
    setRemoveError('')
    try {
      const response = await fetch(`/api/${collection}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        setRemoveError(`This ${singular} could not be removed.`)
        setRemoving(false)
        return
      }
      setConfirming(false)
      onChange()
    } catch {
      setRemoveError(`This ${singular} could not be removed.`)
      setRemoving(false)
    }
  }

  return (
    <li
      className={['uv-related-items__row', dragging ? 'is-dragging' : '', over ? 'is-over' : ''].filter(Boolean).join(' ')}
      draggable={!confirming}
      onDragStart={(event) => {
        if ((event.target as HTMLElement).closest('.uv-related-items__actions')) {
          event.preventDefault()
          return
        }
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', String(id))
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        event.preventDefault()
        onDragOver()
      }}
      onDrop={(event) => {
        event.preventDefault()
        onDrop(event.dataTransfer.getData('text/plain'))
      }}
    >
      <span className="uv-related-items__handle" aria-hidden="true">
        <svg viewBox="0 0 12 16">
          <circle cx="3" cy="3" r="1.2" fill="currentColor" />
          <circle cx="9" cy="3" r="1.2" fill="currentColor" />
          <circle cx="3" cy="8" r="1.2" fill="currentColor" />
          <circle cx="9" cy="8" r="1.2" fill="currentColor" />
          <circle cx="3" cy="13" r="1.2" fill="currentColor" />
          <circle cx="9" cy="13" r="1.2" fill="currentColor" />
        </svg>
      </span>
      {imageUrl ? (
        <img src={imageUrl} alt={imageAlt} />
      ) : (
        <span className="uv-related-items__placeholder">No image</span>
      )}
      <span className="uv-related-items__title">{title}</span>
      <span className="uv-related-items__actions">
        {confirming ? (
          <>
            <span>Remove this {singular} from the site?</span>
            <button type="button" onClick={() => void removeItem()} disabled={removing}>
              {removing ? 'Removing…' : 'Remove'}
            </button>
            <button type="button" onClick={() => setConfirming(false)} disabled={removing}>
              Keep
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={openDrawer}>
              Change
            </button>
            <button type="button" onClick={() => setConfirming(true)}>
              Remove
            </button>
          </>
        )}
      </span>
      {removeError ? <span className="uv-related-items__error">{removeError}</span> : null}
      <DocumentDrawer onSave={onChange} onDelete={onChange} redirectAfterCreate={false} redirectAfterDelete={false} />
    </li>
  )
}

function AddRelatedItem({
  collection,
  singular,
  onChange,
}: {
  collection: string
  singular: string
  onChange: () => void
}) {
  const [DocumentDrawer, , { openDrawer }] = useDocumentDrawer({
    collectionSlug: collection,
  })

  return (
    <>
      <button type="button" className="uv-related-items__add" onClick={openDrawer}>
        Add {singular}
      </button>
      <DocumentDrawer onSave={onChange} redirectAfterCreate={false} />
    </>
  )
}

export function RelatedItemsField({ field }: FieldProps) {
  const custom = readCustom(field)
  const collection = custom?.collection ?? ''
  const where = custom?.where ?? ''
  const [items, setItems] = useState<ItemDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orderError, setOrderError] = useState('')
  const [savingOrder, setSavingOrder] = useState(false)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const label = typeof field.label === 'string' ? field.label : custom?.plural

  const load = useCallback(async () => {
    if (!collection) return
    setError('')
    try {
      const query = where ? `&${where}` : ''
      const response = await fetch(`/api/${collection}?limit=100&depth=1&sort=sortOrder${query}`, {
        credentials: 'include',
      })
      if (!response.ok) throw new Error('load failed')
      const data = (await response.json()) as { docs?: ItemDoc[] }
      setItems(Array.isArray(data.docs) ? data.docs : [])
    } catch {
      setError('These items could not be loaded. Refresh the page and try again.')
    } finally {
      setLoading(false)
    }
  }, [collection, where])

  useEffect(() => {
    void load()
  }, [load])

  async function moveItem(from: number, to: number) {
    if (!custom || from === to || savingOrder) return
    const next = items.slice()
    const [moved] = next.splice(from, 1)
    if (!moved) return
    next.splice(to, 0, moved)
    const ordered = next.map((item, index) => ({ ...item, sortOrder: index }))
    setItems(ordered)
    setSavingOrder(true)
    setOrderError('')
    try {
      const responses = await Promise.all(
        ordered.map((item, index) =>
          fetch(`/api/${custom.collection}/${item.id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sortOrder: index }),
          }),
        ),
      )
      if (responses.some((response) => !response.ok)) {
        throw new Error('save failed')
      }
    } catch {
      setOrderError('The new order could not be saved. The list has been restored.')
      await load()
    } finally {
      setSavingOrder(false)
    }
  }

  const { config } = useConfig()
  const manageHref = `${config.routes.admin}/collections/${collection}`
  const readOnly = Boolean(custom?.readOnly) || custom?.collection === 'case-studies'
  const manageLabel =
    custom?.manageLabel ||
    (custom?.collection === 'podcast-episodes'
      ? 'Episodes'
      : custom?.collection === 'podcast-channels'
        ? 'Channels'
        : custom?.plural)

  if (!custom) return null

  return (
    <section className="uv-related-items">
      <div className="uv-related-items__header">
        <h3>{label}</h3>
        {readOnly ? (
          <Link className="uv-related-items__add" href={manageHref}>
            Open {manageLabel}
          </Link>
        ) : (
          <AddRelatedItem collection={custom.collection} singular={custom.singular} onChange={() => void load()} />
        )}
      </div>
      <p>{custom.help}</p>
      {loading ? <p>Loading…</p> : null}
      {error ? <p className="uv-related-items__error">{error}</p> : null}
      {orderError ? <p className="uv-related-items__error">{orderError}</p> : null}
      {savingOrder ? <p>Saving the new order…</p> : null}
      {!loading && !error && items.length === 0 ? (
        <p>
          {readOnly
            ? `None yet. Add a ${custom.singular} from ${manageLabel}.`
            : `None yet. Use Add ${custom.singular} to put the first one on the site.`}
        </p>
      ) : null}
      {items.length > 0 ? (
        <ul>
          {items.map((item, index) => {
            const image = readImage(item, custom.imageField)
            const title = readTitle(item, custom.titleField)
            if (readOnly) {
              return (
                <ReadOnlyRelatedItemRow
                  key={String(item.id)}
                  title={title}
                  imageUrl={image?.url ?? null}
                  imageAlt={image?.alt || title}
                />
              )
            }
            return (
              <RelatedItemRow
                key={String(item.id)}
                collection={custom.collection}
                singular={custom.singular}
                title={title}
                imageUrl={image?.url ?? null}
                imageAlt={image?.alt || title}
                id={item.id}
                dragging={draggingIndex === index}
                over={overIndex === index && draggingIndex !== index}
                onChange={() => void load()}
                onDragStart={() => setDraggingIndex(index)}
                onDragEnd={() => {
                  setDraggingIndex(null)
                  setOverIndex(null)
                }}
                onDragOver={() => setOverIndex(index)}
                onDrop={(fromId) => {
                  const from = items.findIndex((entry) => String(entry.id) === fromId)
                  setDraggingIndex(null)
                  setOverIndex(null)
                  if (from < 0) return
                  void moveItem(from, index)
                }}
              />
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}
