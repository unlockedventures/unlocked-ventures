import { expect, test } from '@playwright/test'

test.describe('Error pages', () => {
  test('an unknown public URL shows the full-screen missing page', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/this-page-does-not-exist')

    expect(response?.status()).toBe(404)
    await expect(page).toHaveTitle('Page not found')
    await expect(page.getByRole('heading', { name: 'This page is not available' })).toBeVisible()
    await expect(page.getByText('The address may be wrong, or the page may have moved.')).toBeVisible()
    await expect(page.getByRole('banner')).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Get in touch' })).toHaveCount(0)

    await page.getByRole('link', { name: 'Go home' }).click()

    await expect(page).toHaveURL('http://localhost:3000/')
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Welcome to your new project.' })).toBeVisible()
  })

  test('the admin not-found view is unchanged', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/not-a-real-admin-view')

    await expect(page.getByRole('heading', { name: 'This page is not available' })).toHaveCount(0)
  })
})
