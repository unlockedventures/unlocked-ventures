import { describe, expect, it } from 'vitest'

import {
  generatePodcastScriptPrompt,
  generateSourceSummaryPrompt,
} from '@/pipeline/generate-editor-prompts'
import { podcastScriptPromptRevision } from '@/pipeline/prompt-revision'
import { MAX_EDITOR_PROMPT_LENGTH, validateEditorPrompt } from '@/pipeline/prompt-constraints'
import type { GeminiGenerateFn } from '@/pipeline/generate-script'

describe('editable Gemini prompt drafting', () => {
  it('asks Gemini for a prompt rather than source-summary output', async () => {
    let request = ''
    const generate: GeminiGenerateFn = async ({ prompt }) => {
      request = prompt
      return JSON.stringify({ prompt: 'Focus on evidence and tensions.' })
    }
    await expect(
      generateSourceSummaryPrompt({ transcript: 'Untrusted transcript', apiKey: 'key', generate }),
    ).resolves.toBe('Focus on evidence and tensions.')
    expect(request).toContain('Do not summarize the source yourself')
    expect(request).toContain('<source_transcript>')
  })

  it('drafts a script brief from the source summary', async () => {
    let request = ''
    const generate: GeminiGenerateFn = async ({ prompt }) => {
      request = prompt
      return JSON.stringify({ prompt: 'Use a curious, practical tone.' })
    }
    await expect(
      generatePodcastScriptPrompt({
        sourceSummary: 'Current summary',
        apiKey: 'key',
        generate,
      }),
    ).resolves.toBe('Use a curious, practical tone.')
    expect(request).toContain('<source_summary>')
    expect(request).not.toMatch(/gender/i)
  })

  it('rejects malformed or empty prompt output', async () => {
    await expect(
      generateSourceSummaryPrompt({
        transcript: 'Source',
        apiKey: 'key',
        generate: async () => JSON.stringify({ prompt: '  ' }),
      }),
    ).rejects.toThrow('Generate or enter a prompt first')
  })

  it('changes the script prompt revision with the summary', () => {
    const base = podcastScriptPromptRevision({ sourceSummary: 'Summary A' })
    expect(podcastScriptPromptRevision({ sourceSummary: ' Summary A ' })).toBe(base)
    expect(podcastScriptPromptRevision({ sourceSummary: 'Summary B' })).not.toBe(base)
  })

  it('rejects an oversized editor prompt without truncating it', () => {
    expect(validateEditorPrompt('x'.repeat(MAX_EDITOR_PROMPT_LENGTH + 1))).toEqual({
      error: 'Prompt must be 8,000 characters or fewer.',
    })
  })
})
