/** Database smoke check using synthetic transcript results; no external AI calls. */
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { handleTranscribeRequest } from '../src/pipeline/run-transcription'
import type { PodcastEpisode } from '../src/payload-types'

const cfg = await config
const payload = await getPayload({ config: { ...cfg, onInit: undefined } })
let episodeId: number | undefined
try {
  const owner = (
    await payload.find({
      collection: 'users',
      where: { and: [{ isSuperAdmin: { equals: true } }, { active: { equals: true } }] },
      limit: 1,
    })
  ).docs[0]
  const channel = (await payload.find({ collection: 'podcast-channels', limit: 1 })).docs[0]
  assert(owner && channel, 'Requires an active Super Admin and a podcast channel.')
  const user = { ...owner, collection: 'users' as const }
  const firstUrl = 'https://vimeo.com/111111111'
  const secondUrl = 'https://vimeo.com/222222222'
  const slug = `transcription-smoke-${randomUUID()}`
  let episode = await payload.create({
    collection: 'podcast-episodes',
    user,
    overrideAccess: false,
    data: {
      title: `Transcription smoke ${randomUUID()}`,
      channel: channel.id,
      editorMode: 'ai',
      episodeStatus: 'draft',
      slug,
      href: `/podcast/${slug}`,
      sortOrder: 0,
      videoLinks: [{ url: firstUrl }],
    },
  })
  episodeId = episode.id
  const calls: string[] = []
  async function generate(doc: PodcastEpisode) {
    const result = await handleTranscribeRequest({
      user,
      doc: {
        id: doc.id,
        videoLinks: doc.videoLinks,
        transcript: doc.sourceTranscript,
        status: doc.status,
        scriptStatus: doc.scriptStatus,
      },
      otherProcessing: false,
      transcribe: async (url) => {
        calls.push(url)
        return { ok: true, transcript: `Synthetic transcript for ${url}` }
      },
      save: async (patch) => {
        await payload.update({
          collection: 'podcast-episodes',
          id: doc.id,
          user,
          overrideAccess: false,
          context: { transcriptionUpdate: true, skipAiContentSync: true },
          data: {
            videoLinks: patch.videoLinks,
            sourceTranscript: patch.transcript,
            status: patch.status,
            statusMessage: patch.statusMessage,
          },
        })
      },
    })
    assert.equal(result.status, 200)
    return payload.findByID({ collection: 'podcast-episodes', id: doc.id, depth: 0 })
  }
  episode = await generate(episode)
  assert.equal(episode.videoLinks?.[0].transcriptionStatus, 'completed')
  episode = await payload.update({
    collection: 'podcast-episodes',
    id: episode.id,
    user,
    overrideAccess: false,
    data: { videoLinks: [...episode.videoLinks!, { url: secondUrl }] },
  })
  assert.equal(episode.videoLinks?.[0].transcriptionStatus, 'completed')
  assert.equal(episode.videoLinks?.[1].transcriptionStatus, 'pending')
  calls.length = 0
  episode = await generate(episode)
  assert.deepEqual(calls, [secondUrl])
  assert(episode.videoLinks?.every((row) => row.transcriptionStatus === 'completed'))
  assert(episode.sourceTranscript?.includes(`Synthetic transcript for ${firstUrl}`))
  episode = await payload.update({
    collection: 'podcast-episodes',
    id: episode.id,
    user,
    overrideAccess: false,
    data: {
      videoLinks: [
        { ...episode.videoLinks![0], url: 'https://vimeo.com/333333333' },
        episode.videoLinks![1],
      ],
    },
  })
  assert.equal(episode.videoLinks?.[0].transcriptionStatus, 'pending')
  assert.equal(episode.videoLinks?.[0].videoTranscript, '')
  assert.equal(episode.videoLinks?.[1].transcriptionStatus, 'completed')
  console.log(
    'Per-video database checks passed: saved results, incremental generation, and URL reset.',
  )
} finally {
  if (episodeId)
    await payload.delete({ collection: 'podcast-episodes', id: episodeId, overrideAccess: true })
  await Promise.race([payload.destroy(), new Promise((resolve) => setTimeout(resolve, 1000))])
}
process.exit(0)
