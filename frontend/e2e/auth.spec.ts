import { test, expect } from '@playwright/test'
import { CREDENTIALS, loginViaUI } from './helpers'

test.describe('Authentication', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('shows login form with email and password fields', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel('E-mail')).toBeVisible()
    await expect(page.getByLabel('Senha')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  })

  test('shows error message on wrong credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-mail').fill(CREDENTIALS.email)
    await page.getByLabel('Senha').fill('senha_errada')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
  })

  test('logs in and redirects to dashboard with valid credentials', async ({ page }) => {
    await loginViaUI(page)
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('already authenticated users are redirected away from login', async ({ page }) => {
    await loginViaUI(page)
    await page.goto('/login')
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
