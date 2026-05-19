'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowRight, Zap, Target, Brain, Moon, Dumbbell, 
  BookOpen, BarChart3, Shield, Trophy, Flame, Heart,
  CheckCircle2, Star
} from 'lucide-react'

const features = [
  { icon: Target, title: 'Habit Tracker', desc: 'Build powerful habits with streaks, heatmaps, and analytics', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: Shield, title: 'Bad Habit Recovery', desc: 'Track NoFap, no smoking, dopamine detox with relapse logs', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Dumbbell, title: 'Fitness System', desc: 'Log workouts, track weight, walking, calories & gym progress', color: 'text-green-400', bg: 'bg-green-500/10' },
  { icon: Moon, title: 'Sleep Tracker', desc: 'Monitor sleep quality, bedtime consistency & deep sleep', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { icon: BookOpen, title: 'Journal System', desc: 'Daily journal, gratitude, mood tracking & reflection', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { icon: Brain, title: 'Productivity', desc: 'Focus timer, deep work sessions & productivity analytics', color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { icon: BarChart3, title: 'Analytics', desc: 'Beautiful charts and reports across all life areas', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Trophy, title: 'Gamification', desc: 'Earn XP, level up, unlock achievements & track discipline score', color: 'text-orange-400', bg: 'bg-orange-500/10' },
]

const stats = [
  { value: '12+', label: 'Life Systems' },
  { value: '100%', label: 'Private & Secure' },
  { value: '∞', label: 'Streaks to Build' },
  { value: '1', label: 'App for Everything' },
]

const testimonials = [
  { name: 'Ahmad K.', text: 'Finally one app that tracks everything. My discipline score went from 30 to 87 in 3 months.', stars: 5 },
  { name: 'Marcus R.', text: 'The NoFap tracker with trigger logs changed my recovery completely. On day 180 now.', stars: 5 },
  { name: 'Sara M.', text: 'The morning routine system and focus timer doubled my productive hours.', stars: 5 },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none" />
      
      {/* Gradient orbs */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px] pointer-events-none" />

      {/* NAV */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">LifeOS</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex items-center gap-8 text-sm text-zinc-400"
        >
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How It Works</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link href="/auth/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link 
            href="/auth/signup"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200"
          >
            Start Free <ArrowRight size={14} />
          </Link>
        </motion.div>
      </nav>

      {/* HERO */}
      <section className="relative pt-20 pb-32 px-6 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium px-4 py-2 rounded-full mb-8"
        >
          <Flame size={12} className="text-orange-400" />
          Build Unbreakable Discipline
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-5xl md:text-7xl font-bold leading-[1.08] tracking-tight mb-6"
        >
          Your Life.<br />
          <span className="gradient-text">Fully Systemized.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The all-in-one operating system for self-improvement. Track habits, fitness, sleep, NoFap, diet, journaling, and productivity — all in one premium dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/auth/signup"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 text-base glow-blue"
          >
            Start Building Discipline <ArrowRight size={18} />
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center gap-2 glass text-zinc-300 hover:text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200 text-base"
          >
            Sign In
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 text-xs text-zinc-600"
        >
          Free to use. No credit card required.
        </motion.p>

        {/* STATS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px mt-20 bg-white/5 rounded-2xl overflow-hidden border border-white/5"
        >
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#0d0d0d] px-6 py-6 text-center">
              <div className="font-display text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Everything you need.<br /><span className="gradient-text">Nothing you don't.</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            12 interconnected systems working together to optimize every area of your life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 hover:border-white/12 transition-all duration-300 group"
            >
              <div className={`w-10 h-10 ${f.bg} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <f.icon size={20} className={f.color} />
              </div>
              <h3 className="font-display font-semibold text-white mb-1.5">{f.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-6 py-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl font-bold mb-4">Get started in minutes</h2>
          <p className="text-zinc-400">No complicated setup. No learning curve.</p>
        </motion.div>

        <div className="space-y-4">
          {[
            { step: '01', title: 'Create your account', desc: 'Sign up with email or Google. Takes 30 seconds.' },
            { step: '02', title: 'Set up your habits', desc: 'Add the habits you want to build and bad habits to break.' },
            { step: '03', title: 'Track daily', desc: 'Check in each day, log your data, and watch your discipline score grow.' },
            { step: '04', title: 'Review analytics', desc: 'See beautiful charts, weekly reports, and celebrate your progress.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 flex gap-6 items-start"
            >
              <div className="font-display text-4xl font-bold text-white/10 shrink-0 w-12">{item.step}</div>
              <div>
                <h3 className="font-display font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-zinc-500 text-sm">{item.desc}</p>
              </div>
              <CheckCircle2 className="ml-auto text-green-400 shrink-0 mt-0.5" size={20} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="px-6 py-24 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl font-bold mb-4">Real results, real people</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(t.stars)].map((_, j) => (
                  <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
              <p className="text-zinc-500 text-xs font-medium">— {t.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-600/5 rounded-xl" />
          <div className="relative">
            <div className="text-5xl mb-6">🔥</div>
            <h2 className="font-display text-4xl font-bold mb-4">Start your streak today</h2>
            <p className="text-zinc-400 mb-8">Join thousands building discipline and taking control of their lives.</p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 text-base"
            >
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 px-6 py-8 text-center text-zinc-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <span className="font-display font-bold text-zinc-400">LifeOS</span>
        </div>
        <p>Built for warriors. © {new Date().getFullYear()} LifeOS. All rights reserved.</p>
      </footer>
    </div>
  )
}
