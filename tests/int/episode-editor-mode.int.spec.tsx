import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  operation: 'create',
  initializing: false,
  query: 'mode=ai',
  fields: { editorMode: { value: 'manual' } } as Record<string, { value: string }>,
  dispatch: vi.fn(),
  setModified: vi.fn(),
}))

vi.mock('@payloadcms/ui', () => ({
  useOperation: () => state.operation,
  useFormInitializing: () => state.initializing,
  useAllFormFields: () => [state.fields, state.dispatch],
  useForm: () => ({ setModified: state.setModified }),
}))
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(state.query) }))

import {
  EpisodeEditorModeBootstrap,
  readEpisodeCreateMode,
  rememberEpisodeCreateMode,
} from '@/components/admin/episode-editor-mode'

describe('Episode creation mode', () => {
  beforeEach(() => {
    state.operation = 'create'
    state.initializing = false
    state.query = 'mode=ai'
    state.fields = { editorMode: { value: 'manual' } }
    state.dispatch.mockClear()
    state.setModified.mockClear()
    window.history.replaceState({}, '', '/admin/collections/podcast-episodes/create')
    window.sessionStorage.clear()
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('initializes the AI form after Payload finishes loading its defaults', () => {
    state.initializing = true
    const view = render(<EpisodeEditorModeBootstrap />)
    expect(state.dispatch).not.toHaveBeenCalled()
    state.initializing = false
    view.rerender(<EpisodeEditorModeBootstrap />)
    expect(state.dispatch).toHaveBeenCalledWith({ type: 'UPDATE', path: 'editorMode', value: 'ai' })
    expect(state.setModified).toHaveBeenCalledWith(true)
  })

  it('uses the Manual link even when the previous creation used AI', () => {
    rememberEpisodeCreateMode('ai')
    state.query = 'mode=manual'
    state.fields.editorMode.value = 'ai'
    render(<EpisodeEditorModeBootstrap />)
    expect(state.dispatch).toHaveBeenCalledWith({
      type: 'UPDATE',
      path: 'editorMode',
      value: 'manual',
    })
  })

  it('responds when client navigation changes the create mode without remounting', () => {
    state.query = 'mode=manual'
    const view = render(<EpisodeEditorModeBootstrap />)
    expect(state.dispatch).not.toHaveBeenCalled()
    state.query = 'mode=ai'
    view.rerender(<EpisodeEditorModeBootstrap />)
    expect(state.dispatch).toHaveBeenCalledWith({ type: 'UPDATE', path: 'editorMode', value: 'ai' })
  })

  it('waits until editorMode exists in the form', () => {
    state.fields = {}
    const view = render(<EpisodeEditorModeBootstrap />)
    expect(state.dispatch).not.toHaveBeenCalled()
    state.fields = { editorMode: { value: 'manual' } }
    view.rerender(<EpisodeEditorModeBootstrap />)
    expect(state.dispatch).toHaveBeenCalledOnce()
  })

  it('preserves the saved mode when editing an existing episode', () => {
    state.operation = 'update'
    render(<EpisodeEditorModeBootstrap />)
    expect(state.dispatch).not.toHaveBeenCalled()
  })

  it('gives an explicit URL precedence over the remembered mode', () => {
    rememberEpisodeCreateMode('manual')
    window.history.replaceState({}, '', '?mode=ai')
    expect(readEpisodeCreateMode()).toBe('ai')
  })

  it('falls back to Manual safely if browser storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Blocked')
    })
    expect(() => rememberEpisodeCreateMode('ai')).not.toThrow()
    expect(readEpisodeCreateMode()).toBe('manual')
  })
})
