import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse } from '@/lib/utils-server'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const routines = await prisma.routine.findMany({
      where: { userId: auth.userId, isActive: true },
      orderBy: { createdAt: 'asc' },
    })

    return successResponse(routines)
  } catch (error) {
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const { name, type, time, steps } = await request.json()

    const routine = await prisma.routine.create({
      data: {
        userId: auth.userId,
        name: name || (type === 'morning' ? 'Morning Routine' : 'Evening Routine'),
        type: type || 'morning',
        time,
        steps: steps || [],
      },
    })

    return successResponse(routine, 201)
  } catch (error) {
    console.error(error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const { id, steps, name, time } = await request.json()

    const routine = await prisma.routine.findFirst({
      where: { id, userId: auth.userId },
    })

    if (!routine) return errorResponse('Routine not found', 404)

    const updated = await prisma.routine.update({
      where: { id },
      data: { steps, name, time },
    })

    return successResponse(updated)
  } catch (error) {
    return errorResponse('Internal server error', 500)
  }
}
