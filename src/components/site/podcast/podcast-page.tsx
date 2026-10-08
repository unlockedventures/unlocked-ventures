import Link from 'next/link'

import { EpisodePlayer } from '@/components/site/podcast/episode-player'

export type PodcastPageContent = {
  breadcrumbHomeLabel: string
  breadcrumbHomeHref: string
  breadcrumbPodcastLabel: string
  breadcrumbPodcastHref: string
  category: string
  title: string
  meta: string
  description: string
  coverSrc: string
  coverAlt: string
  timeLabel: string
  progress: number
  shareLabel: string
  saveLabel: string
  likeLabel: string
  transcriptLabel: string
  chaptersTitle: string
  chapters: { time: string; title: string }[]
  listenNextTitle: string
  listenNext: { meta: string; title: string; href: string; imageSrc: string }[]
  allEpisodesLabel: string
  allEpisodesHref: string
  subscribeTitle: string
  subscribe: { name: string; href: string; logoSrc: string; width: number; height: number }[]
}

const subscribeDescription = 'New episodes every Wednesday, about 25 minutes each.'

export function PodcastPage({ content }: { content: PodcastPageContent }) {
  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-8 pb-16 sm:px-6 md:px-8 md:pt-10 md:pb-20 xl:px-14 xl:pt-12 xl:pb-[100px]">
        <p className="font-sans text-sm leading-5 font-normal text-[#696969]">
          <Link href={content.breadcrumbHomeHref} className="hover:text-[#171616]">
            {content.breadcrumbHomeLabel}
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href={content.breadcrumbPodcastHref} className="hover:text-[#171616]">
            {content.breadcrumbPodcastLabel}
          </Link>
          <span aria-hidden="true"> / </span>
          <span className="text-[#171616]">{content.title}</span>
        </p>

        {content.category ? (
          <p className="mt-6 inline-flex w-fit items-center bg-[#F3F4F9] px-2.5 py-1 font-sans text-[11px] leading-4 font-medium tracking-[0.08em] text-[#33353F] uppercase">
            {content.category}
          </p>
        ) : null}

        <h1 className="mt-4 font-sans text-[2rem] leading-10 font-normal tracking-[-0.5px] text-[#171616] xl:text-[40px] xl:leading-[48px]">
          {content.title}
        </h1>
        <p className="mt-3 font-sans text-sm leading-5 font-normal text-[#696969]">{content.meta}</p>

        <div className="mt-8 grid items-start gap-10 xl:mt-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
          <div className="flex min-w-0 flex-col gap-10">
            <EpisodePlayer
              title={content.title}
              timeLabel={content.timeLabel}
              progress={content.progress}
              imageSrc={content.coverSrc}
              imageAlt={content.coverAlt}
            />

            {content.description ? (
              <p className="font-sans text-base leading-7 font-normal text-[#23313C]">{content.description}</p>
            ) : null}

            {content.chapters.length > 0 ? (
              <div className="flex flex-col gap-4">
                <h2 className="font-sans text-2xl leading-8 font-normal tracking-[-0.4px] text-[#171616]">
                  {content.chaptersTitle}
                </h2>
                <ol className="border-y border-[#171616]/10">
                  {content.chapters.map((chapter) => (
                    <li key={`${chapter.time}-${chapter.title}`} className="border-b border-[#171616]/10 last:border-b-0">
                      <div className="flex items-center gap-6 py-4 sm:gap-10">
                        <span className="w-[4.5rem] shrink-0 font-sans text-sm leading-5 font-normal text-[#696969] tabular-nums sm:w-[88px]">
                          {chapter.time}
                        </span>
                        <span className="font-sans text-base leading-6 font-normal text-[#171616]">{chapter.title}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>

          <aside className="flex w-full flex-col gap-10 xl:w-[340px]">
            {content.subscribe.length > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="font-sans text-xl leading-7 font-normal tracking-[-0.3px] text-[#171616]">
                  {content.subscribeTitle}
                </h2>
                <p className="font-sans text-sm leading-5 font-normal text-[#696969]">{subscribeDescription}</p>
              </div>
              <ul className="grid grid-cols-2 gap-2">
                {content.subscribe.map((platform) => (
                  <li key={platform.name}>
                    <a
                      href={platform.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 w-full items-center justify-center rounded-md border border-[#E4E6EA] bg-white px-3"
                    >
                      <img
                        src={platform.logoSrc}
                        alt={platform.name}
                        width={platform.width}
                        height={platform.height}
                        className="max-h-5 w-auto max-w-full object-contain"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            ) : null}

            {content.listenNext.length > 0 ? (
            <div className="flex flex-col gap-4">
              <h2 className="font-sans text-xl leading-7 font-normal tracking-[-0.3px] text-[#171616]">
                {content.listenNextTitle}
              </h2>
              <ul className="flex flex-col gap-4">
                {content.listenNext.map((item, index) => (
                  <li key={`${item.href}-${index}`}>
                    <Link href={item.href} className="flex items-center gap-3">
                      <img src={item.imageSrc} alt="" className="size-16 shrink-0 object-cover" />
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="font-sans text-[11px] leading-4 font-normal text-[#696969]">{item.meta}</span>
                        <span className="line-clamp-2 font-sans text-sm leading-5 font-medium tracking-[-0.16px] text-[#171616]">
                          {item.title}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={content.allEpisodesHref}
                className="inline-flex w-fit items-center gap-2 font-sans text-sm leading-5 font-normal text-[#171616]"
              >
                {content.allEpisodesLabel}
                <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
                  <path
                    d="M5.833 14.167 14.166 5.833M14.166 14.167V5.833H5.833"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  )
}
