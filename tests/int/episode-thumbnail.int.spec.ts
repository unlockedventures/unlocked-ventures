import { describe, expect, it } from 'vitest'

import { validateEpisodeThumbnail } from '@/lib/episode-thumbnail'
import { podcastCoverSrc } from '@/lib/podcast-cover'

type HookArgs = Parameters<typeof validateEpisodeThumbnail>[0]
function validate(
  data: HookArgs['data'],
  originalDoc?: HookArgs['originalDoc'],
  operation: HookArgs['operation'] = 'create',
) {
  return validateEpisodeThumbnail({ data, originalDoc, operation } as HookArgs)
}

describe('Required episode thumbnail', () => {
  it.each(['ai', 'manual'] as const)(
    'requires an image for %s creation, including drafts',
    (mode) => {
      expect(() => validate({ editorMode: mode, episodeStatus: 'draft' })).toThrow()
    },
  )

  it('accepts a completed media relationship', () => {
    expect(validate({ imageSource: 'upload', image: 17 })).toMatchObject({ image: 17 })
  })

  it('does not substitute an old URL for a missing selected upload', () => {
    expect(() =>
      validate({ imageSource: 'upload', image: null, imageUrl: 'https://example.com/old.jpg' }),
    ).toThrow()
  })

  it.each(['', '   ', 'not-a-url', 'javascript:alert(1)', 'data:image/png;base64,AAAA'])(
    'rejects an invalid selected URL: %s',
    (imageUrl) => {
      expect(() => validate({ imageSource: 'url', imageUrl, image: 17 })).toThrow()
    },
  )

  it('trims a valid external URL', () => {
    expect(
      validate({ imageSource: 'url', imageUrl: ' https://example.com/cover.jpg ' }),
    ).toMatchObject({
      imageUrl: 'https://example.com/cover.jpg',
    })
  })

  it('uses the persisted image on a partial publication update', () => {
    const originalDoc = { imageSource: 'upload', image: 17 } as HookArgs['originalDoc']
    expect(validate({ episodeStatus: 'complete' }, originalDoc, 'update')).toEqual({
      episodeStatus: 'complete',
    })
  })

  it('requires replacement after clearing an image on update', () => {
    const originalDoc = { imageSource: 'upload', image: 17 } as HookArgs['originalDoc']
    expect(() => validate({ image: null }, originalDoc, 'update')).toThrow()
  })

  it('keeps background progress updates compatible with legacy records', () => {
    expect(validate({ status: 'processing' }, undefined, 'update')).toEqual({
      status: 'processing',
    })
  })
})

describe('Episode page thumbnail source', () => {
  it('uses the uploaded image URL', () => {
    expect(podcastCoverSrc({ imageSource: 'upload', image: { url: '/media/cover.jpg' } })).toBe(
      '/media/cover.jpg',
    )
  })
  it('uses the selected external URL even with an old upload', () => {
    expect(
      podcastCoverSrc({
        imageSource: 'url',
        imageUrl: ' https://example.com/cover.jpg ',
        image: { url: '/media/old.jpg' },
      }),
    ).toBe('https://example.com/cover.jpg')
  })
  it('preserves the empty fallback for old episodes', () => {
    expect(podcastCoverSrc({})).toBeUndefined()
  })
})
