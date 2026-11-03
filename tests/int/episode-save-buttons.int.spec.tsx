import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ButtonHTMLAttributes } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  fields: {} as Record<string, { value: unknown }>,
  uploadStatus: '',
  update: true,
  submit: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@payloadcms/ui', () => ({
  FormSubmit: ({ children, disabled, onClick, type }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
  useAuth: () => ({
    permissions: { collections: { 'podcast-episodes': { update: state.update } } },
  }),
  useAllFormFields: () => [state.fields],
  useDocumentInfo: () => ({ uploadStatus: state.uploadStatus }),
  useEditDepth: () => 1,
  useForm: () => ({ submit: state.submit }),
  useHotkey: vi.fn(),
  useOperation: () => 'update',
}))

import { EpisodeSaveButtons } from '@/components/admin/episode-save-buttons'

describe('Episode save actions after AI generation', () => {
  beforeEach(() => {
    state.fields = { status: { value: 'ready' }, episodeStatus: { value: 'draft' } }
    state.uploadStatus = ''
    state.update = true
    state.submit.mockClear()
  })
  afterEach(cleanup)

  it('allows saving generated content without another manual edit', () => {
    render(<EpisodeSaveButtons />)
    expect(screen.getByRole('button', { name: 'Save as Draft' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Save as Complete' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save as Draft' }))
    expect(state.submit).toHaveBeenCalledWith({ overrides: { episodeStatus: 'draft' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save as Complete' }))
    expect(state.submit).toHaveBeenCalledWith({ overrides: { episodeStatus: 'complete' } })
  })

  it.each(['status', 'scriptStatus', 'audioStatus'])(
    'waits for %s processing and re-enables on completion',
    (field) => {
      state.fields[field] = { value: 'processing' }
      const view = render(<EpisodeSaveButtons />)
      expect(screen.getByRole('button', { name: 'Save as Draft' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Save as Complete' })).toBeDisabled()
      expect(screen.getByRole('status')).toHaveTextContent('Generation is in progress')
      state.fields[field] = { value: 'ready' }
      view.rerender(<EpisodeSaveButtons />)
      expect(screen.getByRole('button', { name: 'Save as Draft' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Save as Complete' })).toBeEnabled()
    },
  )

  it('requires explicitly saving a generated preview before completion', () => {
    state.fields.pendingAudio = { value: 99 }
    const view = render(<EpisodeSaveButtons />)
    expect(screen.getByRole('button', { name: 'Save as Complete' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Save Generated Audio')
    fireEvent.click(screen.getByRole('button', { name: 'Save as Complete' }))
    expect(state.submit).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Save as Draft' }))
    expect(state.submit).toHaveBeenCalledWith({ overrides: { episodeStatus: 'draft' } })
    state.fields.pendingAudio = { value: null }
    view.rerender(<EpisodeSaveButtons />)
    expect(screen.getByRole('button', { name: 'Save as Complete' })).toBeEnabled()
  })

  it('requires saved audio for AI episodes even without a pending preview', () => {
    state.fields.editorMode = { value: 'ai' }
    state.fields.audioSource = { value: 'url' }
    const view = render(<EpisodeSaveButtons />)
    expect(screen.getByRole('button', { name: 'Save as Complete' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Save as Draft' })).toBeEnabled()
    state.fields.audioSource = { value: 'upload' }
    state.fields.audio = { value: 42 }
    view.rerender(<EpisodeSaveButtons />)
    expect(screen.getByRole('button', { name: 'Save as Complete' })).toBeEnabled()
  })

  it('waits while a file is uploading', () => {
    state.uploadStatus = 'uploading'
    render(<EpisodeSaveButtons />)
    expect(screen.getByRole('button', { name: 'Save as Draft' })).toBeDisabled()
  })

  it('keeps save actions hidden without update permission', () => {
    state.update = false
    render(<EpisodeSaveButtons />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
