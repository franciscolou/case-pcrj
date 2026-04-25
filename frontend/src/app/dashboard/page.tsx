'use client'
import Link from 'next/link'
import {
  Users,
  AlertTriangle,
  CheckCircle,
  Database,
  Activity,
  ArrowRight,
} from 'lucide-react'
import { useSummary } from '@/hooks/useSummary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function SummaryCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  sub?: string
  color: string
}) {
  return (
    <Card>
      <CardContent className="pt-2">
        <div className={cn('inline-flex p-2 rounded-lg mb-3', color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-sm font-medium text-gray-600">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useSummary()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral das crianças acompanhadas</p>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 py-3">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Erro ao carregar dados. Verifique a conexão com o servidor.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))
        ) : data ? (
          <>
            <SummaryCard
              icon={Users}
              label="Total de Crianças"
              value={data.total}
              color="bg-blue-100 text-blue-600"
            />
            <SummaryCard
              icon={AlertTriangle}
              label="Com Alertas"
              value={data.com_alertas.total}
              sub={`${Math.round((data.com_alertas.total / data.total) * 100)}% do total`}
              color="bg-red-100 text-red-600"
            />
            <SummaryCard
              icon={CheckCircle}
              label="Revisadas"
              value={data.revisadas}
              sub={`${Math.round((data.revisadas / data.total) * 100)}% do total`}
              color="bg-green-100 text-green-600"
            />
            <SummaryCard
              icon={Database}
              label="Sem Dados"
              value={data.sem_dados}
              sub="Nenhuma área cadastrada"
              color="bg-gray-100 text-gray-500"
            />
          </>
        ) : null}
      </div>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Alertas por Área
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Saúde', value: data.com_alertas.saude, color: 'bg-red-500', total: data.total },
                { label: 'Educação', value: data.com_alertas.educacao, color: 'bg-yellow-500', total: data.total },
                { label: 'Assistência Social', value: data.com_alertas.assistencia_social, color: 'bg-orange-500', total: data.total },
              ].map(({ label, value, color, total }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', color)}
                      style={{ width: `${(value / total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Por Bairro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(data.por_bairro)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([bairro, stats]) => (
                  <div key={bairro} className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600 flex-1 truncate">{bairro}</span>
                    <span className="text-gray-900 font-medium w-6 text-right">
                      {stats.total}
                    </span>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(stats.total / data.total) * 100}%` }}
                      />
                    </div>
                    {stats.com_alertas > 0 && (
                      <span className="text-red-500 text-xs font-medium w-16 text-right">
                        {stats.com_alertas} alertas
                      </span>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-blue-900">Lista de Crianças</h3>
          <p className="text-blue-700 text-sm mt-1">
            Ver todas as crianças com filtros e detalhes
          </p>
        </div>
        <Link
          href="/dashboard/criancas"
          className={cn(buttonVariants({ size: 'default' }), 'gap-2')}
        >
          Ver lista
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
