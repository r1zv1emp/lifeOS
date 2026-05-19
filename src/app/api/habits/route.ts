import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, getToday } from '@/lib/utils-server'

const habitSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  icon: z.string().default('⭐'),
  color: z.string().default('#3B82F6'),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  targetCount: z.number().min(1).default(1),
  category: z.string().default('general'),
})

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const todayStr = getToday()
    const today = new Date(todayStr)
    const todayEnd = new Date(todayStr + 'T23:59:59')

    const habits = await prisma.habit.findMany({
      where: { userId: auth.userId, isActive: true },
      include: {
        logs: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const habitsWithStreak = habits.map(habit => {
      const todayLog = habit.logs.find(l => {
        const logDate = new Date(l.date).toISOString().split('T')[0]
        return logDate === todayStr
      })

      // Calculate streak
      let streak = 0
      const sortedLogs = [...habit.logs].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      let expectedDate = new Date()
      expectedDate.setHours(0, 0, 0, 0)

      for (const log of sortedLogs) {
        const logDate = new Date(log.date)
        logDate.setHours(0, 0, 0, 0)
        const diff = Math.round((expectedDate.getTime() - logDate.getTime()) / 86400000)

        if (diff === 0 || diff === 1) {
          streak++
          expectedDate = new Date(logDate)
          expectedDate.setDate(expectedDate.getDate() - 1)
        } else {
          break
        }
      }

      return {
        ...habit,
        completedToday: !!todayLog,
        streak,
      }
    })

    return successResponse(habitsWithStreak)
  } catch (error) {
    console.error(error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const body = await request.json()
    const parsed = habitSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message)
    }

    const habit = await prisma.habit.create({
      data: { ...parsed.data, userId: auth.userId },
    })

    return successResponse(habit, 201)
  } catch (error) {
    console.error(error)
    return errorResponse('Internal server error', 500)
  }
}
