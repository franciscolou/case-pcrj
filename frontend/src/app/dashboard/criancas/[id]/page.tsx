'use client'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Heart,
  BookOpen,
  HeartHandshake,
  CheckCircle,
  AlertTriangle,
  User,
  MapPin,
  Calendar,
  ClipboardCheck,
} from 'lucide-react'
import { useChild } from '@/hooks/useChild'
import { useReview } from '@/hooks/useReview'
import { AlertBadge } from '@/components/AlertBadge'
import { calcAge, formatDate, formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

function AreaCard({
  title,
  icon: Icon,
  children,
  hasData,
  alertCount,
  color,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  hasData: boolean
  alertCount: number
  color: string
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border shadow-sm',
        alertCount > 0 ? 'border-red-200' : 'border-gray-100'
      )}
    >
      <div
        className={cn(
          'px-5 py-4 flex items-center gap-3 rounded-t-xl border-b',
          alertCount > 0
            ? 'border-red-100 bg-red-50'
            : 'border-gray-100 bg-gray-50'
        )}
      >
        <div className={cn('p-1.5 rounded-lg', color)}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {!hasData && (
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            Sem dados
          </span>
        )}
        {hasData && alertCount > 0 && (
          <span className="ml-auto flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            {alertCount} alerta{alertCount !== 1 ? 's' : ''}
          </span>
        )}
        {hasData && alertCount === 0 && (
          <span className="ml-auto flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Ok
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 text-right">{value}</span>
    </div>
  )
}

export default function ChildDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: child, isLoading, isError } = useChild(id)
  const { mutate: review, isPending: isReviewing } = useReview(id)

  if (isLoading) {
    return (
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 h-32 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !child) {
    return (
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <div className="text-center py-16">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-gray-700 font-medium">Criança não encontrada</h3>
          <p className="text-gray-400 text-sm mt-1">Verifique o ID e tente novamente</p>
        </div>
      </div>
    )
  }

  const age = calcAge(child.data_nascimento)
  const allAreas = [child.saude, child.educacao, child.assistencia_social]
  const allNull = allAreas.every((a) => a === null)
  const totalAlerts =
    (child.saude?.alertas?.length ?? 0) +
    (child.educacao?.alertas?.length ?? 0) +
    (child.assistencia_social?.alertas?.length ?? 0)

  return (
    <div className="max-w-4xl">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para a lista
      </button>

      {/* Child header card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{child.nome}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {formatDate(child.data_nascimento)} · {age} {age === 1 ? 'ano' : 'anos'}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                {child.bairro}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <User className="w-4 h-4" />
                {child.responsavel}
              </span>
            </div>
          </div>

          {/* Review status / button */}
          <div className="shrink-0">
            {child.revisado ? (
              <div className="flex flex-col items-end gap-1">
                <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Revisado
                </span>
                <span className="text-xs text-gray-400">
                  por {child.revisado_por} em {formatDateTime(child.revisado_em)}
                </span>
              </div>
            ) : (
              <button
                onClick={() => review()}
                disabled={isReviewing}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {isReviewing ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ClipboardCheck className="w-4 h-4" />
                )}
                {isReviewing ? 'Salvando...' : 'Marcar como revisado'}
              </button>
            )}
          </div>
        </div>

        {/* Overall status */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {totalAlerts > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                <AlertTriangle className="w-3.5 h-3.5" />
                {totalAlerts} alerta{totalAlerts !== 1 ? 's' : ''} ativo
                {totalAlerts !== 1 ? 's' : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <CheckCircle className="w-3.5 h-3.5" />
                Sem alertas ativos
              </span>
            )}
            {allNull && (
              <span className="inline-flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5" />
                Nenhuma área com dados cadastrados
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Area cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Saúde */}
        <AreaCard
          title="Saúde"
          icon={Heart}
          hasData={child.saude !== null}
          alertCount={child.saude?.alertas?.length ?? 0}
          color="bg-red-100 text-red-600"
        >
          {child.saude ? (
            <div>
              <InfoRow
                label="Última consulta"
                value={formatDate(child.saude.ultima_consulta)}
              />
              <InfoRow
                label="Vacinas"
                value={
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      child.saude.vacinas_em_dia
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    )}
                  >
                    {child.saude.vacinas_em_dia ? 'Em dia' : 'Atrasadas'}
                  </span>
                }
              />
              {child.saude.alertas.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Alertas:</p>
                  <div className="flex flex-wrap gap-1">
                    {child.saude.alertas.map((a) => (
                      <AlertBadge key={a} alert={a} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <Heart className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Sem dados de saúde cadastrados</p>
              <p className="text-xs text-gray-300 mt-1">
                Criança não aparece no sistema de saúde
              </p>
            </div>
          )}
        </AreaCard>

        {/* Educação */}
        <AreaCard
          title="Educação"
          icon={BookOpen}
          hasData={child.educacao !== null}
          alertCount={child.educacao?.alertas?.length ?? 0}
          color="bg-yellow-100 text-yellow-600"
        >
          {child.educacao ? (
            <div>
              <InfoRow
                label="Escola"
                value={
                  child.educacao.escola ?? (
                    <span className="text-amber-600 text-xs">Sem escola cadastrada</span>
                  )
                }
              />
              {child.educacao.frequencia_percent !== null ? (
                <div className="py-2 border-b border-gray-50">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Frequência</span>
                    <span
                      className={cn(
                        'font-medium',
                        child.educacao.frequencia_percent < 75
                          ? 'text-red-600'
                          : 'text-green-600'
                      )}
                    >
                      {child.educacao.frequencia_percent}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        child.educacao.frequencia_percent < 75
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      )}
                      style={{ width: `${child.educacao.frequencia_percent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <InfoRow
                  label="Frequência"
                  value={
                    <span className="text-amber-600 text-xs">Não matriculada</span>
                  }
                />
              )}
              {child.educacao.alertas.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Alertas:</p>
                  <div className="flex flex-wrap gap-1">
                    {child.educacao.alertas.map((a) => (
                      <AlertBadge key={a} alert={a} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <BookOpen className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Sem dados educacionais cadastrados</p>
              <p className="text-xs text-gray-300 mt-1">
                Criança não aparece na rede escolar
              </p>
            </div>
          )}
        </AreaCard>

        {/* Assistência Social */}
        <AreaCard
          title="Assistência Social"
          icon={HeartHandshake}
          hasData={child.assistencia_social !== null}
          alertCount={child.assistencia_social?.alertas?.length ?? 0}
          color="bg-orange-100 text-orange-600"
        >
          {child.assistencia_social ? (
            <div>
              <InfoRow
                label="CadÚnico"
                value={
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      child.assistencia_social.cad_unico
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    )}
                  >
                    {child.assistencia_social.cad_unico ? 'Cadastrado' : 'Não cadastrado'}
                  </span>
                }
              />
              <InfoRow
                label="Benefício"
                value={
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      child.assistencia_social.beneficio_ativo
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    )}
                  >
                    {child.assistencia_social.beneficio_ativo
                      ? 'Ativo'
                      : 'Suspenso/Inativo'}
                  </span>
                }
              />
              {child.assistencia_social.alertas.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Alertas:</p>
                  <div className="flex flex-wrap gap-1">
                    {child.assistencia_social.alertas.map((a) => (
                      <AlertBadge key={a} alert={a} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <HeartHandshake className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Sem dados sociais cadastrados</p>
              <p className="text-xs text-gray-300 mt-1">
                Criança não consta no CRAS/CREAS
              </p>
            </div>
          )}
        </AreaCard>
      </div>
    </div>
  )
}
