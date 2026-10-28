import { describe, expect, it, vi } from 'vitest'

import {
  flattenScriptTurns,
  generatePodcastAudioFromScript,
  pcmToWav,
  voiceIdForSpeaker,
} from '@/pipeline/generate-audio'
import {
  handleGenerateAudioRequest,
  saveGeneratedAudioToEpisode,
} from '@/pipeline/run-generate-audio'
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
    const onProgress = vi.fn()
    const synthesize = vi.fn(async ({ voiceId }: { voiceId: string }) => {
      // Distinct tiny PCM payloads so we can assert both voices ran.
      return Buffer.from(voiceId === 'host-voice' ? [1, 0, 2, 0] : [3, 0, 4, 0])
    })

    const result = await generatePodcastAudioFromScript({
      scriptJson: JSON.stringify(sampleScript),
      hostVoiceId: 'host-voice',
      guestVoiceId: 'guest-voice',
      baseUrl: 'http://kokoro.test',
      synthesize,
      onProgress,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(synthesize).toHaveBeenCalledTimes(2)
    expect(onProgress.mock.calls).toEqual([
      [1, 2],
      [2, 2],
    ])
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
    expect(result.durationSeconds).toBeCloseTo(0.400167, 5)
    expect(result.buffer.toString('ascii', 0, 4)).toBe('RIFF')
  })

  it('normalizes cancellation without replacing audio', async () => {
    const controller = new AbortController()
    controller.abort()
    const result = await generatePodcastAudioFromScript({
      scriptJson: JSON.stringify(sampleScript),
      hostVoiceId: 'host-voice',
      guestVoiceId: 'guest-voice',
      baseUrl: 'http://kokoro.test',
      signal: controller.signal,
    })
    expect(result).toEqual({ ok: false, error: 'Audio generation stopped.' })
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
      stageAudio: async () => ({ audioId: 1, mediaUrl: '/preview.wav' }),
    })
    expect(result).toEqual({
      status: 400,
      body: { error: "Add the system's overall opinion before generating podcast audio." },
    })
  })

  it('stages a preview without publishing it after a successful generate', async () => {
    const patches: unknown[] = []
    const discardAudio = vi.fn(async () => undefined)
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
        pendingAudio: 88,
      },
      save: async (data) => {
        patches.push(data)
      },
      generate: async ({ onProgress }) => {
        await onProgress(1, 2)
        await onProgress(2, 2)
        return {
          ok: true,
          buffer: Buffer.from('wav'),
          filename: 'episode.wav',
          mimeType: 'audio/wav',
          turnCount: 2,
          durationSeconds: 12.5,
        }
      },
      stageAudio: async ({ durationSeconds }) => {
        expect(durationSeconds).toBe(12.5)
        return { audioId: 99, mediaUrl: '/api/podcast-audio/file/episode.wav' }
      },
      discardAudio,
    })

    expect(result).toEqual({ status: 200, body: { status: 'ready' } })
    expect(patches[0]).toMatchObject({ audioStatus: 'processing' })
    expect(patches).toContainEqual({
      audioStatus: 'processing',
      audioStatusMessage: 'Generating audio: 1 of 2 turns (50%).',
    })
    expect(patches.at(-1)).toMatchObject({
      audioStatus: 'ready',
      audioStatusMessage: 'Generated 2 dialogue turns. Preview it, then save to publish.',
      pendingAudio: 99,
      pendingAudioUrl: '/api/podcast-audio/file/episode.wav',
    })
    expect(patches.every((patch) => !('audio' in (patch as object)))).toBe(true)
    expect(patches.every((patch) => !('mediaUrl' in (patch as object)))).toBe(true)
    expect(discardAudio).toHaveBeenCalledWith(88)
  })

  it('changes the public audio relationship only when the preview is saved', async () => {
    const update = vi.fn(async () => ({}))
    const result = await saveGeneratedAudioToEpisode({
      payload: {
        findByID: vi.fn(async () => ({
          id: 99,
          url: '/api/podcast-audio/file/episode.wav',
          durationSeconds: 65,
        })),
        update,
      } as never,
      req: {} as never,
      episodeId: 42,
      audioId: 99,
    })

    expect(result).toEqual({
      mediaUrl: '/api/podcast-audio/file/episode.wav',
      duration: '1:05',
    })
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'podcast-episodes',
        id: 42,
        data: expect.objectContaining({
          audio: 99,
          mediaUrl: '/api/podcast-audio/file/episode.wav',
          meta: '1:05',
          pendingAudio: null,
          pendingAudioUrl: null,
        }),
      }),
    )
  })
})
