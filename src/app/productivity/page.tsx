'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Play, Pause, RotateCcw, Plus, CheckCircle2, Clock } from 'lucide-react'
import { useApi, apiPost } from '@/hooks/useApi'
import toast from 'react-hot-toast'
import { Button, Card, Input, LoadingSpinner, PageHeader, StatCard, Badge } from '@/components/ui'
import { formatDuration, cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

interface FocusSession {
  id: string
  duration: number
  type: string
  task: string | null
  completed: boolean
  createdAt: string
}

interface ProductivityData {
  sessions: FocusSession[]
  stats: { _sum: { duration: number }; _count: number; _avg: { duration: number } }
  today: { _sum: { duration: number }; _count: number }
}

const TIMER_MODES = [
  { label: 'Pomodoro', value: 'pomodoro', duration: 25 },
  { label: 'Short Break', value: 'short_break', duration: 5 },
  { label: 'Deep Work', value: 'deep_work', duration: 90 },
  { label: 'Flow', value: 'flow', duration: 60 },
]

function FocusTimer({ onComplete }: { onComplete: (duration: number, type: string, task: string) => void }) {
  const [mode, setMode] = useState(TIMER_MODES[0])
  const [timeLeft, setTimeLeft] = useState(mode.duration * 60)
  const [running, setRunning] = useState(false)
  const [task, setTask] = useState('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const totalDurationRef = useRef<number>(mode.duration * 60)

  const totalSeconds = mode.duration * 60
  const progress = (timeLeft / totalSeconds) * 100
  const circumference = 2 * Math.PI * 120
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const start = () => {
    if (!running) {
      startTimeRef.current = Date.now()
      setRunning(true)
    }
  }

  const pause = () => setRunning(false)

  const reset = () => {
    setRunning(false)
    setTimeLeft(mode.duration * 60)
  }

  const switchMode = (m: typeof TIMER_MODES[0]) => {
    setMode(m)
    setRunning(false)
    setTimeLeft(m.duration * 60)
    totalDurationRef.current = m.duration * 60
  }

  useEffect(() => {
    setTimeLeft(mode.duration * 60)
    totalDurationRef.current = mode.duration * 60
  }, [mode])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            const elapsed = Math.round((Date.now() - startTimeRef.current) / 60000)
            onComplete(elapsed || mode.duration, mode.value, task)
            toast.success(`🎯 Focus session complete! +25 XP`)
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const completedPercent = Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100)

  return (
    <div className="glass-card p-6 flex flex-col items-center">
      {/* Mode selector */}
      <div className="flex gap-1 mb-6 bg-white/5 rounded-lg p-1 w-full max-w-sm">
        {TIMER_MODES.map(m => (
          <button
            key={m.value}
            onClick={() => switchMode(m)}
            className={cn(
              'flex-1 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
              mode.value === m.value
                ? 'bg-blue-600 text-white'
                : 'text-zinc-500 hover:text-white'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="relative mb-6">
        <svg width="280" height="280" className="-rotate-90">
          <circle cx="140" cy="140" r="120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="140" cy="140" r="120" fill="none"
            stroke={running ? '#3b82f6' : '#374151'}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'none' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-5xl text-white tracking-tight">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-zinc-500 mt-1">{mode.label}</span>
          {running && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 mt-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs text-blue-400">Focusing</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Task input */}
      <div className="w-full max-w-sm mb-5">
        <Input
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder="What are you focusing on?"
          className="text-center"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 transition-all"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={running ? pause : start}
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200',
            running
              ? 'bg-white/10 hover:bg-white/15 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          )}
        >
          {running ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
        </button>
        <div className="w-10 h-10" />
      </div>
    </div>
  )
}

export default function ProductivityPage() {
  const { data, loading, refetch } = useApi<ProductivityData>('/api/productivity')

  const handleSessionComplete = async (duration: number, type: string, task: string) => {
    await apiPost('/api/productivity', { duration, type, task, completed: true })
    refetch()
  }

  const sessions = data?.sessions || []
  const today = data?.today
  const stats = data?.stats

  // Chart: last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = format(d, 'yyyy-MM-dd')
    const daySessions = sessions.filter(s => s.createdAt.startsWith(dateStr))
    return {
      day: format(d, 'EEE'),
      minutes: daySessions.reduce((sum, s) => sum + s.duration, 0),
      sessions: daySessions.length,
    }
  })

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Focus & Productivity"
        subtitle="Deep work builds mastery"
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Timer */}
        <FocusTimer onComplete={handleSessionComplete} />

        {/* Stats */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="text-center py-4">
              <p className="font-display font-bold text-2xl text-white">
                {today?._sum?.duration ? formatDuration(today._sum.duration) : '0m'}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Today</p>
            </Card>
            <Card className="text-center py-4">
              <p className="font-display font-bold text-2xl text-white">{today?._count || 0}</p>
              <p className="text-xs text-zinc-500 mt-1">Sessions</p>
            </Card>
            <Card className="text-center py-4">
              <p className="font-display font-bold text-2xl text-white">
                {stats?._sum?.duration ? formatDuration(stats._sum.duration) : '0m'}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Total Focus</p>
            </Card>
            <Card className="text-center py-4">
              <p className="font-display font-bold text-2xl text-white">{stats?._count || 0}</p>
              <p className="text-xs text-zinc-500 mt-1">All Sessions</p>
            </Card>
          </div>

          <Card>
            <h3 className="font-display font-semibold text-white text-sm mb-4">Focus Minutes — 7 Days</h3>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={last7} barSize={20}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="minutes" fill="#8b5cf6" radius={[3, 3, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Recent sessions */}
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Recent Sessions</h2>
          {sessions.slice(0, 10).map(session => (
            <div key={session.id} className="glass-card px-4 py-3 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <Brain size={14} className="text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{session.task || 'Focus session'}</p>
                <p className="text-xs text-zinc-500">{format(new Date(session.createdAt), 'MMM d, h:mm a')}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="purple">{formatDuration(session.duration)}</Badge>
                {session.completed && <CheckCircle2 size={14} className="text-green-400" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
