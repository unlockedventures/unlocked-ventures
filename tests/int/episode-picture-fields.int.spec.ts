import { describe, expect, it, vi } from 'vitest'

vi.mock('@/pipeline/episode-ai-endpoints', () => ({ episodeAiEndpoints: [] }))

import { PodcastEpisodes } from '@/collections/PodcastEpisodes'
import { validateEpisodeThumbnail } from '@/lib/episode-thumbnail'

const conditionContext = { blockData: {}, operation: 'create' as const, path: [], user: null }

function field(name: string) {
  const found = PodcastEpisodes.fields.find((item) => 'name' in item && item.name === name)
  if (!found) throw new Error(`Missing ${name}`)
  return found
}

describe('Episode picture controls', () => {
  it('registers server-side thumbnail validation', () => {
    expect(PodcastEpisodes.hooks?.beforeValidate).toContain(validateEpisodeThumbnail)
  })

  it('shows source and alt controls regardless of editor mode', () => {
    expect(field('imageSource').admin?.condition).toBeUndefined()
    expect(field('imageAlt').admin?.condition).toBeUndefined()
  })

  it.each(['ai', 'manual'])('shows the selected image input in %s mode', (editorMode) => {
    const uploadCondition = field('image').admin?.condition
    const urlCondition = field('imageUrl').admin?.condition
    expect(uploadCondition?.({}, { editorMode, imageSource: 'upload' }, conditionContext)).toBe(
      true,
    )
    expect(uploadCondition?.({}, { editorMode, imageSource: 'url' }, conditionContext)).toBe(false)
    expect(urlCondition?.({}, { editorMode, imageSource: 'url' }, conditionContext)).toBe(true)
    expect(urlCondition?.({}, { editorMode, imageSource: 'upload' }, conditionContext)).toBe(false)
  })

  it('reuses the existing image drag-and-drop uploader', () => {
    expect(field('image').admin?.components?.Field).toBe(
      '@/components/admin/direct-upload-field#DirectUploadField',
    )
    expect(field('image').admin?.custom).toMatchObject({ relationTo: 'media', accept: 'image/*' })
  })

  it('retains the existing audio visibility rule', () => {
    const condition = field('audioSource').admin?.condition
    expect(condition?.({}, { editorMode: 'ai' }, conditionContext)).toBe(false)
    expect(condition?.({}, { editorMode: 'manual' }, conditionContext)).toBe(true)
  })
})
