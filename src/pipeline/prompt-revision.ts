/** Fast deterministic identity used only for prompt staleness, not security. */
function stableHash(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function podcastScriptPromptRevision(args: { sourceSummary: string }) {
  return `v2-${stableHash(JSON.stringify([args.sourceSummary.trim()]))}`
}
