import { describe, expect, it } from 'vitest'

import { collectVideoLinksFromForm } from '@/pipeline/form-video-links'

describe('collectVideoLinksFromForm', () => {
  it('reads urls from Payload array row paths', () => {
    const fields = {
      videoLinks: { value: 2, rows: [{ id: 'a' }, { id: 'b' }] },
      'videoLinks.0.url': { value: 'https://www.youtube.com/watch?v=aaaaaaaaaaa' },
      'videoLinks.1.url': { value: 'https://www.youtube.com/watch?v=bbbbbbbbbbb' },
    }

    expect(collectVideoLinksFromForm(fields)).toEqual([
      'https://www.youtube.com/watch?v=aaaaaaaaaaa',
      'https://www.youtube.com/watch?v=bbbbbbbbbbb',
    ])
  })

  it('skips empty rows and returns empty when none are set', () => {
    expect(
      collectVideoLinksFromForm({
        videoLinks: { value: 1, rows: [{ id: 'a' }] },
        'videoLinks.0.url': { value: '   ' },
      }),
    ).toEqual([])
    expect(collectVideoLinksFromForm({})).toEqual([])
  })
})
