import { act } from '@testing-library/react'
import { hydrateRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { AdminHydrationProvider } from '@/components/admin/admin-hydration-provider'

describe('admin hydration boundary', () => {
  it('renders a stable loading state on the server instead of initializing form controls', () => {
    const initialize = vi.fn(() => <input aria-label="Title" />)
    function Editor() {
      return initialize()
    }
    const html = renderToString(
      <AdminHydrationProvider>
        <Editor />
      </AdminHydrationProvider>,
    )
    expect(html).toContain('Loading admin')
    expect(html).not.toContain('<input')
    expect(initialize).not.toHaveBeenCalled()
  })

  it.each([false, true])(
    'hydrates without attribute mismatches and preserves disabled=%s',
    async (disabled) => {
      const container = document.createElement('div')
      document.body.appendChild(container)
      const consoleError = vi.spyOn(console, 'error')
      const recoverable = vi.fn()
      let root: Root | undefined
      const editor = (
        <AdminHydrationProvider>
          <form>
            <input aria-label="Title" disabled={disabled} defaultValue="Episode" />
            <button disabled={disabled}>Save as Draft</button>
          </form>
        </AdminHydrationProvider>
      )
      try {
        container.innerHTML = renderToString(editor)
        await act(async () => {
          root = hydrateRoot(container, editor, { onRecoverableError: recoverable })
        })
        expect(container.querySelector('button')?.disabled).toBe(disabled)
        expect(container.querySelector('input')?.disabled).toBe(disabled)
        expect(container.textContent).not.toContain('Loading admin')
        expect(recoverable).not.toHaveBeenCalled()
        expect(
          consoleError.mock.calls.some((args) =>
            /hydration|hydrated|didn't match/i.test(args.join(' ')),
          ),
        ).toBe(false)
      } finally {
        if (root) await act(async () => root!.unmount())
        container.remove()
        consoleError.mockRestore()
      }
    },
  )
})
