import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildApp } from '../../app'
import type { FastifyInstance } from 'fastify'

// DB module is not used by auth routes but is imported at module level by children/summary.
// Mocking it prevents SQLite from being touched during this test file.
vi.mock('../../db/index', () => ({
  getAllChildren: vi.fn(),
  getChildById: vi.fn(),
  updateChildReview: vi.fn(),
  rowToChild: vi.fn((r: unknown) => r),
  db: {},
}))

describe('POST /auth/token', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
    await app.ready()
  })

  afterAll(() => app.close())

  it('returns 200 with token and user for valid credentials', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/token',
      payload: { email: 'tecnico@prefeitura.rio', password: 'painel@2024' },
    })

    expect(res.statusCode).toBe(200)
    const body = res.json<{ token: string; user: { email: string; preferred_username: string } }>()
    expect(body.token).toBeTruthy()
    expect(body.user.email).toBe('tecnico@prefeitura.rio')
    expect(body.user.preferred_username).toBe('tecnico@prefeitura.rio')
  })

  it('returns a JWT that can be verified by the server', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/token',
      payload: { email: 'tecnico@prefeitura.rio', password: 'painel@2024' },
    })

    const { token } = res.json<{ token: string }>()
    const decoded = app.jwt.verify<{ sub: string; preferred_username: string }>(token)
    expect(decoded.sub).toBe('tecnico@prefeitura.rio')
    expect(decoded.preferred_username).toBe('tecnico@prefeitura.rio')
  })

  it('returns 401 for wrong password', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/token',
      payload: { email: 'tecnico@prefeitura.rio', password: 'wrong-password' },
    })

    expect(res.statusCode).toBe(401)
    expect(res.json().error).toBe('Credenciais inválidas')
  })

  it('returns 401 for wrong email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/token',
      payload: { email: 'outro@email.com', password: 'painel@2024' },
    })

    expect(res.statusCode).toBe(401)
    expect(res.json().error).toBe('Credenciais inválidas')
  })

  it('returns 400 when body is missing required fields', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/token',
      payload: { email: 'tecnico@prefeitura.rio' },
    })

    expect(res.statusCode).toBe(400)
  })
})
