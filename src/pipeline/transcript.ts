export function failureBody(reason: string) {
  return `Could not transcribe this video: ${reason}`
}

export function appendTranscript(current: string, url: string, body: string) {
  const block = `## ${url}\n\n${body.trim()}`
  const trimmed = current.trim()
  return trimmed ? `${trimmed}\n\n${block}` : block
}

/** Generated transcripts already carry a URL heading for each video's result. */
function transcriptBlocks(transcript: string) {
  const headings = [...transcript.matchAll(/^## (https?:\/\/[^\r\n]+)\r?$/gm)]
  return headings.map((heading, index) => ({
    url: heading[1].trim(),
    start: heading.index!,
    end: headings[index + 1]?.index ?? transcript.length,
    body: transcript.slice(heading.index! + heading[0].length, headings[index + 1]?.index).trim(),
  }))
}

/** Replace a failed/empty result when retrying, retaining every other video block. */
export function updateVideoTranscript(current: string, url: string, body: string): string {
  const block = transcriptBlocks(current).find((entry) => entry.url === url)
  if (!block) return appendTranscript(current, url, body)
  return [
    current.slice(0, block.start).trim(),
    `## ${url}\n\n${body.trim()}`,
    current.slice(block.end).trim(),
  ]
    .filter(Boolean)
    .join('\n\n')
}
