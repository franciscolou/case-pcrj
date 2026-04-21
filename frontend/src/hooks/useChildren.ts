import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ChildrenResponse, ChildFilters } from '@/types'

export function useChildren(filters: ChildFilters) {
  const params: Record<string, string | number> = {}
  if (filters.bairro) params.bairro = filters.bairro
  if (filters.alertas) params.alertas = filters.alertas
  if (filters.revisado) params.revisado = filters.revisado
  if (filters.page) params.page = filters.page
  if (filters.limit) params.limit = filters.limit

  return useQuery<ChildrenResponse>({
    queryKey: ['children', filters],
    queryFn: () => api.get('/children', { params }).then((r) => r.data),
  })
}
