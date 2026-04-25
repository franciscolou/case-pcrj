import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChildCard } from '@/components/ChildCard'
import type { Child } from '@/types'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) =>
    <a href={href} {...props}>{children}</a>,
}))

const makeChild = (overrides: Partial<Child> = {}): Child => ({
  id: 'c-001',
  nome: 'Ana Teste',
  data_nascimento: '2018-03-10',
  bairro: 'Rocinha',
  responsavel: 'Maria Teste',
  saude: { ultima_consulta: '2024-01-01', vacinas_em_dia: true, alertas: [] },
  educacao: { escola: 'CIEP Teste', frequencia_percent: 85, alertas: [] },
  assistencia_social: { cad_unico: true, beneficio_ativo: true, alertas: [] },
  revisado: false,
  revisado_por: null,
  revisado_em: null,
  ...overrides,
})

describe('ChildCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15'))
  })

  it('renders the child name', () => {
    render(<ChildCard child={makeChild()} />)
    expect(screen.getByText('Ana Teste')).toBeInTheDocument()
  })

  it('renders the bairro', () => {
    render(<ChildCard child={makeChild()} />)
    expect(screen.getByText(/Rocinha/)).toBeInTheDocument()
  })

  it('renders the calculated age', () => {
    render(<ChildCard child={makeChild({ data_nascimento: '2018-03-10' })} />)
    expect(screen.getByText(/7 anos/)).toBeInTheDocument()
  })

  it('links to the correct child detail URL', () => {
    render(<ChildCard child={makeChild({ id: 'c-123' })} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/dashboard/criancas/c-123')
  })

  it('shows "Sem alertas ativos" when child has no alerts', () => {
    render(<ChildCard child={makeChild()} />)
    expect(screen.getByText('Sem alertas ativos')).toBeInTheDocument()
  })

  it('shows alert badges when child has alerts', () => {
    const child = makeChild({
      saude: { ultima_consulta: '2022-01-01', vacinas_em_dia: false, alertas: ['vacinas_atrasadas'] },
    })
    render(<ChildCard child={child} />)
    expect(screen.getByText('Vacinas atrasadas')).toBeInTheDocument()
  })

  it('shows "+N mais" when there are more than 3 alerts', () => {
    const child = makeChild({
      saude: { ultima_consulta: '2022-01-01', vacinas_em_dia: false, alertas: ['vacinas_atrasadas', 'consulta_atrasada'] },
      educacao: { escola: null, frequencia_percent: 50, alertas: ['frequencia_baixa', 'matricula_pendente'] },
    })
    render(<ChildCard child={child} />)
    expect(screen.getByText(/\+1 mais/)).toBeInTheDocument()
  })

  it('has accessible aria-label describing the child', () => {
    render(<ChildCard child={makeChild()} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-label', expect.stringContaining('Ana Teste'))
    expect(link).toHaveAttribute('aria-label', expect.stringContaining('Rocinha'))
  })
})
