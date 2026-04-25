import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AlertBadge } from '@/components/AlertBadge'

const KNOWN_ALERTS: Array<[string, string]> = [
  ['vacinas_atrasadas', 'Vacinas atrasadas'],
  ['consulta_atrasada', 'Consulta atrasada'],
  ['frequencia_baixa', 'Frequência baixa'],
  ['matricula_pendente', 'Matrícula pendente'],
  ['beneficio_suspenso', 'Benefício suspenso'],
  ['cadastro_ausente', 'Cadastro ausente'],
  ['cadastro_desatualizado', 'Cadastro desatualizado'],
]

describe('AlertBadge', () => {
  it.each(KNOWN_ALERTS)('renders label "%s" for alert key "%s"', (key, label) => {
    render(<AlertBadge alert={key} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('renders the raw key as label for unknown alert types', () => {
    render(<AlertBadge alert="alerta_desconhecido" />)
    expect(screen.getByText('alerta_desconhecido')).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    const { container } = render(<AlertBadge alert="vacinas_atrasadas" className="minha-classe" />)
    expect(container.firstChild).toHaveClass('minha-classe')
  })
})
