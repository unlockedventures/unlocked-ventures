'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import { ContentSlider } from '@/components/site/slider/content-slider'
import { Skeleton } from '@/components/ui/skeleton'
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

function PodcastCard({ episode }: { episode: PodcastEpisode }) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [imageReady, setImageReady] = useState(false)

  useEffect(() => {
    const image = imageRef.current
    if (image?.complete && image.naturalWidth > 0) {
      setImageReady(true)
      return
    }
    setImageReady(false)
  }, [episode.imageSrc])

  return (
    <article className="h-full">
      <Link href={episode.href} className="flex h-full cursor-pointer flex-col">
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-[2px] bg-[#E4E6EA]">
          {episode.imageSrc && !imageReady ? (
            <Skeleton className="absolute inset-0 size-full rounded-[2px] bg-[#E4E6EA]" />
          ) : null}
          {episode.imageSrc ? (
            <img
              ref={imageRef}
              src={episode.imageSrc}
              alt={episode.imageAlt ?? ''}
              onLoad={() => setImageReady(true)}
              onError={() => setImageReady(true)}
              className={cn(
                'absolute inset-0 h-full w-full object-cover object-top',
                imageReady ? 'opacity-100' : 'opacity-0',
              )}
            />
          ) : null}
          {episode.meta && (imageReady || !episode.imageSrc) ? (
            <span className="absolute right-2 bottom-2 rounded-[4px] bg-[#121212] px-1 py-1 font-sans text-[10px] leading-none font-semibold tracking-[0.3px] text-white">
              {episode.meta}
            </span>
          ) : null}
        </div>
        <div className="grid grid-rows-[3rem_1.125rem] gap-1.5 pt-2.5">
          <h3 className="line-clamp-2 font-sans text-base leading-6 font-medium tracking-[-0.16px] text-[#33353F]">
            {episode.title}
          </h3>
          <p className="truncate font-sans text-xs leading-[18px] font-semibold tracking-[0.48px] text-[#696969] uppercase">
            {episode.guests}
          </p>
        </div>
      </Link>
    </article>
  )
}

const skeletonCardClassName =
  'w-[calc((100%-0.75rem)/2)] shrink-0 md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)]'

function PodcastCardSkeleton() {
  return (
    <div className={skeletonCardClassName}>
      <Skeleton className="aspect-video w-full rounded-[2px] bg-[#E4E6EA]" />
      <div className="pt-2.5">
        <Skeleton className="mb-1.5 h-6 w-4/5 rounded-sm bg-[#E4E6EA]" />
        <Skeleton className="h-6 w-3/5 rounded-sm bg-[#E4E6EA]" />
        <Skeleton className="mt-1.5 h-[18px] w-2/5 rounded-sm bg-[#E4E6EA]" />
      </div>
    </div>
  )
}

export function RecentPodcastSkeleton({ className }: { className?: string }) {
  return (
    <section aria-busy="true" aria-label="Loading podcasts" className={cn('bg-[#F3F4F9]', className)}>
      <div className="w-full px-4 py-8 sm:px-6 md:px-8 md:py-10 lg:px-[56px] lg:py-12 min-[1440px]:mx-auto min-[1440px]:max-w-[1440px]">
        <Skeleton className="mb-6 h-10 w-64 max-w-full rounded-sm bg-[#E4E6EA] md:h-14" />
        <div className="flex gap-3 overflow-hidden md:gap-5">
          {Array.from({ length: 4 }, (_, index) => (
            <PodcastCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function RecentPodcastSection({ title, episodes, className }: RecentPodcastSectionProps) {
  return (
    <section aria-label={title} className={cn('bg-[#F3F4F9]', className)}>
      <div className="w-full px-4 py-8 sm:px-6 md:px-8 md:py-10 lg:px-[56px] lg:py-12 min-[1440px]:mx-auto min-[1440px]:max-w-[1440px]">
        <ContentSlider
          label={title}
          className="gap-5 md:gap-6"
          headerClassName="sm:items-center"
          controlsClassName="gap-[21px]"
          heading={
            <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#33353F] md:text-5xl md:leading-[56px]">
              {title}
            </h2>
          }
          trackClassName="gap-3 md:gap-5"
          snapClassName="snap-x snap-mandatory"
          slideSnapClassName="snap-start"
          slideClassName="w-[calc((100%-0.75rem)/2)] md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)]"
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
