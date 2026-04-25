import { Page } from '@playwright/test'

export const CREDENTIALS = {
  email: 'tecnico@prefeitura.rio',
  password: 'painel@2024',
}

export async function loginViaUI(page: Page) {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(CREDENTIALS.email)
  await page.getByLabel('Senha').fill(CREDENTIALS.password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('**/dashboard', { timeout: 10_000 })
}

export async function loginViaAPI(page: Page) {
  const resp = await page.request.post('http://localhost:3001/auth/token', {
    data: CREDENTIALS,
  })
  const { token, user } = await resp.json()
  await page.addInitScript(
    ({ token, user }: { token: string; user: object }) => {
      localStorage.setItem('pcrj_token', token)
      localStorage.setItem('pcrj_user', JSON.stringify(user))
    },
    { token, user },
  )
}
