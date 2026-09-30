import Link from 'next/link'

import { EpisodePlayer } from '@/components/site/podcast/episode-player'
import { podcastPage } from '@/data/podcast-page'

const actionClassName =
  'inline-flex h-11 cursor-pointer items-center gap-2.5 border border-[#484D56]/36 px-5 font-sans text-base leading-[22px] font-normal text-[#484D56]'

function ActionIcon({ src }: { src: string }) {
  return <img src={src} alt="" width={20} height={20} />
}

export function PodcastPage() {
  const { episode, chapters, listenNext, subscribe } = podcastPage

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden">
        <img
          src="/podcast/episode/arcs.png"
          alt=""
          width={1174}
          height={756}
          className="pointer-events-none absolute top-0 left-[18.47%] hidden w-[81.53%] max-w-none select-none lg:block"
        />
        <div className="relative mx-auto w-full max-w-[1440px] px-4 pt-12 sm:px-6 md:px-8 md:pt-16 xl:px-[156px] xl:pt-20">
          <p className="font-sans text-base leading-[22px] font-normal text-[#222222]">
            <Link href={podcastPage.breadcrumb.home.href} className="hover:text-[#1CACAE]">
              {podcastPage.breadcrumb.home.label}
            </Link>
            <span aria-hidden="true"> / </span>
            <Link href={podcastPage.breadcrumb.podcast.href} className="hover:text-[#1CACAE]">
              {podcastPage.breadcrumb.podcast.label}
            </Link>
            <span aria-hidden="true"> / </span>
            <span>{episode.title}</span>
          </p>
        </div>
        <div className="relative mt-8 xl:mt-12">
          <EpisodePlayer
            title={episode.title}
            timeLabel={episode.timeLabel}
            progress={episode.progress}
            imageSrc={episode.coverSrc}
            imageAlt={episode.coverAlt}
          />
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-4 py-12 sm:px-6 md:px-8 md:py-16 xl:flex-row xl:items-start xl:gap-12 xl:px-[156px] xl:pt-[60px] xl:pb-20">
        <div className="flex min-w-0 flex-1 flex-col gap-12 xl:max-w-[710px]">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <p className="inline-flex w-fit items-center bg-[#33353F]/8 px-4 py-1.5 font-sans text-sm leading-[26px] font-normal text-[#231F20]">
                {episode.category}
              </p>
              <div className="flex flex-col gap-2">
                <h1 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#171616] xl:text-[40px] xl:leading-[56px]">
                  {episode.title}
                </h1>
                <p className="font-sans text-lg leading-[27px] font-normal tracking-[0.36px] text-[#23313C]">
                  {episode.meta}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <div className="h-px bg-[#33353F]" />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-4">
                  <button type="button" className={actionClassName}>
                    Share
                    <ActionIcon src="/podcast/episode/icons/share.svg" />
                  </button>
                  <button type="button" className={actionClassName}>
                    Save
                    <ActionIcon src="/podcast/episode/icons/save.svg" />
                  </button>
                  <button type="button" className={actionClassName}>
                    Like
                    <ActionIcon src="/podcast/episode/icons/like.svg" />
                  </button>
                </div>
                <button
                  type="button"
                  className="inline-flex h-11 cursor-pointer items-center gap-2.5 bg-[#33353F] px-5 font-sans text-base leading-[22px] font-normal text-white"
                >
                  Read transcript
                  <ActionIcon src="/podcast/episode/icons/transcript.svg" />
                </button>
              </div>
              <div className="h-px bg-[#33353F]" />
            </div>
            <p className="max-w-[703px] font-sans text-lg leading-[27px] font-normal tracking-[0.36px] text-[#23313C]">
              {episode.description}
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#33353F]">Chapters</h2>
            <ol className="border-y border-black/8">
              {chapters.map((chapter) => (
                <li key={chapter.time} className="border-b border-black/8 last:border-b-0">
                  <div className="flex items-center gap-6 py-[22px] sm:gap-14">
                    <span className="w-[4.5rem] shrink-0 font-sans text-base leading-[27px] font-normal text-[#33353F] sm:w-[100px]">
                      {chapter.time}
                    </span>
                    <span className="font-sans text-base leading-[27px] font-normal text-[#33353F]">{chapter.title}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="flex w-full flex-col gap-12 xl:w-[370px] xl:shrink-0">
          <div className="flex flex-col gap-4 bg-[#F3F4F9] p-5">
            <h2 className="font-sans text-2xl leading-10 font-normal tracking-[-1px] text-[#33353F]">Listen next</h2>
            <div className="flex flex-col gap-6">
              <ul className="flex flex-col gap-3">
                {listenNext.map((item, index) => (
                  <li key={`${item.imageSrc}-${index}`}>
                    <Link href={item.href} className="flex items-center gap-4 bg-white">
                      <img src={item.imageSrc} alt="" className="size-[120px] shrink-0 object-cover" />
                      <span className="flex min-w-0 flex-col gap-2 pr-3">
                        <span className="font-sans text-xs leading-6 font-normal text-[#222222]/85">{item.meta}</span>
                        <span className="font-sans text-base leading-5 font-medium tracking-[-0.32px] text-[#25282D]">
                          {item.title}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={podcastPage.allEpisodes.href}
                className="inline-flex h-11 w-fit items-center gap-2.5 bg-[#33353F] px-5 font-sans text-base leading-[22px] font-normal text-white"
              >
                {podcastPage.allEpisodes.label}
                <img src="/podcast/episode/icons/arrow-up-right.svg" alt="" width={20} height={20} />
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4 bg-[#33353F] p-5">
            <h2 className="font-sans text-2xl leading-10 font-normal tracking-[-1px] text-white">Subscribe on</h2>
            <ul className="flex flex-wrap gap-2">
              {subscribe.map((platform) => (
                <li key={platform.name}>
                  <a
                    href={platform.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 w-[105px] items-center justify-center bg-white px-5"
                  >
                    <img src={platform.logoSrc} alt={platform.name} width={platform.width} height={platform.height} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  )
}
