/** Read video URLs from Payload admin form state (array rows + nested paths). */
export function collectVideoLinksFromForm(
  fields: Record<string, { value?: unknown; rows?: unknown[] } | undefined>,
): string[] {
  const rows = fields.videoLinks?.rows
  if (!Array.isArray(rows) || rows.length === 0) return []

  const urls: string[] = []
  for (let index = 0; index < rows.length; index += 1) {
    const url = fields[`videoLinks.${index}.url`]?.value
    if (typeof url === 'string' && url.trim() !== '') urls.push(url.trim())
  }
  return urls
}
