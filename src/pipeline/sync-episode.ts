import type { PayloadRequest } from 'payload'

import { podcastEpisodePath, slugifyPodcastTitle } from '@/lib/podcast-slug'
import { parsePodcastVideoScript, type PodcastVideoScript } from '@/pipeline/script-schema'

type PointRow = { point?: string | null }

type PipelineLike = {
  id: number | string
  name?: string | null
  channel?: number | { id?: number } | null
  episode?: number | { id?: number } | null
  summary?: string | null
  transcript?: string | null
  scriptJson?: string | null
  videoLinks?: { url?: string | null }[] | null
  mainPoints?: PointRow[] | null
  contrastingPoints?: PointRow[] | null
  disagreementPoints?: PointRow[] | null
  systemOpinion?: string | null
}

type TranscriptLine = { time: string; speaker: string; text: string }

function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = seconds % 60
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
  }
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

function speakerLabel(role: 'host' | 'guest'): string {
  return role === 'host' ? 'Host' : 'Guest'
}

function parseStoredScript(raw: string | null | undefined): PodcastVideoScript | null {
  if (typeof raw !== 'string' || !raw.trim()) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    // Field stores the script object; tolerate a wrapped `{ script: ... }` envelope.
    const candidate =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'script' in parsed
        ? (parsed as { script: unknown }).script
        : parsed
    return parsePodcastVideoScript(candidate)
  } catch {
    return null
  }
}

function scriptToTranscriptLines(script: PodcastVideoScript): TranscriptLine[] {
  const lines: TranscriptLine[] = []
  let elapsed = 0

  for (const section of script.sections) {
    const turns = section.turns ?? []
    if (!turns.length) {
      elapsed += Math.max(0, section.durationHintSeconds || 0)
      continue
    }
    const span = Math.max(0, section.durationHintSeconds || 0)
    const step = span / turns.length
    turns.forEach((turn, index) => {
      lines.push({
        time: formatClock(elapsed + index * step),
        speaker: speakerLabel(turn.speaker),
        text: turn.text,
      })
    })
    elapsed += span
  }

  return lines
}

/** Prefer structured script.json turns — clean Host/Guest rows with section-based timestamps. */
export function mapScriptJsonToLines(raw: string | null | undefined): TranscriptLine[] {
  const script = parseStoredScript(raw)
  return script ? scriptToTranscriptLines(script) : []
}

function relationId(value: number | { id?: number } | null | undefined): number | null {
  if (typeof value === 'number') return value
  if (value && typeof value.id === 'number') return value.id
  return null
}

function mapMainPoints(items: PointRow[] | null | undefined) {
  return (items ?? []).flatMap((item) => {
    const point = typeof item?.point === 'string' ? item.point.trim() : ''
    return point ? [{ point }] : []
  })
}

/** Map pipeline point strings into episode agree/disagree rows (title + body). */
function mapPointRows(items: PointRow[] | null | undefined, label: string) {
  return (items ?? []).flatMap((item, index) => {
    const point = typeof item?.point === 'string' ? item.point.trim() : ''
    if (!point) return []
    return [{ title: `${label} ${index + 1}`, body: point }]
  })
}

const timedSpeakerLine =
  /^[\[(]?(\d{1,2}:\d{2}(?::\d{2})?)[\])]?\s*[-–—:]?\s*([^:]{1,80}?)\s*:\s*(.+)$/
const speakerLine = /^([^:]{1,60}?)\s*:\s*(.+)$/

