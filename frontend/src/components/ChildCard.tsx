import Link from 'next/link'
import { AlertTriangle, CheckCircle, Heart, BookOpen, HeartHandshake } from 'lucide-react'
import { Child } from '@/types'
import { calcAge, hasAnyAlert } from '@/lib/utils'
import { AlertBadge } from './AlertBadge'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ChildCardProps {
  child: Child
}

export function ChildCard({ child }: ChildCardProps) {
  const age = calcAge(child.data_nascimento)
  const hasAlert = hasAnyAlert(child)
  const allAlerts = [
    ...(child.saude?.alertas ?? []),
    ...(child.educacao?.alertas ?? []),
    ...(child.assistencia_social?.alertas ?? []),
  ]
  const displayAlerts = allAlerts.slice(0, 3)
  const extraAlerts = allAlerts.length - displayAlerts.length

  const statusLabel = hasAlert
    ? `, ${allAlerts.length} alerta${allAlerts.length !== 1 ? 's' : ''} ativo${allAlerts.length !== 1 ? 's' : ''}`
    : ', sem alertas'
  const revisadoLabel = child.revisado ? ', revisado' : ''

  return (
    <Link
      href={`/dashboard/criancas/${child.id}`}
      aria-label={`Ver detalhes de ${child.nome}, ${age} ${age === 1 ? 'ano' : 'anos'}, ${child.bairro}${statusLabel}${revisadoLabel}`}
    >
      <Card
        className={cn(
          'hover:shadow-md transition-all duration-200 cursor-pointer group py-0 gap-0',
          hasAlert ? 'ring-red-200' : ''
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {child.nome}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {age} {age === 1 ? 'ano' : 'anos'} · {child.bairro}
              </p>
            </div>
            <div className="flex items-center gap-1 ml-2" aria-hidden="true">
              {child.revisado && (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
              {hasAlert && !child.revisado && (
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
            </div>
          </div>

          <div className="flex gap-2 mb-3" aria-hidden="true">
            <AreaIndicator
              icon={Heart}
              label="Saúde"
              present={child.saude !== null}
              alert={(child.saude?.alertas?.length ?? 0) > 0}
            />
            <AreaIndicator
              icon={BookOpen}
              label="Educação"
              present={child.educacao !== null}
              alert={(child.educacao?.alertas?.length ?? 0) > 0}
            />
            <AreaIndicator
              icon={HeartHandshake}
              label="Social"
              present={child.assistencia_social !== null}
              alert={(child.assistencia_social?.alertas?.length ?? 0) > 0}
            />
          </div>

          {allAlerts.length > 0 ? (
            <div className="flex flex-wrap gap-1" aria-hidden="true">
              {displayAlerts.map((alert) => (
                <AlertBadge key={alert} alert={alert} />
              ))}
              {extraAlerts > 0 && (
                <span className="text-xs text-gray-600 self-center">+{extraAlerts} mais</span>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-600 italic" aria-hidden="true">Sem alertas ativos</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

function AreaIndicator({
  icon: Icon,
  label,
  present,
  alert,
}: {
  icon: React.ElementType
  label: string
  present: boolean
  alert: boolean
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'h-auto rounded-full px-2 py-1 text-xs gap-1 border-transparent font-normal',
        !present
          ? 'bg-gray-100 text-gray-600 hover:bg-gray-100'
          : alert
            ? 'bg-red-100 text-red-600 hover:bg-red-100'
            : 'bg-green-100 text-green-600 hover:bg-green-100'
      )}
    >
      <Icon className="w-3 h-3" aria-hidden="true" />
      <span>{label}</span>
    </Badge>
  )
}
