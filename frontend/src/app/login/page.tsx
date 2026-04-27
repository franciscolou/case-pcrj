'use client'
import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { setAuth, isAuthenticated } from '@/lib/auth'
import { ShieldCheck, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = 'Login | Painel da Infância'
    if (isAuthenticated()) router.replace('/dashboard')
  }, [router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/token', { email, password })
      setAuth(data.token, data.user)
      router.replace('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg || 'Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 to-blue-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4"
            aria-hidden="true"
          >
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold">Prefeitura do Rio</h1>
          <p className="text-blue-200 text-sm mt-1">Painel da Infância</p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl p-8">
          <h2 className="text-foreground text-xl font-semibold mb-6" id="login-heading">
            Entrar
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-labelledby="login-heading"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground/80">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tecnico@prefeitura.rio"
                required
                autoComplete="email"
                className="h-10"
                aria-required="true"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-foreground/80">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="h-10"
                aria-required="true"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 py-2">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full h-10 gap-2"
            >
              {loading && (
                <span
                  className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
              )}
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>

        <p className="text-center text-blue-300 text-xs mt-6">
          Acesso restrito a técnicos autorizados
        </p>
      </div>
    </div>
  )
}
