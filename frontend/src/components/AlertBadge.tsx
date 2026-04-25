import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const alertConfig: Record<string, { label: string; className: string }> = {
  vacinas_atrasadas: {
    label: 'Vacinas atrasadas',
    className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
  },
  consulta_atrasada: {
    label: 'Consulta atrasada',
    className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
  },
  frequencia_baixa: {
    label: 'Frequência baixa',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
  },
  matricula_pendente: {
    label: 'Matrícula pendente',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
  },
  beneficio_suspenso: {
    label: 'Benefício suspenso',
    className: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100',
  },
  cadastro_ausente: {
    label: 'Cadastro ausente',
    className: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100',
  },
  cadastro_desatualizado: {
    label: 'Cadastro desatualizado',
    className: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100',
  },
}

interface AlertBadgeProps {
  alert: string
  className?: string
}

export function AlertBadge({ alert, className }: AlertBadgeProps) {
  const config = alertConfig[alert] ?? {
    label: alert,
    className: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100',
  }
  return (
    <Badge
      variant="outline"
      className={cn('h-auto rounded-full px-2 py-0.5 text-xs font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
