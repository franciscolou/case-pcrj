import { test, expect } from '@playwright/test'
import { loginViaAPI } from './helpers'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaAPI(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('displays summary cards', async ({ page }) => {
    // The summary card uses aria-label="<value> Total de Crianças"
    await expect(page.getByLabel(/Total de Crianças/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('has navigation links to main sections', async ({ page }) => {
    const nav = page.getByRole('navigation')
    await expect(nav).toBeVisible()
    // Nav links have role="listitem"; find by text within the role="list" container
    await expect(nav.getByRole('list').getByText('Crianças')).toBeVisible()
  })

  test('shows charts and map tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /Gráficos/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Mapa/i })).toBeVisible()
  })

  test('link to children list works', async ({ page }) => {
    // The button inside the banner card says "Ver lista"
    await page.getByRole('link', { name: /Ver lista/i }).click()
    await expect(page).toHaveURL(/\/dashboard\/criancas/)
  })
})
