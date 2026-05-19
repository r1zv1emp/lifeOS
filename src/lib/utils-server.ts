import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export async function getAuthUser(request: NextRequest): Promise<{ userId: string; email: string } | null> {
  const authHeader = request.headers.get('authorization')
  const cookieToken = request.cookies.get('token')?.value

  const token = authHeader?.replace('Bearer ', '') || cookieToken

  if (!token) return null

  return verifyToken(token)
}

export function requireAuth() {
  return async (request: NextRequest) => {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }
    return user
  }
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getToday(): string {
  return formatDate(new Date())
}

export function calculateStreak(dates: string[]): number {
  if (!dates.length) return 0
  
  const sorted = [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  const today = getToday()
  const yesterday = formatDate(new Date(Date.now() - 86400000))
  
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0
  
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const current = new Date(sorted[i - 1])
    const prev = new Date(sorted[i])
    const diff = Math.round((current.getTime() - prev.getTime()) / 86400000)
    
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

export function calculateXP(action: string): number {
  const xpMap: Record<string, number> = {
    habit_complete: 10,
    habit_streak_7: 50,
    habit_streak_30: 200,
    workout: 30,
    sleep_logged: 15,
    journal_entry: 20,
    meal_logged: 10,
    focus_session: 25,
    nofap_day: 20,
    walk_logged: 15,
  }
  return xpMap[action] || 5
}

export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export function calculateDisciplineScore(data: {
  habitRate: number
  sleepScore: number
  workoutDays: number
  focusHours: number
  streak: number
}): number {
  const { habitRate, sleepScore, workoutDays, focusHours, streak } = data
  
  const habitPoints = habitRate * 40
  const sleepPoints = (sleepScore / 10) * 20
  const workoutPoints = Math.min(workoutDays / 5, 1) * 20
  const focusPoints = Math.min(focusHours / 4, 1) * 10
  const streakPoints = Math.min(streak / 30, 1) * 10
  
  return Math.round(habitPoints + sleepPoints + workoutPoints + focusPoints + streakPoints)
}
