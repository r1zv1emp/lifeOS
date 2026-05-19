import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, pattern = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern)
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'h:mm a')
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function getLevelTitle(level: number): string {
  const titles = [
    'Beginner', 'Apprentice', 'Seeker', 'Warrior', 'Champion',
    'Master', 'Grandmaster', 'Legend', 'Elite', 'Supreme'
  ]
  return titles[Math.min(level - 1, titles.length - 1)] || 'Supreme'
}

export function getXPForNextLevel(currentXP: number): { current: number; required: number; percent: number } {
  const level = Math.floor(Math.sqrt(currentXP / 100)) + 1
  const currentLevelXP = (level - 1) * (level - 1) * 100
  const nextLevelXP = level * level * 100
  const required = nextLevelXP - currentLevelXP
  const current = currentXP - currentLevelXP
  const percent = Math.round((current / required) * 100)
  return { current, required, percent }
}

export function getDisciplineRank(score: number): { rank: string; color: string } {
  if (score >= 90) return { rank: 'Legendary', color: 'text-yellow-400' }
  if (score >= 75) return { rank: 'Elite', color: 'text-purple-400' }
  if (score >= 60) return { rank: 'Strong', color: 'text-blue-400' }
  if (score >= 45) return { rank: 'Building', color: 'text-green-400' }
  if (score >= 30) return { rank: 'Starting', color: 'text-zinc-400' }
  return { rank: 'Rookie', color: 'text-zinc-500' }
}

export function getStreakDays(startDate: string): number {
  const start = parseISO(startDate)
  const now = new Date()
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export function generateHeatmapData(logs: { date: string }[], days = 365) {
  const counts: Record<string, number> = {}
  logs.forEach(log => {
    const key = log.date.split('T')[0]
    counts[key] = (counts[key] || 0) + 1
  })

  const data = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const key = format(date, 'yyyy-MM-dd')
    data.push({ date: key, count: counts[key] || 0 })
  }
  return data
}

export function getMoodEmoji(mood: number): string {
  if (mood >= 9) return '🤩'
  if (mood >= 7) return '😊'
  if (mood >= 5) return '😐'
  if (mood >= 3) return '😔'
  return '😢'
}

export function getMoodLabel(mood: number): string {
  if (mood >= 9) return 'Amazing'
  if (mood >= 7) return 'Good'
  if (mood >= 5) return 'Okay'
  if (mood >= 3) return 'Low'
  return 'Terrible'
}

export function getSleepQualityLabel(quality: number): string {
  if (quality >= 8) return 'Excellent'
  if (quality >= 6) return 'Good'
  if (quality >= 4) return 'Fair'
  return 'Poor'
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str
}

export const HABIT_CATEGORIES = [
  { value: 'health', label: 'Health', icon: '❤️' },
  { value: 'fitness', label: 'Fitness', icon: '💪' },
  { value: 'mindset', label: 'Mindset', icon: '🧠' },
  { value: 'learning', label: 'Learning', icon: '📚' },
  { value: 'productivity', label: 'Productivity', icon: '⚡' },
  { value: 'social', label: 'Social', icon: '👥' },
  { value: 'spiritual', label: 'Spiritual', icon: '🙏' },
  { value: 'general', label: 'General', icon: '⭐' },
]

export const BAD_HABIT_CATEGORIES = [
  { value: 'nofap', label: 'NoFap', icon: '🔥' },
  { value: 'smoking', label: 'No Smoking', icon: '🚭' },
  { value: 'social_media', label: 'Social Media', icon: '📵' },
  { value: 'dopamine', label: 'Dopamine Detox', icon: '🧘' },
  { value: 'junk_food', label: 'Junk Food', icon: '🥗' },
  { value: 'alcohol', label: 'Alcohol', icon: '🚫' },
  { value: 'other', label: 'Other', icon: '⚠️' },
]

export const WORKOUT_TYPES = [
  { value: 'gym', label: 'Gym', icon: '🏋️' },
  { value: 'cardio', label: 'Cardio', icon: '🏃' },
  { value: 'yoga', label: 'Yoga', icon: '🧘' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'cycling', label: 'Cycling', icon: '🚴' },
  { value: 'swimming', label: 'Swimming', icon: '🏊' },
  { value: 'other', label: 'Other', icon: '💪' },
]

export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🍎' },
]
