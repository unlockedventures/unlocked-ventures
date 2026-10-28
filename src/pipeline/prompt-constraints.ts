export const MAX_EDITOR_PROMPT_LENGTH = 8_000

export function validateEditorPrompt(value: unknown) {
  const prompt = typeof value === 'string' ? value.trim() : ''
  if (!prompt) return { error: 'Generate or enter a prompt first.' } as const
  if (prompt.length > MAX_EDITOR_PROMPT_LENGTH) {
    return {
      error: `Prompt must be ${MAX_EDITOR_PROMPT_LENGTH.toLocaleString()} characters or fewer.`,
    } as const
  }
  return { prompt } as const
}
