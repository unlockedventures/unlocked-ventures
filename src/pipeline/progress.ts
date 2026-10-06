/** Combine "video N of M" with the current video's 0–100 stage into an overall percent. */
export function overallTranscriptPercent(args: {
  statusMessage: string
  stagePercent: number | null
}) {
  const match = args.statusMessage.match(/video\s+(\d+)\s+of\s+(\d+)/i)
  if (!match) return null

  const current = Number(match[1])
  const total = Number(match[2])
  if (!Number.isFinite(current) || !Number.isFinite(total) || total < 1 || current < 1) {
    return null
  }

  const stage =
    args.stagePercent == null
      ? 0
      : Math.min(100, Math.max(0, Math.round(args.stagePercent)))

  return Math.min(99, Math.round((((current - 1) + stage / 100) / total) * 100))
}
