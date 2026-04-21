import { cn } from '@/lib/utils'

const alertConfig: Record<string, { label: string; className: string }> = {
  vacinas_atrasadas: {
    label: 'Vacinas atrasadas',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  consulta_atrasada: {
    label: 'Consulta atrasada',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  frequencia_baixa: {
    label: 'Frequência baixa',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  matricula_pendente: {
    label: 'Matrícula pendente',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  beneficio_suspenso: {
    label: 'Benefício suspenso',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  cadastro_ausente: {
    label: 'Cadastro ausente',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  cadastro_desatualizado: {
    label: 'Cadastro desatualizado',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
}

interface AlertBadgeProps {
  alert: string
  className?: string
}

export function AlertBadge({ alert, className }: AlertBadgeProps) {
  const config = alertConfig[alert] ?? {
    label: alert,
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
