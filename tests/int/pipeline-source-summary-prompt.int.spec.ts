import { afterEach, describe, expect, it } from 'vitest'

import { generateSourceSummary } from '@/pipeline/generate-source-summary'
import type { GeminiGenerateFn } from '@/pipeline/generate-script'

describe('source-summary editable prompt composition', () => {
  afterEach(() => {
    delete process.env.GEMINI_API_KEY
  })

  it('combines fixed grounding rules with the edited brief and source data', async () => {
    process.env.GEMINI_API_KEY = 'test-key'
    let request = ''
    const generate: GeminiGenerateFn = async ({ prompt }) => {
      request = prompt
      return JSON.stringify({ sourceSummary: 'A grounded combined source summary.' })
    }
    await expect(
      generateSourceSummary(
        'Transcript content',
        'Prioritize evidence and explicitly compare conflicting claims.',
        generate,
      ),
    ).resolves.toBe('A grounded combined source summary.')
    expect(request).toContain('fixed requirements take priority')
    expect(request).toContain('Prioritize evidence')
    expect(request).toContain('<source_transcript>')
    expect(request).toContain('Transcript content')
  })
})
