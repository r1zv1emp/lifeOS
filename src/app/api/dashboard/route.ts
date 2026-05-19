import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, getToday } from '@/lib/utils-server'
import { startOfWeek, endOfWeek, startOfMonth, subDays, format } from 'date-fns'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const today = new Date()
    const todayStr = getToday()
    const weekStart = startOfWeek(today, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
    const monthStart = startOfMonth(today)

    // User data
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { xp: true, level: true, disciplineScore: true, streak: true, longestStreak: true },
    })

    // Today's habits
    const habits = await prisma.habit.findMany({
      where: { userId: auth.userId, isActive: true },
      include: {
        logs: {
          where: { date: { gte: new Date(todayStr), lte: new Date(todayStr + 'T23:59:59') } },
        },
      },
    })

    const habitsCompleted = habits.filter(h => h.logs.length > 0).length
    const habitRate = habits.length > 0 ? habitsCompleted / habits.length : 0

    // Today's sleep
    const todaySleep = await prisma.sleepLog.findUnique({
      where: { userId_date: { userId: auth.userId, date: new Date(todayStr) } },
    })

    // Week workouts
    const weekWorkouts = await prisma.workout.count({
      where: { userId: auth.userId, date: { gte: weekStart, lte: weekEnd } },
    })

    // Today's focus
    const todayFocus = await prisma.focusSession.aggregate({
      where: { userId: auth.userId, date: { gte: new Date(todayStr), lte: new Date(todayStr + 'T23:59:59') } },
      _sum: { duration: true },
    })

    // Week focus
    const weekFocus = await prisma.focusSession.aggregate({
      where: { userId: auth.userId, date: { gte: weekStart, lte: weekEnd } },
      _sum: { duration: true },
    })

    // Today's water
    const todayWater = await prisma.waterLog.aggregate({
      where: { userId: auth.userId, date: { gte: new Date(todayStr), lte: new Date(todayStr + 'T23:59:59') } },
      _sum: { amount: true },
    })

    // Today's calories
    const todayCalories = await prisma.mealLog.aggregate({
      where: { userId: auth.userId, date: { gte: new Date(todayStr), lte: new Date(todayStr + 'T23:59:59') } },
      _sum: { calories: true },
    })

    // Recent journal
    const recentJournal = await prisma.journal.findFirst({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, createdAt: true, mood: true, type: true },
    })

    // Bad habits streaks
    const badHabits = await prisma.badHabit.findMany({
      where: { userId: auth.userId, isActive: true },
      select: { id: true, name: true, category: true, startDate: true, icon: true },
    })

    // Last 7 days habit completion for sparkline
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const logs = await prisma.habitLog.count({
        where: { userId: auth.userId, date: { gte: new Date(dateStr), lte: new Date(dateStr + 'T23:59:59') } },
      })
      last7Days.push({ date: dateStr, completed: logs })
    }

    // Month stats
    const monthWorkouts = await prisma.workout.count({
      where: { userId: auth.userId, date: { gte: monthStart } },
    })

    const monthJournals = await prisma.journal.count({
      where: { userId: auth.userId, createdAt: { gte: monthStart } },
    })

    // Latest mood
    const latestMood = await prisma.moodLog.findFirst({
      where: { userId: auth.userId },
      orderBy: { date: 'desc' },
    })

    return successResponse({
      user,
      today: {
        habits: { total: habits.length, completed: habitsCompleted, rate: habitRate },
        sleep: todaySleep,
        focus: { minutes: todayFocus._sum.duration || 0 },
        water: { ml: todayWater._sum.amount || 0 },
        calories: { total: todayCalories._sum.calories || 0 },
        mood: latestMood,
      },
      week: {
        workouts: weekWorkouts,
        focus: { minutes: weekFocus._sum.duration || 0 },
        habitTrend: last7Days,
      },
      month: {
        workouts: monthWorkouts,
        journals: monthJournals,
      },
      badHabits,
      recentJournal,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return errorResponse('Internal server error', 500)
  }
}
