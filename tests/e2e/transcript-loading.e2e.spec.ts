import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(
  fileURLToPath(
    new URL('../../src/components/admin/generate-podcast-skeleton.css', import.meta.url),
  ),
  'utf8',
)

test('transcription loading keeps the AI section and its controls visible', async ({ page }) => {
  // Reproduce Payload's nested .field-type wrappers without starting a paid AI job.
  await page.setContent(`
    <style>${css}</style>
    <form>
      <div class="field-type collapsible-field" data-testid="ai-section">
        <h2>Create with AI</h2>
        <div class="field-type array"><label>Video links<input value="https://example.com/video" /></label></div>
        <div class="field-type ui"><button disabled>Generate Transcript</button></div>
        <div class="field-type textarea"><label>Source transcript<textarea></textarea></label></div>
        <div class="field-type textarea" data-testid="summary-field"><label>Summary<textarea id="field-summary"></textarea></label></div>
        <div class="field-type ui"><div class="uv-podcast-skeleton" role="status">Generating the transcript…</div></div>
        <div class="field-type textarea" data-testid="script-field"><label>Script<textarea id="field-scriptJson"></textarea></label></div>
      </div>
    </form>
  `)
  await expect(page.getByTestId('summary-field')).toBeVisible()
  await page.locator('form').evaluate((form) => form.classList.add('uv-pipeline-transcribing'))
  await expect(page.getByTestId('ai-section')).toBeVisible()
  await expect(page.getByLabel('Video links')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Generate Transcript' })).toBeVisible()
  await expect(page.getByLabel('Source transcript')).toBeVisible()
  await expect(page.getByRole('status')).toBeVisible()
  await expect(page.getByTestId('summary-field')).toBeHidden()
  await expect(page.getByTestId('script-field')).toBeHidden()
  await page.locator('form').evaluate((form) => form.classList.remove('uv-pipeline-transcribing'))
  await expect(page.getByTestId('summary-field')).toBeVisible()
  await expect(page.getByTestId('script-field')).toBeVisible()
})
