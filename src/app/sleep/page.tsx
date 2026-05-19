'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Plus, Star } from 'lucide-react'
import { useApi, apiPost } from '@/hooks/useApi'
import toast from 'react-hot-toast'
import {
  Button, Card, Modal, Input, EmptyState, LoadingSpinner, PageHeader, StatCard, Badge
} from '@/components/ui'
import { formatHours, getSleepQualityLabel, cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts'

interface SleepLog {
  id: string
  date: string
  bedtime: string
  wakeTime: string
  duration: number
  quality: number
  notes: string | null
}

interface SleepData {
  logs: SleepLog[]
  stats: { _avg: { duration: number; quality: number }; _count: number }
}

function AddSleepModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: () => void }) {
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    bedtime: '23:00',
    wakeTime: '07:00',
    quality: 7,
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    const res = await apiPost('/api/sleep', form)
    setLoading(false)
    if (res.success) {
      toast.success('Sleep logged! +15 XP 😴')
      onAdd()
      onClose()
    } else {
      toast.error(res.error || 'Failed to log sleep')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Sleep">
      <div className="space-y-4">
        <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Bedtime" type="time" value={form.bedtime} onChange={e => setForm(f => ({ ...f, bedtime: e.target.value }))} />
          <Input label="Wake Time" type="time" value={form.wakeTime} onChange={e => setForm(f => ({ ...f, wakeTime: e.target.value }))} />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Sleep Quality: {form.quality}/10</label>
          <div className="flex gap-1">
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button
                key={n}
                onClick={() => setForm(f => ({ ...f, quality: n }))}
                className={cn(
                  'flex-1 h-8 rounded text-xs font-medium transition-all',
                  n <= form.quality
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-zinc-600 hover:bg-white/10'
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-500 text-center">{getSleepQualityLabel(form.quality)}</p>
        </div>

        <Input
          label="Notes (optional)"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Dreams, interruptions, how rested you feel..."
        />

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">Log Sleep</Button>
        </div>
      </div>
    </Modal>
  )
}

function QualityDots({ quality }: { quality: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            i < quality ? 'bg-blue-400' : 'bg-white/10'
          )}
        />
      ))}
    </div>
  )
}

export default function SleepPage() {
  const { data, loading, refetch } = useApi<SleepData>('/api/sleep')
  const [addOpen, setAddOpen] = useState(false)

  const logs = data?.logs || []
  const stats = data?.stats

  const chartData = logs.slice(0, 14).reverse().map(l => ({
    date: format(new Date(l.date), 'MM/dd'),
    hours: Math.round(l.duration * 10) / 10,
    quality: l.quality,
  }))

  const avgDuration = stats?._avg?.duration || 0
  const avgQuality = stats?._avg?.quality || 0

  const getDurationColor = (h: number) => {
    if (h >= 7.5) return 'text-green-400'
    if (h >= 6) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Sleep Tracker"
        subtitle="Rest is where growth happens"
        action={<Button onClick={() => setAddOpen(true)} icon={<Plus size={16} />}>Log Sleep</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Avg Sleep" value={formatHours(avgDuration)} icon={<Moon size={14} />} iconBg="bg-indigo-500/10" color="text-indigo-400" />
        <StatCard title="Avg Quality" value={`${Math.round(avgQuality * 10) / 10}/10`} icon={<Star size={14} />} iconBg="bg-yellow-500/10" color="text-yellow-400" />
        <StatCard title="Total Logs" value={stats?._count || 0} icon={<Sun size={14} />} iconBg="bg-orange-500/10" color="text-orange-400" />
        <StatCard
          title="Best Night"
          value={logs.length ? formatHours(Math.max(...logs.map(l => l.duration))) : '—'}
          icon={<Moon size={14} />}
          iconBg="bg-blue-500/10"
          color="text-blue-400"
        />
      </div>

      {chartData.length > 1 && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-display font-semibold text-white text-sm mb-4">Sleep Duration (hrs)</h3>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 12]} tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="hours" stroke="#6366f1" fill="url(#sleepGrad)" strokeWidth={2} dot={{ fill: '#6366f1', r: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="font-display font-semibold text-white text-sm mb-4">Sleep Quality</h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} barSize={14}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="quality" fill="#f59e0b" radius={[3, 3, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Sleep Log</h2>
          {logs.length === 0 ? (
            <EmptyState
              icon={<Moon size={24} className="text-indigo-400" />}
              title="No sleep logged yet"
              description="Track your sleep to understand your rest patterns and improve recovery."
              action={<Button onClick={() => setAddOpen(true)} icon={<Plus size={16} />}>Log Tonight's Sleep</Button>}
            />
          ) : (
            logs.map(log => (
              <div key={log.id} className="glass-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Moon size={18} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-white text-sm">{format(new Date(log.date), 'EEEE, MMM d')}</p>
                    <Badge variant={log.quality >= 7 ? 'green' : log.quality >= 5 ? 'yellow' : 'red'}>
                      {getSleepQualityLabel(log.quality)}
                    </Badge>
                  </div>
                  <QualityDots quality={log.quality} />
                </div>
                <div className="text-right shrink-0">
                  <p className={cn('font-display font-bold text-lg', getDurationColor(log.duration))}>
                    {formatHours(log.duration)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {format(new Date(log.bedtime), 'h:mm a')} → {format(new Date(log.wakeTime), 'h:mm a')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <AddSleepModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={refetch} />
    </div>
  )
}
