'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Plus, AlertTriangle, Flame, RotateCcw } from 'lucide-react'
import { useApi, apiPost } from '@/hooks/useApi'
import toast from 'react-hot-toast'
import {
  Button, Card, Modal, Input, Select, EmptyState, LoadingSpinner, PageHeader, Badge
} from '@/components/ui'
import { BAD_HABIT_CATEGORIES, cn } from '@/lib/utils'

interface BadHabit {
  id: string
  name: string
  description: string | null
  icon: string
  category: string
  startDate: string
  streak: number
  lastRelapse: string | null
}

function StreakCard({ habit, onRelapse }: { habit: BadHabit; onRelapse: () => void }) {
  const [relapseOpen, setRelapseOpen] = useState(false)
  const [trigger, setTrigger] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const pct = Math.min((habit.streak / 90) * 100, 100)

  const milestones = [
    { days: 7, label: '1 Week', color: 'text-blue-400' },
    { days: 30, label: '1 Month', color: 'text-purple-400' },
    { days: 90, label: '90 Days', color: 'text-yellow-400' },
    { days: 180, label: '6 Months', color: 'text-orange-400' },
    { days: 365, label: '1 Year', color: 'text-red-400' },
  ]

  const nextMilestone = milestones.find(m => m.days > habit.streak) || milestones[milestones.length - 1]
  const daysToNext = nextMilestone.days - habit.streak

  const handleRelapse = async () => {
    setLoading(true)
    const res = await apiPost('/api/habits/bad/relapse', {
      badHabitId: habit.id,
      trigger,
      note,
    })
    setLoading(false)
    if (res.success) {
      toast.success('Relapse logged. Reset — you got this! 💪')
      setRelapseOpen(false)
      onRelapse()
    }
  }

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      nofap: 'text-red-400',
      smoking: 'text-orange-400',
      social_media: 'text-blue-400',
      dopamine: 'text-purple-400',
      junk_food: 'text-yellow-400',
    }
    return colors[cat] || 'text-zinc-400'
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{habit.icon}</div>
            <div>
              <h3 className="font-display font-semibold text-white">{habit.name}</h3>
              <Badge variant="zinc" className="text-[10px]">{habit.category.replace('_', ' ')}</Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display font-bold text-3xl text-white">{habit.streak}</div>
            <div className="text-xs text-zinc-500">days clean</div>
          </div>
        </div>

        {/* Progress bar to next milestone */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
            <span>Progress to {nextMilestone.label}</span>
            <span className={nextMilestone.color}>{daysToNext} days left</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Milestones */}
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {milestones.map(m => (
            <div
              key={m.days}
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-full border',
                habit.streak >= m.days
                  ? 'bg-green-500/15 border-green-500/30 text-green-400'
                  : 'bg-white/3 border-white/8 text-zinc-600'
              )}
            >
              {m.label}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-zinc-600">
            {habit.lastRelapse
              ? `Last slip: ${new Date(habit.lastRelapse).toLocaleDateString()}`
              : 'Never relapsed 🔥'
            }
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={<RotateCcw size={12} />}
            onClick={() => setRelapseOpen(true)}
          >
            Log Relapse
          </Button>
        </div>
      </motion.div>

      <Modal open={relapseOpen} onClose={() => setRelapseOpen(false)} title="Log a Relapse">
        <div className="space-y-4">
          <div className="p-4 bg-amber-500/8 border border-amber-500/20 rounded-lg">
            <p className="text-amber-400 text-sm font-medium">Don't be too hard on yourself.</p>
            <p className="text-zinc-400 text-xs mt-1">
              Logging your triggers helps you break the cycle. Every setback is data.
            </p>
          </div>

          <Input
            label="What triggered this? (optional)"
            value={trigger}
            onChange={e => setTrigger(e.target.value)}
            placeholder="e.g., stress, boredom, late night..."
          />

          <Input
            label="Notes (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Any thoughts or reflection..."
          />

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setRelapseOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={handleRelapse} loading={loading} className="flex-1">
              Reset Streak
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

function AddBadHabitModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: () => void }) {
  const [form, setForm] = useState({ name: '', category: 'nofap', description: '' })
  const [loading, setLoading] = useState(false)

  const catIcons: Record<string, string> = {
    nofap: '🔥', smoking: '🚭', social_media: '📵', dopamine: '🧘', junk_food: '🥗', alcohol: '🚫', other: '⚠️'
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Enter a name')
    setLoading(true)
    const res = await apiPost('/api/habits/bad', {
      ...form,
      icon: catIcons[form.category] || '⚠️',
    })
    setLoading(false)
    if (res.success) {
      toast.success('Recovery tracker started! Day 1 begins now. 💪')
      onAdd()
      onClose()
      setForm({ name: '', category: 'nofap', description: '' })
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Start Recovery Tracker">
      <div className="space-y-4">
        <Input
          label="Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g., No PMO, Quit smoking"
        />
        <Select
          label="Category"
          value={form.category}
          onChange={v => setForm(f => ({ ...f, category: v }))}
          options={BAD_HABIT_CATEGORIES}
        />
        <Input
          label="Why are you quitting? (optional)"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Your reason and motivation..."
        />
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">Start Journey</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function RecoveryPage() {
  const { data: badHabits, loading, refetch } = useApi<BadHabit[]>('/api/habits/bad')
  const [addOpen, setAddOpen] = useState(false)

  const totalDays = badHabits?.reduce((sum, h) => sum + h.streak, 0) || 0

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Recovery Tracker"
        subtitle="Break free. One day at a time."
        action={
          <Button onClick={() => setAddOpen(true)} icon={<Plus size={16} />}>
            Track New
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center py-5">
          <div className="font-display font-bold text-2xl text-white">{badHabits?.length || 0}</div>
          <div className="text-xs text-zinc-500 mt-1">Habits Breaking</div>
        </Card>
        <Card className="text-center py-5">
          <div className="font-display font-bold text-2xl text-green-400">{totalDays}</div>
          <div className="text-xs text-zinc-500 mt-1">Total Clean Days</div>
        </Card>
        <Card className="text-center py-5">
          <div className="font-display font-bold text-2xl text-yellow-400">
            {badHabits ? Math.max(...badHabits.map(h => h.streak), 0) : 0}
          </div>
          <div className="text-xs text-zinc-500 mt-1">Best Streak</div>
        </Card>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && (!badHabits || badHabits.length === 0) && (
        <EmptyState
          icon={<Shield size={24} className="text-purple-400" />}
          title="Start your recovery journey"
          description="Track NoFap, no smoking, social media detox, and more. Every day counts."
          action={<Button onClick={() => setAddOpen(true)} icon={<Plus size={16} />}>Start Tracking</Button>}
        />
      )}

      <div className="space-y-4">
        {badHabits?.map(habit => (
          <StreakCard key={habit.id} habit={habit} onRelapse={refetch} />
        ))}
      </div>

      <AddBadHabitModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={refetch} />
    </div>
  )
}
