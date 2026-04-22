'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    router.replace(isAuthenticated() ? '/dashboard' : '/login')
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
