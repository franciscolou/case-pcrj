'use client'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { useChildren } from '@/hooks/useChildren'
import { ChildCard } from '@/components/ChildCard'
import { ChildFilters } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertTriangle } from 'lucide-react'

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

      <Card className="mb-6 py-0 gap-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros</span>
            {hasFilters && (
              <Button
                variant="link"
                size="sm"
                onClick={() => router.replace(pathname)}
                className="ml-auto h-auto p-0 text-xs text-blue-600"
              >
                Limpar filtros
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Select
              value={bairro || 'all'}
              onValueChange={(val) =>
                updateParams({ bairro: !val || val === 'all' ? '' : val })
              }
            >
              <SelectTrigger className="w-auto text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os bairros</SelectItem>
                {BAIRROS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
        </CardContent>
      </Card>

      {isError && (
        <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 py-3">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Erro ao carregar crianças. Tente novamente.
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="py-0 gap-0">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-4" />
                <div className="flex gap-2 mb-3">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && data && data.data.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-500 font-medium">Nenhuma criança encontrada</h3>
          <p className="text-gray-400 text-sm mt-1">Tente ajustar os filtros</p>
        </div>
      )}

      {!isLoading && data && data.data.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {data.data.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>

          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Página {page} de {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(page + 1)}
                disabled={page === data.pagination.totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
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
