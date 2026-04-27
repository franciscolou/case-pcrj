import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { buildApp } from '../../app'
import type { FastifyInstance } from 'fastify'
import {
  allTestChildren,
  childWithAllAlerts,
  childWithNoAlerts,
  childReviewed,
  childWithNoData,
} from '../fixtures'

vi.mock('../../db/index', () => ({
  getAllChildren: vi.fn(),
  getChildById: vi.fn(),
  updateChildReview: vi.fn(),
  rowToChild: vi.fn((r: unknown) => r),
  db: {},
}))

import { getAllChildren, getChildById, updateChildReview } from '../../db/index'
const mockGetAll = vi.mocked(getAllChildren)
const mockGetById = vi.mocked(getChildById)
const mockUpdateReview = vi.mocked(updateChildReview)

describe('GET /children', () => {
  let app: FastifyInstance
  let authToken: string

  beforeAll(async () => {
    app = await buildApp()
    await app.ready()

    const authRes = await app.inject({
      method: 'POST',
      url: '/auth/token',
      payload: { email: 'tecnico@prefeitura.rio', password: 'painel@2024' },
    })
    authToken = authRes.json<{ token: string }>().token
  })

  afterAll(() => app.close())

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAll.mockReturnValue(allTestChildren as never)
  })

  it('returns all children with default pagination', async () => {
    const res = await app.inject({ method: 'GET', url: '/children', headers: { Authorization: `Bearer ${authToken}` } })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data).toHaveLength(allTestChildren.length)
    expect(body.pagination.total).toBe(allTestChildren.length)
    expect(body.pagination.page).toBe(1)
  })

  it('filters by bairro (case-insensitive)', async () => {
    const res = await app.inject({ method: 'GET', url: '/children?bairro=rocinha', headers: { Authorization: `Bearer ${authToken}` } })

    const body = res.json()
    expect(body.data.every((c: { bairro: string }) => c.bairro.toLowerCase() === 'rocinha')).toBe(true)
    expect(body.pagination.total).toBe(1)
  })

  it('filters children with alertas=true', async () => {
    const res = await app.inject({ method: 'GET', url: '/children?alertas=true', headers: { Authorization: `Bearer ${authToken}` } })

    const body = res.json()
    // childWithAllAlerts and childWithSaudeAlertOnly have alerts
    expect(body.pagination.total).toBe(2)
    const ids = body.data.map((c: { id: string }) => c.id)
    expect(ids).toContain(childWithAllAlerts.id)
  })

  it('filters children with alertas=false', async () => {
    const res = await app.inject({ method: 'GET', url: '/children?alertas=false', headers: { Authorization: `Bearer ${authToken}` } })

    const body = res.json()
    // childWithNoAlerts, childReviewed, childWithNoData have no alerts
    expect(body.pagination.total).toBe(3)
    const ids = body.data.map((c: { id: string }) => c.id)
    expect(ids).toContain(childWithNoAlerts.id)
    expect(ids).not.toContain(childWithAllAlerts.id)
  })

  it('filters children with revisado=true', async () => {
    const res = await app.inject({ method: 'GET', url: '/children?revisado=true', headers: { Authorization: `Bearer ${authToken}` } })

    const body = res.json()
    expect(body.pagination.total).toBe(1)
    expect(body.data[0].id).toBe(childReviewed.id)
  })

  it('filters children with revisado=false', async () => {
    const res = await app.inject({ method: 'GET', url: '/children?revisado=false', headers: { Authorization: `Bearer ${authToken}` } })

    const body = res.json()
    expect(body.pagination.total).toBe(4)
    const ids = body.data.map((c: { id: string }) => c.id)
    expect(ids).not.toContain(childReviewed.id)
  })

  it('paginates results correctly', async () => {
    const res = await app.inject({ method: 'GET', url: '/children?page=2&limit=2', headers: { Authorization: `Bearer ${authToken}` } })

    const body = res.json()
    expect(body.data).toHaveLength(2)
    expect(body.pagination.page).toBe(2)
    expect(body.pagination.limit).toBe(2)
    expect(body.pagination.totalPages).toBe(3)
  })

  it('caps limit at 50', async () => {
    const res = await app.inject({ method: 'GET', url: '/children?limit=9999', headers: { Authorization: `Bearer ${authToken}` } })

    const body = res.json()
    expect(body.pagination.limit).toBe(50)
  })

  it('returns empty data for out-of-range page', async () => {
    const res = await app.inject({ method: 'GET', url: '/children?page=999', headers: { Authorization: `Bearer ${authToken}` } })

    const body = res.json()
    expect(body.data).toHaveLength(0)
    expect(body.pagination.total).toBe(allTestChildren.length)
  })
})

