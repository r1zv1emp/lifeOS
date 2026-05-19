'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuth, AuthProvider } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { Button, Input } from '@/components/ui'

function SignupForm() {
  const { signup } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const passwordStrength = (pw: string) => {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }

  const strength = passwordStrength(form.password)
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Fill in all fields')
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')

    setLoading(true)
    const res = await signup(form.name, form.email, form.password)
    setLoading(false)

    if (res.success) {
      toast.success('Account created! Let\'s build discipline 🔥')
      router.push('/dashboard')
    } else {
      toast.error(res.error || 'Signup failed')
    }
  }

  const benefits = [
    'Habit tracker with streaks & heatmaps',
    'NoFap, no smoking & recovery tracking',
    'Sleep, fitness, diet & focus all-in-one',
    'Gamification: XP, levels & discipline score',
  ]

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 grid-bg">
      <div className="absolute top-0 right-1/3 w-[400px] h-[400px] bg-purple-600/6 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">LifeOS</span>
        </Link>

        <div className="glass-card p-7">
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl text-white mb-1">Start your journey</h1>
            <p className="text-zinc-500 text-sm">Free forever. No credit card required.</p>
          </div>

          {/* Benefits */}
          <div className="mb-6 space-y-2">
            {benefits.map(b => (
              <div key={b} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                <span className="text-xs text-zinc-400">{b}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your Name"
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="John Doe"
              icon={<User size={14} />}
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
              icon={<Mail size={14} />}
              autoComplete="email"
            />
            <div className="space-y-2">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 8 characters"
                  icon={<Lock size={14} />}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 bottom-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? strengthColors[strength] : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-600">{strengthLabels[strength]}</p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full justify-center"
              size="lg"
            >
              Create Free Account <ArrowRight size={16} />
            </Button>
          </form>

          <p className="text-xs text-zinc-600 text-center mt-4">
            By signing up you agree to our terms. Your data stays private.
          </p>

          <div className="mt-5 pt-5 border-t border-white/5 text-center">
            <p className="text-sm text-zinc-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <AuthProvider>
      <SignupForm />
    </AuthProvider>
  )
}
