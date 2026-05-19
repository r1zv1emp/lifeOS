'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Target, Shield, Dumbbell, Moon, BookOpen,
  Utensils, Brain, BarChart3, Settings, LogOut, Zap, Menu, X,
  ChevronRight, Trophy, Sun, Flame
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getLevelTitle, getXPForNextLevel } from '@/lib/utils'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: Target },
  { href: '/habits/recovery', label: 'Recovery', icon: Shield },
  { href: '/fitness', label: 'Fitness', icon: Dumbbell },
  { href: '/sleep', label: 'Sleep', icon: Moon },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/diet', label: 'Diet', icon: Utensils },
  { href: '/productivity', label: 'Focus', icon: Brain },
  { href: '/routines', label: 'Routines', icon: Sun },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center animate-pulse">
            <Zap size={20} className="text-white" />
          </div>
          <div className="text-zinc-500 text-sm">Loading LifeOS...</div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const xpInfo = getXPForNextLevel(user.xp)

  return (
    <div className="min-h-screen bg-[#080808] flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-[#0d0d0d] border-r border-white/5 z-50 flex flex-col transition-transform duration-300',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">LifeOS</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-zinc-500 hover:text-white p-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* User XP Card */}
        <div className="mx-3 mt-4 p-3 glass-card">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sm">
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user.name}</div>
              <div className="text-xs text-zinc-500">Level {user.level} · {getLevelTitle(user.level)}</div>
            </div>
            <div className="flex items-center gap-1 text-yellow-400">
              <Trophy size={12} />
              <span className="text-xs font-medium">{user.xp}</span>
            </div>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpInfo.percent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-zinc-600">{xpInfo.current} XP</span>
            <span className="text-[10px] text-zinc-600">{xpInfo.required} XP</span>
          </div>
        </div>

        {/* Discipline Score */}
        <div className="mx-3 mt-2 px-3 py-2.5 rounded-lg bg-blue-500/8 border border-blue-500/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-orange-400" />
            <span className="text-xs text-zinc-400">Discipline Score</span>
          </div>
          <span className="font-display font-bold text-white text-sm">{user.disciplineScore}</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'sidebar-item',
                  active && 'active'
                )}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
                {active && <ChevronRight size={14} className="ml-auto text-blue-400" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/5 space-y-0.5">
          <Link
            href="/settings"
            className={cn('sidebar-item', pathname === '/settings' && 'active')}
            onClick={() => setSidebarOpen(false)}
          >
            <Settings size={16} />
            <span>Settings</span>
          </Link>
          <button
            onClick={logout}
            className="sidebar-item w-full text-left text-red-400/60 hover:text-red-400 hover:bg-red-500/5"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Top bar mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-[#0d0d0d]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-400 hover:text-white p-1"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-display font-bold text-white">LifeOS</span>
          </div>
          <div className="w-8" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
