import { useEffect, useState, type ComponentType } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/cn'
import { initials } from '../lib/format'
import { NOTIFICATIONS_CHANGED } from '../lib/events'
import { Logo } from './Logo'
import { Button } from './ui'
import {
  IconBell,
  IconBook,
  IconBookmark,
  IconChevronDown,
  IconCompass,
  IconGrid,
  IconHome,
  IconMenu,
  IconTarget,
  IconUser,
  IconX,
} from './icons'

interface NavItem {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: IconHome },
  { to: '/products', label: 'Products', icon: IconGrid },
  { to: '/bookmarks', label: 'Bookmarks', icon: IconBookmark },
  { to: '/price-alerts', label: 'Price Alerts', icon: IconTarget },
  { to: '/journal', label: 'Journal', icon: IconBook },
]

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const load = () => {
      api
        .get<{ data: { count: number } }>('/notifications/unread-count')
        .then((res) => setUnread(res.data.data?.count ?? 0))
        .catch(() => {})
    }
    load()
    window.addEventListener(NOTIFICATIONS_CHANGED, load)
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED, load)
  }, [location.pathname])

  useEffect(() => {
    setMobileOpen(false)
    setMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    )

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="mr-2 shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <Link
              to="/notifications"
              className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Notifications"
            >
              <IconBell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>

            <Link to="/wizard" className="hidden sm:block">
              <Button size="sm">
                <IconCompass className="h-4 w-4" />
                New decision
              </Button>
            </Link>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg p-1 pr-2 transition hover:bg-slate-100"
                aria-label="Account menu"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white">
                  {initials(user?.username)}
                </span>
                <IconChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg animate-fade-in">
                    <div className="border-b border-slate-100 px-4 py-2.5">
                      <p className="truncate text-sm font-semibold text-slate-900">{user?.username}</p>
                      <p className="truncate text-xs text-slate-400">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <IconUser className="h-4 w-4" /> Profile & DNA
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                    >
                      <IconX className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <IconX className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 lg:hidden">
            <nav className="flex flex-col gap-0.5">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <Link to="/wizard" className="mt-3 block">
              <Button fullWidth>
                <IconCompass className="h-4 w-4" /> New decision
              </Button>
            </Link>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
