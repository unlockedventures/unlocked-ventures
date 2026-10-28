import { afterEach, describe, expect, it, vi } from 'vitest'

import { listKokoroVoices, synthesizeKokoroSpeech } from '@/pipeline/kokoro'
import { isVoicePreviewRole, voicePreviewText } from '@/pipeline/kokoro-voice-preview'

describe('Kokoro provider', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses short server-owned samples for host and guest previews', () => {
    expect(isVoicePreviewRole('host')).toBe(true)
    expect(isVoicePreviewRole('guest')).toBe(true)
    expect(isVoicePreviewRole('other')).toBe(false)
    expect(voicePreviewText('host')).not.toBe(voicePreviewText('guest'))
    expect(voicePreviewText('host').length).toBeLessThan(160)
    expect(voicePreviewText('guest').length).toBeLessThan(160)
  })

  it('normalizes available voices', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ voices: [{ id: 'af_heart', name: 'Heart' }, 'am_adam'] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    await expect(listKokoroVoices({ baseUrl: 'http://kokoro:8880/' })).resolves.toEqual([
      { voiceId: 'af_heart', name: 'Heart' },
      { voiceId: 'am_adam', name: 'am_adam' },
    ])
  })

  it('requests raw PCM using the selected voice', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Uint8Array([1, 0, 2, 0]), {
        status: 200,
        headers: { 'Content-Type': 'application/octet-stream' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      synthesizeKokoroSpeech({
        baseUrl: 'http://kokoro:8880',
        voiceId: 'af_heart',
        text: 'Hello world',
      }),
    ).resolves.toEqual(Buffer.from([1, 0, 2, 0]))

    expect(fetchMock).toHaveBeenCalledWith(
      'http://kokoro:8880/v1/audio/speech',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          model: 'kokoro',
          input: 'Hello world',
          voice: 'af_heart',
          response_format: 'pcm',
          speed: 1,
        }),
      }),
    )
  })

  it('rejects malformed PCM', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(new Uint8Array([1]), { status: 200 })),
    )
    await expect(
      synthesizeKokoroSpeech({
        baseUrl: 'http://kokoro:8880',
        voiceId: 'af_heart',
        text: 'Hello',
      }),
    ).rejects.toThrow('invalid PCM')
  })

  it('cancels an active synthesis request', async () => {
    const controller = new AbortController()
    vi.stubGlobal(
      'fetch',
      vi.fn((_url, init?: RequestInit) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          )
        })
      }),
    )

    const request = synthesizeKokoroSpeech({
      baseUrl: 'http://kokoro:8880',
      voiceId: 'af_heart',
      text: 'A long turn',
      signal: controller.signal,
    })
    controller.abort()
    await expect(request).rejects.toThrow('Audio generation stopped.')
  })
})
