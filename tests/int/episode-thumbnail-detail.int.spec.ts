import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({ find: vi.fn(), shared: vi.fn() }))
vi.mock('@payload-config', () => ({ default: Promise.resolve({}) }))
vi.mock('payload', () => ({ getPayload: async () => ({ find: state.find }) }))
vi.mock('@/data/get-podcast-shared', () => ({ getPodcastSharedChrome: state.shared }))

import { getPodcastEpisode } from '@/data/get-podcast-episode'

describe('Public episode detail thumbnail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.shared.mockResolvedValue({})
  })

  it.each([
    {
      imageSource: 'upload',
      image: { id: 17, url: '/media/cover.jpg' },
      expected: '/media/cover.jpg',
    },
    {
      imageSource: 'url',
      imageUrl: 'https://example.com/cover.jpg',
      expected: 'https://example.com/cover.jpg',
    },
  ])('passes the saved $imageSource cover into the detail page', async (picture) => {
    state.find.mockResolvedValue({
      docs: [{ title: 'Episode', slug: 'episode', imageAlt: 'Guest portrait', ...picture }],
    })
    const result = await getPodcastEpisode('episode')
    expect(result).toMatchObject({ coverSrc: picture.expected, coverAlt: 'Guest portrait' })
    expect(state.find).toHaveBeenCalledWith(
      expect.objectContaining({
        depth: 1,
        where: { episodeStatus: { equals: 'complete' } },
      }),
    )
  })

  it('uses the episode title as alternative text when no image alt is set', async () => {
    state.find.mockResolvedValue({
      docs: [
        {
          title: 'Episode',
          slug: 'episode',
          imageSource: 'url',
          imageUrl: 'https://example.com/cover.jpg',
        },
      ],
    })
    expect(await getPodcastEpisode('episode')).toMatchObject({ coverAlt: 'Episode' })
  })

  it('does not expose episodes in inactive channels', async () => {
    state.find.mockResolvedValue({
      docs: [{ title: 'Episode', slug: 'episode', channel: { active: false } }],
    })
    expect(await getPodcastEpisode('episode')).toBeNull()
  })

  it('keeps older records with no thumbnail readable', async () => {
    state.find.mockResolvedValue({ docs: [{ title: 'Episode', slug: 'episode' }] })
    expect(await getPodcastEpisode('episode')).toMatchObject({ coverSrc: '' })
  })
})
