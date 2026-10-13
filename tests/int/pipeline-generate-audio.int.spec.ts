import { describe, expect, it, vi } from 'vitest'

import {
  flattenScriptTurns,
  generatePodcastAudioFromScript,
  pcmToWav,
  voiceIdForSpeaker,
} from '@/pipeline/generate-audio'
import { handleGenerateAudioRequest } from '@/pipeline/run-generate-audio'
import type { PodcastVideoScript } from '@/pipeline/script-schema'

const sampleScript: PodcastVideoScript = {
  format: 'podcast_video',
  title: 'Sample Show',
  speakers: {
    host: { role: 'host', gender: 'male' },
    guest: { role: 'guest', gender: 'female' },
  },
  estimatedWordCount: 20,
  estimatedDurationSeconds: 30,
  sections: [
    {
      id: 'intro',
      heading: 'Intro',
      visualCue: 'studio',
      onScreenText: 'Intro',
      durationHintSeconds: 10,
      turns: [
        { speaker: 'host', text: 'Welcome to the show.' },
        { speaker: 'guest', text: 'Thanks for having me.' },
      ],
    },
  ],
}

describe('generate-audio helpers', () => {
  it('flattens turns in order and routes voices', () => {
    const turns = flattenScriptTurns(sampleScript)
    expect(turns).toEqual([
      { speaker: 'host', text: 'Welcome to the show.' },
      { speaker: 'guest', text: 'Thanks for having me.' },
    ])
    expect(voiceIdForSpeaker('host', { hostVoiceId: 'host-1', guestVoiceId: 'guest-1' })).toBe(
      'host-1',
    )
    expect(voiceIdForSpeaker('guest', { hostVoiceId: 'host-1', guestVoiceId: 'guest-1' })).toBe(
      'guest-1',
    )
  })

  it('wraps PCM in a WAV header', () => {
    const pcm = Buffer.alloc(480) // 10ms at 24kHz mono 16-bit
    const wav = pcmToWav(pcm, 24_000)
    expect(wav.toString('ascii', 0, 4)).toBe('RIFF')
    expect(wav.toString('ascii', 8, 12)).toBe('WAVE')
    expect(wav.length).toBe(44 + pcm.length)
  })

  it('synthesizes turns with the injected TTS fn and stitches a WAV', async () => {
    const synthesize = vi.fn(async ({ voiceId }: { voiceId: string }) => {
      // Distinct tiny PCM payloads so we can assert both voices ran.
      return Buffer.from(voiceId === 'host-voice' ? [1, 0, 2, 0] : [3, 0, 4, 0])
    })

    const result = await generatePodcastAudioFromScript({
      scriptJson: JSON.stringify(sampleScript),
      hostVoiceId: 'host-voice',
      guestVoiceId: 'guest-voice',
      apiKey: 'test-key',
      synthesize,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(synthesize).toHaveBeenCalledTimes(2)
    expect(synthesize.mock.calls[0]?.[0]).toMatchObject({
      voiceId: 'host-voice',
      text: 'Welcome to the show.',
    })
    expect(synthesize.mock.calls[1]?.[0]).toMatchObject({
      voiceId: 'guest-voice',
      text: 'Thanks for having me.',
    })
    expect(result.mimeType).toBe('audio/wav')
    expect(result.turnCount).toBe(2)
    expect(result.buffer.toString('ascii', 0, 4)).toBe('RIFF')
  })
})

describe('handleGenerateAudioRequest', () => {
  it('rejects when system opinion is missing', async () => {
    const result = await handleGenerateAudioRequest({
      user: { id: 1 },
      doc: {
        id: 1,
        scriptJson: JSON.stringify(sampleScript),
        systemOpinion: '',
        hostVoiceId: 'host',
        guestVoiceId: 'guest',
      },
      save: async () => undefined,
      generate: async () => ({ ok: false, error: 'should not run' }),
      attachToEpisode: async () => null,
    })
    expect(result).toEqual({
      status: 400,
      body: { error: "Add the system's overall opinion before generating podcast audio." },
    })
  })

  it('saves ready status after a successful generate + attach', async () => {
    const patches: unknown[] = []
    const result = await handleGenerateAudioRequest({
      user: { id: 1 },
      doc: {
        id: 7,
        name: 'Episode Seven',
        scriptJson: JSON.stringify(sampleScript),
        systemOpinion: 'A solid overview.',
        hostVoiceId: 'host',
        guestVoiceId: 'guest',
        episode: 42,
      },
      save: async (data) => {
        patches.push(data)
      },
      generate: async () => ({
        ok: true,
        buffer: Buffer.from('wav'),
        filename: 'episode.wav',
        mimeType: 'audio/wav',
        turnCount: 2,
      }),
      attachToEpisode: async ({ episodeId }) => {
        expect(episodeId).toBe(42)
        return 99
      },
    })

    expect(result).toEqual({ status: 200, body: { status: 'ready' } })
    expect(patches[0]).toMatchObject({ audioStatus: 'processing' })
    expect(patches.at(-1)).toMatchObject({
      audioStatus: 'ready',
      audioStatusMessage: 'Generated 2 dialogue turns.',
    })
  })
})
