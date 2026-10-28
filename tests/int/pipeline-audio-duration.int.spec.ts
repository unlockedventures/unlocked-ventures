import { describe, expect, it } from 'vitest'

import { formatAudioDuration, readAudioDuration } from '@/pipeline/audio-duration'
import { pcmToWav } from '@/pipeline/generate-audio'

describe('podcast audio duration', () => {
  it('formats minute and hour durations', () => {
    expect(formatAudioDuration(14 * 60 + 22)).toBe('14:22')
    expect(formatAudioDuration(60 * 60 + 2 * 60 + 3)).toBe('1:02:03')
    expect(formatAudioDuration(null)).toBe('—')
  })

  it('reads duration from an uploaded WAV buffer', async () => {
    const wav = pcmToWav(Buffer.alloc(24_000 * 2 * 2))
    await expect(
      readAudioDuration({ buffer: wav, mimeType: 'audio/wav', size: wav.length }),
    ).resolves.toBeCloseTo(2, 3)
  })
})
