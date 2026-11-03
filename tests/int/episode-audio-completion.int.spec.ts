import { describe, expect, it, vi } from 'vitest'

vi.mock('@/pipeline/episode-ai-endpoints', () => ({ episodeAiEndpoints: [] }))
vi.mock('@/pipeline/source-summary', () => ({ sourceRevision: async () => 'revision' }))

import { podcastAudioSrc } from '@/lib/podcast-cover'
import { PodcastEpisodes } from '@/collections/PodcastEpisodes'
import { applyAiContentToEpisode } from '@/pipeline/apply-ai-content'

const hook = PodcastEpisodes.hooks!.beforeChange![0]

async function save(data: Record<string, unknown>, original: Record<string, unknown>) {
  const findByID = vi.fn().mockResolvedValue({ url: '/saved.wav', durationSeconds: 65 })
  return hook({
    data,
    originalDoc: original,
    operation: 'update',
    req: { context: {}, payload: { findByID } },
    context: {},
  } as unknown as Parameters<typeof hook>[0])
}

const episode = {
  editorMode: 'ai',
  episodeStatus: 'draft',
  audioSource: 'url',
  videoLinks: [{ url: 'https://vimeo.com/123456789' }],
}

describe('Episode audio publication boundary', () => {
  it.each(['https://youtu.be/dQw4w9WgXcQ', 'https://vimeo.com/123456789'])(
    'never maps transcription source %s to public playback',
    (url) => {
      const patch = applyAiContentToEpisode({ videoLinks: [{ url }] })
      expect(patch).not.toHaveProperty('mediaUrl')
      expect(patch).not.toHaveProperty('audioSource')
    },
  )

  it('does not play a legacy AI source video or an unsaved preview publicly', () => {
    expect(podcastAudioSrc({ ...episode, mediaUrl: episode.videoLinks[0].url })).toBe('')
    expect(
      podcastAudioSrc({
        ...episode,
        audioSource: 'upload',
        audio: { url: '/published.wav' },
      }),
    ).toBe('/published.wav')
    expect(
      podcastAudioSrc({
        editorMode: 'manual',
        audioSource: 'url',
        mediaUrl: episode.videoLinks[0].url,
      }),
    ).toBe(episode.videoLinks[0].url)
  })

  it('rejects completing an AI episode without saved audio', async () => {
    await expect(save({ episodeStatus: 'complete' }, episode)).rejects.toThrow(
      'Save generated episode audio',
    )
  })

  it('uses persisted preview state even if a request tries to clear it', async () => {
    await expect(
      save(
        { episodeStatus: 'complete', pendingAudio: null },
        { ...episode, audioSource: 'upload', audio: 42, pendingAudio: 99 },
      ),
    ).rejects.toThrow('Save generated episode audio')
  })

  it('allows draft saves while a preview is pending without publishing source video', async () => {
    const result = await save({ episodeStatus: 'draft' }, { ...episode, pendingAudio: 99 })
    expect(result.pendingAudio).toBe(99)
    expect(result.mediaUrl).toBeUndefined()
  })

  it('allows completion after audio is saved and retains an edited duration', async () => {
    const result = await save(
      { episodeStatus: 'complete', meta: '2:00' },
      { ...episode, audioSource: 'upload', audio: 42, meta: '1:05' },
    )
    expect(result.episodeStatus).toBe('complete')
    expect(result.meta).toBe('2:00')
    expect(result.mediaUrl).toBe('/saved.wav')
  })

  it('preserves manual URL episode completion', async () => {
    const result = await save(
      { episodeStatus: 'complete' },
      { ...episode, editorMode: 'manual', mediaUrl: '/manual.mp3' },
    )
    expect(result.episodeStatus).toBe('complete')
  })
})
