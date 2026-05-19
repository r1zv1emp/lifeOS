'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Plus, CheckCircle2, Circle, GripVertical, Trash2, Edit2 } from 'lucide-react'
import { useApi, apiPost } from '@/hooks/useApi'
import toast from 'react-hot-toast'
import { Button, Card, Modal, Input, EmptyState, LoadingSpinner, PageHeader, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'

interface RoutineStep {
  order: number
  task: string
  duration: number
  completed: boolean
}

interface Routine {
  id: string
  name: string
  type: string
  time: string | null
  steps: RoutineStep[]
}

function RoutineCard({ routine, onUpdate }: { routine: Routine; onUpdate: () => void }) {
  const [steps, setSteps] = useState<RoutineStep[]>(
    Array.isArray(routine.steps) ? routine.steps : []
  )
  const [saving, setSaving] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [newDuration, setNewDuration] = useState('5')
  const [addingStep, setAddingStep] = useState(false)

  const completedCount = steps.filter(s => s.completed).length
  const totalPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0
  const totalMinutes = steps.reduce((s, step) => s + step.duration, 0)

  const toggleStep = async (idx: number) => {
    const updated = steps.map((s, i) => i === idx ? { ...s, completed: !s.completed } : s)
    setSteps(updated)
    setSaving(true)
    await apiPost('/api/routines', { id: routine.id, steps: updated })
    setSaving(false)
  }

  const addStep = async () => {
    if (!newTask.trim()) return
    const updated = [...steps, {
      order: steps.length,
      task: newTask,
      duration: parseInt(newDuration) || 5,
      completed: false,
    }]
    setSteps(updated)
    setSaving(true)
    await apiPost('/api/routines', { id: routine.id, steps: updated })
    setSaving(false)
    setNewTask('')
    setNewDuration('5')
    setAddingStep(false)
    toast.success('Step added!')
  }

  const removeStep = async (idx: number) => {
    const updated = steps.filter((_, i) => i !== idx)
    setSteps(updated)
    setSaving(true)
    await apiPost('/api/routines', { id: routine.id, steps: updated })
    setSaving(false)
  }

  const Icon = routine.type === 'morning' ? Sun : Moon
  const iconColor = routine.type === 'morning' ? 'text-yellow-400' : 'text-indigo-400'
  const bgColor = routine.type === 'morning' ? 'bg-yellow-500/10' : 'bg-indigo-500/10'

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bgColor)}>
            <Icon size={20} className={iconColor} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-white">{routine.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              {routine.time && <span className="text-xs text-zinc-500">{routine.time}</span>}
              <span className="text-xs text-zinc-600">~{totalMinutes}min</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display font-bold text-xl text-white">{totalPercent}%</p>
          <p className="text-xs text-zinc-600">{completedCount}/{steps.length}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
        <motion.div
          className={cn('h-full rounded-full', totalPercent === 100 ? 'bg-green-500' : routine.type === 'morning' ? 'bg-yellow-500' : 'bg-indigo-500')}
          initial={{ width: 0 }}
          animate={{ width: `${totalPercent}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2 mb-4">
        {steps.length === 0 ? (
          <p className="text-sm text-zinc-600 text-center py-4">No steps yet. Add your first step below.</p>
        ) : (
          steps.map((step, idx) => (
            <motion.div
              key={idx}
              layout
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
                step.completed ? 'bg-green-500/5' : 'bg-white/3 hover:bg-white/5'
              )}
            >
              <button onClick={() => toggleStep(idx)} className="shrink-0">
                {step.completed
                  ? <CheckCircle2 size={18} className="text-green-400" />
                  : <Circle size={18} className="text-zinc-600 hover:text-zinc-400 transition-colors" />
                }
              </button>
              <span className={cn('flex-1 text-sm', step.completed ? 'line-through text-zinc-600' : 'text-zinc-300')}>
                {step.task}
              </span>
              <span className="text-xs text-zinc-600 shrink-0">{step.duration}m</span>
              <button
                onClick={() => removeStep(idx)}
                className="text-zinc-700 hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Add step */}
      {addingStep ? (
        <div className="flex gap-2">
          <Input
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            placeholder="Step task..."
            className="flex-1"
            onKeyDown={e => e.key === 'Enter' && addStep()}
          />
          <Input
            value={newDuration}
            onChange={e => setNewDuration(e.target.value)}
            type="number"
            placeholder="min"
            className="w-16"
          />
          <Button size="sm" onClick={addStep} loading={saving}>Add</Button>
          <Button size="sm" variant="ghost" onClick={() => setAddingStep(false)}>✕</Button>
        </div>
      ) : (
        <button
          onClick={() => setAddingStep(true)}
          className="w-full py-2 border border-dashed border-white/10 rounded-lg text-xs text-zinc-600 hover:text-zinc-400 hover:border-white/20 transition-all"
        >
          + Add step
        </button>
      )}
    </Card>
  )
}

function CreateRoutineModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: () => void }) {
  const [form, setForm] = useState({ name: '', type: 'morning', time: '06:00' })
  const [loading, setLoading] = useState(false)

  const defaultSteps: Record<string, RoutineStep[]> = {
    morning: [
      { order: 0, task: 'Wake up without snoozing', duration: 1, completed: false },
      { order: 1, task: 'Drink 500ml water', duration: 2, completed: false },
      { order: 2, task: 'Meditate / breathwork', duration: 10, completed: false },
      { order: 3, task: 'Exercise / walk', duration: 30, completed: false },
      { order: 4, task: 'Cold shower', duration: 5, completed: false },
      { order: 5, task: 'Healthy breakfast', duration: 15, completed: false },
      { order: 6, task: 'Review goals / journal', duration: 10, completed: false },
    ],
    evening: [
      { order: 0, task: 'Stop screens 1hr before bed', duration: 5, completed: false },
      { order: 1, task: 'Review day & journal', duration: 10, completed: false },
      { order: 2, task: 'Read physical book', duration: 20, completed: false },
      { order: 3, task: 'Stretching / yoga', duration: 10, completed: false },
      { order: 4, task: 'Set tomorrow\'s priorities', duration: 5, completed: false },
      { order: 5, task: 'Lights out on time', duration: 1, completed: false },
    ],
  }

  const handleSubmit = async () => {
    setLoading(true)
    const res = await apiPost('/api/routines', {
      ...form,
      steps: defaultSteps[form.type] || [],
    })
    setLoading(false)
    if (res.success) {
      toast.success('Routine created!')
      onAdd()
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Routine">
      <div className="space-y-4">
        <Input
          label="Routine Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Morning Power Routine"
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Type</label>
            <div className="flex gap-2">
              {['morning', 'evening'].map(type => (
                <button
                  key={type}
                  onClick={() => setForm(f => ({ ...f, type }))}
                  className={cn(
                    'flex-1 py-2.5 text-sm rounded-lg border transition-all capitalize',
                    form.type === type
                      ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                      : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/20'
                  )}
                >
                  {type === 'morning' ? '☀️' : '🌙'} {type}
                </button>
              ))}
            </div>
          </div>
          <Input label="Start Time" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
        </div>
        <p className="text-xs text-zinc-500">
          We'll pre-fill with recommended steps for a {form.type} routine. You can customize afterwards.
        </p>
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">Create Routine</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function RoutinesPage() {
  const { data: routines, loading, refetch } = useApi<Routine[]>('/api/routines')
  const [addOpen, setAddOpen] = useState(false)

  const morning = routines?.filter(r => r.type === 'morning') || []
  const evening = routines?.filter(r => r.type === 'evening') || []

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Routines"
        subtitle="Structure creates freedom"
        action={<Button onClick={() => setAddOpen(true)} icon={<Plus size={16} />}>New Routine</Button>}
      />

      {loading ? <LoadingSpinner /> : (
        <>
          {routines?.length === 0 && (
            <EmptyState
              icon={<Sun size={24} className="text-yellow-400" />}
              title="No routines yet"
              description="Create your morning and evening routines to build daily structure."
              action={<Button onClick={() => setAddOpen(true)} icon={<Plus size={16} />}>Create First Routine</Button>}
            />
          )}

          {morning.length > 0 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                <Sun size={12} className="text-yellow-400" /> Morning
              </h2>
              {morning.map(r => <RoutineCard key={r.id} routine={r} onUpdate={refetch} />)}
            </div>
          )}

          {evening.length > 0 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                <Moon size={12} className="text-indigo-400" /> Evening
              </h2>
              {evening.map(r => <RoutineCard key={r.id} routine={r} onUpdate={refetch} />)}
            </div>
          )}
        </>
      )}

      <CreateRoutineModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={refetch} />
    </div>
  )
}
