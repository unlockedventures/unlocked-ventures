'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = String(total % 60).padStart(2, '0')
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${secs}`
  return `${minutes}:${secs}`
}

function parseTimeLabel(value: string) {
  const parts = value
    .trim()
    .split(':')
    .map((part) => Number(part))
  if (parts.some((part) => !Number.isFinite(part) || part < 0)) return 0
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return 0
}

function youtubeId(url: string) {
  const match = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i,
  )
  return match?.[1] ?? null
}

function embedSrc(url: string) {
  const yt = youtubeId(url)
  if (yt) return `https://www.youtube.com/embed/${yt}?autoplay=1`
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`
  return null
}

/** Hosts / patterns the browser cannot play in <audio>/<video>. */
function unsuitableReason(url: string): string | null {
  if (embedSrc(url)) return null
  try {
    const host = new URL(url, 'https://example.invalid').hostname.toLowerCase()
    if (host.includes('googlevideo.com') || host.includes('youtube.com') || host === 'youtu.be') {
      return 'Use a YouTube watch/share link, not a direct stream URL.'
    }
    if (
      host.includes('spotify.com') ||
      host.includes('podcasts.apple.com') ||
      host.includes('music.apple.com')
    ) {
      return 'Platform page links cannot be played here. Upload audio or paste a direct file / YouTube / Vimeo URL.'
    }
  } catch {
    return 'This media link is not a valid URL.'
  }
  return null
}

function fileKind(url: string): 'embed' | 'video' | 'audio' | 'unsupported' {
  if (embedSrc(url)) return 'embed'
  if (unsuitableReason(url)) return 'unsupported'
  if (/\.(mp4|webm|ogv|mov)(\?|#|$)/i.test(url)) return 'video'
  return 'audio'
}

export function EpisodePlayer({
  title,
  timeLabel,
  progress,
  imageSrc,
  imageAlt,
  mediaUrl,
}: {
  title: string
  timeLabel: string
  progress: number
  imageSrc?: string
  imageAlt: string
  mediaUrl?: string
}) {
  const playerRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<HTMLMediaElement | null>(null)
  const setMediaRef = useCallback((node: HTMLAudioElement | HTMLVideoElement | null) => {
    mediaRef.current = node
  }, [])
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [embed, setEmbed] = useState<string | null>(null)
  const [scrubbing, setScrubbing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [playbackFeedback, setPlaybackFeedback] = useState<'play' | 'pause' | null>(null)
  const source = mediaUrl?.trim() ?? ''
  const kind = source ? fileKind(source) : null
  const blocked = source ? unsuitableReason(source) : null
  const mediaCanPlay = Boolean(source && kind && kind !== 'unsupported')
  const canPlay = mediaCanPlay
  const uiPlaying = playing
  const effectiveDuration =
    Number.isFinite(duration) && duration > 0 ? duration : parseTimeLabel(timeLabel)
  const canSeek = Boolean(mediaCanPlay && kind !== 'embed' && effectiveDuration > 0)
  const played =
    effectiveDuration > 0
      ? Math.min(100, Math.max(0, (current / effectiveDuration) * 100))
      : Math.min(100, Math.max(0, progress * 100))
  const clock =
    effectiveDuration > 0 ? `${formatTime(current)} / ${formatTime(effectiveDuration)}` : timeLabel
  const statusMessage = error || blocked || (!source ? 'No audio linked for this episode.' : null)

  useEffect(() => {
    const syncFullscreen = () => setFullscreen(document.fullscreenElement === playerRef.current)
    document.addEventListener('fullscreenchange', syncFullscreen)
    return () => document.removeEventListener('fullscreenchange', syncFullscreen)
  }, [])

  useEffect(
    () => () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    },
    [],
  )

  function showPlaybackFeedback(action: 'play' | 'pause') {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    setPlaybackFeedback(action)
    feedbackTimerRef.current = setTimeout(() => {
      setPlaybackFeedback(null)
      feedbackTimerRef.current = null
    }, 500)
  }

  function onMediaError() {
    setPlaying(false)
    setError('This media file could not be played. Check the URL or upload a new audio file.')
  }

  function syncMediaDuration(media: HTMLMediaElement) {
    if (Number.isFinite(media.duration) && media.duration > 0) setDuration(media.duration)
  }

  async function toggle() {
    if (!mediaCanPlay) {
      setError(blocked || 'No playable media for this episode.')
      return
    }
    setError(null)
    if (kind === 'embed') {
      setEmbed(embedSrc(source))
      setPlaying(true)
      showPlaybackFeedback('play')
      return
    }
    const media = mediaRef.current
    if (!media) return
    if (media.paused) {
      try {
        await media.play()
        showPlaybackFeedback('play')
      } catch {
        onMediaError()
      }
    } else {
      media.pause()
      showPlaybackFeedback('pause')
    }
  }

  function changePlaybackRate(rate: number) {
    if (!Number.isFinite(rate)) return
    const media = mediaRef.current
    if (media) media.playbackRate = rate
    setPlaybackRate(rate)
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await playerRef.current?.requestFullscreen()
    } catch {
      setError('Fullscreen is not available in this browser.')
    }
  }

  const seekToClientX = useCallback(
    (clientX: number) => {
      const media = mediaRef.current
      const track = trackRef.current
      if (!media || !track || !effectiveDuration) return
      const bounds = track.getBoundingClientRect()
      const ratio = Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width))
      media.currentTime = ratio * effectiveDuration
      setCurrent(ratio * effectiveDuration)
    },
    [effectiveDuration],
  )

  function onTrackPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!canSeek) return
    event.preventDefault()
    event.stopPropagation()
    draggingRef.current = true
    setScrubbing(true)
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Click-to-seek still works in browsers without pointer capture.
    }
    seekToClientX(event.clientX)
  }

  function onTrackPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return
    seekToClientX(event.clientX)
  }

  function onTrackPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return
    draggingRef.current = false
    setScrubbing(false)
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
    } catch {
      // Pointer capture is optional; seeking already completed.
    }
  }

  function onTrackClick(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation()
    if (!canSeek) return
    seekToClientX(event.clientX)
  }

  function onTrackKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!canSeek) return
    const media = mediaRef.current
    if (!media) return
    const step = event.shiftKey ? 10 : 5
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault()
      media.currentTime = Math.min(effectiveDuration, media.currentTime + step)
      setCurrent(media.currentTime)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault()
      media.currentTime = Math.max(0, media.currentTime - step)
      setCurrent(media.currentTime)
    } else if (event.key === 'Home') {
      event.preventDefault()
      media.currentTime = 0
      setCurrent(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      media.currentTime = effectiveDuration
      setCurrent(effectiveDuration)
    }
  }

  function onSurfaceClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target
    if (
      target instanceof Element &&
      target.closest('button, a, input, select, textarea, iframe, [role="slider"]')
    ) {
      return
    }
    void toggle()
  }

  function onSurfaceKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    void toggle()
  }

  return (
    <div
      ref={playerRef}
      className={`relative w-full overflow-hidden bg-[#E4E6EA] outline-none focus-visible:ring-2 focus-visible:ring-[#0A2540] focus-visible:ring-offset-2 fullscreen:flex fullscreen:items-center fullscreen:bg-black ${
        canPlay ? 'cursor-pointer' : ''
      }`}
      role="group"
      tabIndex={canPlay ? 0 : -1}
      aria-label={canPlay ? `${uiPlaying ? 'Pause' : 'Play'} ${title}` : title}
      onClick={onSurfaceClick}
      onKeyDown={onSurfaceKeyDown}
    >
      {embed ? (
        <iframe
          src={embed}
          title={title}
          className="aspect-[16/9] w-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : kind === 'video' ? (
        <video
          ref={setMediaRef}
          src={source}
          poster={imageSrc}
          playsInline
          preload="metadata"
          className="aspect-[16/9] w-full object-cover"
          onPlay={() => {
            setError(null)
            setPlaying(true)
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={onMediaError}
          onTimeUpdate={() => {
            if (!draggingRef.current) setCurrent(mediaRef.current?.currentTime ?? 0)
          }}
          onLoadedMetadata={(event) => syncMediaDuration(event.currentTarget)}
          onDurationChange={(event) => syncMediaDuration(event.currentTarget)}
          onCanPlay={(event) => syncMediaDuration(event.currentTarget)}
          onRateChange={() => setPlaybackRate(mediaRef.current?.playbackRate ?? 1)}
        />
      ) : imageSrc ? (
        <img src={imageSrc} alt={imageAlt} className="aspect-[16/9] w-full object-cover" />
      ) : (
        <div className="aspect-[16/9] w-full bg-[#E4E6EA]" aria-hidden="true" />
      )}
      {kind === 'audio' ? (
        <audio
          ref={setMediaRef}
          src={source}
          preload="metadata"
          onPlay={() => {
            setError(null)
            setPlaying(true)
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={onMediaError}
          onTimeUpdate={() => {
            if (!draggingRef.current) setCurrent(mediaRef.current?.currentTime ?? 0)
          }}
          onLoadedMetadata={(event) => syncMediaDuration(event.currentTarget)}
          onDurationChange={(event) => syncMediaDuration(event.currentTarget)}
          onCanPlay={(event) => syncMediaDuration(event.currentTarget)}
          onRateChange={() => setPlaybackRate(mediaRef.current?.playbackRate ?? 1)}
        />
      ) : null}
      {playbackFeedback ? (
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          data-testid="playback-feedback"
          data-feedback={playbackFeedback}
          aria-hidden="true"
        >
          <span className="absolute size-20 animate-ping rounded-full bg-black/30" />
          <span className="relative flex size-16 items-center justify-center rounded-full bg-black/65 text-white shadow-lg">
            {playbackFeedback === 'play' ? (
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <path d="M12 8.5 27 17 12 25.5v-17Z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <path
                  d="M11 9v16M23 9v16"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </span>
        </div>
      ) : null}
      {embed ? null : (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pt-12 pb-3">
          <div
            ref={trackRef}
            role="slider"
            tabIndex={canSeek ? 0 : -1}
            aria-valuemin={0}
            aria-valuemax={Math.round(effectiveDuration) || 100}
            aria-valuenow={Math.round(current)}
            aria-valuetext={clock}
            aria-label="Seek"
            aria-disabled={!canSeek}
            className={`group relative mb-1 flex h-8 w-full items-center touch-none outline-none ${
              canSeek ? 'cursor-pointer' : 'cursor-default'
            }`}
            onPointerDown={onTrackPointerDown}
            onPointerMove={onTrackPointerMove}
            onPointerUp={onTrackPointerUp}
            onPointerCancel={onTrackPointerUp}
            onClick={onTrackClick}
            onKeyDown={onTrackKeyDown}
          >
            <div className="relative h-1 w-full rounded-full bg-white/35 transition-[height] group-hover:h-1.5 group-focus-visible:h-1.5">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-white"
                style={{ width: `${played}%` }}
              />
              <div
                className={`absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.35)] transition-transform ${
                  canSeek
                    ? scrubbing
                      ? 'scale-110'
                      : 'scale-100 group-hover:scale-110 group-focus-visible:scale-110'
                    : 'scale-90 opacity-80'
                }`}
                style={{ left: `${played}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 text-white">
            <button
              type="button"
              aria-label={uiPlaying ? 'Pause' : 'Play'}
              aria-disabled={!canPlay}
              onClick={() => {
                void toggle()
              }}
              className={`shrink-0 ${canPlay ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
            >
              {uiPlaying ? (
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <circle cx="16" cy="16" r="15" stroke="white" strokeOpacity="0.7" />
                  <path
                    d="M12 10.5v11M20 10.5v11"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <img src="/podcast/episode/icons/play.svg" alt="" width={32} height={32} />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-sm leading-5 font-normal">{title}</p>
              {statusMessage ? (
                <p
                  className="mt-0.5 truncate font-sans text-[11px] leading-4 font-normal text-white/80"
                  role="status"
                >
                  {statusMessage}
                </p>
              ) : null}
            </div>
            {kind === 'audio' || kind === 'video' ? (
              <label className="shrink-0 text-xs">
                <span className="sr-only">Playback speed</span>
                <select
                  aria-label="Playback speed"
                  value={playbackRate}
                  onChange={(event) => changePlaybackRate(Number(event.target.value))}
                  className="cursor-pointer rounded border border-white/35 bg-black/30 px-1.5 py-1 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <option key={rate} value={rate} className="bg-[#0A2540] text-white">
                      {rate}×
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <p className="shrink-0 font-sans text-xs leading-4 font-normal tabular-nums">{clock}</p>
            <button
              type="button"
              aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              onClick={() => void toggleFullscreen()}
              className="shrink-0 cursor-pointer rounded p-1 outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {fullscreen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
