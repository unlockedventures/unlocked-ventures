'use client'

import { useRef, useState, type MouseEvent } from 'react'

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = String(total % 60).padStart(2, '0')
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${secs}`
  return `${minutes}:${secs}`
}

function embedSrc(url: string) {
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}?autoplay=1`
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`
  return null
}

function fileKind(url: string) {
  if (embedSrc(url)) return 'embed'
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
  const mediaRef = useRef<HTMLMediaElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [embed, setEmbed] = useState<string | null>(null)
  const source = mediaUrl?.trim() ?? ''
  const kind = source ? fileKind(source) : null
  const played = duration > 0 ? Math.min(100, Math.max(0, (current / duration) * 100)) : Math.min(100, Math.max(0, progress * 100))
  const clock = duration > 0 ? `${formatTime(current)} / ${formatTime(duration)}` : timeLabel

  function toggle() {
    if (!source) return
    if (kind === 'embed') {
      setEmbed(embedSrc(source))
      setPlaying(true)
      return
    }
    const media = mediaRef.current
    if (!media) return
    if (media.paused) {
      void media.play()
    } else {
      media.pause()
    }
  }

  function seek(event: MouseEvent<HTMLDivElement>) {
    const media = mediaRef.current
    if (!media || !duration) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width))
    media.currentTime = ratio * duration
  }

  return (
    <div className="relative w-full overflow-hidden bg-[#E4E6EA]">
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
          ref={mediaRef}
          src={source}
          poster={imageSrc}
          playsInline
          preload="metadata"
          className="aspect-[16/9] w-full object-cover"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={() => setCurrent(mediaRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setDuration(mediaRef.current?.duration ?? 0)}
        />
      ) : imageSrc ? (
        <img src={imageSrc} alt={imageAlt} className="aspect-[16/9] w-full object-cover" />
      ) : (
        <div className="aspect-[16/9] w-full bg-[#E4E6EA]" aria-hidden="true" />
      )}
      {kind === 'audio' ? (
        <audio
          ref={mediaRef}
          src={source}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={() => setCurrent(mediaRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setDuration(mediaRef.current?.duration ?? 0)}
        />
      ) : null}
      {embed ? null : (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pt-12 pb-3">
          <div
            className={`relative mb-2.5 h-0.5 w-full bg-white/35 ${source && kind !== 'embed' ? 'cursor-pointer' : ''}`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(played)}
            aria-label="Playback progress"
            onClick={seek}
          >
            <div className="absolute inset-y-0 left-0 bg-white" style={{ width: `${played}%` }} />
          </div>
          <div className="flex items-center gap-3 text-white">
            <button
              type="button"
              aria-label={playing ? 'Pause' : 'Play'}
              onClick={toggle}
              className="shrink-0 cursor-pointer"
            >
              {playing ? (
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <circle cx="16" cy="16" r="15" stroke="white" strokeOpacity="0.7" />
                  <path d="M12 10.5v11M20 10.5v11" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : (
                <img src="/podcast/episode/icons/play.svg" alt="" width={32} height={32} />
              )}
            </button>
            <p className="min-w-0 flex-1 truncate font-sans text-sm leading-5 font-normal">{title}</p>
            <p className="shrink-0 font-sans text-xs leading-4 font-normal tabular-nums">{clock}</p>
          </div>
        </div>
      )}
    </div>
  )
}
