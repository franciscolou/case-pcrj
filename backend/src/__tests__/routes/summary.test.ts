import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { buildApp } from '../../app'
import type { FastifyInstance } from 'fastify'
import { allTestChildren } from '../fixtures'

vi.mock('../../db/index', () => ({
  getAllChildren: vi.fn(),
  getChildById: vi.fn(),
  updateChildReview: vi.fn(),
  rowToChild: vi.fn((r: unknown) => r),
  db: {},
}))

import { getAllChildren } from '../../db/index'
const mockGetAll = vi.mocked(getAllChildren)

describe('GET /summary', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
    await app.ready()
  })

  afterAll(() => app.close())

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAll.mockReturnValue(allTestChildren as never)
  })

  it('returns correct total count', async () => {
    const res = await app.inject({ method: 'GET', url: '/summary' })

    expect(res.statusCode).toBe(200)
    expect(res.json().total).toBe(allTestChildren.length)
  })

  it('counts children with any alert (com_alertas.total)', async () => {
    const res = await app.inject({ method: 'GET', url: '/summary' })

    // childWithAllAlerts and childWithSaudeAlertOnly have alerts
    expect(res.json().com_alertas.total).toBe(2)
  })

  it('counts children with saude alerts', async () => {
    const res = await app.inject({ method: 'GET', url: '/summary' })

    // childWithAllAlerts (vacinas_atrasadas) and childWithSaudeAlertOnly (consulta_atrasada)
    expect(res.json().com_alertas.saude).toBe(2)
  })

  it('counts children with educacao alerts', async () => {
    const res = await app.inject({ method: 'GET', url: '/summary' })

    // childWithAllAlerts (frequencia_baixa)
    expect(res.json().com_alertas.educacao).toBe(1)
  })

  it('counts children with assistencia_social alerts', async () => {
    const res = await app.inject({ method: 'GET', url: '/summary' })

    // childWithAllAlerts (beneficio_suspenso)
    expect(res.json().com_alertas.assistencia_social).toBe(1)
  })

  it('counts revisadas children', async () => {
    const res = await app.inject({ method: 'GET', url: '/summary' })

    // childReviewed
    expect(res.json().revisadas).toBe(1)
  })

  it('counts sem_dados children (all areas null)', async () => {
    const res = await app.inject({ method: 'GET', url: '/summary' })

    // childWithNoData
    expect(res.json().sem_dados).toBe(1)
  })

  it('groups children correctly por_bairro', async () => {
    const res = await app.inject({ method: 'GET', url: '/summary' })

    const porBairro = res.json().por_bairro
    expect(porBairro['Rocinha']).toEqual({ total: 1, com_alertas: 1 })
    expect(porBairro['Maré']).toEqual({ total: 1, com_alertas: 0 })
    expect(porBairro['Jacarezinho']).toEqual({ total: 1, com_alertas: 0 })
    expect(porBairro['Mangueira']).toEqual({ total: 1, com_alertas: 0 })
    expect(porBairro['Complexo do Alemão']).toEqual({ total: 1, com_alertas: 1 })
  })

  it('returns empty summary for empty database', async () => {
    mockGetAll.mockReturnValue([])

    const res = await app.inject({ method: 'GET', url: '/summary' })

    const body = res.json()
    expect(body.total).toBe(0)
    expect(body.com_alertas.total).toBe(0)
    expect(body.revisadas).toBe(0)
    expect(body.sem_dados).toBe(0)
    expect(body.por_bairro).toEqual({})
  })
})
