import type { Payload } from 'payload'

import { podcastPage } from '@/data/podcast-page'
import { uploadPublicFile } from '@/data/upload-public-file'

const episodeBrief = {
  about:
    'AI is already writing code, answering support tickets and drafting legal briefs. Three voices argue about what that means for the next ten years of work: which roles shrink, which grow, and which skills will still be worth paying for. We look at entry-level jobs, the rise of AI agents in business teams, and what workers in fast-growing markets like South Asia should do differently.',
  reading:
    'Our reading of the arguments presented in this episode highlights the key ideas, perspectives, and reasoning discussed throughout the conversation, offering a thoughtful interpretation of the main insights and viewpoints.',
  agree: [
    {
      title: 'Tasks disappear faster than jobs',
      body: 'Most roles will be reshaped long before they are removed. The work inside the job changes first.',
    },
    {
      title: 'Entry-level work is most exposed',
      body: 'Junior tasks like first drafts, data cleanup and basic QA are exactly what AI does well today.',
    },
    {
      title: 'Judgment becomes the premium skill',
      body: 'Knowing what to ask, what to trust and what to ship matters more when output is cheap.',
    },
  ],
  disagree: [
    {
      title: '“Everyone should learn to code”',
      body: 'Coding alone is losing value. Domain knowledge paired with AI tools is the stronger bet.',
    },
    {
      title: '“New jobs will replace old ones automatically”',
      body: 'They may, but not for the same people or in the same places without deliberate retraining.',
    },
    {
      title: '“Creative work is safe”',
      body: 'Creative roles are changing as fast as any other. Taste is safer; production work is not.',
    },
  ],
  takeIntro:
    "The safest career move isn't avoiding AI. It's becoming the person on your team who knows how to put it to work. Here is what we'd do this year.",
  take: [
    {
      title: 'Map your week',
      body: 'List the tasks you repeat every week and mark which ones an AI tool could draft for you today.',
    },
    {
      title: 'Pick one tool and go deep',
      body: 'Use one assistant daily for a month instead of trying ten. Depth beats a long tool list.',
    },
    {
      title: 'Show the result, not the tool',
      body: 'Share one workflow you sped up with your manager or clients. Measurable time saved is your new portfolio.',
    },
  ],
  transcript: [
    {
      time: '0:00',
      speaker: 'Saker Ghani',
      text: 'AI is already writing code, answering support tickets, and drafting legal briefs. Today we ask what that means for the next ten years of work: which roles shrink, which grow, and which skills will still be worth paying for.',
    },
    {
      time: '2:14',
      speaker: 'Maya Chen',
      text: 'The first thing I want to separate is tasks and jobs. Most roles will be reshaped long before they are removed. The work inside the job changes first. A title can stay on the org chart while the day-to-day work is already different.',
    },
    {
      time: '6:40',
      speaker: 'Omar Hassan',
      text: 'Entry-level work is the most exposed. First drafts, data cleanup, and basic QA are exactly what these tools do well today. If your first two years were built on that work, you need a new way to become useful.',
    },
    {
      time: '11:05',
      speaker: 'Saker Ghani',
      text: 'A line we keep hearing is that everyone should learn to code. I do not think that is the bet. Coding alone is losing value. Domain knowledge paired with AI tools is the stronger position.',
    },
    {
      time: '16:22',
      speaker: 'Maya Chen',
      text: 'Judgment becomes the premium skill. Knowing what to ask, what to trust, and what to ship matters more when output is cheap. Taste and review are harder to automate than production.',
    },
    {
      time: '21:48',
      speaker: 'Omar Hassan',
      text: 'People say new jobs will replace old ones automatically. They may, but not for the same people or in the same places without deliberate retraining. Waiting for the market to sort itself out is not a plan.',
    },
    {
      time: '27:10',
      speaker: 'Maya Chen',
      text: 'Creative work is not a safe harbor either. Creative roles are changing as fast as any other. Taste is safer. Production work is not.',
    },
    {
      time: '32:36',
      speaker: 'Saker Ghani',
      text: 'The safest career move is not avoiding AI. It is becoming the person on your team who knows how to put it to work. Map the tasks you repeat, pick one tool and use it daily, and show the result. Measurable time saved is the new portfolio.',
    },
  ],
}

export async function seedPodcastPage(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'podcast-page' })
  if (current.title) {
    if (!current.about) {
      await payload.updateGlobal({
        slug: 'podcast-page',
        data: episodeBrief,
      })
    }
    return
  }

  const cover = await uploadPublicFile(payload, podcastPage.episode.coverSrc, podcastPage.episode.coverAlt)
  const listenNext = await Promise.all(
    podcastPage.listenNext.map(async (item) => {
      const image = await uploadPublicFile(payload, item.imageSrc, item.title)
      return { meta: item.meta, title: item.title, href: item.href, image: image.id }
    }),
  )
  const subscribe = await Promise.all(
    podcastPage.subscribe.map(async (platform) => {
      const logo = await uploadPublicFile(payload, platform.logoSrc, platform.name)
      return {
        name: platform.name,
        href: platform.href,
        logo: logo.id,
        width: platform.width,
        height: platform.height,
      }
    }),
  )

  await payload.updateGlobal({
    slug: 'podcast-page',
    data: {
      breadcrumbHomeLabel: podcastPage.breadcrumb.home.label,
      breadcrumbHomeHref: podcastPage.breadcrumb.home.href,
      breadcrumbPodcastLabel: podcastPage.breadcrumb.podcast.label,
      breadcrumbPodcastHref: podcastPage.breadcrumb.podcast.href,
      category: podcastPage.episode.category,
      title: podcastPage.episode.title,
      meta: podcastPage.episode.meta,
      description: podcastPage.episode.description,
      cover: cover.id,
      coverAlt: podcastPage.episode.coverAlt,
      timeLabel: podcastPage.episode.timeLabel,
      progress: podcastPage.episode.progress,
      shareLabel: 'Share',
      saveLabel: 'Save',
      likeLabel: 'Like',
      transcriptLabel: 'Read transcript',
      transcriptDialogTitle: 'Transcript',
      closeTranscriptLabel: 'Close transcript',
      aboutTitle: 'About this episode',
      mainPointsTitle: 'Main points',
      stanceTitle: "Where we agree and where we don't",
      agreeTitle: 'We agree',
      disagreeTitle: 'We disagree',
      takeTitle: 'The Unlocked Ventures take',
      loadMoreLabel: 'Load more',
      ...episodeBrief,
      chaptersTitle: 'Chapters',
      chapters: podcastPage.chapters,
      listenNextTitle: 'Listen next',
      listenNext,
      allEpisodesLabel: podcastPage.allEpisodes.label,
      allEpisodesHref: podcastPage.allEpisodes.href,
      subscribeTitle: 'Subscribe on',
      subscribe,
    },
  })
}
