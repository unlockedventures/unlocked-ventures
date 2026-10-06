export function failureBody(reason: string) {
  return `Could not transcribe this video: ${reason}`
}

export function appendTranscript(current: string, url: string, body: string) {
  const block = `## ${url}\n\n${body.trim()}`
  const trimmed = current.trim()
  return trimmed ? `${trimmed}\n\n${block}` : block
}
