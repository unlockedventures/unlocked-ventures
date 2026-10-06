export type SpeakerGender = 'male' | 'female'
export type SpeakerRole = 'host' | 'guest'

export type PodcastSpeaker = {
  role: SpeakerRole
  gender: SpeakerGender
}

export type PodcastDialogueTurn = {
  speaker: SpeakerRole
  text: string
}

export type PodcastVideoSection = {
  id: string
  heading: string
  visualCue: string
  onScreenText: string
  durationHintSeconds: number
  turns: PodcastDialogueTurn[]
}

export type PodcastVideoScript = {
  format: 'podcast_video'
  title: string
  speakers: {
    host: PodcastSpeaker
    guest: PodcastSpeaker
  }
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

export function parseSpeakerGender(value: unknown, label: string): SpeakerGender {
  if (value !== 'male' && value !== 'female') {
    throw new ScriptValidationError(`${label} must be "male" or "female".`)
  }
  return value
}

function parseSpeaker(value: unknown, expectedRole: SpeakerRole): PodcastSpeaker {
  const row = asRecord(value)
  if (!row) throw new ScriptValidationError(`speakers.${expectedRole} must be an object.`)
  const role = asString(row.role)?.trim()
  if (role !== expectedRole) {
    throw new ScriptValidationError(`speakers.${expectedRole}.role must be "${expectedRole}".`)
  }
  return {
    role: expectedRole,
    gender: parseSpeakerGender(row.gender, `speakers.${expectedRole}.gender`),
  }
}

function parseTurn(value: unknown, sectionIndex: number, turnIndex: number): PodcastDialogueTurn {
  const row = asRecord(value)
  if (!row) {
    throw new ScriptValidationError(`sections[${sectionIndex}].turns[${turnIndex}] must be an object.`)
  }
  const speaker = asString(row.speaker)?.trim()
  const text = asString(row.text)?.trim()
  if (speaker !== 'host' && speaker !== 'guest') {
    throw new ScriptValidationError(
      `sections[${sectionIndex}].turns[${turnIndex}].speaker must be "host" or "guest".`,
    )
  }
  if (!text) {
    throw new ScriptValidationError(
      `sections[${sectionIndex}].turns[${turnIndex}].text must be a non-empty string.`,
    )
  }
  return { speaker, text }
}

function parseSection(value: unknown, index: number): PodcastVideoSection {
  const row = asRecord(value)
  if (!row) throw new ScriptValidationError(`sections[${index}] must be an object.`)

  if ('narration' in row) {
    throw new ScriptValidationError(
      `sections[${index}].narration is not allowed; use turns with host/guest speakers.`,
    )
  }

  const id = asString(row.id)?.trim()
  const heading = asString(row.heading)?.trim()
  const visualCue = asString(row.visualCue)?.trim()
  const onScreenText = asString(row.onScreenText)
  const durationHintSeconds = asNumber(row.durationHintSeconds)

  if (!id) throw new ScriptValidationError(`sections[${index}].id is required.`)
  if (!heading) throw new ScriptValidationError(`sections[${index}].heading is required.`)
  if (!visualCue) throw new ScriptValidationError(`sections[${index}].visualCue is required.`)
  if (onScreenText == null) {
    throw new ScriptValidationError(`sections[${index}].onScreenText must be a string.`)
  }
  if (durationHintSeconds == null || durationHintSeconds < 0) {
    throw new ScriptValidationError(`sections[${index}].durationHintSeconds must be a number.`)
  }
  if (!Array.isArray(row.turns) || row.turns.length === 0) {
    throw new ScriptValidationError(`sections[${index}].turns must be a non-empty array.`)
  }

  return {
    id,
    heading,
    visualCue,
    onScreenText,
    durationHintSeconds,
    turns: row.turns.map((turn, turnIndex) => parseTurn(turn, index, turnIndex)),
  }
}

export function parsePodcastVideoScript(value: unknown): PodcastVideoScript {
  const row = asRecord(value)
  if (!row) throw new ScriptValidationError('script must be an object.')

  const format = asString(row.format)
  const title = asString(row.title)?.trim()
  const estimatedWordCount = asNumber(row.estimatedWordCount)
  const estimatedDurationSeconds = asNumber(row.estimatedDurationSeconds)
  const speakers = asRecord(row.speakers)

  if (format !== 'podcast_video') {
    throw new ScriptValidationError('script.format must be "podcast_video".')
  }
  if (!title) throw new ScriptValidationError('script.title is required.')
  if (!speakers) throw new ScriptValidationError('script.speakers must be an object.')
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
    speakers: {
      host: parseSpeaker(speakers.host, 'host'),
      guest: parseSpeaker(speakers.guest, 'guest'),
    },
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

/** Force script speakers to match admin-selected genders. */
export function withAdminSpeakers(
  script: PodcastVideoScript,
  genders: { hostGender: SpeakerGender; guestGender: SpeakerGender },
): PodcastVideoScript {
  return {
    ...script,
    speakers: {
      host: { role: 'host', gender: genders.hostGender },
      guest: { role: 'guest', gender: genders.guestGender },
    },
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

export function isSpeakerGender(value: unknown): value is SpeakerGender {
  return value === 'male' || value === 'female'
}
