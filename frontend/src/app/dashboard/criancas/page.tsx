'use client'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { useChildren } from '@/hooks/useChildren'
import { ChildCard } from '@/components/ChildCard'
import { ChildFilters } from '@/types'
import { cn } from '@/lib/utils'

const BAIRROS = ['Rocinha', 'Maré', 'Jacarezinho', 'Complexo do Alemão', 'Mangueira']

function ChildrenList() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const bairro = searchParams.get('bairro') || ''
  const alertas = (searchParams.get('alertas') || '') as '' | 'true' | 'false'
  const revisado = (searchParams.get('revisado') || '') as '' | 'true' | 'false'
  const page = parseInt(searchParams.get('page') || '1')

  const filters: ChildFilters = {
    ...(bairro && { bairro }),
    ...(alertas && { alertas }),
    ...(revisado && { revisado }),
    page,
    limit: 12,
  }

  const { data, isLoading, isError } = useChildren(filters)

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v)
      else params.delete(k)
    })
    params.delete('page')
    router.replace(`${pathname}?${params.toString()}`)
  }

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.replace(`${pathname}?${params.toString()}`)
  }

  const hasFilters = !!(bairro || alertas || revisado)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Crianças</h1>
        <p className="text-gray-500 text-sm mt-1">
          {data
            ? `${data.pagination.total} criança${data.pagination.total !== 1 ? 's' : ''} encontrada${data.pagination.total !== 1 ? 's' : ''}`
            : 'Carregando...'}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtros</span>
          {hasFilters && (
            <button
              onClick={() => router.replace(pathname)}
              className="ml-auto text-xs text-blue-600 hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Bairro filter */}
          <select
            value={bairro}
            onChange={(e) => updateParams({ bairro: e.target.value })}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os bairros</option>
            {BAIRROS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Alerts filter */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(
              [
                ['', 'Todos'],
                ['true', 'Com alertas'],
                ['false', 'Sem alertas'],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                onClick={() => updateParams({ alertas: val })}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  alertas === val
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Review filter */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(
              [
                ['', 'Todos'],
                ['false', 'Pendentes'],
                ['true', 'Revisados'],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                onClick={() => updateParams({ revisado: val })}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  revisado === val
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-6">
          Erro ao carregar crianças. Tente novamente.
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="flex gap-2 mb-3">
                <div className="h-6 bg-gray-200 rounded-full w-16" />
                <div className="h-6 bg-gray-200 rounded-full w-16" />
                <div className="h-6 bg-gray-200 rounded-full w-16" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && data && data.data.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-500 font-medium">Nenhuma criança encontrada</h3>
          <p className="text-gray-400 text-sm mt-1">Tente ajustar os filtros</p>
        </div>
      )}

      {/* Children grid */}
      {!isLoading && data && data.data.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {data.data.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                Página {page} de {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === data.pagination.totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function CriancasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ChildrenList />
    </Suspense>
  )
}
