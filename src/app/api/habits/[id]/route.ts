import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse } from '@/lib/utils-server'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const body = await request.json()

    const habit = await prisma.habit.findFirst({
      where: { id: params.id, userId: auth.userId },
    })

    if (!habit) return errorResponse('Habit not found', 404)

    const updated = await prisma.habit.update({
      where: { id: params.id },
      data: body,
    })

    return successResponse(updated)
  } catch (error) {
    console.error(error)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUser(_request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const habit = await prisma.habit.findFirst({
      where: { id: params.id, userId: auth.userId },
    })

    if (!habit) return errorResponse('Habit not found', 404)

    await prisma.habit.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return successResponse({ deleted: true })
  } catch (error) {
    console.error(error)
    return errorResponse('Internal server error', 500)
  }
}
