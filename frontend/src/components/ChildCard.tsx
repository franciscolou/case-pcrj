import Link from 'next/link'
import { AlertTriangle, CheckCircle, Heart, BookOpen, HeartHandshake } from 'lucide-react'
import { Child } from '@/types'
import { calcAge, hasAnyAlert } from '@/lib/utils'
import { AlertBadge } from './AlertBadge'
import { cn } from '@/lib/utils'

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

  return (
    <Link href={`/dashboard/criancas/${child.id}`}>
      <div
        className={cn(
          'bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 p-4 cursor-pointer group',
          hasAlert ? 'border-red-200' : 'border-gray-100'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {child.nome}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {age} {age === 1 ? 'ano' : 'anos'} · {child.bairro}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            {child.revisado && (
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            )}
            {hasAlert && !child.revisado && (
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Area presence */}
        <div className="flex gap-2 mb-3">
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

        {/* Alert badges */}
        {allAlerts.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {displayAlerts.map((alert) => (
              <AlertBadge key={alert} alert={alert} />
            ))}
            {extraAlerts > 0 && (
              <span className="text-xs text-gray-500 self-center">+{extraAlerts} mais</span>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">Sem alertas ativos</p>
        )}
      </div>
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
    <div
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
        !present
          ? 'bg-gray-100 text-gray-400'
          : alert
            ? 'bg-red-100 text-red-600'
            : 'bg-green-100 text-green-600'
      )}
      title={`${label}: ${!present ? 'sem dados' : alert ? 'com alertas' : 'ok'}`}
    >
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  )
}
