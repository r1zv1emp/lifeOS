'use client'

import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ========== BUTTON ==========
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white',
    secondary: 'bg-white/8 hover:bg-white/12 text-zinc-200 border border-white/10',
    ghost: 'hover:bg-white/6 text-zinc-400 hover:text-white',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
    outline: 'border border-white/10 hover:border-white/20 text-zinc-200 hover:bg-white/4',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  )
}

// ========== CARD ==========
interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: 'blue' | 'green' | 'purple'
}

export function Card({ children, className, hover, glow }: CardProps) {
  return (
    <div
      className={cn(
        'glass-card p-5',
        hover && 'hover:border-white/12 hover:bg-white/6 transition-all duration-300 cursor-pointer',
        glow === 'blue' && 'glow-blue',
        glow === 'green' && 'glow-green',
        glow === 'purple' && 'glow-purple',
        className
      )}
    >
      {children}
    </div>
  )
}

// ========== INPUT ==========
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white',
              'placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8',
              'transition-all duration-200',
              icon && 'pl-9',
              error && 'border-red-500/50',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ========== TEXTAREA ==========
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white',
            'placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8',
            'transition-all duration-200 resize-none',
            error && 'border-red-500/50',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// ========== SELECT ==========
interface SelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string; icon?: string }[]
  className?: string
}

export function Select({ label, value, onChange, options, className }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={cn(
          'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white',
          'focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all duration-200',
          'cursor-pointer',
          className
        )}
        style={{ colorScheme: 'dark' }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: '#111' }}>
            {opt.icon} {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// ========== BADGE ==========
interface BadgeProps {
  children: ReactNode
  variant?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'zinc'
  className?: string
}

export function Badge({ children, variant = 'blue', className }: BadgeProps) {
  const variants = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    zinc: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  }

  return (
    <span className={cn('badge border', variants[variant], className)}>
      {children}
    </span>
  )
}

// ========== MODAL ==========
interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'w-full glass-card bg-[#111] relative',
                sizes[size]
              )}
              onClick={e => e.stopPropagation()}
            >
              {title && (
                <div className="flex items-center justify-between p-5 border-b border-white/8">
                  <h2 className="font-display font-semibold text-white">{title}</h2>
                  <button
                    onClick={onClose}
                    className="text-zinc-500 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="p-5">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// ========== STAT CARD ==========
interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  iconBg?: string
  trend?: { value: number; label: string }
  color?: string
}

export function StatCard({ title, value, subtitle, icon, iconBg, trend, color }: StatCardProps) {
  return (
    <Card className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{title}</p>
        {icon && (
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconBg || 'bg-blue-500/10')}>
            <span className={color || 'text-blue-400'}>{icon}</span>
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className={cn('font-display font-bold text-2xl text-white')}>{value}</p>
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium',
            trend.value >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </Card>
  )
}

// ========== PROGRESS RING ==========
interface ProgressRingProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
}

export function ProgressRing({ value, max = 100, size = 80, strokeWidth = 6, color = '#3b82f6', label }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / max, 1)
  const strokeDashoffset = circumference - progress * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      {label && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-white text-sm">{label}</span>
        </div>
      )}
    </div>
  )
}

// ========== EMPTY STATE ==========
interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-4 text-2xl">
          {icon}
        </div>
      )}
      <h3 className="font-display font-semibold text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-zinc-500 max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  )
}

// ========== LOADING SPINNER ==========
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <Loader2 className="animate-spin text-zinc-500" size={24} />
    </div>
  )
}

// ========== PAGE HEADER ==========
interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
