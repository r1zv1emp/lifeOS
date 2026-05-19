import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse } from '@/lib/utils-server'
import { differenceInDays } from 'date-fns'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const badHabits = await prisma.badHabit.findMany({
      where: { userId: auth.userId, isActive: true },
      include: {
        logs: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const habitsWithStreak = badHabits.map(habit => {
      const lastRelapse = habit.logs.find(l => l.relapsed)
      const streakStart = lastRelapse ? new Date(lastRelapse.date) : new Date(habit.startDate)
      const streak = differenceInDays(new Date(), streakStart)

      return {
        ...habit,
        streak: Math.max(0, streak),
        lastRelapse: lastRelapse ? lastRelapse.date : null,
      }
    })

    return successResponse(habitsWithStreak)
  } catch (error) {
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const { name, description, category, icon } = await request.json()

    const badHabit = await prisma.badHabit.create({
      data: {
        userId: auth.userId,
        name,
        description,
        category: category || 'other',
        icon: icon || '⚠️',
        startDate: new Date(),
      },
    })

    return successResponse(badHabit, 201)
  } catch (error) {
    console.error(error)
    return errorResponse('Internal server error', 500)
  }
}