describe('GET /children/:id', () => {
  let app: FastifyInstance
  let authToken: string

  beforeAll(async () => {
    app = await buildApp()
    await app.ready()

    const authRes = await app.inject({
      method: 'POST',
      url: '/auth/token',
      payload: { email: 'tecnico@prefeitura.rio', password: 'painel@2024' },
    })
    authToken = authRes.json<{ token: string }>().token
  })

  afterAll(() => app.close())

  beforeEach(() => vi.clearAllMocks())

  it('returns child when found', async () => {
    mockGetById.mockReturnValue(childWithNoData as never)

    const res = await app.inject({ method: 'GET', url: `/children/${childWithNoData.id}`, headers: { Authorization: `Bearer ${authToken}` } })

    expect(res.statusCode).toBe(200)
    expect(res.json().id).toBe(childWithNoData.id)
    expect(res.json().nome).toBe(childWithNoData.nome)
  })

  it('returns 404 when child does not exist', async () => {
    mockGetById.mockReturnValue(undefined)

    const res = await app.inject({ method: 'GET', url: '/children/nonexistent-id', headers: { Authorization: `Bearer ${authToken}` } })

    expect(res.statusCode).toBe(404)
    expect(res.json().error).toBe('Criança não encontrada')
  })
})

describe('PATCH /children/:id/review', () => {
  let app: FastifyInstance
  let authToken: string

  beforeAll(async () => {
    app = await buildApp()
    await app.ready()

    // Obtain a real token via the auth route
    const authRes = await app.inject({
      method: 'POST',
      url: '/auth/token',
      payload: { email: 'tecnico@prefeitura.rio', password: 'painel@2024' },
    })
    authToken = authRes.json<{ token: string }>().token
  })

  afterAll(() => app.close())

  beforeEach(() => vi.clearAllMocks())

  it('returns 401 without Authorization header', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/children/${childWithAllAlerts.id}/review`,
    })

    expect(res.statusCode).toBe(401)
  })

  it('marks child as reviewed and returns updated child', async () => {
    mockGetById
      .mockReturnValueOnce(childWithAllAlerts as never) // existence check
      .mockReturnValueOnce({ ...childWithAllAlerts, revisado: true, revisado_por: 'tecnico@prefeitura.rio' } as never) // after update

    const res = await app.inject({
      method: 'PATCH',
      url: `/children/${childWithAllAlerts.id}/review`,
      headers: { Authorization: `Bearer ${authToken}` },
    })

    expect(res.statusCode).toBe(200)
    expect(mockUpdateReview).toHaveBeenCalledWith(
      childWithAllAlerts.id,
      'tecnico@prefeitura.rio',
      expect.any(String),
    )
    const body = res.json()
    expect(body.revisado).toBe(true)
  })

  it('returns 404 when child does not exist', async () => {
    mockGetById.mockReturnValue(undefined)

    const res = await app.inject({
      method: 'PATCH',
      url: '/children/nonexistent-id/review',
      headers: { Authorization: `Bearer ${authToken}` },
    })

    expect(res.statusCode).toBe(404)
    expect(res.json().error).toBe('Criança não encontrada')
  })
})
