import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, getToday, calculateXP } from '@/lib/utils-server'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '30')

  try {
    const sessions = await prisma.focusSession.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const stats = await prisma.focusSession.aggregate({
      where: { userId: auth.userId },
      _sum: { duration: true },
      _count: true,
      _avg: { duration: true },
    })

    const todayStr = getToday()
    const todayStats = await prisma.focusSession.aggregate({
      where: {
        userId: auth.userId,
        date: { gte: new Date(todayStr), lte: new Date(todayStr + 'T23:59:59') },
      },
      _sum: { duration: true },
      _count: true,
    })

    return successResponse({ sessions, stats, today: todayStats })
  } catch (error) {
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const { duration, type, task, completed, notes, distractions } = await request.json()

    const session = await prisma.focusSession.create({
      data: {
        userId: auth.userId,
        date: new Date(),
        duration: duration || 25,
        type: type || 'pomodoro',
        task,
        completed: completed ?? true,
        notes,
        distractions,
      },
    })

    if (completed) {
      await prisma.user.update({
        where: { id: auth.userId },
        data: { xp: { increment: calculateXP('focus_session') } },
      })
    }

    return successResponse(session, 201)
  } catch (error) {
    console.error(error)
    return errorResponse('Internal server error', 500)
  }
}
