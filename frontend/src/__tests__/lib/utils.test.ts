import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calcAge, formatDate, formatDateTime, hasAnyAlert } from '@/lib/utils'
import type { Child } from '@/types'

// ---- calcAge ----

describe('calcAge', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15'))
  })
  afterEach(() => vi.useRealTimers())

  it('returns correct age when birthday already passed this year', () => {
    expect(calcAge('2018-03-10')).toBe(7)
  })

  it('returns correct age when birthday has not passed yet this year', () => {
    expect(calcAge('2018-09-01')).toBe(6)
  })

  it('returns 0 for a newborn born this year', () => {
    expect(calcAge('2025-01-10')).toBe(0)
  })

  it('returns 1 on exact birthday', () => {
    expect(calcAge('2024-06-15')).toBe(1)
  })
})

// ---- formatDate ----

describe('formatDate', () => {
  it('formats a valid ISO date to pt-BR locale', () => {
    const result = formatDate('2024-03-15')
    // Check year and month; day may shift by timezone but year/month are stable
    expect(result).toMatch(/2024/)
    expect(result).toMatch(/03/)
  })

  it('returns "—" for null', () => {
    expect(formatDate(null)).toBe('—')
  })

  it('returns "—" for undefined', () => {
    expect(formatDate(undefined)).toBe('—')
  })
})

// ---- formatDateTime ----

describe('formatDateTime', () => {
  it('formats a valid ISO datetime string', () => {
    const result = formatDateTime('2024-03-15T14:30:00.000Z')
    expect(result).toMatch(/2024/)
  })

  it('returns "—" for null', () => {
    expect(formatDateTime(null)).toBe('—')
  })

  it('returns "—" for undefined', () => {
    expect(formatDateTime(undefined)).toBe('—')
  })
})

// ---- hasAnyAlert ----

const makeChild = (overrides: Partial<Child> = {}): Child => ({
  id: '1',
  nome: 'Teste',
  data_nascimento: '2018-01-01',
  bairro: 'Rocinha',
  responsavel: 'Responsável',
  saude: null,
  educacao: null,
  assistencia_social: null,
  revisado: false,
  revisado_por: null,
  revisado_em: null,
  ...overrides,
})

describe('hasAnyAlert', () => {
  it('returns false when all areas are null', () => {
    expect(hasAnyAlert(makeChild())).toBe(false)
  })

  it('returns false when all areas exist but have empty alertas arrays', () => {
    const child = makeChild({
      saude: { ultima_consulta: '2024-01-01', vacinas_em_dia: true, alertas: [] },
      educacao: { escola: 'Escola', frequencia_percent: 90, alertas: [] },
      assistencia_social: { cad_unico: true, beneficio_ativo: true, alertas: [] },
    })
    expect(hasAnyAlert(child)).toBe(false)
  })

  it('returns true when saude has alerts', () => {
    const child = makeChild({
      saude: { ultima_consulta: '2022-01-01', vacinas_em_dia: false, alertas: ['vacinas_atrasadas'] },
    })
    expect(hasAnyAlert(child)).toBe(true)
  })

  it('returns true when educacao has alerts', () => {
    const child = makeChild({
      educacao: { escola: 'Escola', frequencia_percent: 50, alertas: ['frequencia_baixa'] },
    })
    expect(hasAnyAlert(child)).toBe(true)
  })

  it('returns true when assistencia_social has alerts', () => {
    const child = makeChild({
      assistencia_social: { cad_unico: false, beneficio_ativo: false, alertas: ['beneficio_suspenso'] },
    })
    expect(hasAnyAlert(child)).toBe(true)
  })
})
