import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, getToday, calculateXP } from '@/lib/utils-server'

const sleepSchema = z.object({
  date: z.string(),
  bedtime: z.string(),
  wakeTime: z.string(),
  quality: z.number().min(1).max(10),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '30')

  try {
    const logs = await prisma.sleepLog.findMany({
      where: { userId: auth.userId },
      orderBy: { date: 'desc' },
      take: limit,
    })

    const stats = await prisma.sleepLog.aggregate({
      where: { userId: auth.userId },
      _avg: { duration: true, quality: true },
      _count: true,
    })

    return successResponse({ logs, stats })
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
    const parsed = sleepSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message)
    }

    const { date, bedtime, wakeTime, quality, notes } = parsed.data

    const bedtimeDate = new Date(`${date}T${bedtime}`)
    const wakeTimeDate = new Date(`${date}T${wakeTime}`)

    // Handle next-day wake time
    if (wakeTimeDate < bedtimeDate) {
      wakeTimeDate.setDate(wakeTimeDate.getDate() + 1)
    }

    const duration = (wakeTimeDate.getTime() - bedtimeDate.getTime()) / (1000 * 60 * 60)

    const log = await prisma.sleepLog.upsert({
      where: { userId_date: { userId: auth.userId, date: new Date(date) } },
      update: { bedtime: bedtimeDate, wakeTime: wakeTimeDate, duration, quality, notes },
      create: {
        userId: auth.userId,
        date: new Date(date),
        bedtime: bedtimeDate,
        wakeTime: wakeTimeDate,
        duration,
        quality,
        notes,
      },
    })

    // Award XP
    await prisma.user.update({
      where: { id: auth.userId },
      data: { xp: { increment: calculateXP('sleep_logged') } },
    })

    return successResponse(log, 201)
  } catch (error) {
    console.error(error)
    return errorResponse('Internal server error', 500)
  }
}
