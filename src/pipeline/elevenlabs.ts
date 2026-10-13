export const DEFAULT_ELEVENLABS_MODEL = 'eleven_multilingual_v2'
export const DEFAULT_ELEVENLABS_OUTPUT_FORMAT = 'pcm_24000'
export const ELEVENLABS_PCM_SAMPLE_RATE = 24_000

export type ElevenLabsVoice = {
  voiceId: string
  name: string
}

export class ElevenLabsError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'ElevenLabsError'
  }
}

function apiBase() {
  return 'https://api.elevenlabs.io/v1'
}

export async function listElevenLabsVoices(apiKey: string): Promise<ElevenLabsVoice[]> {
  const key = apiKey.trim()
  if (!key) throw new ElevenLabsError('ELEVENLABS_API_KEY is not configured.')

  const response = await fetch(`${apiBase()}/voices`, {
    headers: { 'xi-api-key': key, Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new ElevenLabsError(
      detail.trim() || `ElevenLabs voices request failed (${response.status}).`,
      response.status,
    )
  }

  const body = (await response.json()) as {
    voices?: { voice_id?: string; name?: string }[]
  }
  return (body.voices ?? []).flatMap((voice) => {
    const voiceId = typeof voice.voice_id === 'string' ? voice.voice_id.trim() : ''
    const name = typeof voice.name === 'string' ? voice.name.trim() : ''
    if (!voiceId || !name) return []
    return [{ voiceId, name }]
  })
}

/** Synthesize one turn as raw 16-bit mono PCM at 24 kHz. */
export async function synthesizeSpeech(args: {
  apiKey: string
  voiceId: string
  text: string
  modelId?: string
}): Promise<Buffer> {
  const key = args.apiKey.trim()
  const voiceId = args.voiceId.trim()
  const text = args.text.trim()
  if (!key) throw new ElevenLabsError('ELEVENLABS_API_KEY is not configured.')
  if (!voiceId) throw new ElevenLabsError('ElevenLabs voice ID is required.')
  if (!text) throw new ElevenLabsError('Cannot synthesize empty text.')

  const modelId = (args.modelId ?? DEFAULT_ELEVENLABS_MODEL).trim() || DEFAULT_ELEVENLABS_MODEL
  const url = new URL(`${apiBase()}/text-to-speech/${encodeURIComponent(voiceId)}`)
  url.searchParams.set('output_format', DEFAULT_ELEVENLABS_OUTPUT_FORMAT)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': key,
      Accept: 'application/octet-stream',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.75,
      },
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    let message = `ElevenLabs TTS failed (${response.status}).`
    try {
      const body = (await response.json()) as { detail?: { message?: string } | string }
      if (typeof body.detail === 'string' && body.detail.trim()) message = body.detail.trim()
      else if (
        body.detail &&
        typeof body.detail === 'object' &&
        typeof body.detail.message === 'string' &&
        body.detail.message.trim()
      ) {
        message = body.detail.message.trim()
      }
    } catch {
      // keep default
    }
    if (response.status === 429) {
      message = 'ElevenLabs rate limit reached. Try again in a moment.'
    }
    throw new ElevenLabsError(message, response.status)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
