import { parsePodcastVideoScript, type PodcastVideoScript } from '@/pipeline/script-schema'
import { mapScriptJsonToLines, mapTranscriptToLines } from '@/pipeline/sync-episode'

type PointRow = { point?: string | null }

type AiSource = {
  sourceTranscript?: string | null
  scriptJson?: string | null
  summary?: string | null
  systemOpinion?: string | null
  mainPoints?: PointRow[] | null
  contrastingPoints?: PointRow[] | null
  disagreementPoints?: PointRow[] | null
  videoLinks?: { url?: string | null }[] | null
}

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

function parseStoredScript(raw: string | null | undefined): PodcastVideoScript | null {
  if (typeof raw !== 'string' || !raw.trim()) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    const candidate =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'script' in parsed
        ? (parsed as { script: unknown }).script
        : parsed
    return parsePodcastVideoScript(candidate)
  } catch {
    return null
  }
}

function mapMainPoints(items: PointRow[] | null | undefined) {
  return (items ?? []).flatMap((item) => {
    const point = typeof item?.point === 'string' ? item.point.trim() : ''
    return point ? [{ point }] : []
  })
}

function mapPointRows(items: PointRow[] | null | undefined, label: string) {
  return (items ?? []).flatMap((item, index) => {
    const point = typeof item?.point === 'string' ? item.point.trim() : ''
    if (!point) return []
    return [{ title: `${label} ${index + 1}`, body: point }]
  })
}

/**
 * Map AI workspace fields onto public episode content fields (in-place, same row).
 * Returns a partial update; caller merges into beforeChange data.
 */
export function applyAiContentToEpisode(doc: AiSource): Record<string, unknown> {
  const summary = typeof doc.summary === 'string' ? doc.summary.trim() : ''
  const systemOpinion = typeof doc.systemOpinion === 'string' ? doc.systemOpinion.trim() : ''
  const mainPoints = mapMainPoints(doc.mainPoints)
  const agree = mapPointRows(doc.contrastingPoints, 'Agreement')
  const disagree = mapPointRows(doc.disagreementPoints, 'Disagreement')
  const script = parseStoredScript(doc.scriptJson)
  const fromScript = script ? mapScriptJsonToLines(doc.scriptJson) : []
  const transcript = fromScript.length > 0 ? fromScript : mapTranscriptToLines(doc.sourceTranscript)
  const meta =
    script && script.estimatedDurationSeconds > 0
      ? formatClock(script.estimatedDurationSeconds)
      : undefined

  const patch: Record<string, unknown> = {}
  if (summary) {
    patch.summary = summary
    patch.about = summary
  }
  if (mainPoints.length) patch.mainPoints = mainPoints
  if (agree.length) patch.agree = agree
  if (disagree.length) patch.disagree = disagree
  if (systemOpinion) patch.takeIntro = systemOpinion
  if (transcript.length) patch.transcript = transcript
  if (meta) patch.meta = meta
  return patch
}