/** Convert pipeline textarea transcript into episode transcript rows. */
export function mapTranscriptToLines(raw: string | null | undefined): TranscriptLine[] {
  const text = typeof raw === 'string' ? raw.trim() : ''
  if (!text) return []

  const lines: TranscriptLine[] = []

  for (const block of text.split(/\n{2,}/)) {
    const trimmedBlock = block.trim()
    if (!trimmedBlock) continue
    // Skip ## video URL section headers from the pipeline append format.
    if (/^##\s+\S/.test(trimmedBlock) && !trimmedBlock.includes('\n')) continue

    const rows = trimmedBlock
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    let buffer = ''

    const flushParagraph = () => {
      const body = buffer.trim()
      buffer = ''
      if (!body) return
      // Drop orphan section headers that landed in a multi-line block.
      if (/^##\s+\S/.test(body) && body.split('\n').length === 1) return
      lines.push({
        time: '—',
        speaker: 'Transcript',
        text: body.replace(/^##\s+\S+\s*\n+/, '').trim() || body,
      })
    }

    for (const row of rows) {
      if (/^##\s+\S/.test(row)) {
        flushParagraph()
        continue
      }

      const timed = row.match(timedSpeakerLine)
      if (timed) {
        flushParagraph()
        lines.push({ time: timed[1], speaker: timed[2].trim(), text: timed[3].trim() })
        continue
      }

      const spoken = row.match(speakerLine)
      if (spoken && !/^https?:\/\//i.test(spoken[1]) && spoken[1].split(' ').length <= 6) {
        flushParagraph()
        lines.push({ time: '—', speaker: spoken[1].trim(), text: spoken[2].trim() })
        continue
      }

      buffer = buffer ? `${buffer}\n${row}` : row
    }

    flushParagraph()
  }

  return lines
}

/** Create or update the public episode wired to a Pipeline podcast document. */
export async function syncPipelineToEpisode(
  req: PayloadRequest,
  doc: PipelineLike,
): Promise<number | null> {
  const title = typeof doc.name === 'string' ? doc.name.trim() : ''
  const channelId = relationId(doc.channel)
  if (!title || channelId == null) return null

  const slug = slugifyPodcastTitle(title) || `episode-${doc.id}`
  const summary = typeof doc.summary === 'string' ? doc.summary.trim() : ''
  const systemOpinion = typeof doc.systemOpinion === 'string' ? doc.systemOpinion.trim() : ''
  const mainPoints = mapMainPoints(doc.mainPoints)
  const agree = mapPointRows(doc.contrastingPoints, 'Agreement')
  const disagree = mapPointRows(doc.disagreementPoints, 'Disagreement')
  // Prefer script.json dialogue turns for the readable Host/Guest layout; fall back to raw transcript.
  const script = parseStoredScript(doc.scriptJson)
  const fromScript = script ? scriptToTranscriptLines(script) : []
  const transcript = fromScript.length > 0 ? fromScript : mapTranscriptToLines(doc.transcript)
  const meta =
    script && script.estimatedDurationSeconds > 0
      ? formatClock(script.estimatedDurationSeconds)
      : '—'

  const baseData = {
    channel: channelId,
    title,
    slug,
    href: podcastEpisodePath(slug),
    meta,
    guests: 'Host & Guest',
    summary,
    about: summary,
    mainPoints,
    agree,
    disagree,
    takeIntro: systemOpinion,
    transcript,
    featured: true,
    // Required by Payload create types; beforeChange bump assigns the next order when 0.
    sortOrder: 0,
  }

  async function updateEpisodePreservingGeneratedAudio(episodeId: number) {
    await req.payload.update({
      collection: 'podcast-episodes',
      id: episodeId,
      data: baseData,
      depth: 0,
      overrideAccess: true,
      req,
    })
    return episodeId
  }

  const existingId = relationId(doc.episode)
  if (existingId != null) {
    return updateEpisodePreservingGeneratedAudio(existingId)
  }

  const bySlug = await req.payload.find({
    collection: 'podcast-episodes',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  if (bySlug.docs[0]?.id) {
    return updateEpisodePreservingGeneratedAudio(bySlug.docs[0].id)
  }

  const created = await req.payload.create({
    collection: 'podcast-episodes',
    data: baseData,
    depth: 0,
    overrideAccess: true,
    req,
  })
  return typeof created.id === 'number' ? created.id : Number(created.id)
}
