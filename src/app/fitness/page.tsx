'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, Plus, Scale, Activity, Flame, Clock, TrendingUp } from 'lucide-react'
import { useApi, apiPost } from '@/hooks/useApi'
import toast from 'react-hot-toast'
import {
  Button, Card, Modal, Input, Select, EmptyState, LoadingSpinner, PageHeader, Badge, StatCard
} from '@/components/ui'
import { WORKOUT_TYPES, formatDate, formatDuration, cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts'

interface Workout {
  id: string
  name: string
  type: string
  duration: number
  calories: number | null
  date: string
  notes: string | null
}

interface FitnessData {
  workouts: Workout[]
  stats: { _sum: { duration: number; calories: number }; _count: number; _avg: { duration: number } }
  weekCount: number
}

interface WeightLog {
  id: string
  date: string
  weight: number
  bodyFat: number | null
}

function AddWorkoutModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: () => void }) {
  const [form, setForm] = useState({
    name: '',
    type: 'gym',
    duration: '',
    calories: '',
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Enter a workout name')
    if (!form.duration) return toast.error('Enter duration')
    setLoading(true)
    const res = await apiPost('/api/fitness/workouts', {
      ...form,
      duration: parseInt(form.duration),
      calories: form.calories ? parseInt(form.calories) : undefined,
    })
    setLoading(false)
    if (res.success) {
      toast.success('Workout logged! +30 XP 💪')
      onAdd()
      onClose()
      setForm({ name: '', type: 'gym', duration: '', calories: '', notes: '', date: format(new Date(), 'yyyy-MM-dd') })
    } else {
      toast.error(res.error || 'Failed to log workout')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Workout">
      <div className="space-y-4">
        <Input
          label="Workout Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g., Push day, Morning run..."
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Type"
            value={form.type}
            onChange={v => setForm(f => ({ ...f, type: v }))}
            options={WORKOUT_TYPES}
          />
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Duration (minutes)"
            type="number"
            value={form.duration}
            onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
            placeholder="60"
          />
          <Input
            label="Calories burned"
            type="number"
            value={form.calories}
            onChange={e => setForm(f => ({ ...f, calories: e.target.value }))}
            placeholder="Optional"
          />
        </div>
        <Input
          label="Notes (optional)"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="How did it feel?"
        />
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">Log Workout</Button>
        </div>
      </div>
    </Modal>
  )
}

function LogWeightModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: () => void }) {
  const [form, setForm] = useState({ weight: '', bodyFat: '', date: format(new Date(), 'yyyy-MM-dd') })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.weight) return toast.error('Enter your weight')
    setLoading(true)
    const res = await apiPost('/api/fitness/weight', {
      weight: parseFloat(form.weight),
      bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : undefined,
      date: form.date,
    })
    setLoading(false)
    if (res.success) {
      toast.success('Weight logged!')
      onAdd()
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Weight">
      <div className="space-y-4">
        <Input
          label="Weight (kg)"
          type="number"
          step="0.1"
          value={form.weight}
          onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
          placeholder="75.5"
        />
        <Input
          label="Body Fat % (optional)"
          type="number"
          step="0.1"
          value={form.bodyFat}
          onChange={e => setForm(f => ({ ...f, bodyFat: e.target.value }))}
          placeholder="15.0"
        />
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
        />
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">Log Weight</Button>
        </div>
      </div>
    </Modal>
  )
}

const typeIconMap: Record<string, string> = {
  gym: '🏋️', cardio: '🏃', yoga: '🧘', sports: '⚽', cycling: '🚴', swimming: '🏊', other: '💪'
}

export default function FitnessPage() {
  const { data, loading, refetch } = useApi<FitnessData>('/api/fitness/workouts')
  const { data: weightLogs, refetch: refetchWeight } = useApi<WeightLog[]>('/api/fitness/weight')
  const [workoutOpen, setWorkoutOpen] = useState(false)
  const [weightOpen, setWeightOpen] = useState(false)

  const workouts = data?.workouts || []
  const stats = data?.stats

  // Chart data
  const last7Workouts = workouts.slice(0, 7).reverse().map(w => ({
    date: format(new Date(w.date), 'MM/dd'),
    duration: w.duration,
    calories: w.calories || 0,
  }))

  const weightChartData = (weightLogs || []).slice(0, 30).reverse().map(w => ({
    date: format(new Date(w.date), 'MM/dd'),
    weight: w.weight,
  }))

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Fitness"
        subtitle="Track your strength and progress"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setWeightOpen(true)} icon={<Scale size={14} />}>
              Log Weight
            </Button>
            <Button onClick={() => setWorkoutOpen(true)} icon={<Plus size={16} />}>
              Log Workout
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Total Workouts"
          value={stats?._count || 0}
          icon={<Dumbbell size={14} />}
          iconBg="bg-green-500/10"
          color="text-green-400"
        />
        <StatCard
          title="This Week"
          value={data?.weekCount || 0}
          subtitle="workouts"
          icon={<Activity size={14} />}
          iconBg="bg-blue-500/10"
          color="text-blue-400"
        />
        <StatCard
          title="Total Time"
          value={stats?._sum?.duration ? formatDuration(stats._sum.duration) : '0m'}
          icon={<Clock size={14} />}
          iconBg="bg-purple-500/10"
          color="text-purple-400"
        />
        <StatCard
          title="Calories Burned"
          value={stats?._sum?.calories ? `${Math.round(stats._sum.calories / 1000)}k` : '0'}
          icon={<Flame size={14} />}
          iconBg="bg-orange-500/10"
          color="text-orange-400"
        />
      </div>

      {/* Charts */}
      {last7Workouts.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-display font-semibold text-white text-sm mb-4">Workout Duration</h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={last7Workouts} barSize={16}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="duration" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {weightChartData.length > 1 && (
            <Card>
              <h3 className="font-display font-semibold text-white text-sm mb-4">Weight Trend (kg)</h3>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={weightChartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 11 }} />
                  <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {/* Workout list */}
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Recent Workouts</h2>
          {workouts.length === 0 ? (
            <EmptyState
              icon={<Dumbbell size={24} className="text-green-400" />}
              title="No workouts logged yet"
              description="Start tracking your gym sessions, runs, and more."
              action={<Button onClick={() => setWorkoutOpen(true)} icon={<Plus size={16} />}>Log Your First Workout</Button>}
            />
          ) : (
            workouts.map(w => (
              <div key={w.id} className="glass-card p-4 flex items-center gap-4">
                <div className="text-2xl">{typeIconMap[w.type] || '💪'}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">{w.name}</p>
                  <p className="text-xs text-zinc-500">{format(new Date(w.date), 'MMM d, yyyy')}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-right">
                  <div>
                    <p className="text-sm font-medium text-white">{formatDuration(w.duration)}</p>
                    {w.calories && <p className="text-xs text-zinc-500">{w.calories} kcal</p>}
                  </div>
                  <Badge variant="green">{w.type}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <AddWorkoutModal open={workoutOpen} onClose={() => setWorkoutOpen(false)} onAdd={refetch} />
      <LogWeightModal open={weightOpen} onClose={() => setWeightOpen(false)} onAdd={refetchWeight} />
    </div>
  )
}
