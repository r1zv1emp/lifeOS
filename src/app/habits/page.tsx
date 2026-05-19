'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Target, CheckCircle2, Circle, Flame, MoreVertical, Trash2, Edit2, Calendar } from 'lucide-react'
import { useApi, apiPost, apiDelete } from '@/hooks/useApi'
import toast from 'react-hot-toast'
import {
  Button, Card, Modal, Input, Select, Badge, EmptyState, LoadingSpinner, PageHeader, ProgressRing
} from '@/components/ui'
import { HABIT_CATEGORIES, cn, formatDate } from '@/lib/utils'
import { format } from 'date-fns'

interface Habit {
  id: string
  name: string
  description: string | null
  icon: string
  color: string
  frequency: string
  category: string
  completedToday: boolean
  streak: number
  logs: { date: string }[]
}

const ICONS = ['⭐', '💪', '🧠', '📚', '🏃', '🥗', '💧', '🧘', '🎯', '⚡', '🌟', '❤️', '🔥', '🌱', '🎨']
const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#84CC16']

function HabitCard({ habit, onToggle, onDelete }: { habit: Habit; onToggle: () => void; onDelete: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    await onToggle()
    setLoading(false)
  }

  // Last 7 days mini heatmap
  const last7 = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = format(d, 'yyyy-MM-dd')
    const done = habit.logs.some(l => l.date.startsWith(dateStr))
    last7.push({ done, date: dateStr })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass-card p-4 transition-all duration-300',
        habit.completedToday && 'border-green-500/20 bg-green-500/3'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={loading}
          className="mt-0.5 shrink-0"
        >
          {habit.completedToday ? (
            <CheckCircle2 size={22} className="text-green-400" />
          ) : (
            <Circle size={22} className="text-zinc-600 hover:text-zinc-400 transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{habit.icon}</span>
            <h3 className={cn(
              'font-medium text-white text-sm truncate',
              habit.completedToday && 'line-through text-zinc-400'
            )}>
              {habit.name}
            </h3>
            <Badge variant="zinc" className="shrink-0 text-[10px] py-0">{habit.category}</Badge>
          </div>

          {/* Mini heatmap */}
          <div className="flex gap-1 mt-2">
            {last7.map((d, i) => (
              <div
                key={i}
                title={d.date}
                className={cn(
                  'w-4 h-4 rounded-sm',
                  d.done ? 'bg-blue-500/70' : 'bg-white/5'
                )}
              />
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {habit.streak > 0 && (
            <div className="flex items-center gap-1 text-orange-400">
              <Flame size={13} />
              <span className="text-xs font-bold">{habit.streak}</span>
            </div>
          )}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-zinc-600 hover:text-zinc-400 p-1 rounded transition-colors"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 glass-card py-1 z-10 shadow-xl">
                <button
                  onClick={() => { onDelete(); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={12} /> Delete habit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function AddHabitModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: () => void }) {
  const [form, setForm] = useState({
    name: '',
    icon: '⭐',
    color: '#3B82F6',
    category: 'general',
    frequency: 'daily',
    description: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Enter a habit name')
    setLoading(true)
    const res = await apiPost('/api/habits', form)
    setLoading(false)
    if (res.success) {
      toast.success('Habit created! 🎯')
      onAdd()
      onClose()
      setForm({ name: '', icon: '⭐', color: '#3B82F6', category: 'general', frequency: 'daily', description: '' })
    } else {
      toast.error(res.error || 'Failed to create habit')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add New Habit">
      <div className="space-y-4">
        <Input
          label="Habit Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g., Read 30 minutes"
        />

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Choose Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(icon => (
              <button
                key={icon}
                onClick={() => setForm(f => ({ ...f, icon }))}
                className={cn(
                  'w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all',
                  form.icon === icon ? 'bg-blue-500/20 border border-blue-500/40' : 'bg-white/5 border border-white/5 hover:bg-white/10'
                )}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <Select
          label="Category"
          value={form.category}
          onChange={v => setForm(f => ({ ...f, category: v }))}
          options={HABIT_CATEGORIES}
        />

        <Select
          label="Frequency"
          value={form.frequency}
          onChange={v => setForm(f => ({ ...f, frequency: v }))}
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
          ]}
        />

        <Input
          label="Description (optional)"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Why does this habit matter?"
        />

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">Create Habit</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function HabitsPage() {
  const { data: habits, loading, refetch } = useApi<Habit[]>('/api/habits')
  const [addOpen, setAddOpen] = useState(false)

  const handleToggle = async (habit: Habit) => {
    const res = await apiPost('/api/habits/log', { habitId: habit.id })
    if (res.success) {
      refetch()
      if ((res.data as any)?.completed) {
        toast.success(`✓ ${habit.name} completed! +10 XP`)
      }
    }
  }

  const handleDelete = async (id: string) => {
    const res = await apiDelete(`/api/habits/${id}`)
    if (res.success) {
      toast.success('Habit removed')
      refetch()
    }
  }

  const completed = habits?.filter(h => h.completedToday) || []
  const pending = habits?.filter(h => !h.completedToday) || []
  const allHabits = habits || []
  const completionRate = allHabits.length > 0 ? Math.round((completed.length / allHabits.length) * 100) : 0

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Habit Tracker"
        subtitle="Build the foundation of your best self"
        action={
          <Button onClick={() => setAddOpen(true)} icon={<Plus size={16} />}>
            Add Habit
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center py-4">
          <ProgressRing value={completionRate} size={56} strokeWidth={5} label={`${completionRate}%`} />
          <p className="text-xs text-zinc-500 mt-2">Today</p>
        </Card>
        <Card className="flex flex-col items-center justify-center py-4">
          <p className="font-display font-bold text-2xl text-white">{completed.length}/{allHabits.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Completed</p>
        </Card>
        <Card className="flex flex-col items-center justify-center py-4">
          <div className="flex items-center gap-1.5 text-orange-400">
            <Flame size={18} />
            <p className="font-display font-bold text-2xl text-white">
              {habits ? Math.max(...habits.map(h => h.streak), 0) : 0}
            </p>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Best streak</p>
        </Card>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && allHabits.length === 0 && (
        <EmptyState
          icon={<Target size={24} className="text-blue-400" />}
          title="No habits yet"
          description="Start building your dream life, one habit at a time."
          action={<Button onClick={() => setAddOpen(true)} icon={<Plus size={16} />}>Add Your First Habit</Button>}
        />
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">To Do ({pending.length})</h2>
          {pending.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={() => handleToggle(habit)}
              onDelete={() => handleDelete(habit.id)}
            />
          ))}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Completed Today ✓ ({completed.length})</h2>
          {completed.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={() => handleToggle(habit)}
              onDelete={() => handleDelete(habit.id)}
            />
          ))}
        </div>
      )}

      <AddHabitModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={refetch}
      />
    </div>
  )
}
