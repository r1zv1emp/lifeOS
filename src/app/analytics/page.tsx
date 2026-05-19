'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Calendar, Target, Dumbbell, Moon, Brain } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { Card, LoadingSpinner, PageHeader, Badge } from '@/components/ui'
import { formatHours, formatDuration, getDisciplineRank } from '@/lib/utils'
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

interface AnalyticsData {
  user: { xp: number; level: number; disciplineScore: number; streak: number }
  today: {
    habits: { total: number; completed: number; rate: number }
    sleep: { duration: number; quality: number } | null
    focus: { minutes: number }
  }
  week: { workouts: number; focus: { minutes: number }; habitTrend: { date: string; completed: number }[] }
  month: { workouts: number; journals: number }
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
        <p className="text-zinc-400 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const { data, loading } = useApi<AnalyticsData>('/api/dashboard')
  const [period, setPeriod] = useState<'week' | 'month'>('week')

  if (loading) return <LoadingSpinner />
  if (!data) return null

  const rank = getDisciplineRank(data.user.disciplineScore)

  // Build last 30 days habit trend (we'll use the 7-day data we have)
  const habitTrend = data.week.habitTrend.map(d => ({
    date: format(new Date(d.date), 'MM/dd'),
    completed: d.completed,
  }))

  // Radar chart for life balance
  const radarData = [
    { subject: 'Habits', value: Math.round(data.today.habits.rate * 100), fullMark: 100 },
    { subject: 'Sleep', value: data.today.sleep ? data.today.sleep.quality * 10 : 0, fullMark: 100 },
    { subject: 'Fitness', value: Math.min(data.week.workouts / 5 * 100, 100), fullMark: 100 },
    { subject: 'Focus', value: Math.min(data.today.focus.minutes / 120 * 100, 100), fullMark: 100 },
    { subject: 'Journal', value: Math.min(data.month.journals / 30 * 100, 100), fullMark: 100 },
    { subject: 'Score', value: data.user.disciplineScore, fullMark: 100 },
  ]

  // Weekly summary stats
  const weekStats = [
    { label: 'Habit Rate', value: `${Math.round(data.today.habits.rate * 100)}%`, color: 'text-blue-400' },
    { label: 'Workouts', value: data.week.workouts, color: 'text-green-400' },
    { label: 'Focus Time', value: formatDuration(data.week.focus.minutes), color: 'text-purple-400' },
    { label: 'Sleep Avg', value: data.today.sleep ? formatHours(data.today.sleep.duration) : '—', color: 'text-indigo-400' },
  ]

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Understand your patterns. Optimize your life."
      />

