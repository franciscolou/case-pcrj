import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Summary } from '@/types'

export function useSummary() {
  return useQuery<Summary>({
    queryKey: ['summary'],
    queryFn: () => api.get('/summary').then((r) => r.data),
    staleTime: 60_000,
  })
}
