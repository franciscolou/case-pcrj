'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Shield, Users, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { clearAuth, getUser } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const user = getUser()

  const handleLogout = () => {
    clearAuth()
    router.replace('/login')
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/criancas', label: 'Crianças', icon: Users },
  ]

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <nav aria-label="Principal" className="bg-nav-bg shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-nav-text" aria-hidden="true" />
            <span className="text-nav-text font-semibold text-sm sm:text-base">Painel PCRJ</span>
          </div>

          <div className="hidden md:flex items-center gap-1" role="list">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="listitem"
                aria-current={isActive(href) ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(href)
                    ? 'bg-nav-active text-nav-text'
                    : 'text-nav-text-muted hover:bg-nav-hover hover:text-nav-text'
                )}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user && (
              <span
                className="text-nav-text-muted text-sm truncate max-w-[200px]"
                aria-label={`Usuário: ${user.email}`}
              >
                {user.email}
              </span>
            )}
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-nav-text-muted hover:text-nav-text hover:bg-nav-hover gap-2"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Sair
            </Button>
          </div>

          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="text-nav-text hover:bg-nav-hover hover:text-nav-text"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen
                ? <X className="w-5 h-5" aria-hidden="true" />
                : <Menu className="w-5 h-5" aria-hidden="true" />
              }
            </Button>
          </div>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={cn('md:hidden bg-nav-mobile px-4 pb-4 space-y-1', !mobileOpen && 'hidden')}
      >
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            aria-current={isActive(href) ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
              isActive(href)
                ? 'bg-nav-mobile-active text-nav-text'
                : 'text-nav-text-muted hover:bg-nav-bg hover:text-nav-text'
            )}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
        {user && (
          <p className="text-nav-text-dim text-xs px-3 pt-2 truncate" aria-hidden="true">
            {user.email}
          </p>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-nav-text-muted hover:text-nav-text hover:bg-nav-bg gap-2 w-full justify-start px-3"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Sair
        </Button>
      </div>
    </nav>
  )
}
