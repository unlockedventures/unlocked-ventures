'use client'

const controls = {
  left: [
    { src: '/podcast/episode/icons/player-1.svg', label: 'Pause' },
    { src: '/podcast/episode/icons/player-2.svg', label: 'Next' },
    { src: '/podcast/episode/icons/player-3.svg', label: 'Previous' },
  ],
  right: [
    { src: '/podcast/episode/icons/player-4.svg', label: 'Volume' },
    { src: '/podcast/episode/icons/player-5.svg', label: 'Comments' },
    { src: '/podcast/episode/icons/player-6.svg', label: 'Full screen' },
    { src: '/podcast/episode/icons/player-7.svg', label: 'More' },
  ],
} as const

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
  const played = Math.round(progress * 100)

  return (
    <div className="relative mx-auto w-full max-w-[1173px]">
      <img src={imageSrc} alt={imageAlt} className="aspect-[1173/660] w-full object-cover" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[196px] bg-gradient-to-b from-transparent to-black" />
      <button
        type="button"
        aria-label="Play"
        className="absolute top-[40.9%] left-1/2 -translate-x-1/2 cursor-pointer"
      >
        <img src="/podcast/episode/icons/play.svg" alt="" width={80} height={80} />
      </button>
      <div className="absolute inset-x-[22px] bottom-0 flex h-24 flex-col justify-center gap-[11px] bg-gradient-to-b from-[rgb(8_9_13/0)] to-[rgb(8_9_13/0.9)] px-7">
        <div className="flex items-center justify-between gap-4 text-white">
          <p className="truncate font-sans text-base leading-4 font-normal">{title}</p>
          <p className="shrink-0 font-sans text-base leading-4 font-normal">{timeLabel}</p>
        </div>
        <div
          className="relative h-px w-full bg-[#D9D9D9]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={played}
          aria-label="Playback progress"
        >
          <div className="absolute inset-y-0 left-0 bg-white" style={{ width: `${played}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {controls.left.map((control) => (
              <button key={control.label} type="button" aria-label={control.label} className="cursor-pointer">
                <img src={control.src} alt="" width={34} height={34} />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {controls.right.map((control) => (
              <button key={control.label} type="button" aria-label={control.label} className="cursor-pointer">
                <img src={control.src} alt="" width={34} height={34} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
