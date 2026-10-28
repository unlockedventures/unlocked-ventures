import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { EpisodePlayer } from '@/components/site/podcast/episode-player'

const baseProps = {
  title: 'Stored podcast',
  timeLabel: '12:34',
  progress: 0,
  imageAlt: 'Episode cover',
}

describe('EpisodePlayer stored audio', () => {
  afterEach(cleanup)

  it('uses the stored media URL as its audio source', () => {
    const { container } = render(<EpisodePlayer {...baseProps} mediaUrl="/media/show.wav" />)
    expect(container.querySelector('audio')).toHaveAttribute('src', '/media/show.wav')
    expect(screen.queryByText(/browser TTS/i)).not.toBeInTheDocument()
  })

  it('does not synthesize a fallback when no audio is linked', () => {
    render(<EpisodePlayer {...baseProps} />)
    expect(screen.getByText('No audio linked for this episode.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play' })).toHaveAttribute('aria-disabled', 'true')
  })
})
