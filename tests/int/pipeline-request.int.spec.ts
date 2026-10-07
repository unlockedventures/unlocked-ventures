import { describe, expect, it } from 'vitest'

import { requestTranscript } from '@/pipeline/request-transcript'

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('requestTranscript', () => {
  it('returns the transcript on success', async () => {
    const result = await requestTranscript({
      url: 'https://vimeo.com/123456789',
      endpoint: 'http://transcriber:8080',
      secret: 'secret',
      fetchImpl: async (input, init) => {
        expect(String(input)).toBe('http://transcriber:8080/transcribe')
        expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer secret')
        return jsonResponse(200, { transcript: 'Hello' })
      },
    })
    expect(result).toEqual({ ok: true, transcript: 'Hello' })
  })

  it('stops the run when the secret is rejected', async () => {
    const result = await requestTranscript({
      url: 'https://vimeo.com/123456789',
      endpoint: 'http://transcriber:8080',
      secret: 'wrong',
      fetchImpl: async () => jsonResponse(401, { error: 'Unauthorized' }),
    })
    expect(result).toEqual({ ok: false, error: 'The transcriber rejected the request.', stop: true })
  })

  it('marks a busy transcriber so the caller can restore the document', async () => {
    const result = await requestTranscript({
      url: 'https://vimeo.com/123456789',
      endpoint: 'http://transcriber:8080',
      secret: 'secret',
      fetchImpl: async () => jsonResponse(409, { error: 'busy' }),
    })
    expect(result).toEqual({
      ok: false,
      error: 'Another transcript is already being generated. Try again when it finishes.',
      stop: true,
      busy: true,
    })
  })

  it('continues the run when one video cannot be transcribed', async () => {
    const result = await requestTranscript({
      url: 'https://vimeo.com/123456789',
      endpoint: 'http://transcriber:8080',
      secret: 'secret',
      fetchImpl: async () => jsonResponse(422, { error: 'Video unavailable' }),
    })
    expect(result).toEqual({ ok: false, error: 'Video unavailable', stop: false })
  })

  it('stops the run when the transcriber reports out-of-memory', async () => {
    const result = await requestTranscript({
      url: 'https://vimeo.com/123456789',
      endpoint: 'http://transcriber:8080',
      secret: 'secret',
      fetchImpl: async () =>
        jsonResponse(422, {
          error: 'The transcriber ran out of memory loading Whisper (turbo). Set WHISPER_MODEL=small.',
          stop: true,
        }),
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.stop).toBe(true)
      expect(result.error).toMatch(/out of memory/i)
    }
  })

  it('stops the run when the transcriber cannot be reached', async () => {
    const result = await requestTranscript({
      url: 'https://vimeo.com/123456789',
      endpoint: 'http://transcriber:8080',
      secret: 'secret',
      fetchImpl: async () => {
        throw new Error('connect ECONNREFUSED')
      },
    })
    expect(result).toEqual({ ok: false, error: 'The transcriber is unavailable.', stop: true })
  })
})
