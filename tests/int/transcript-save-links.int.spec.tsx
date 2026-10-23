import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ButtonHTMLAttributes } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  id: undefined as number | undefined,
  processing: false,
  create: true,
  update: true,
  fields: {} as Record<string, { value?: unknown; rows?: unknown[] }>,
  submit: vi.fn().mockResolvedValue(undefined),
  dispatch: vi.fn(),
}))

vi.mock('@payloadcms/ui', () => {
  const Action = ({
    children,
    disabled,
    onClick,
    type,
  }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
  return {
    Button: Action,
    FormSubmit: Action,
    useAuth: () => ({
      permissions: {
        collections: { 'podcast-episodes': { create: state.create, update: state.update } },
      },
    }),
    useDocumentInfo: () => ({ id: state.id }),
    useForm: () => ({ submit: state.submit }),
    useFormProcessing: () => state.processing,
    useAllFormFields: () => [state.fields, state.dispatch],
  }
})

import { GenerateTranscriptField } from '@/components/admin/generate-transcript-field'

describe('Saving video links before transcription', () => {
  beforeEach(() => {
    state.id = undefined
    state.processing = false
    state.create = true
    state.update = true
    state.fields = {
      videoLinks: { rows: [{}] },
      'videoLinks.0.url': { value: 'https://www.youtube.com/watch?v=test' },
    }
    state.submit.mockClear()
  })
  afterEach(cleanup)

  it('offers an inline save while transcription is unavailable on a new episode', () => {
    render(<GenerateTranscriptField />)
    expect(screen.getByRole('button', { name: 'Generate Transcript' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save video links' }))
    expect(state.submit).toHaveBeenCalledWith({ overrides: { episodeStatus: 'draft' } })
    expect(screen.getByRole('status')).toHaveTextContent('Enter a title, choose a channel and picture')
  })

  it('enables transcription after the episode has been saved', () => {
    state.id = 42
    render(<GenerateTranscriptField />)
    expect(screen.getByRole('button', { name: 'Generate Transcript' })).toBeEnabled()
  })

  it('preserves an existing episode status when saving updated links', () => {
    state.id = 42
    state.fields.episodeStatus = { value: 'complete' }
    render(<GenerateTranscriptField />)
    fireEvent.click(screen.getByRole('button', { name: 'Save video links' }))
    expect(state.submit).toHaveBeenCalledWith({})
  })

  it('prevents empty and duplicate in-flight saves', () => {
    state.fields = {}
    const view = render(<GenerateTranscriptField />)
    expect(screen.getByRole('button', { name: 'Save video links' })).toBeDisabled()
    state.fields = {
      videoLinks: { rows: [{}] },
      'videoLinks.0.url': { value: 'https://example.com/video' },
    }
    state.processing = true
    view.rerender(<GenerateTranscriptField />)
    expect(screen.getByRole('button', { name: 'Save video links' })).toBeDisabled()
  })

  it('allows create-only users to save a draft without exposing generation', () => {
    state.update = false
    render(<GenerateTranscriptField />)
    expect(screen.getByRole('button', { name: 'Save video links' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: 'Generate Transcript' })).not.toBeInTheDocument()
  })

  it('hides actions from users without write permissions', () => {
    state.create = false
    state.update = false
    render(<GenerateTranscriptField />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
