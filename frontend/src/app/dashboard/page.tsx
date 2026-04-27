'use client'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { ChartsTab } from '@/components/ChartsTab'

const MapTab = dynamic(() => import('@/components/MapTab').then((m) => m.MapTab), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 text-muted-foreground text-sm" role="status">
      <span
        className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin mr-2"
        aria-hidden="true"
      />
      Carregando mapa...
    </div>
  ),
})

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
        <div className={cn('inline-flex p-2 rounded-lg mb-3', color)} aria-hidden="true">
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-3xl font-bold text-foreground mb-1" aria-label={`${value} ${label}`}>
          {value}
        </div>
        <div className="text-sm font-medium text-foreground/80" aria-hidden="true">{label}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  )
}

function GeralTab({ data }: { data: NonNullable<ReturnType<typeof useSummary>['data']> }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" aria-hidden="true" />
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
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
                <div
                  role="progressbar"
                  aria-label={`${label}: ${value} de ${total} crianças com alertas`}
                  aria-valuenow={value}
                  aria-valuemin={0}
                  aria-valuemax={total}
                  className="h-2 bg-muted rounded-full overflow-hidden"
                >
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
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" aria-hidden="true" />
              Por Bairro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(data.por_bairro)
              .sort((a, b) => b[1].total - a[1].total)
              .map(([bairro, stats]) => (
                <div key={bairro} className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground flex-1 truncate">{bairro}</span>
                  <span className="text-foreground font-medium w-6 text-right">
                    {stats.total}
                  </span>
                  <div
                    role="progressbar"
                    aria-label={`${bairro}: ${stats.total} crianças`}
                    aria-valuenow={stats.total}
                    aria-valuemin={0}
                    aria-valuemax={data.total}
                    className="w-24 h-2 bg-muted rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(stats.total / data.total) * 100}%` }}
                    />
                  </div>
                  {stats.com_alertas > 0 && (
                    <span className="text-red-500 dark:text-red-400 text-xs font-medium w-16 text-right">
                      {stats.com_alertas} alertas
                    </span>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <div className="bg-banner-bg border border-banner-border rounded-xl p-5 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-banner-heading">Lista de Crianças</h2>
          <p className="text-banner-text text-sm mt-1">
            Ver todas as crianças com filtros e detalhes
          </p>
        </div>
        <Link
          href="/dashboard/criancas"
          className={cn(buttonVariants({ size: 'default' }), 'gap-2')}
        >
          Ver lista
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </>
  )
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useSummary()

  useEffect(() => {
    document.title = 'Dashboard | Painel da Infância'
  }, [])

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral das crianças acompanhadas</p>
      </header>

      {isError && (
        <Alert variant="destructive" className="mb-6 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 py-3">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
          <AlertDescription className="text-red-700 dark:text-red-300">
            Erro ao carregar dados. Verifique a conexão com o servidor.
          </AlertDescription>
        </Alert>
      )}

      <section aria-label="Resumo" aria-busy={isLoading}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" aria-hidden="true" />
            ))
          ) : data ? (
            <>
              <SummaryCard
                icon={Users}
                label="Total de Crianças"
                value={data.total}
                color="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
              />
              <SummaryCard
                icon={AlertTriangle}
                label="Com Alertas"
                value={data.com_alertas.total}
                sub={`${Math.round((data.com_alertas.total / data.total) * 100)}% do total`}
                color="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
              />
              <SummaryCard
                icon={CheckCircle}
                label="Revisadas"
                value={data.revisadas}
                sub={`${Math.round((data.revisadas / data.total) * 100)}% do total`}
                color="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
              />
              <SummaryCard
                icon={Database}
                label="Sem Dados"
                value={data.sem_dados}
                sub="Nenhuma área cadastrada"
                color="bg-muted text-muted-foreground"
              />
            </>
          ) : null}
        </div>
      </section>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-72 rounded-lg" aria-hidden="true" />
          <Skeleton className="h-64 rounded-xl" aria-hidden="true" />
        </div>
      )}

      {data && (
        <Tabs defaultValue="geral">
          <TabsList className="mb-6" aria-label="Seções do dashboard">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="graficos">Gráficos</TabsTrigger>
            <TabsTrigger value="mapa">Mapa</TabsTrigger>
          </TabsList>

          <TabsContent value="geral">
            <GeralTab data={data} />
          </TabsContent>

          <TabsContent value="graficos">
            <ChartsTab data={data} />
          </TabsContent>

          <TabsContent value="mapa">
            <MapTab data={data} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
