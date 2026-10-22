import { describe, expect, it, vi } from 'vitest'

import {
  handleTranscribeRequest,
  type PipelineDoc,
  type PipelinePatch,
  type TranscribeResult,
} from '@/pipeline/run-transcription'
import type { VideoResource } from '@/pipeline/video-resources'

function completedResource(url: string): VideoResource {
  return {
    url,
    transcriptionStatus: 'completed',
    transcribedUrl: url,
    videoTranscript: 'Stored per-video result.',
    transcriptionError: '',
  }
}

const doc: PipelineDoc = {
  id: 7,
  videoLinks: [
    { url: 'https://www.youtube.com/watch?v=abcdefghijk' },
    { url: 'https://vimeo.com/123456789' },
  ],
  transcript: 'old transcript',
  status: 'ready',
  statusMessage: '',
}

function harness(
  transcribe: (url: string) => Promise<TranscribeResult>,
  overrides: Partial<Parameters<typeof handleTranscribeRequest>[0]> = {},
) {
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
  it('persists each resource result before moving to the next video', async () => {
    const { promise, saves } = harness(async () => ({ ok: true, transcript: 'Per-video result.' }))
    await promise
    expect(saves[0].videoLinks?.map((row) => row.transcriptionStatus)).toEqual([
      'processing',
      'pending',
    ])
    expect(saves[1].videoLinks?.[0]).toMatchObject({
      transcriptionStatus: 'completed',
      videoTranscript: 'Per-video result.',
      transcribedUrl: doc.videoLinks![0].url,
    })
    expect(saves.at(-1)?.videoLinks?.map((row) => row.transcriptionStatus)).toEqual([
      'completed',
      'completed',
    ])
  })

  it('does not use editable combined text as proof of completion', async () => {
    const url = doc.videoLinks![0].url!
    const transcribe = vi.fn(async () => ({
      ok: true as const,
      transcript: 'Authoritative result.',
    }))
    const { promise, saves } = harness(transcribe, {
      doc: {
        ...doc,
        videoLinks: [{ url, transcriptionStatus: 'pending' }],
        transcript: `## ${url}\n\nText that looks completed.`,
      },
    })
    await promise
    expect(transcribe).toHaveBeenCalledExactlyOnceWith(url)
    expect(saves.at(-1)?.videoLinks?.[0].transcriptionStatus).toBe('completed')
  })

  it('marks an empty result as failed so it can be retried', async () => {
    const { promise, saves } = harness(async () => ({ ok: true, transcript: '' }))
    await promise
    expect(saves.at(-1)?.videoLinks?.every((row) => row.transcriptionStatus === 'failed')).toBe(
      true,
    )
  })
  it('returns 401 when no editor is logged in and does not save', async () => {
    const { promise, saves } = harness(async () => ({ ok: true, transcript: 'nope' }), {
      user: null,
    })
    await expect(promise).resolves.toEqual({ status: 401, body: { error: 'Unauthorized' } })
    expect(saves).toEqual([])
  })

  it('returns 404 when the document is missing', async () => {
    const { promise, saves } = harness(async () => ({ ok: true, transcript: 'nope' }), {
      doc: null,
    })
    await expect(promise).resolves.toEqual({
      status: 404,
      body: { error: 'Pipeline document not found.' },
    })
    expect(saves).toEqual([])
  })

  it('returns 409 when this document is already processing', async () => {
    const { promise, saves } = harness(async () => ({ ok: true, transcript: 'nope' }), {
      doc: { ...doc, status: 'processing' },
    })
    await expect(promise).resolves.toEqual({
      status: 409,
      body: { error: 'This transcript is already being generated.' },
    })
    expect(saves).toEqual([])
  })

  it('returns 409 when a podcast script is generating', async () => {
    const { promise, saves } = harness(async () => ({ ok: true, transcript: 'nope' }), {
      doc: { ...doc, scriptStatus: 'processing' },
    })
    await expect(promise).resolves.toEqual({
      status: 409,
      body: { error: 'Wait for the podcast script to finish before generating a transcript.' },
    })
    expect(saves).toEqual([])
  })

  it('persists video links from the request body on the first save', async () => {
    const { promise, saves } = harness(async () => ({ ok: true, transcript: 'ok' }), {
      doc: { ...doc, videoLinks: [{ url: 'https://www.youtube.com/watch?v=oldvvvvvvvv' }] },
      videoLinks: [{ url: 'https://www.youtube.com/watch?v=newvvvvvvvv' }],
    })
    await expect(promise).resolves.toEqual({ status: 200, body: { status: 'ready' } })
    expect(saves[0]).toMatchObject({
      status: 'processing',
      videoLinks: [{ url: 'https://www.youtube.com/watch?v=newvvvvvvvv' }],
    })
  })

  it('returns 409 when another document is processing and leaves this document unchanged', async () => {
    const { promise, saves } = harness(async () => ({ ok: true, transcript: 'nope' }), {
      otherProcessing: true,
    })
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
    await expect(promise).resolves.toEqual({
      status: 400,
      body: { error: 'Video link 1 is empty.' },
    })
    expect(saves).toEqual([])
  })

  it('appends each transcript and finishes ready', async () => {
    const { promise, saves } = harness(async (url) => ({ ok: true, transcript: `text for ${url}` }))
    await expect(promise).resolves.toEqual({ status: 200, body: { status: 'ready' } })
    expect(saves.at(-1)).toMatchObject({
      status: 'ready',
      statusMessage: '',
      transcript: [
        'old transcript',
        '',
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
      if (url.includes('vimeo'))
        return { ok: false, error: 'The transcriber is unavailable.', stop: true }
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

  it('restores the previous transcript when the transcriber stays busy before any block is written', async () => {
    const { promise, saves } = harness(
      async () => ({
        ok: false,
        error: 'Another transcript is already being generated. Try again when it finishes.',
        stop: true,
        busy: true,
      }),
      { wait: async () => undefined },
    )
    await expect(promise).resolves.toEqual({
      status: 409,
      body: { error: 'Another transcript is already being generated. Try again when it finishes.' },
    })
    expect(saves.at(-1)).toMatchObject({
      transcript: 'old transcript',
      status: 'idle',
      statusMessage: 'Another transcript is already being generated. Try again when it finishes.',
    })
  })

  it('retries when the transcriber is briefly busy and then succeeds', async () => {
    let calls = 0
    const { promise, saves } = harness(
      async () => {
        calls += 1
        if (calls === 1) {
          return {
            ok: false,
            error: 'Another transcript is already being generated. Try again when it finishes.',
            stop: true,
            busy: true,
          }
        }
        return { ok: true, transcript: `text for call ${calls}` }
      },
      { wait: async () => undefined },
    )
    await expect(promise).resolves.toEqual({ status: 200, body: { status: 'ready' } })
    expect(calls).toBe(3)
    expect(
      saves.some((save) => save.statusMessage === 'Waiting for another transcript to finish.'),
    ).toBe(true)
    expect(saves.at(-1)?.status).toBe('ready')
  })

  it('transcribes only a newly added video and preserves the earlier edited transcript', async () => {
    const first = doc.videoLinks![0].url!
    const second = doc.videoLinks![1].url!
    const existing = `## ${first}\n\nPreviously generated and edited text.`
    const transcribe = vi.fn(async () => ({ ok: true as const, transcript: 'New video text.' }))
    const { promise, saves } = harness(transcribe, {
      doc: {
        ...doc,
        transcript: existing,
        videoLinks: [completedResource(first), { url: second }],
      },
    })
    await expect(promise).resolves.toMatchObject({ body: { status: 'ready' } })
    expect(transcribe).toHaveBeenCalledExactlyOnceWith(second)
    expect(saves[0]).toMatchObject({
      transcript: existing,
      statusMessage: 'Generating transcript for video 1 of 1.',
    })
    expect(saves.at(-1)?.transcript).toBe(`${existing}\n\n## ${second}\n\nNew video text.`)
  })

  it('does not call the transcriber when every link already has a transcript', async () => {
    const existing = doc.videoLinks!.map(({ url }) => `## ${url}\n\nCompleted text.`).join('\n\n')
    const transcribe = vi.fn(async () => ({
      ok: true as const,
      transcript: 'Unexpected regeneration',
    }))
    const resources = doc.videoLinks!.map(({ url }) => completedResource(url!))
    const { promise, saves } = harness(transcribe, {
      doc: { ...doc, transcript: existing, videoLinks: resources },
    })
    await expect(promise).resolves.toMatchObject({ body: { status: 'ready' } })
    expect(transcribe).not.toHaveBeenCalled()
    expect(saves).toEqual([
      {
        transcript: existing,
        videoLinks: resources,
        status: 'ready',
        statusMessage: 'All video links already have transcripts.',
      },
    ])
  })

  it('retries a failed video without regenerating successes or duplicating its old failure', async () => {
    const first = doc.videoLinks![0].url!
    const second = doc.videoLinks![1].url!
    const existing = `## ${first}\n\nKeep this text.\n\n## ${second}\n\nCould not transcribe this video: Temporary failure`
    const transcribe = vi.fn(async () => ({
      ok: true as const,
      transcript: 'Recovered transcript.',
    }))
    const { promise, saves } = harness(transcribe, {
      doc: {
        ...doc,
        transcript: existing,
        status: 'error',
        videoLinks: [
          completedResource(first),
          { url: second, transcriptionStatus: 'failed', transcriptionError: 'Temporary failure' },
        ],
      },
    })
    await promise
    expect(transcribe).toHaveBeenCalledExactlyOnceWith(second)
    expect(saves.at(-1)?.transcript).toBe(
      `## ${first}\n\nKeep this text.\n\n## ${second}\n\nRecovered transcript.`,
    )
  })

  it('processes repeated links only once', async () => {
    const first = doc.videoLinks![0].url!
    const transcribe = vi.fn(async () => ({ ok: true as const, transcript: 'One transcript.' }))
    const { promise, saves } = harness(transcribe, { videoLinks: [{ url: first }, { url: first }] })
    await promise
    expect(transcribe).toHaveBeenCalledExactlyOnceWith(first)
    expect(saves[0].videoLinks).toMatchObject([{ url: first, transcriptionStatus: 'processing' }])
  })

  it('keeps earlier successes when transcription of a new video stops', async () => {
    const first = doc.videoLinks![0].url!
    const existing = `## ${first}\n\nAlready generated.`
    const transcribe = vi.fn(async () => ({ ok: false as const, error: 'Unavailable', stop: true }))
    const { promise, saves } = harness(transcribe, {
      doc: {
        ...doc,
        transcript: existing,
        videoLinks: [completedResource(first), doc.videoLinks![1]],
      },
    })
    await expect(promise).resolves.toMatchObject({ body: { status: 'error' } })
    expect(transcribe).toHaveBeenCalledTimes(1)
    expect(saves.at(-1)?.transcript).toBe(existing)
  })
})
