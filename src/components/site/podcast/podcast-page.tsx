'use client'

import { useState } from 'react'
import Link from 'next/link'

import { EpisodeBrief } from '@/components/site/podcast/episode-brief'
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
  metaTitle?: string
  metaDescription?: string
  coverSrc: string
  coverAlt: string
  mediaUrl?: string
  timeLabel: string
  progress: number
  /** Optional Guest / Topic / Duration block above About (admin-controlled). */
  details?: {
    guest?: string
    topic?: string
    duration?: string
  } | null
  about?: string
  summary?: string
  mainPoints?: string[]
  reading?: string
  agree?: { title: string; body: string }[]
  disagree?: { title: string; body: string }[]
  takeIntro?: string
  take?: { title: string; body: string }[]
  transcript?: { time: string; speaker: string; text: string }[]
  shareLabel: string
  saveLabel: string
  likeLabel: string
  transcriptLabel: string
  transcriptDialogTitle: string
  closeTranscriptLabel: string
  aboutTitle: string
  mainPointsTitle: string
  stanceTitle: string
  agreeTitle: string
  disagreeTitle: string
  takeTitle: string
  loadMoreLabel: string
  chaptersTitle: string
  chapters: { time: string; title: string }[]
  listenNextTitle: string
  listenNext: { meta: string; title: string; href: string; imageSrc: string }[]
  allEpisodesLabel: string
  allEpisodesHref: string
  subscribeTitle: string
  subscribe: { name: string; href: string; logoSrc: string; width: number; height: number }[]
}

const listenNextBatch = 3

function ListenNext({
  title,
  items,
  loadMoreLabel,
}: {
  title: string
  items: PodcastPageContent['listenNext']
  loadMoreLabel: string
}) {
  const [visibleCount, setVisibleCount] = useState(listenNextBatch)
  const visible = items.slice(0, visibleCount)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-sans text-xl leading-7 font-normal tracking-[-0.3px] text-[#171616]">
        {title}
      </h2>
      <ul className="flex flex-col gap-4">
        {visible.map((item, index) => (
          <li key={`${item.href}-${index}`}>
            <Link href={item.href} className="flex items-center gap-3">
              {item.imageSrc ? (
                <img src={item.imageSrc} alt="" className="size-16 shrink-0 object-cover" />
              ) : (
                <span className="size-16 shrink-0 bg-[#E4E6EA]" aria-hidden="true" />
              )}
              <span className="flex min-w-0 flex-col gap-1">
                <span className="font-sans text-[11px] leading-4 font-normal text-[#696969]">
                  {item.meta}
                </span>
                <span className="line-clamp-2 font-sans text-sm leading-5 font-medium tracking-[-0.16px] text-[#171616]">
                  {item.title}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {visibleCount < items.length && loadMoreLabel ? (
        <button
          type="button"
          onClick={() => setVisibleCount((count) => count + listenNextBatch)}
          className="mt-2 inline-flex h-11 w-full cursor-pointer items-center justify-between rounded-lg bg-[#F3F4F9] px-4 font-sans text-sm leading-5 font-normal text-[#0B1F3A] transition-colors duration-200 hover:bg-[#E6E9F2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B1F3A]"
        >
          {loadMoreLabel}
          <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
            <path
              d="M5 8.5 10 13.5 15 8.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  )
}

export function PodcastPage({ content }: { content: PodcastPageContent }) {
  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-8 pb-4 sm:px-6 md:px-8 md:pt-10 xl:px-14 xl:pt-12">
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
        <p className="mt-3 font-sans text-sm leading-5 font-normal text-[#696969]">
          {content.meta}
        </p>

        <div className="mt-8 grid items-start gap-10 xl:mt-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
          <div className="flex min-w-0 flex-col gap-10">
            <div className="flex flex-col gap-8">
              <EpisodePlayer
                title={content.title}
                timeLabel={content.timeLabel}
                progress={content.progress}
                imageSrc={content.coverSrc}
                imageAlt={content.coverAlt}
                mediaUrl={content.mediaUrl}
              />
              <EpisodeBrief
                title={content.title}
                shareLabel={content.shareLabel}
                saveLabel={content.saveLabel}
                likeLabel={content.likeLabel}
                transcriptLabel={content.transcriptLabel}
                transcriptDialogTitle={content.transcriptDialogTitle}
                closeTranscriptLabel={content.closeTranscriptLabel}
                aboutTitle={content.aboutTitle}
                mainPointsTitle={content.mainPointsTitle}
                stanceTitle={content.stanceTitle}
                agreeTitle={content.agreeTitle}
                disagreeTitle={content.disagreeTitle}
                takeTitle={content.takeTitle}
                details={content.details}
                about={content.about}
                summary={content.summary}
                mainPoints={content.mainPoints}
                reading={content.reading}
                agree={content.agree}
                disagree={content.disagree}
                takeIntro={content.takeIntro}
                take={content.take}
                transcript={content.transcript}
              />
            </div>
          </div>

          <aside className="flex w-full flex-col gap-10 xl:w-[340px]">
            {content.listenNext.length > 0 ? (
              <ListenNext
                title={content.listenNextTitle}
                items={content.listenNext}
                loadMoreLabel={content.loadMoreLabel}
              />
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  )
}
