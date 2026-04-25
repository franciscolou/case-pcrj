import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const alertConfig: Record<string, { label: string; className: string }> = {
  vacinas_atrasadas: {
    label: 'Vacinas atrasadas',
    className: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/50',
  },
  consulta_atrasada: {
    label: 'Consulta atrasada',
    className: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/50',
  },
  frequencia_baixa: {
    label: 'Frequência baixa',
    className: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/50',
  },
  matricula_pendente: {
    label: 'Matrícula pendente',
    className: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/50',
  },
  beneficio_suspenso: {
    label: 'Benefício suspenso',
    className: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/50',
  },
  cadastro_ausente: {
    label: 'Cadastro ausente',
    className: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/50',
  },
  cadastro_desatualizado: {
    label: 'Cadastro desatualizado',
    className: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/50',
  },
}

interface AlertBadgeProps {
  alert: string
  className?: string
}

export function AlertBadge({ alert, className }: AlertBadgeProps) {
  const config = alertConfig[alert] ?? {
    label: alert,
    className: 'bg-muted text-muted-foreground border-border hover:bg-muted',
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
