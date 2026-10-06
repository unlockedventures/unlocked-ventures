import { describe, expect, it } from 'vitest'

import { handleTranscribeRequest, type PipelineDoc, type PipelinePatch, type TranscribeResult } from '@/pipeline/run-transcription'

const doc: PipelineDoc = {
  id: 7,
  videoLinks: [{ url: 'https://www.youtube.com/watch?v=abcdefghijk' }, { url: 'https://vimeo.com/123456789' }],
  transcript: 'old transcript',
  status: 'ready',
  statusMessage: '',
}

function harness(transcribe: (url: string) => Promise<TranscribeResult>, overrides: Partial<Parameters<typeof handleTranscribeRequest>[0]> = {}) {
  const saves: PipelinePatch[] = []
  const promise = handleTranscribeRequest({
    user: { id: 1 },
    doc,
    otherProcessing: false,
    save: async (data) => {
      saves.push(data)
    },
    transcribe,
    ...overrides,
  })
  return { promise, saves }
}

describe('handleTranscribeRequest', () => {
  it('returns 401 when no editor is logged in and does not save', async () => {
    const { promise, saves } = harness(async () => ({ ok: true, transcript: 'nope' }), { user: null })
    await expect(promise).resolves.toEqual({ status: 401, body: { error: 'Unauthorized' } })
    expect(saves).toEqual([])
  })

  it('returns 404 when the document is missing', async () => {
    const { promise, saves } = harness(async () => ({ ok: true, transcript: 'nope' }), { doc: null })
    await expect(promise).resolves.toEqual({ status: 404, body: { error: 'Pipeline document not found.' } })
    expect(saves).toEqual([])
  })

  it('returns 409 when this document is already processing', async () => {
    const { promise, saves } = harness(async () => ({ ok: true, transcript: 'nope' }), {
      doc: { ...doc, status: 'processing' },
    })
    await expect(promise).resolves.toEqual({ status: 409, body: { error: 'This transcript is already being generated.' } })
    expect(saves).toEqual([])
  })

  it('returns 409 when another document is processing and leaves this document unchanged', async () => {
    const { promise, saves } = harness(async () => ({ ok: true, transcript: 'nope' }), { otherProcessing: true })
    await expect(promise).resolves.toEqual({
      status: 409,
      body: { error: 'Another transcript is already being generated. Try again when it finishes.' },
    })
    expect(saves).toEqual([])
  })

  it('returns 400 and names the bad row', async () => {
    const { promise, saves } = harness(async () => ({ ok: true, transcript: 'nope' }), {
      doc: { ...doc, videoLinks: [{ url: '' }] },
    })
    await expect(promise).resolves.toEqual({ status: 400, body: { error: 'Video link 1 is empty.' } })
    expect(saves).toEqual([])
  })

  it('appends each transcript and finishes ready', async () => {
    const { promise, saves } = harness(async (url) => ({ ok: true, transcript: `text for ${url}` }))
    await expect(promise).resolves.toEqual({ status: 200, body: { status: 'ready' } })
    expect(saves.at(-1)).toEqual({
      status: 'ready',
      statusMessage: '',
      transcript: [
        '## https://www.youtube.com/watch?v=abcdefghijk',
        '',
        'text for https://www.youtube.com/watch?v=abcdefghijk',
        '',
        '## https://vimeo.com/123456789',
        '',
        'text for https://vimeo.com/123456789',
      ].join('\n'),
    })
  })

  it('keeps the first transcript when the second video fails', async () => {
    const { promise, saves } = harness(async (url) => {
      if (url.includes('vimeo')) return { ok: false, error: 'Video unavailable', stop: false }
      return { ok: true, transcript: 'First video' }
    })
    await expect(promise).resolves.toEqual({ status: 200, body: { status: 'error' } })
    expect(saves.at(-1)?.status).toBe('error')
    expect(saves.at(-1)?.statusMessage).toBe('Some videos could not be transcribed.')
    expect(saves.at(-1)?.transcript).toContain('First video')
    expect(saves.at(-1)?.transcript).toContain('Could not transcribe this video: Video unavailable')
  })

  it('stops the loop when the transcriber is unavailable and keeps finished blocks', async () => {
    const { promise, saves } = harness(async (url) => {
      if (url.includes('vimeo')) return { ok: false, error: 'The transcriber is unavailable.', stop: true }
      return { ok: true, transcript: 'First video' }
    })
    await expect(promise).resolves.toEqual({ status: 200, body: { status: 'error' } })
    expect(saves.at(-1)).toMatchObject({
      status: 'error',
      statusMessage: 'The transcriber is unavailable.',
    })
    expect(saves.at(-1)?.transcript).toContain('First video')
    expect(saves.at(-1)?.transcript).not.toContain('vimeo.com')
  })

  it('restores the previous transcript when the transcriber is busy before any block is written', async () => {
    const { promise, saves } = harness(async () => ({
      ok: false,
      error: 'Another transcript is already being generated. Try again when it finishes.',
      stop: true,
      busy: true,
    }))
    await expect(promise).resolves.toEqual({
      status: 409,
      body: { error: 'Another transcript is already being generated. Try again when it finishes.' },
    })
    expect(saves.at(-1)).toEqual({
      transcript: 'old transcript',
      status: 'ready',
      statusMessage: '',
    })
  })
})
