import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, calculateXP } from '@/lib/utils-server'

const workoutSchema = z.object({
  name: z.string().min(1),
  type: z.string().default('gym'),
  duration: z.number().min(1),
  calories: z.number().optional(),
  notes: z.string().optional(),
  date: z.string(),
  exercises: z.array(z.object({
    name: z.string(),
    sets: z.number().optional(),
    reps: z.number().optional(),
    weight: z.number().optional(),
  })).optional(),
})

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')

  try {
    const workouts = await prisma.workout.findMany({
      where: { userId: auth.userId },
      orderBy: { date: 'desc' },
      take: limit,
    })

    const stats = await prisma.workout.aggregate({
      where: { userId: auth.userId },
      _sum: { duration: true, calories: true },
      _count: true,
      _avg: { duration: true },
    })

    // Weekly count
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    const weekCount = await prisma.workout.count({
      where: { userId: auth.userId, date: { gte: weekStart } },
    })

    return successResponse({ workouts, stats, weekCount })
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
    const parsed = workoutSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message)
    }

    const workout = await prisma.workout.create({
      data: {
        ...parsed.data,
        userId: auth.userId,
        date: new Date(parsed.data.date),
      },
    })

    await prisma.user.update({
      where: { id: auth.userId },
      data: { xp: { increment: calculateXP('workout') } },
    })

    return successResponse(workout, 201)
  } catch (error) {
    console.error(error)
    return errorResponse('Internal server error', 500)
  }
}
