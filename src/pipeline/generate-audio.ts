import { KOKORO_PCM_SAMPLE_RATE, synthesizeKokoroSpeech } from '@/pipeline/kokoro'
import {
  parsePodcastVideoScript,
  type PodcastVideoScript,
  type SpeakerRole,
} from '@/pipeline/script-schema'

export type ScriptTurn = {
  speaker: SpeakerRole
  text: string
}

const PAUSE_MS = 400

export function parseStoredScriptJson(raw: string | null | undefined): PodcastVideoScript | null {
  if (typeof raw !== 'string' || !raw.trim()) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    const candidate =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'script' in parsed
        ? (parsed as { script: unknown }).script
        : parsed
    return parsePodcastVideoScript(candidate)
  } catch {
    return null
  }
}

/** Flatten section turns in order for TTS. */
export function flattenScriptTurns(script: PodcastVideoScript): ScriptTurn[] {
  return script.sections.flatMap((section) =>
    (section.turns ?? []).flatMap((turn) => {
      const text = typeof turn.text === 'string' ? turn.text.trim() : ''
      if (!text) return []
      return [{ speaker: turn.speaker, text }]
    }),
  )
}

export function voiceIdForSpeaker(
  speaker: SpeakerRole,
  voices: { hostVoiceId: string; guestVoiceId: string },
): string {
  return speaker === 'host' ? voices.hostVoiceId : voices.guestVoiceId
}

function pcmSilence(durationMs: number, sampleRate = KOKORO_PCM_SAMPLE_RATE): Buffer {
  const samples = Math.max(0, Math.round((sampleRate * durationMs) / 1000))
  return Buffer.alloc(samples * 2) // 16-bit mono
}

/** Wrap little-endian 16-bit mono PCM in a WAV container. */
export function pcmToWav(pcm: Buffer, sampleRate = KOKORO_PCM_SAMPLE_RATE): Buffer {
  const header = Buffer.alloc(44)
  const dataSize = pcm.length
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + dataSize, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16) // PCM chunk size
  header.writeUInt16LE(1, 20) // audio format PCM
  header.writeUInt16LE(1, 22) // mono
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * 2, 28) // byte rate
  header.writeUInt16LE(2, 32) // block align
  header.writeUInt16LE(16, 34) // bits per sample
  header.write('data', 36)
  header.writeUInt32LE(dataSize, 40)
  return Buffer.concat([header, pcm])
}

export type GeneratePodcastAudioResult =
  | {
      ok: true
      buffer: Buffer
      filename: string
      mimeType: string
      turnCount: number
      durationSeconds: number
    }
  | { ok: false; error: string }

export async function generatePodcastAudioFromScript(args: {
  scriptJson: string
  hostVoiceId: string
  guestVoiceId: string
  baseUrl: string
  modelId?: string
  speed?: number
  timeoutMs?: number
  title?: string
  synthesize?: typeof synthesizeKokoroSpeech
  onProgress?: (completedTurns: number, totalTurns: number) => void | Promise<void>
  signal?: AbortSignal
}): Promise<GeneratePodcastAudioResult> {
  const script = parseStoredScriptJson(args.scriptJson)
  if (!script) {
    return { ok: false, error: 'script.json is missing or invalid.' }
  }

  const turns = flattenScriptTurns(script)
  if (turns.length === 0) {
    return { ok: false, error: 'script.json has no dialogue turns to speak.' }
  }

  const hostVoiceId = args.hostVoiceId.trim()
  const guestVoiceId = args.guestVoiceId.trim()
  if (!hostVoiceId || !guestVoiceId) {
    return { ok: false, error: 'Host and guest Kokoro voices are required.' }
  }

  const synthesize = args.synthesize ?? synthesizeKokoroSpeech
  const parts: Buffer[] = []

  try {
    for (let index = 0; index < turns.length; index += 1) {
      if (args.signal?.aborted) throw new Error('Audio generation stopped.')
      const turn = turns[index]
      const voiceId = voiceIdForSpeaker(turn.speaker, { hostVoiceId, guestVoiceId })
      const pcm = await synthesize({
        baseUrl: args.baseUrl,
        voiceId,
        text: turn.text,
        modelId: args.modelId,
        speed: args.speed,
        timeoutMs: args.timeoutMs,
        signal: args.signal,
      })
      parts.push(pcm)
      if (index < turns.length - 1) parts.push(pcmSilence(PAUSE_MS))
      await args.onProgress?.(index + 1, turns.length)
    }
  } catch (error) {
    const message = args.signal?.aborted
      ? 'Audio generation stopped.'
      : error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof error.message === 'string'
        ? error.message
        : 'Kokoro speech generation failed.'
    return { ok: false, error: message }
  }

  const pcm = Buffer.concat(parts)
  const wav = pcmToWav(pcm)
  const slugBase = (args.title || script.title || 'podcast')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
  const filename = `${slugBase || 'podcast'}-host-guest.wav`

  return {
    ok: true,
    buffer: wav,
    filename,
    mimeType: 'audio/wav',
    turnCount: turns.length,
    durationSeconds: pcm.length / (KOKORO_PCM_SAMPLE_RATE * 2),
  }
}
