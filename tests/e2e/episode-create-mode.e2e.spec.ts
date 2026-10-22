import { expect, test } from '@playwright/test'

// Use a disposable account with episode Read/Create access; never embed credentials.
const email = process.env.ADMIN_E2E_EMAIL
const password = process.env.ADMIN_E2E_PASSWORD

test.describe('Episode creation modes', () => {
  test.skip(
    !email || !password,
    'Set ADMIN_E2E_EMAIL and ADMIN_E2E_PASSWORD for an authorized test account.',
  )

  test.beforeEach(async ({ context }) => {
    const response = await context.request.post('http://localhost:3000/api/users/login', {
      data: { email, password },
    })
    expect(response.ok()).toBe(true)
  })

  test('Create with AI displays video input instead of manual audio input', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/collections/podcast-episodes')
    await page.getByText('Create with AI', { exact: true }).click()
    await expect(page).toHaveURL(/\/create\?mode=ai/)
    await expect(page.locator('#field-editorMode')).toContainText('AI')
    await expect(page.getByText('Video links', { exact: true })).toBeVisible()
    await expect(page.locator('input[type="file"][accept="image/*"]')).toBeVisible()
    await page.getByRole('radio', { name: 'Image URL', exact: true }).check()
    await expect(page.locator('#field-imageUrl')).toBeVisible()
    await expect(page.getByText('Audio URL', { exact: true })).not.toBeVisible()
  })

  test('Create Manually displays manual audio input instead of AI video input', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/admin/collections/podcast-episodes')
    await page.getByText('Create Manually', { exact: true }).click()
    await expect(page).toHaveURL(/\/create\?mode=manual/)
    await expect(page.locator('#field-editorMode')).toContainText('Manual')
    await expect(page.getByText('Audio URL', { exact: true })).toBeVisible()
    await expect(page.locator('input[type="file"][accept="image/*"]')).toBeVisible()
    await expect(page.getByText('Video links', { exact: true })).not.toBeVisible()
  })
})
