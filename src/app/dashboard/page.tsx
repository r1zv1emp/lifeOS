'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'
import {
  Target, Dumbbell, Moon, Brain, Droplets, BookOpen,
  Flame, Trophy, TrendingUp, Calendar, Zap, ChevronRight,
  CheckCircle2, Circle
} from 'lucide-react'
import Link from 'next/link'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Area, AreaChart
} from 'recharts'
import {
  Card, StatCard, ProgressRing, LoadingSpinner, Badge
} from '@/components/ui'
import {
  getGreeting, formatHours, formatDate, formatRelative,
  getMoodEmoji, getDisciplineRank, getLevelTitle, getStreakDays
} from '@/lib/utils'
import { format, subDays } from 'date-fns'

interface DashboardData {
  user: { xp: number; level: number; disciplineScore: number; streak: number; longestStreak: number }
  today: {
    habits: { total: number; completed: number; rate: number }
    sleep: { duration: number; quality: number } | null
    focus: { minutes: number }
    water: { ml: number }
    calories: { total: number }
    mood: { mood: number } | null
  }
  week: {
    workouts: number
    focus: { minutes: number }
    habitTrend: { date: string; completed: number }[]
  }
  month: { workouts: number; journals: number }
  badHabits: { id: string; name: string; category: string; startDate: string; icon: string }[]
  recentJournal: { id: string; title: string | null; createdAt: string; mood: number | null; type: string } | null
}

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, loading } = useApi<DashboardData>('/api/dashboard')
  const today = new Date()

  if (loading) return <LoadingSpinner />

  if (!data) return null

  const rank = getDisciplineRank(data.user.disciplineScore)
  const habitPercent = data.today.habits.total > 0
    ? Math.round((data.today.habits.completed / data.today.habits.total) * 100)
    : 0

  const weekChartData = data.week.habitTrend.map(d => ({
    day: format(new Date(d.date), 'EEE'),
    habits: d.completed,
  }))

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div {...fadeIn} className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-white">
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {format(today, 'EEEE, MMMM d, yyyy')} · Your discipline journey continues
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="px-3 py-1.5 glass-card flex items-center gap-2">
            <Flame size={14} className="text-orange-400" />
            <span className="text-sm font-medium text-white">{data.user.streak} day streak</span>
          </div>
        </div>
      </motion.div>

      {/* Discipline Score Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
        <div className="relative flex flex-col md:flex-row gap-6 items-center">
          <ProgressRing
            value={data.user.disciplineScore}
            max={100}
            size={100}
            strokeWidth={8}
            color="#3b82f6"
            label={`${data.user.disciplineScore}`}
          />
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              <span className={`font-display font-bold text-lg ${rank.color}`}>{rank.rank}</span>
              <Badge variant="blue">Lv.{data.user.level}</Badge>
            </div>
            <h2 className="font-display font-bold text-3xl text-white mb-1">{data.user.disciplineScore}<span className="text-zinc-600 text-lg">/100</span></h2>
            <p className="text-zinc-500 text-sm">Discipline Score · {getLevelTitle(data.user.level)}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            <div className="text-center">
              <div className="font-display font-bold text-xl text-white">{data.user.streak}</div>
              <div className="text-xs text-zinc-500">Streak</div>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-xl text-white">{data.user.longestStreak}</div>
              <div className="text-xs text-zinc-500">Best</div>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-xl text-yellow-400">{data.user.xp}</div>
              <div className="text-xs text-zinc-500">Total XP</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Today's Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: 'Habits',
            value: `${data.today.habits.completed}/${data.today.habits.total}`,
            icon: <Target size={14} />,
            bg: 'bg-blue-500/10',
            color: 'text-blue-400',
            sub: `${habitPercent}% done`,
          },
          {
            label: 'Sleep',
            value: data.today.sleep ? formatHours(data.today.sleep.duration) : '—',
            icon: <Moon size={14} />,
            bg: 'bg-indigo-500/10',
            color: 'text-indigo-400',
            sub: data.today.sleep ? `Quality ${data.today.sleep.quality}/10` : 'Not logged',
          },
          {
            label: 'Workouts',
            value: data.week.workouts,
            icon: <Dumbbell size={14} />,
            bg: 'bg-green-500/10',
            color: 'text-green-400',
            sub: 'This week',
          },
          {
            label: 'Focus',
            value: `${Math.round(data.today.focus.minutes / 60 * 10) / 10}h`,
            icon: <Brain size={14} />,
            bg: 'bg-purple-500/10',
            color: 'text-purple-400',
            sub: `${data.today.focus.minutes}m today`,
          },
          {
            label: 'Water',
            value: `${Math.round(data.today.water.ml / 100) / 10}L`,
            icon: <Droplets size={14} />,
            bg: 'bg-cyan-500/10',
            color: 'text-cyan-400',
            sub: `${data.today.water.ml}ml`,
          },
          {
            label: 'Mood',
            value: data.today.mood ? getMoodEmoji(data.today.mood.mood) : '—',
            icon: null,
            bg: 'bg-yellow-500/10',
            color: 'text-yellow-400',
            sub: data.today.mood ? `${data.today.mood.mood}/10` : 'Not logged',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider">{stat.label}</p>
              {stat.icon && (
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${stat.bg}`}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
              )}
            </div>
            <p className="font-display font-bold text-xl text-white">{stat.value}</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Habit trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white text-sm">Habit Completions — 7 Days</h3>
            <Link href="/habits" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weekChartData} barSize={20}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#52525b' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#71717a' }}
                itemStyle={{ color: '#60a5fa' }}
              />
              <Bar dataKey="habits" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bad Habits Recovery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white text-sm">Recovery Streaks</h3>
            <Link href="/habits/recovery" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {data.badHabits.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[140px] text-center">
              <p className="text-zinc-600 text-sm">No recovery habits tracked yet</p>
              <Link href="/habits/recovery" className="text-xs text-blue-400 mt-2">Add one →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.badHabits.slice(0, 3).map(habit => {
                const days = getStreakDays(habit.startDate)
                return (
                  <div key={habit.id} className="flex items-center gap-3">
                    <div className="text-xl">{habit.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-white font-medium truncate">{habit.name}</p>
                        <span className="text-sm font-display font-bold text-green-400 shrink-0 ml-2">{days}d</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min((days / 90) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Quick Habits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5 md:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white text-sm">Today's Progress</h3>
            <Link href="/habits" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Go to habits <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <ProgressRing
              value={habitPercent}
              size={64}
              strokeWidth={5}
              color={habitPercent === 100 ? '#10b981' : '#3b82f6'}
              label={`${habitPercent}%`}
            />
            <div>
              <p className="text-white font-display font-bold text-lg">{data.today.habits.completed} / {data.today.habits.total}</p>
              <p className="text-zinc-500 text-xs">habits completed today</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {habitPercent === 100 && (
              <Badge variant="green">🔥 Perfect day!</Badge>
            )}
            {data.week.workouts >= 3 && (
              <Badge variant="blue">💪 Active week</Badge>
            )}
            {data.today.sleep && data.today.sleep.quality >= 7 && (
              <Badge variant="purple">😴 Great sleep</Badge>
            )}
            {data.user.streak >= 7 && (
              <Badge variant="yellow">⚡ {data.user.streak} day streak</Badge>
            )}
          </div>
        </motion.div>

        {/* Journal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white text-sm">Journal</h3>
            <Link href="/journal" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View <ChevronRight size={12} />
            </Link>
          </div>
          {data.recentJournal ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{data.recentJournal.mood ? getMoodEmoji(data.recentJournal.mood) : '📝'}</span>
                <div>
                  <p className="text-sm text-white font-medium line-clamp-1">
                    {data.recentJournal.title || 'Journal Entry'}
                  </p>
                  <p className="text-xs text-zinc-500">{formatRelative(data.recentJournal.createdAt)}</p>
                </div>
              </div>
              <Badge variant="zinc">{data.recentJournal.type}</Badge>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-zinc-600 text-sm mb-3">No entries yet</p>
              <Link href="/journal/new" className="text-xs text-blue-400">Write today's entry →</Link>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-zinc-500">{data.month.journals} entries this month</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
