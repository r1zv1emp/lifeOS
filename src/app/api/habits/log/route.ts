import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, getToday, calculateXP } from '@/lib/utils-server'

// POST /api/habits/log - toggle habit completion for today
export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const { habitId, date, note } = await request.json()
    const dateStr = date || getToday()
    const dateObj = new Date(dateStr)

    // Verify habit belongs to user
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId: auth.userId },
    })

    if (!habit) return errorResponse('Habit not found', 404)

    // Check if already logged
    const existing = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId, date: dateObj } },
    })

    if (existing) {
      // Uncomplete it
      await prisma.habitLog.delete({
        where: { habitId_date: { habitId, date: dateObj } },
      })
      return successResponse({ completed: false })
    }

    // Complete it
    await prisma.habitLog.create({
      data: {
        habitId,
        userId: auth.userId,
        date: dateObj,
        completed: true,
        note,
      },
    })

    // Award XP
    const xpGained = calculateXP('habit_complete')
    await prisma.user.update({
      where: { id: auth.userId },
      data: { xp: { increment: xpGained } },
    })

    return successResponse({ completed: true, xpGained })
  } catch (error) {
    console.error(error)
    return errorResponse('Internal server error', 500)
  }
}
