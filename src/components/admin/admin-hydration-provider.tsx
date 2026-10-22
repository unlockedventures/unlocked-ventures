'use client'

import { useSyncExternalStore, type ReactNode } from 'react'

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

/** Initialize Payload's interactive form state after the server tree hydrates. */
export function AdminHydrationProvider({ children }: { children: ReactNode }) {
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)

  if (!hydrated) {
    return (
      <div className="uv-admin-loading" role="status" aria-live="polite" aria-busy="true">
        Loading admin…
      </div>
    )
  }

  return children
}
