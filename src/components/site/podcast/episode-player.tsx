'use client'

export function EpisodePlayer({
  title,
  timeLabel,
  progress,
  imageSrc,
  imageAlt,
}: {
  title: string
  timeLabel: string
  progress: number
  imageSrc: string
  imageAlt: string
}) {
  const played = Math.min(100, Math.max(0, Math.round(progress * 100)))

  return (
    <div className="relative w-full overflow-hidden bg-[#E4E6EA]">
      <img src={imageSrc} alt={imageAlt} className="aspect-[16/9] w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pt-12 pb-3">
        <div
          className="relative mb-2.5 h-0.5 w-full bg-white/35"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={played}
          aria-label="Playback progress"
        >
          <div className="absolute inset-y-0 left-0 bg-white" style={{ width: `${played}%` }} />
        </div>
        <div className="flex items-center gap-3 text-white">
          <button type="button" aria-label="Play" className="shrink-0 cursor-pointer">
            <img src="/podcast/episode/icons/play.svg" alt="" width={32} height={32} />
          </button>
          <p className="min-w-0 flex-1 truncate font-sans text-sm leading-5 font-normal">{title}</p>
          <p className="shrink-0 font-sans text-xs leading-4 font-normal tabular-nums">{timeLabel}</p>
        </div>
      </div>
    </div>
  )
}
