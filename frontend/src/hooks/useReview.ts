import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Child } from '@/types'

export function useReview(childId: string) {
  const queryClient = useQueryClient()
  return useMutation<Child, Error, void>({
    mutationFn: () => api.patch(`/children/${childId}/review`).then((r) => r.data),
    onSuccess: (updatedChild) => {
      queryClient.setQueryData(['child', childId], updatedChild)
      queryClient.invalidateQueries({ queryKey: ['children'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}
