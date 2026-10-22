import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({ setValue: vi.fn(), error: vi.fn() }))
vi.mock('@payloadcms/ui', () => ({
  FieldDescription: () => null,
  FieldError: ({ path }: { path: string }) => <span data-testid="field-error">{path}</span>,
  FieldLabel: ({ label }: { label: string }) => <span>{label}</span>,
  toast: { error: state.error },
  useConfig: () => ({ config: { routes: { api: '/api' } } }),
  useField: () => ({ value: null, setValue: state.setValue, showError: false }),
}))

import { DirectUploadField } from '@/components/admin/direct-upload-field'

const props = {
  path: 'image',
  field: { label: 'Upload image', admin: { custom: { relationTo: 'media', accept: 'image/*' } } },
}
const file = new File(['image'], 'cover.png', { type: 'image/png' })

describe('Episode thumbnail uploads', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it.each(['picker', 'drop'])('uploads an image through the %s', async (method) => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ doc: { id: 17, filename: 'cover.png', url: '/media/cover.png' } }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const { container } = render(<DirectUploadField {...props} />)
    const input = container.querySelector('input')!
    if (method === 'picker') fireEvent.change(input, { target: { files: [file] } })
    else fireEvent.drop(input.closest('label')!, { dataTransfer: { files: [file] } })
    await waitFor(() => expect(state.setValue).toHaveBeenCalledWith(17))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/media',
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    )
    const body = fetchMock.mock.calls[0][1].body as FormData
    expect(body.get('file')).toBe(file)
  })

  it('reports denied uploads without setting an image', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ errors: [{ message: 'Not authorized' }] }),
      }),
    )
    const { container } = render(<DirectUploadField {...props} />)
    fireEvent.change(container.querySelector('input')!, { target: { files: [file] } })
    await waitFor(() => expect(state.error).toHaveBeenCalledWith('Not authorized'))
    expect(state.setValue).not.toHaveBeenCalled()
  })

  it('reports network failure and allows a retry', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network unavailable')))
    const { container } = render(<DirectUploadField {...props} />)
    const input = container.querySelector('input')!
    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => expect(state.error).toHaveBeenCalledWith('Network unavailable'))
    expect(state.setValue).not.toHaveBeenCalled()
    expect(input).toBeEnabled()
  })

  it('keeps file selection disabled while uploading', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))
    const { container } = render(<DirectUploadField {...props} />)
    const input = container.querySelector('input')!
    fireEvent.change(input, { target: { files: [file] } })
    expect(input).toBeDisabled()
    expect(screen.getByText('Uploading…')).toBeInTheDocument()
  })

  it('does not upload in read-only mode and exposes field validation feedback', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { container } = render(<DirectUploadField {...props} readOnly />)
    const input = container.querySelector('input')!
    fireEvent.drop(input.closest('label')!, { dataTransfer: { files: [file] } })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(input).toBeDisabled()
    expect(screen.getByTestId('field-error')).toHaveTextContent('image')
  })
})
