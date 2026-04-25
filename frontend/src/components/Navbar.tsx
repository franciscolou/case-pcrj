'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Shield, Users, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { clearAuth, getUser } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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

  return (
    <nav className="bg-blue-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-white" />
            <span className="text-white font-semibold text-sm sm:text-base">Painel PCRJ</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === href ||
                    (href !== '/dashboard' && pathname.startsWith(href))
                    ? 'bg-blue-800 text-white'
                    : 'text-blue-100 hover:bg-blue-600 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user && (
              <span className="text-blue-200 text-sm truncate max-w-[200px]">{user.email}</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-blue-100 hover:text-white hover:bg-blue-600 gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-blue-600 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-blue-800 px-4 pb-4 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                pathname === href ||
                  (href !== '/dashboard' && pathname.startsWith(href))
                  ? 'bg-blue-900 text-white'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          {user && (
            <p className="text-blue-300 text-xs px-3 pt-2 truncate">{user.email}</p>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-blue-100 hover:text-white hover:bg-blue-700 gap-2 w-full justify-start px-3"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      )}
    </nav>
  )
}