      {/* Discipline score banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
        <div className="relative flex flex-col md:flex-row gap-6 items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Overall Discipline Score</p>
            <div className="flex items-baseline gap-3">
              <span className="font-display font-bold text-6xl text-white">{data.user.disciplineScore}</span>
              <span className="text-zinc-600 text-xl">/100</span>
              <span className={`font-display font-semibold text-xl ${rank.color}`}>{rank.rank}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {weekStats.map(s => (
              <div key={s.label} className="text-center">
                <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
                <p className="text-xs text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Life Balance Radar + Habit trend */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-display font-semibold text-white text-sm mb-4">Life Balance Score</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#71717a' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#52525b' }} />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-display font-semibold text-white text-sm mb-4">Habit Completions — 7 Days</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={habitTrend}>
              <defs>
                <linearGradient id="habitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#3b82f6"
                fill="url(#habitGrad)"
                strokeWidth={2}
                name="Habits"
                dot={{ fill: '#3b82f6', r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Achievement/XP section */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <h3 className="font-display font-semibold text-white text-sm mb-4">XP & Level</h3>
          <div className="space-y-4">
            <div className="text-center py-2">
              <p className="font-display font-bold text-5xl text-yellow-400">{data.user.xp}</p>
              <p className="text-xs text-zinc-500 mt-1">Total XP Earned</p>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Current Level', value: `Level ${data.user.level}` },
                { label: 'Current Streak', value: `${data.user.streak} days` },
                { label: 'Discipline Rank', value: rank.rank },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-2 border-t border-white/5">
                  <span className="text-xs text-zinc-500">{item.label}</span>
                  <span className="text-sm font-medium text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2">
          <h3 className="font-display font-semibold text-white text-sm mb-4">Monthly Progress Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🎯', label: 'Habits Tracked', value: data.today.habits.total, sub: 'active habits', color: 'bg-blue-500/10 border-blue-500/20' },
              { icon: '💪', label: 'Workouts', value: data.month.workouts, sub: 'this month', color: 'bg-green-500/10 border-green-500/20' },
              { icon: '📝', label: 'Journal Entries', value: data.month.journals, sub: 'this month', color: 'bg-yellow-500/10 border-yellow-500/20' },
              { icon: '🔥', label: 'Day Streak', value: data.user.streak, sub: 'current streak', color: 'bg-orange-500/10 border-orange-500/20' },
            ].map(item => (
              <div key={item.label} className={`p-4 rounded-xl border ${item.color}`}>
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="font-display font-bold text-2xl text-white">{item.value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{item.label}</p>
                <p className="text-[10px] text-zinc-600">{item.sub}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tips based on data */}
      <Card>
        <h3 className="font-display font-semibold text-white text-sm mb-4">💡 Insights & Recommendations</h3>
        <div className="space-y-3">
          {data.today.habits.rate < 0.5 && (
            <div className="flex gap-3 p-3 bg-red-500/8 border border-red-500/20 rounded-lg">
              <span className="text-lg shrink-0">⚠️</span>
              <div>
                <p className="text-sm font-medium text-red-400">Low habit completion</p>
                <p className="text-xs text-zinc-500 mt-0.5">You're completing less than 50% of your habits. Focus on 2–3 keystone habits first.</p>
              </div>
            </div>
          )}
          {data.week.workouts < 3 && (
            <div className="flex gap-3 p-3 bg-yellow-500/8 border border-yellow-500/20 rounded-lg">
              <span className="text-lg shrink-0">💪</span>
              <div>
                <p className="text-sm font-medium text-yellow-400">Increase workout frequency</p>
                <p className="text-xs text-zinc-500 mt-0.5">Aim for at least 3 workouts per week. You've done {data.week.workouts} this week.</p>
              </div>
            </div>
          )}
          {data.today.sleep && data.today.sleep.duration < 7 && (
            <div className="flex gap-3 p-3 bg-indigo-500/8 border border-indigo-500/20 rounded-lg">
              <span className="text-lg shrink-0">😴</span>
              <div>
                <p className="text-sm font-medium text-indigo-400">Prioritize more sleep</p>
                <p className="text-xs text-zinc-500 mt-0.5">You got {formatHours(data.today.sleep.duration)} last night. 7–9 hours is optimal for performance.</p>
              </div>
            </div>
          )}
          {data.user.disciplineScore >= 60 && (
            <div className="flex gap-3 p-3 bg-green-500/8 border border-green-500/20 rounded-lg">
              <span className="text-lg shrink-0">🏆</span>
              <div>
                <p className="text-sm font-medium text-green-400">Discipline score is solid</p>
                <p className="text-xs text-zinc-500 mt-0.5">Score of {data.user.disciplineScore}/100. Keep maintaining consistency — it's the hardest part.</p>
              </div>
            </div>
          )}
          {data.today.habits.rate >= 0.8 && (
            <div className="flex gap-3 p-3 bg-blue-500/8 border border-blue-500/20 rounded-lg">
              <span className="text-lg shrink-0">🔥</span>
              <div>
                <p className="text-sm font-medium text-blue-400">Excellent habit day!</p>
                <p className="text-xs text-zinc-500 mt-0.5">{Math.round(data.today.habits.rate * 100)}% completion rate. Compound this over weeks and watch your life transform.</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
