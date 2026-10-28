export const KOKORO_PCM_SAMPLE_RATE = 24_000
export const DEFAULT_KOKORO_MODEL = 'kokoro'
export const DEFAULT_KOKORO_SPEED = 1
export const DEFAULT_KOKORO_TIMEOUT_MS = 120_000

const MAX_AUDIO_BYTES = 100 * 1024 * 1024

export type KokoroVoice = {
  voiceId: string
  name: string
}

export class KokoroError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'KokoroError'
  }
}

function apiUrl(baseUrl: string, path: string) {
  const base = baseUrl.trim().replace(/\/+$/, '')
  if (!base) throw new KokoroError('KOKORO_BASE_URL is not configured.')
  return `${base}${path}`
}

function requestSignal(timeoutMs: number, signal?: AbortSignal) {
  const timeout = AbortSignal.timeout(Math.max(1_000, timeoutMs))
  return signal ? AbortSignal.any([timeout, signal]) : timeout
}

async function errorMessage(response: Response, fallback: string) {
  if (response.status === 404) return 'The selected Kokoro voice is not available.'
  if (response.status === 429) return 'Kokoro is busy. Try again in a moment.'
  return fallback
}

export async function listKokoroVoices(args: {
  baseUrl: string
  timeoutMs?: number
}): Promise<KokoroVoice[]> {
  let response: Response
  try {
    response = await fetch(apiUrl(args.baseUrl, '/v1/audio/voices'), {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: requestSignal(args.timeoutMs ?? 10_000),
    })
  } catch {
    throw new KokoroError('Could not reach the Kokoro voice service.')
  }
  if (!response.ok) {
    throw new KokoroError(
      await errorMessage(response, `Kokoro voices request failed (${response.status}).`),
      response.status,
    )
  }

  const body = (await response.json().catch(() => null)) as {
    voices?: ({ id?: unknown; name?: unknown } | string)[]
  } | null
  return (body?.voices ?? []).flatMap((voice) => {
    const voiceId =
      typeof voice === 'string' ? voice.trim() : typeof voice.id === 'string' ? voice.id.trim() : ''
    if (!voiceId) return []
    const name =
      typeof voice === 'object' && typeof voice.name === 'string' && voice.name.trim()
        ? voice.name.trim()
        : voiceId
    return [{ voiceId, name }]
  })
}

/** Synthesize one turn as raw signed 16-bit mono PCM at 24 kHz. */
export async function synthesizeKokoroSpeech(args: {
  baseUrl: string
  voiceId: string
  text: string
  modelId?: string
  speed?: number
  timeoutMs?: number
  signal?: AbortSignal
}): Promise<Buffer> {
  const voiceId = args.voiceId.trim()
  const input = args.text.trim()
  if (!voiceId) throw new KokoroError('Kokoro voice is required.')
  if (!input) throw new KokoroError('Cannot synthesize empty text.')

  let response: Response
  try {
    response = await fetch(apiUrl(args.baseUrl, '/v1/audio/speech'), {
      method: 'POST',
      headers: { Accept: 'application/octet-stream', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: args.modelId?.trim() || DEFAULT_KOKORO_MODEL,
        input,
        voice: voiceId,
        response_format: 'pcm',
        speed:
          typeof args.speed === 'number' && Number.isFinite(args.speed)
            ? args.speed
            : DEFAULT_KOKORO_SPEED,
      }),
      cache: 'no-store',
      signal: requestSignal(args.timeoutMs ?? DEFAULT_KOKORO_TIMEOUT_MS, args.signal),
    })
  } catch {
    if (args.signal?.aborted) throw new KokoroError('Audio generation stopped.')
    throw new KokoroError('Kokoro speech generation timed out or is unavailable.')
  }

  if (!response.ok) {
    throw new KokoroError(
      await errorMessage(response, `Kokoro speech generation failed (${response.status}).`),
      response.status,
    )
  }
  const contentType = response.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase()
  if (contentType && contentType !== 'audio/pcm' && contentType !== 'application/octet-stream') {
    throw new KokoroError('Kokoro returned an unexpected audio format.')
  }
  const declaredSize = Number(response.headers.get('content-length') || 0)
  if (declaredSize > MAX_AUDIO_BYTES) throw new KokoroError('Kokoro audio response is too large.')
  let buffer: Buffer
  try {
    buffer = Buffer.from(await response.arrayBuffer())
  } catch {
    if (args.signal?.aborted) throw new KokoroError('Audio generation stopped.')
    throw new KokoroError('Could not read the Kokoro audio response.')
  }
  if (!buffer.length || buffer.length > MAX_AUDIO_BYTES || buffer.length % 2 !== 0) {
    throw new KokoroError('Kokoro returned invalid PCM audio.')
  }
  return buffer
}
