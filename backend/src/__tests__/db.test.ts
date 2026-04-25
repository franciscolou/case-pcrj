import { describe, it, expect } from 'vitest'
import { rowToChild } from '../db/index'
import { childRowUnreviewed, childRowRevisado } from './fixtures'

describe('rowToChild', () => {
  it('converts revisado=0 to false', () => {
    const child = rowToChild(childRowUnreviewed)
    expect(child.revisado).toBe(false)
  })

  it('converts revisado=1 to true', () => {
    const child = rowToChild(childRowRevisado)
    expect(child.revisado).toBe(true)
  })

  it('parses saude JSON string into object', () => {
    const child = rowToChild(childRowUnreviewed)
    expect(child.saude).not.toBeNull()
    expect(child.saude?.vacinas_em_dia).toBe(false)
    expect(child.saude?.alertas).toContain('vacinas_atrasadas')
  })

  it('parses educacao JSON string into object', () => {
    const child = rowToChild(childRowUnreviewed)
    expect(child.educacao).not.toBeNull()
    expect(child.educacao?.frequencia_percent).toBe(60)
    expect(child.educacao?.alertas).toContain('frequencia_baixa')
  })

  it('parses assistencia_social JSON string into object', () => {
    const child = rowToChild(childRowUnreviewed)
    expect(child.assistencia_social).not.toBeNull()
    expect(child.assistencia_social?.beneficio_ativo).toBe(false)
    expect(child.assistencia_social?.alertas).toContain('beneficio_suspenso')
  })

  it('keeps null areas as null', () => {
    const child = rowToChild(childRowRevisado)
    expect(child.saude).toBeNull()
    expect(child.educacao).toBeNull()
    expect(child.assistencia_social).toBeNull()
  })

  it('preserves scalar fields unchanged', () => {
    const child = rowToChild(childRowUnreviewed)
    expect(child.id).toBe(childRowUnreviewed.id)
    expect(child.nome).toBe(childRowUnreviewed.nome)
    expect(child.bairro).toBe(childRowUnreviewed.bairro)
    expect(child.data_nascimento).toBe(childRowUnreviewed.data_nascimento)
    expect(child.responsavel).toBe(childRowUnreviewed.responsavel)
  })

  it('preserves revisado_por and revisado_em', () => {
    const child = rowToChild(childRowRevisado)
    expect(child.revisado_por).toBe('tecnico@prefeitura.rio')
    expect(child.revisado_em).toBe('2024-01-01T10:00:00.000Z')
  })
})
