'use client'
import { useEffect } from 'react'
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
import { calcAge, formatDate, formatDateTime, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

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
    <section aria-label={title}>
      <Card className={cn('py-0 gap-0 h-full', alertCount > 0 ? 'ring-red-200 dark:ring-red-900/50' : '')}>
        <CardHeader
          className={cn(
            'flex flex-row items-center gap-3 px-5 py-4 rounded-t-xl border-b',
            alertCount > 0
              ? 'border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-950/30'
              : 'border-border bg-muted/50'
          )}
        >
          <div className={cn('p-1.5 rounded-lg shrink-0', color)} aria-hidden="true">
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">{title}</h3>
          {!hasData && (
            <Badge
              variant="outline"
              className="ml-auto text-xs text-muted-foreground bg-muted border-border hover:bg-muted"
            >
              Sem dados
            </Badge>
          )}
          {hasData && alertCount > 0 && (
            <Badge
              variant="outline"
              className="ml-auto text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 gap-1"
            >
              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
              {alertCount} alerta{alertCount !== 1 ? 's' : ''}
            </Badge>
          )}
          {hasData && alertCount === 0 && (
            <Badge
              variant="outline"
              className="ml-auto text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 gap-1"
            >
              <CheckCircle className="w-3 h-3" aria-hidden="true" />
              Ok
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-5">{children}</CardContent>
      </Card>
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <div className="flex justify-between items-start gap-4 py-2">
        <span className="text-sm text-muted-foreground shrink-0">{label}</span>
        <span className="text-sm text-foreground text-right">{value}</span>
      </div>
      <Separator aria-hidden="true" />
    </>
  )
}

export default function ChildDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: child, isLoading, isError } = useChild(id)
  const { mutate: review, isPending: isReviewing } = useReview(id)

  useEffect(() => {
    document.title = child?.nome
      ? `${child.nome} | Painel da Infância`
      : 'Painel da Infância'
  }, [child?.nome])

  if (isLoading) {
    return (
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-6 text-muted-foreground hover:text-foreground gap-2 px-0"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Voltar
        </Button>
        <div className="space-y-4" role="status" aria-label="Carregando dados da criança">
          <Skeleton className="h-32 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !child) {
    return (
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-6 text-muted-foreground hover:text-foreground gap-2 px-0"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Voltar
        </Button>
        <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 mb-4">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
          <AlertDescription className="text-red-700 dark:text-red-300">
            Criança não encontrada. Verifique o ID e tente novamente.
          </AlertDescription>
        </Alert>
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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-6 text-muted-foreground hover:text-foreground gap-2 px-0"
        aria-label="Voltar para a lista de crianças"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Voltar para a lista
      </Button>

      <Card className="mb-6 py-0 gap-0">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{child.nome}</h1>
              <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Data de nascimento</dt>
                  <Calendar className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <dd className="text-sm text-muted-foreground">
                    {formatDate(child.data_nascimento)} · {age} {age === 1 ? 'ano' : 'anos'}
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Bairro</dt>
                  <MapPin className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <dd className="text-sm text-muted-foreground">{child.bairro}</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Responsável</dt>
                  <User className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <dd className="text-sm text-muted-foreground">{child.responsavel}</dd>
                </div>
              </dl>
            </div>

            <div className="shrink-0">
              {child.revisado ? (
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant="outline"
                    className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 gap-2 h-auto px-3 py-1.5 text-sm"
                  >
                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                    Revisado
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    por {child.revisado_por} em {formatDateTime(child.revisado_em)}
                  </span>
                </div>
              ) : (
                <Button
                  onClick={() => review()}
                  disabled={isReviewing}
                  aria-busy={isReviewing}
                  className="gap-2"
                >
                  {isReviewing ? (
                    <span
                      className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <ClipboardCheck className="w-4 h-4" aria-hidden="true" />
                  )}
                  {isReviewing ? 'Salvando...' : 'Marcar como revisado'}
                </Button>
              )}
            </div>
          </div>

          <Separator className="my-4" aria-hidden="true" />

          <div className="flex flex-wrap gap-2" role="status" aria-label="Status geral">
            {totalAlerts > 0 ? (
              <Badge
                variant="outline"
                className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1.5 h-auto px-3 py-1 rounded-full"
              >
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                {totalAlerts} alerta{totalAlerts !== 1 ? 's' : ''} ativo{totalAlerts !== 1 ? 's' : ''}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/40 gap-1.5 h-auto px-3 py-1 rounded-full"
              >
                <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                Sem alertas ativos
              </Badge>
            )}
            {allNull && (
              <Badge
                variant="outline"
                className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 gap-1.5 h-auto px-3 py-1 rounded-full"
              >
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                Nenhuma área com dados cadastrados
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AreaCard
          title="Saúde"
          icon={Heart}
          hasData={child.saude !== null}
          alertCount={child.saude?.alertas?.length ?? 0}
          color="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
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
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs h-auto px-2 py-0.5',
                      child.saude.vacinas_em_dia
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40'
                        : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40'
                    )}
                  >
                    {child.saude.vacinas_em_dia ? 'Em dia' : 'Atrasadas'}
                  </Badge>
                }
              />
              {child.saude.alertas.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Alertas:</p>
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
              <Heart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Sem dados de saúde cadastrados</p>
              <p className="text-xs text-muted-foreground mt-1">
                Criança não aparece no sistema de saúde
              </p>
            </div>
          )}
        </AreaCard>

        <AreaCard
          title="Educação"
          icon={BookOpen}
          hasData={child.educacao !== null}
          alertCount={child.educacao?.alertas?.length ?? 0}
          color="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400"
        >
          {child.educacao ? (
            <div>
              <InfoRow
                label="Escola"
                value={
                  child.educacao.escola ?? (
                    <span className="text-amber-700 dark:text-amber-400 text-xs">Sem escola cadastrada</span>
                  )
                }
              />
              {child.educacao.frequencia_percent !== null ? (
                <div className="py-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Frequência</span>
                    <span
                      className={cn(
                        'font-medium',
                        child.educacao.frequencia_percent < 75
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      )}
                    >
                      {child.educacao.frequencia_percent}%
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`Frequência escolar: ${child.educacao.frequencia_percent}%`}
                    aria-valuenow={child.educacao.frequencia_percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-2 bg-muted rounded-full overflow-hidden"
                  >
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
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
                  value={<span className="text-amber-700 dark:text-amber-400 text-xs">Não matriculada</span>}
                />
              )}
              {child.educacao.alertas.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Alertas:</p>
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
              <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Sem dados educacionais cadastrados</p>
              <p className="text-xs text-muted-foreground mt-1">
                Criança não aparece na rede escolar
              </p>
            </div>
          )}
        </AreaCard>

        <AreaCard
          title="Assistência Social"
          icon={HeartHandshake}
          hasData={child.assistencia_social !== null}
          alertCount={child.assistencia_social?.alertas?.length ?? 0}
          color="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400"
        >
          {child.assistencia_social ? (
            <div>
              <InfoRow
                label="CadÚnico"
                value={
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs h-auto px-2 py-0.5',
                      child.assistencia_social.cad_unico
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40'
                        : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40'
                    )}
                  >
                    {child.assistencia_social.cad_unico ? 'Cadastrado' : 'Não cadastrado'}
                  </Badge>
                }
              />
              <InfoRow
                label="Benefício"
                value={
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs h-auto px-2 py-0.5',
                      child.assistencia_social.beneficio_ativo
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40'
                        : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40'
                    )}
                  >
                    {child.assistencia_social.beneficio_ativo ? 'Ativo' : 'Suspenso/Inativo'}
                  </Badge>
                }
              />
              {child.assistencia_social.alertas.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Alertas:</p>
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
              <HeartHandshake className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Sem dados sociais cadastrados</p>
              <p className="text-xs text-muted-foreground mt-1">
                Criança não consta no CRAS/CREAS
              </p>
            </div>
          )}
        </AreaCard>
      </div>
    </div>
  )
}
