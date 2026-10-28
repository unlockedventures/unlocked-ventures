export type VoicePreviewRole = 'host' | 'guest'

const VOICE_PREVIEW_TEXT: Record<VoicePreviewRole, string> = {
  host: 'Welcome to the podcast. Today, we are exploring an idea worth discussing.',
  guest: 'Thank you for having me. I am excited to share a different perspective with you.',
}

export function isVoicePreviewRole(value: unknown): value is VoicePreviewRole {
  return value === 'host' || value === 'guest'
}

export function voicePreviewText(role: VoicePreviewRole) {
  return VOICE_PREVIEW_TEXT[role]
}
