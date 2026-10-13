'use client'

import { Button, toast, useSelection } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import {
  LIST_FIELD_BULK_EVENT,
  type ListFieldBulkDetail,
} from '@/components/admin/boolean-toggle-cell'

/** Injects Active / Inactive into the Channels list selection bar. */
export function ChannelBulkActiveActions() {
  const { count, selectedIDs, toggleAll } = useSelection()
  const router = useRouter()
  const [host, setHost] = useState<Element | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (count === 0) {
      setHost(null)
      document.querySelectorAll('.uv-channel-bulk-sep, .uv-channel-bulk-host').forEach((el) => el.remove())
      return
    }

    const ensureHost = () => {
      const root = document.querySelector(
        '.collection-list__header .list-selection, .list-header .list-selection, .list-selection',
      )
      if (!root) return null

      let actions = root.querySelector('.uv-channel-bulk-host')
      if (!actions) {
        const sep = document.createElement('span')
        sep.className = 'uv-channel-bulk-sep'
        sep.textContent = '—'
        actions = document.createElement('div')
        actions.className = 'list-selection__actions uv-channel-bulk-host'
        root.appendChild(sep)
        root.appendChild(actions)
      }
      return actions
    }

    setHost(ensureHost())
    const observer = new MutationObserver(() => {
      setHost(ensureHost())
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      document.querySelectorAll('.uv-channel-bulk-sep, .uv-channel-bulk-host').forEach((el) => el.remove())
    }
  }, [count])

  async function setActive(active: boolean) {
    if (busy || count === 0 || selectedIDs.length === 0) return
    setBusy(true)
    const ids = selectedIDs.map(String)
    try {
      // Per-document PATCH — collection bulk edit is disabled on this collection.
      const results = await Promise.all(
        ids.map((id) =>
          fetch(`/api/podcast-channels/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active }),
          }),
        ),
      )
      if (results.some((res) => !res.ok)) throw new Error('update failed')

      // Optimistic Active-column update — refineListData with the same query
      // does not navigate, so cells would otherwise stay stale until a full reload.
      const detail: ListFieldBulkDetail = { field: 'active', ids, value: active }
      window.dispatchEvent(new CustomEvent(LIST_FIELD_BULK_EVENT, { detail }))

      toast.success(active ? 'Channels set to Active.' : 'Channels set to Inactive.')
      toggleAll()
      router.refresh()
    } catch {
      toast.error('Could not update channels. Try again.')
    } finally {
      setBusy(false)
    }
  }

  if (count === 0 || !host) return null

  return createPortal(
    <>
      <Button
        buttonStyle="none"
        className="list-selection__button"
        disabled={busy}
        onClick={() => void setActive(true)}
      >
        Active
      </Button>
      <Button
        buttonStyle="none"
        className="list-selection__button"
        disabled={busy}
        onClick={() => void setActive(false)}
      >
        Inactive
      </Button>
    </>,
    host,
  )
}
