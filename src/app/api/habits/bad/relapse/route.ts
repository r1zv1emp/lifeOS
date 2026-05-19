import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse } from '@/lib/utils-server'

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const { badHabitId, trigger, note } = await request.json()

    // Verify ownership
    const badHabit = await prisma.badHabit.findFirst({
      where: { id: badHabitId, userId: auth.userId },
    })

    if (!badHabit) return errorResponse('Bad habit not found', 404)

    const log = await prisma.badHabitLog.create({
      data: {
        badHabitId,
        userId: auth.userId,
        relapsed: true,
        trigger,
        note,
      },
    })

    return successResponse(log, 201)
  } catch (error) {
    console.error(error)
    return errorResponse('Internal server error', 500)
  }
}
