import { describe, expect, it } from 'vitest'

import { appendTranscript, failureBody, updateVideoTranscript } from '@/pipeline/transcript'

describe('appendTranscript', () => {
  it('writes the first block with the video URL as a heading', () => {
    expect(appendTranscript('', 'https://vimeo.com/123456789', 'Hello there')).toBe(
      '## https://vimeo.com/123456789\n\nHello there',
    )
  })

  it('keeps the earlier block when a later video fails', () => {
    const first = appendTranscript('', 'https://www.youtube.com/watch?v=abcdefghijk', 'First video')
    const second = appendTranscript(
      first,
      'https://www.bilibili.com/video/BV1xx411c7mD',
      failureBody('Video unavailable'),
    )
    expect(second).toBe(
      [
        '## https://www.youtube.com/watch?v=abcdefghijk',
        '',
        'First video',
        '',
        '## https://www.bilibili.com/video/BV1xx411c7mD',
        '',
        'Could not transcribe this video: Video unavailable',
      ].join('\n'),
    )
  })
})

describe('video transcript updates', () => {
  it('replaces an empty block without losing the following completed video', () => {
    const text = 'Intro\n\n## https://vimeo.com/123\n\n## https://vimeo.com/456\n\nKeep me'
    expect(updateVideoTranscript(text, 'https://vimeo.com/123', 'Recovered')).toBe(
      'Intro\n\n## https://vimeo.com/123\n\nRecovered\n\n## https://vimeo.com/456\n\nKeep me',
    )
  })
})
