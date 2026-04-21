import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Child } from '@/types'

export function useChild(id: string) {
  return useQuery<Child>({
    queryKey: ['child', id],
    queryFn: () => api.get(`/children/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}
