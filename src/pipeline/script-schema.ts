export type PodcastVideoSection = {
  id: string
  heading: string
  narration: string
  visualCue: string
  onScreenText: string
  durationHintSeconds: number
}

export type PodcastVideoScript = {
  format: 'podcast_video'
  title: string
  estimatedWordCount: number
  estimatedDurationSeconds: number
  sections: PodcastVideoSection[]
}

export type ScriptEnvelope = {
  script: PodcastVideoScript
  summary: string
  mainPoints: string[]
  contrastingPoints: string[]
  disagreementPoints: string[]
  systemOpinion: string
}

export type PointRow = { point: string }

export class ScriptValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ScriptValidationError'
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function asStringArray(value: unknown, label: string, max?: number): string[] {
  if (!Array.isArray(value)) {
    throw new ScriptValidationError(`${label} must be an array of strings.`)
  }
  const items = value.map((item, index) => {
    if (typeof item !== 'string' || item.trim() === '') {
      throw new ScriptValidationError(`${label} item ${index + 1} must be a non-empty string.`)
    }
    return item.trim()
  })
  if (max != null && items.length > max) {
    throw new ScriptValidationError(`${label} cannot have more than ${max} items.`)
  }
  return items
}

function parseSection(value: unknown, index: number): PodcastVideoSection {
  const row = asRecord(value)
  if (!row) throw new ScriptValidationError(`sections[${index}] must be an object.`)

  const id = asString(row.id)?.trim()
  const heading = asString(row.heading)?.trim()
  const narration = asString(row.narration)?.trim()
  const visualCue = asString(row.visualCue)?.trim()
  const onScreenText = asString(row.onScreenText)
  const durationHintSeconds = asNumber(row.durationHintSeconds)

  if (!id) throw new ScriptValidationError(`sections[${index}].id is required.`)
  if (!heading) throw new ScriptValidationError(`sections[${index}].heading is required.`)
  if (!narration) throw new ScriptValidationError(`sections[${index}].narration is required.`)
  if (!visualCue) throw new ScriptValidationError(`sections[${index}].visualCue is required.`)
  if (onScreenText == null) {
    throw new ScriptValidationError(`sections[${index}].onScreenText must be a string.`)
  }
  if (durationHintSeconds == null || durationHintSeconds < 0) {
    throw new ScriptValidationError(`sections[${index}].durationHintSeconds must be a number.`)
  }

  return {
    id,
    heading,
    narration,
    visualCue,
    onScreenText,
    durationHintSeconds,
  }
}

export function parsePodcastVideoScript(value: unknown): PodcastVideoScript {
  const row = asRecord(value)
  if (!row) throw new ScriptValidationError('script must be an object.')

  const format = asString(row.format)
  const title = asString(row.title)?.trim()
  const estimatedWordCount = asNumber(row.estimatedWordCount)
  const estimatedDurationSeconds = asNumber(row.estimatedDurationSeconds)

  if (format !== 'podcast_video') {
    throw new ScriptValidationError('script.format must be "podcast_video".')
  }
  if (!title) throw new ScriptValidationError('script.title is required.')
  if (estimatedWordCount == null || estimatedWordCount < 0) {
    throw new ScriptValidationError('script.estimatedWordCount must be a number.')
  }
  if (estimatedDurationSeconds == null || estimatedDurationSeconds < 0) {
    throw new ScriptValidationError('script.estimatedDurationSeconds must be a number.')
  }
  if (!Array.isArray(row.sections) || row.sections.length === 0) {
    throw new ScriptValidationError('script.sections must be a non-empty array.')
  }

  return {
    format: 'podcast_video',
    title,
    estimatedWordCount,
    estimatedDurationSeconds,
    sections: row.sections.map(parseSection),
  }
}

export function parseScriptEnvelope(value: unknown): ScriptEnvelope {
  const row = asRecord(value)
  if (!row) throw new ScriptValidationError('Response must be a JSON object.')

  const summary = asString(row.summary)?.trim()
  const systemOpinion = asString(row.systemOpinion)?.trim()
  if (!summary) throw new ScriptValidationError('summary is required.')
  if (!systemOpinion) throw new ScriptValidationError('systemOpinion is required.')

  return {
    script: parsePodcastVideoScript(row.script),
    summary,
    mainPoints: asStringArray(row.mainPoints, 'mainPoints', 10),
    contrastingPoints: asStringArray(row.contrastingPoints, 'contrastingPoints'),
    disagreementPoints: Array.isArray(row.disagreementPoints)
      ? row.disagreementPoints.length === 0
        ? []
        : asStringArray(row.disagreementPoints, 'disagreementPoints')
      : (() => {
          throw new ScriptValidationError('disagreementPoints must be an array of strings.')
        })(),
    systemOpinion,
  }
}

export function formatScriptJson(script: PodcastVideoScript): string {
  return JSON.stringify(script, null, 2)
}

export function toPointRows(points: string[]): PointRow[] {
  return points.map((point) => ({ point }))
}

export function fromPointRows(rows: { point?: string | null }[] | null | undefined): string[] {
  if (!Array.isArray(rows)) return []
  return rows
    .map((row) => (typeof row?.point === 'string' ? row.point.trim() : ''))
    .filter((point) => point !== '')
}
