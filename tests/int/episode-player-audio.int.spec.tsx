import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

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

  it('toggles stored audio by clicking anywhere on the episode artwork', async () => {
    const { container } = render(
      <EpisodePlayer {...baseProps} imageSrc="/media/cover.jpg" mediaUrl="/media/show.wav" />,
    )
    const audio = container.querySelector('audio') as HTMLAudioElement
    const artwork = screen.getByRole('img', { name: 'Episode cover' })
    let paused = true
    Object.defineProperty(audio, 'paused', { configurable: true, get: () => paused })
    audio.play = vi.fn(async () => {
      paused = false
      fireEvent.play(audio)
    })
    audio.pause = vi.fn(() => {
      paused = true
      fireEvent.pause(audio)
    })

    fireEvent.click(artwork)
    await waitFor(() => expect(audio.play).toHaveBeenCalledTimes(1))
    expect(screen.getByTestId('playback-feedback')).toHaveAttribute('data-feedback', 'play')
    fireEvent.click(artwork)
    expect(audio.pause).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('playback-feedback')).toHaveAttribute('data-feedback', 'pause')
  })

  it('changes playback speed and enters fullscreen', () => {
    const { container } = render(
      <EpisodePlayer {...baseProps} imageSrc="/media/cover.jpg" mediaUrl="/media/show.wav" />,
    )
    const audio = container.querySelector('audio') as HTMLAudioElement
    fireEvent.change(screen.getByRole('combobox', { name: 'Playback speed' }), {
      target: { value: '1.5' },
    })
    expect(audio.playbackRate).toBe(1.5)

    const player = container.firstElementChild as HTMLDivElement
    player.requestFullscreen = vi.fn(async () => undefined)
    fireEvent.click(screen.getByRole('button', { name: 'Enter fullscreen' }))
    expect(player.requestFullscreen).toHaveBeenCalledTimes(1)
  })

  it('seeks from the saved duration when browser metadata is not ready', () => {
    const { container } = render(
      <EpisodePlayer {...baseProps} imageSrc="/media/cover.jpg" mediaUrl="/media/show.wav" />,
    )
    const audio = container.querySelector('audio') as HTMLAudioElement
    const seekBar = screen.getByRole('slider', { name: 'Seek' })
    seekBar.getBoundingClientRect = () => ({
      left: 0,
      width: 100,
      right: 100,
      top: 0,
      bottom: 8,
      height: 8,
      x: 0,
      y: 0,
      toJSON() {},
    })

    fireEvent.click(seekBar, { clientX: 50 })
    expect(audio.currentTime).toBe(377)
  })
})
