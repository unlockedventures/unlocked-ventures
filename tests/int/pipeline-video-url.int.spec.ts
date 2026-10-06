import { describe, expect, it } from 'vitest'

import { validateVideoLinks } from '@/pipeline/video-url'

describe('validateVideoLinks', () => {
  it('rejects an empty list', () => {
    expect(validateVideoLinks([])).toEqual({ ok: false, message: 'Add at least one video link.' })
    expect(validateVideoLinks(null)).toEqual({ ok: false, message: 'Add at least one video link.' })
  })

  it('rejects a blank row and names that row', () => {
    expect(validateVideoLinks([{ url: 'https://www.youtube.com/watch?v=abcdefghijk' }, { url: '  ' }])).toEqual({
      ok: false,
      message: 'Video link 2 is empty.',
    })
  })

  it('rejects a link that is not http or https', () => {
    expect(validateVideoLinks([{ url: 'ftp://example.com/video' }])).toEqual({
      ok: false,
      message: 'Video link 1 must start with http:// or https://.',
    })
  })

  it('accepts YouTube, Vimeo, and Bilibili links', () => {
    expect(
      validateVideoLinks([
        { url: 'https://www.youtube.com/watch?v=abcdefghijk' },
        { url: 'https://vimeo.com/123456789' },
        { url: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      ]),
    ).toEqual({
      ok: true,
      urls: [
        'https://www.youtube.com/watch?v=abcdefghijk',
        'https://vimeo.com/123456789',
        'https://www.bilibili.com/video/BV1xx411c7mD',
      ],
    })
  })
})
