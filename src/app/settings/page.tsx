'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Shield, Trash2, Save, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { apiPost } from '@/hooks/useApi'
import toast from 'react-hot-toast'
import { Button, Card, Input, PageHeader } from '@/components/ui'
import { getLevelTitle, getXPForNextLevel } from '@/lib/utils'

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: '',
    timezone: 'UTC',
  })
  const [saving, setSaving] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' })

  const handleSave = async () => {
    setSaving(true)
    const res = await apiPost('/api/user/me', form)
    setSaving(false)
    if (res.success) {
      toast.success('Profile updated!')
      refreshUser()
    } else {
      toast.error('Failed to update')
    }
  }

  if (!user) return null

  const xpInfo = getXPForNextLevel(user.xp)

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      {/* Profile card */}
      <Card>
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl font-display font-bold text-blue-400">
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="font-display font-semibold text-white text-lg">{user.name}</h3>
            <p className="text-zinc-500 text-sm">{user.email}</p>
            <p className="text-xs text-blue-400 mt-0.5">Level {user.level} · {getLevelTitle(user.level)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
            <User size={14} /> Profile
          </h3>
          <Input
            label="Display Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Your name"
          />
          <Input
            label="Bio (optional)"
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="Tell us about your goals..."
          />
          <Input
            label="Email"
            value={user.email}
            disabled
            className="opacity-50"
          />
          <Button onClick={handleSave} loading={saving} icon={<Save size={14} />}>
            Save Changes
          </Button>
        </div>
      </Card>

      {/* XP & Level */}
      <Card>
        <h3 className="font-display font-semibold text-white text-sm mb-4 flex items-center gap-2">
          🏆 Progress & Gamification
        </h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-white/3 rounded-xl">
            <p className="font-display font-bold text-2xl text-yellow-400">{user.xp}</p>
            <p className="text-xs text-zinc-500">Total XP</p>
          </div>
          <div className="text-center p-3 bg-white/3 rounded-xl">
            <p className="font-display font-bold text-2xl text-white">Lv.{user.level}</p>
            <p className="text-xs text-zinc-500">{getLevelTitle(user.level)}</p>
          </div>
          <div className="text-center p-3 bg-white/3 rounded-xl">
            <p className="font-display font-bold text-2xl text-orange-400">{user.streak}</p>
            <p className="text-xs text-zinc-500">Day streak</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Level {user.level}</span>
            <span>{xpInfo.current} / {xpInfo.required} XP to Level {user.level + 1}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpInfo.percent}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </Card>

      {/* How XP works */}
      <Card>
        <h3 className="font-display font-semibold text-white text-sm mb-4">⚡ How You Earn XP</h3>
        <div className="space-y-2">
          {[
            { action: 'Complete a habit', xp: '+10 XP' },
            { action: 'Log a workout', xp: '+30 XP' },
            { action: 'Write a journal entry', xp: '+20 XP' },
            { action: 'Complete a focus session', xp: '+25 XP' },
            { action: 'Log sleep', xp: '+15 XP' },
            { action: 'Log a meal', xp: '+10 XP' },
            { action: 'Log a walk', xp: '+15 XP' },
            { action: '7-day habit streak', xp: '+50 XP' },
            { action: '30-day habit streak', xp: '+200 XP' },
          ].map(item => (
            <div key={item.action} className="flex justify-between items-center py-2 border-t border-white/4">
              <span className="text-sm text-zinc-400">{item.action}</span>
              <span className="text-sm font-medium text-yellow-400">{item.xp}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-500/15">
        <h3 className="font-display font-semibold text-red-400 text-sm mb-4 flex items-center gap-2">
          <Shield size={14} /> Account
        </h3>
        <div className="space-y-3">
          <Button
            variant="danger"
            onClick={logout}
            icon={<LogOut size={14} />}
            className="w-full justify-center"
          >
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  )
}
