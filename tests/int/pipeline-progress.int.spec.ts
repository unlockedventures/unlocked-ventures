import { describe, expect, it } from 'vitest'

import { overallTranscriptPercent } from '@/pipeline/progress'

describe('overallTranscriptPercent', () => {
  it('returns 0 while the first video has not started a stage yet', () => {
    expect(
      overallTranscriptPercent({
        statusMessage: 'Generating transcript for video 1 of 1.',
        stagePercent: null,
      }),
    ).toBe(0)
  })

  it('scales the current stage across multiple videos', () => {
    expect(
      overallTranscriptPercent({
        statusMessage: 'Generating transcript for video 2 of 4.',
        stagePercent: 50,
      }),
    ).toBe(38)
  })

  it('stays under 100 while a run is still processing', () => {
    expect(
      overallTranscriptPercent({
        statusMessage: 'Generating transcript for video 1 of 1.',
        stagePercent: 100,
      }),
    ).toBe(99)
  })

  it('returns null when the status line is not a progress message', () => {
    expect(
      overallTranscriptPercent({
        statusMessage: 'Some videos could not be transcribed.',
        stagePercent: 40,
      }),
    ).toBeNull()
  })
})
