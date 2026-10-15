import {
  classifyMediaUrl,
  vimeoEmbedSrc,
  youtubeEmbedSrc,
} from '@/lib/media-embed'
import { cn } from '@/lib/utils'

export function MediaEmbed({
  url,
  caption,
  className,
}: {
  url: string
  caption?: string | null
  className?: string
}) {
  const kind = classifyMediaUrl(url)
  const safeUrl = url.trim()

  let media: React.ReactNode = null

  if (kind === 'youtube') {
    const src = youtubeEmbedSrc(safeUrl)
    media = src ? (
      <div className="relative aspect-video w-full overflow-hidden bg-[#111]">
        <iframe
          src={src}
          title={caption || 'YouTube video'}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    ) : null
  } else if (kind === 'vimeo') {
    const src = vimeoEmbedSrc(safeUrl)
    media = src ? (
      <div className="relative aspect-video w-full overflow-hidden bg-[#111]">
        <iframe
          src={src}
          title={caption || 'Vimeo video'}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    ) : null
  } else if (kind === 'video') {
    media = (
      <video controls className="h-auto w-full bg-[#111]" preload="metadata">
        <source src={safeUrl} />
      </video>
    )
  } else if (kind === 'image' || kind === 'unknown') {
    media = (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={safeUrl} alt={caption || ''} className="h-auto w-full" loading="lazy" />
    )
  }

  if (!media) return null

  return (
    <figure className={cn('my-8 w-full', className)}>
      {media}
      {caption ? (
        <figcaption className="mt-3 font-sans text-sm leading-5 text-[#484D56]">{caption}</figcaption>
      ) : null}
    </figure>
  )
}
