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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className={`inline-flex p-2 rounded-lg mb-4 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-600">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-6">
          Erro ao carregar dados. Verifique a conexão com o servidor.
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36" />)
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

      {/* Alerts by area + by bairro */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Alertas por Área
            </h2>
            <div className="space-y-3">
              {[
                {
                  label: 'Saúde',
                  value: data.com_alertas.saude,
                  color: 'bg-red-500',
                  total: data.total,
                },
                {
                  label: 'Educação',
                  value: data.com_alertas.educacao,
                  color: 'bg-yellow-500',
                  total: data.total,
                },
                {
                  label: 'Assistência Social',
                  value: data.com_alertas.assistencia_social,
                  color: 'bg-orange-500',
                  total: data.total,
                },
              ].map(({ label, value, color, total }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${(value / total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Por Bairro
            </h2>
            <div className="space-y-2">
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
            </div>
          </div>
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
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Ver lista
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
