import { parseBuffer } from 'music-metadata'

export function formatAudioDuration(seconds: number | null | undefined): string {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) return '—'
  const total = Math.max(1, Math.round(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const remaining = String(total % 60).padStart(2, '0')
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${remaining}`
  return `${minutes}:${remaining}`
}

export async function readAudioDuration(args: {
  buffer: Uint8Array
  mimeType?: string
  size?: number
}): Promise<number | null> {
  try {
    const metadata = await parseBuffer(args.buffer, {
      mimeType: args.mimeType,
      size: args.size ?? args.buffer.byteLength,
    })
    const duration = metadata.format.duration
    return typeof duration === 'number' && Number.isFinite(duration) && duration > 0
      ? duration
      : null
  } catch {
    return null
  }
}
