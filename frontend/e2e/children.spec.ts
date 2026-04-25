import { test, expect } from '@playwright/test'
import { loginViaAPI } from './helpers'

test.describe('Children list', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaAPI(page)
    await page.goto('/dashboard/criancas')
    await page.waitForLoadState('networkidle')
  })

  test('shows the page heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Crianças' })).toBeVisible()
  })

  test('renders child cards', async ({ page }) => {
    // At least one child card should be present (links to detail)
    await expect(page.getByRole('link', { name: /anos/ }).first()).toBeVisible({ timeout: 10_000 })
  })

  test('filters by bairro', async ({ page }) => {
    const select = page.getByRole('combobox').first()
    await select.click()
    await page.getByRole('option', { name: 'Rocinha' }).click()
    await page.waitForLoadState('networkidle')
    // URL reflects the filter
    await expect(page).toHaveURL(/bairro=Rocinha/)
  })

  test('navigates to child detail on card click', async ({ page }) => {
    const firstCard = page.getByRole('link', { name: /anos/ }).first()
    await firstCard.click()
    await expect(page).toHaveURL(/\/dashboard\/criancas\//)
  })
})

test.describe('Child detail', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaAPI(page)
    // Navigate to list and click first child to get a real ID
    await page.goto('/dashboard/criancas')
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: /anos/ }).first().click()
    await expect(page).toHaveURL(/\/dashboard\/criancas\//)
    await page.waitForLoadState('networkidle')
  })

  test('shows child name and age', async ({ page }) => {
    // Child detail has name in heading area and age in years
    await expect(page.getByText(/anos/)).toBeVisible({ timeout: 10_000 })
  })

  test('shows health, education, and social sections', async ({ page }) => {
    await expect(page.getByRole('region', { name: /Saúde/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('region', { name: /Educação/i })).toBeVisible()
    await expect(page.getByRole('region', { name: /Assistência/i })).toBeVisible()
  })

  test('has a back button to return to list', async ({ page }) => {
    await page.getByRole('button', { name: /Voltar/i }).click()
    await expect(page).toHaveURL(/\/dashboard\/criancas$/)
  })

  test('can mark child as reviewed', async ({ page }) => {
    const reviewButton = page.getByRole('button', { name: /Marcar como revisado/i })
    // Only test if the button is present (child not yet reviewed)
    if (await reviewButton.isVisible()) {
      await reviewButton.click()
      await expect(page.getByText(/Revisado/i).first()).toBeVisible({ timeout: 5_000 })
    } else {
      // Already reviewed — check the reviewed badge exists
      await expect(page.getByText('Revisado')).toBeVisible()
    }
  })
})
