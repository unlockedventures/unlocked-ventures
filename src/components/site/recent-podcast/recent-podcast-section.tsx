import Link from 'next/link'

import { ContentSlider } from '@/components/site/slider/content-slider'
import { cn } from '@/lib/utils'

export type PodcastEpisode = {
  meta: string
  title: string
  guests: string
  href: string
  imageSrc?: string
  imageAlt?: string
}

export type RecentPodcastSectionProps = {
  title: string
  episodes: readonly PodcastEpisode[]
  className?: string
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-0.5 size-7 sm:size-8 lg:size-9">
      <path d="M8.5 6.2v11.6L18.2 12 8.5 6.2z" fill="currentColor" />
    </svg>
  )
}

function PodcastCard({ episode }: { episode: PodcastEpisode }) {
  return (
    <article className="h-full bg-white">
      <Link href={episode.href} className="group flex h-full cursor-pointer flex-col gap-7">
        <div className="relative h-[220px] shrink-0 overflow-hidden bg-[#E4E6EA] sm:h-[280px] lg:h-[360px]">
          {episode.imageSrc ? (
            <img
              src={episode.imageSrc}
              alt={episode.imageAlt ?? ''}
              className="absolute inset-0 h-full w-full object-cover grayscale"
            />
          ) : null}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 scale-90 items-center justify-center rounded-full bg-[#E7E9F3] text-[#25282D] opacity-0 transition duration-300 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 sm:size-16 lg:size-[72px]"
          >
            <PlayIcon />
          </span>
        </div>
        <div className="flex flex-col gap-3 px-5 pb-5">
          <p className="font-sans text-base leading-6 font-normal text-[#222222]/68">{episode.meta}</p>
          <div className="flex flex-col gap-1.5">
            <h3 className="min-h-[65px] font-sans text-2xl leading-[30px] font-normal tracking-[-0.48px] text-[#25282D]">
              {episode.title}
            </h3>
            <p className="inline-flex h-[43px] w-fit max-w-full items-center bg-[#F3F4F9] px-4 font-sans text-base leading-6 font-normal text-[#222222]/68">
              {episode.guests}
            </p>
          </div>
        </div>
      </Link>
    </article>
  )
}

export function RecentPodcastSection({ title, episodes, className }: RecentPodcastSectionProps) {
  return (
    <section aria-label="Recent podcast" className={cn('bg-[#F3F4F9]', className)}>
      <div className="w-full px-4 py-12 sm:px-6 md:px-8 md:py-16 lg:px-[56px] lg:py-[80px]">
        <ContentSlider
          label="Recent podcast episodes"
          headerClassName="sm:items-center"
          controlsClassName="gap-[21px]"
          heading={
            <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#33353F] md:text-5xl md:leading-[56px]">
              {title}
            </h2>
          }
          snapClassName="max-lg:snap-x max-lg:snap-mandatory"
          slideSnapClassName="max-lg:snap-start"
          slideClassName="lg:w-[calc((100%-5.5rem)/2)]"
          endFadeClassName="via-[#F3F4F9] via-45% to-[#F3F4F9] lg:w-16"
        >
          {episodes.map((episode) => (
            <PodcastCard key={episode.href} episode={episode} />
          ))}
        </ContentSlider>
      </div>
    </section>
  )
}
