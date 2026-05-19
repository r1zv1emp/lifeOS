'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Plus, Tag, Calendar, Smile } from 'lucide-react'
import { useApi, apiPost, apiDelete } from '@/hooks/useApi'
import toast from 'react-hot-toast'
import {
  Button, Card, Modal, Input, Select, Textarea, EmptyState, LoadingSpinner, PageHeader, Badge, StatCard
} from '@/components/ui'
import { getMoodEmoji, getMoodLabel, cn, formatRelative } from '@/lib/utils'
import { format } from 'date-fns'

interface Journal {
  id: string
  date: string
  title: string | null
  content: string
  type: string
  mood: number | null
  tags: string[]
  createdAt: string
}

const JOURNAL_TYPES = [
  { value: 'daily', label: '📝 Daily Journal' },
  { value: 'gratitude', label: '🙏 Gratitude' },
  { value: 'reflection', label: '🔮 Reflection' },
  { value: 'goals', label: '🎯 Goals' },
]

const JOURNAL_PROMPTS: Record<string, string[]> = {
  daily: [
    "What did I accomplish today?",
    "What challenged me today and how did I respond?",
    "What am I proud of?",
    "What will I do better tomorrow?"
  ],
  gratitude: [
    "3 things I'm grateful for today...",
    "One person who made my day better...",
    "Something I usually take for granted...",
    "A small win worth celebrating..."
  ],
  reflection: [
    "How am I progressing toward my goals?",
    "What patterns am I noticing in my behavior?",
    "What would my future self say to me right now?",
    "What belief is holding me back?"
  ],
  goals: [
    "My top priority this week is...",
    "Steps I'll take toward my main goal...",
    "Obstacles I might face and how I'll handle them...",
    "My commitment to myself today..."
  ],
}

function WriteJournalModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: () => void }) {
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    title: '',
    content: '',
    type: 'daily',
    mood: 7,
    tags: '',
  })
  const [loading, setLoading] = useState(false)
  const [promptIdx, setPromptIdx] = useState(0)

  const prompts = JOURNAL_PROMPTS[form.type] || []

  const handlePrompt = () => {
    const prompt = prompts[promptIdx % prompts.length]
    setForm(f => ({ ...f, content: f.content + (f.content ? '\n\n' : '') + prompt + '\n' }))
    setPromptIdx(i => i + 1)
  }

  const handleSubmit = async () => {
    if (!form.content.trim()) return toast.error('Write something first')
    setLoading(true)
    const res = await apiPost('/api/journal', {
      ...form,
      mood: form.mood,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    setLoading(false)
    if (res.success) {
      toast.success('Journal saved! +20 XP ✍️')
      onAdd()
      onClose()
      setForm({ date: format(new Date(), 'yyyy-MM-dd'), title: '', content: '', type: 'daily', mood: 7, tags: '' })
    } else {
      toast.error(res.error || 'Failed to save')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Write Journal Entry" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Type"
            value={form.type}
            onChange={v => setForm(f => ({ ...f, type: v }))}
            options={JOURNAL_TYPES}
          />
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          />
        </div>

        <Input
          label="Title (optional)"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Give your entry a title..."
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Entry</label>
            <button
              onClick={handlePrompt}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              + Prompt
            </button>
          </div>
          <Textarea
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="Start writing... your thoughts are safe here."
            rows={8}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Mood: {getMoodEmoji(form.mood)} {getMoodLabel(form.mood)} ({form.mood}/10)
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={form.mood}
            onChange={e => setForm(f => ({ ...f, mood: parseInt(e.target.value) }))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-zinc-600">
            <span>😢 Terrible</span>
            <span>😐 Okay</span>
            <span>🤩 Amazing</span>
          </div>
        </div>

        <Input
          label="Tags (optional, comma separated)"
          value={form.tags}
          onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
          placeholder="motivation, work, family..."
          icon={<Tag size={14} />}
        />

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">Save Entry</Button>
        </div>
      </div>
    </Modal>
  )
}

const typeColors: Record<string, 'blue' | 'green' | 'purple' | 'yellow'> = {
  daily: 'blue',
  gratitude: 'green',
  reflection: 'purple',
  goals: 'yellow',
}

export default function JournalPage() {
  const { data: journals, loading, refetch } = useApi<Journal[]>('/api/journal')
  const [addOpen, setAddOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = filter === 'all' ? (journals || []) : (journals || []).filter(j => j.type === filter)

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    const res = await apiDelete(`/api/journal?id=${id}`)
    if (res.success) {
      toast.success('Entry deleted')
      refetch()
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Journal"
        subtitle="Reflect. Grow. Remember."
        action={<Button onClick={() => setAddOpen(true)} icon={<Plus size={16} />}>Write Entry</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {['all', 'daily', 'gratitude', 'reflection'].map(type => {
          const count = type === 'all'
            ? (journals?.length || 0)
            : (journals?.filter(j => j.type === type).length || 0)
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                'glass-card p-3 text-center transition-all duration-200',
                filter === type ? 'border-blue-500/30 bg-blue-500/8' : 'hover:border-white/12'
              )}
            >
              <p className="font-display font-bold text-xl text-white">{count}</p>
              <p className="text-[11px] text-zinc-500 capitalize">{type}</p>
            </button>
          )
        })}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={24} className="text-yellow-400" />}
              title="No entries yet"
              description="Start journaling to track your thoughts, gratitude, and growth."
              action={<Button onClick={() => setAddOpen(true)} icon={<Plus size={16} />}>Write First Entry</Button>}
            />
          ) : (
            filtered.map(journal => (
              <motion.div
                key={journal.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 cursor-pointer hover:border-white/12 transition-all duration-200"
                onClick={() => setExpandedId(expandedId === journal.id ? null : journal.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl mt-0.5">
                    {journal.mood ? getMoodEmoji(journal.mood) : '📝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-medium text-white text-sm">
                        {journal.title || format(new Date(journal.date), 'MMMM d, yyyy')}
                      </h3>
                      <Badge variant={typeColors[journal.type] || 'zinc'}>
                        {journal.type}
                      </Badge>
                      {journal.mood && (
                        <span className="text-xs text-zinc-500">
                          {getMoodLabel(journal.mood)} ({journal.mood}/10)
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      'text-zinc-400 text-sm leading-relaxed',
                      expandedId !== journal.id && 'line-clamp-2'
                    )}>
                      {journal.content}
                    </p>
                    {journal.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {journal.tags.map(tag => (
                          <span key={tag} className="text-[10px] bg-white/5 text-zinc-500 px-2 py-0.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-zinc-600">{formatRelative(journal.createdAt)}</p>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(journal.id) }}
                      className="text-xs text-zinc-700 hover:text-red-400 mt-1 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      <WriteJournalModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={refetch} />
    </div>
  )
}
