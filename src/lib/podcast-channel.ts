/** True when the episode's channel is active (or missing/unresolved — treat as visible). */
export function isPodcastChannelActive(
  channel: number | { active?: boolean | null } | null | undefined,
): boolean {
  if (channel == null || typeof channel === 'number') return true
  return channel.active !== false
}
