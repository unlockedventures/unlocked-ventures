import { describe, expect, it, vi } from 'vitest'
import {
  hasCompletedTranscription,
  reconcileVideoResources,
  type VideoResource,
} from '@/pipeline/video-resources'
import { syncVideoProgress } from '@/pipeline/sync-video-progress'

const completed: VideoResource = {
  id: 'row-1',
  url: 'https://vimeo.com/123',
  transcriptionStatus: 'completed',
  transcribedUrl: 'https://vimeo.com/123',
  videoTranscript: 'Generated result.',
  transcriptionError: '',
}

describe('per-video transcription state', () => {
  it('requires completed status, a matching URL, and a stored result', () => {
    expect(hasCompletedTranscription(completed)).toBe(true)
    expect(hasCompletedTranscription({ ...completed, url: 'https://vimeo.com/456' })).toBe(false)
    expect(hasCompletedTranscription({ ...completed, videoTranscript: '' })).toBe(false)
    expect(hasCompletedTranscription({ ...completed, transcriptionStatus: 'failed' })).toBe(false)
  })

  it('retains server state when an editor saves a reordered resource', () => {
    const rows = reconcileVideoResources(
      [{ url: 'https://vimeo.com/456' }, { id: 'row-1', url: completed.url }],
      [completed],
    )
    expect(rows[0].transcriptionStatus).toBe('pending')
    expect(rows[1]).toMatchObject(completed)
  })

  it('resets state and clears the previous result when a URL changes', () => {
    expect(
      reconcileVideoResources([{ ...completed, url: 'https://vimeo.com/456' }], [completed])[0],
    ).toMatchObject({
      transcriptionStatus: 'pending',
      videoTranscript: '',
      transcribedUrl: '',
      transcriptionError: '',
    })
  })

  it('rejects editor-supplied success metadata for a new video', () => {
    expect(reconcileVideoResources([completed])[0]).toMatchObject({
      transcriptionStatus: 'pending',
      videoTranscript: '',
      transcribedUrl: '',
    })
  })

  it('keeps completed results when stale form data claims the job is pending', () => {
    expect(
      reconcileVideoResources(
        [{ id: completed.id, url: completed.url, transcriptionStatus: 'pending' }],
        [completed],
      )[0],
    ).toMatchObject(completed)
  })

  it('syncs progress by URL without overwriting an unsaved URL or adding rows', () => {
    const dispatch = vi.fn()
    syncVideoProgress(
      {
        videoLinks: { rows: [{}, {}] },
        'videoLinks.0.url': { value: 'https://vimeo.com/456' },
        'videoLinks.1.url': { value: completed.url },
      },
      [completed],
      dispatch,
    )
    expect(dispatch).toHaveBeenCalledWith({
      type: 'UPDATE',
      path: 'videoLinks.1.transcriptionStatus',
      value: 'completed',
    })
    expect(
      dispatch.mock.calls.every(
        ([action]) => action.path.startsWith('videoLinks.1.') && !action.path.endsWith('.url'),
      ),
    ).toBe(true)
  })
})
