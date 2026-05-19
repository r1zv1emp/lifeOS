import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse } from '@/lib/utils-server'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        timezone: true,
        xp: true,
        level: true,
        disciplineScore: true,
        streak: true,
        longestStreak: true,
        createdAt: true,
        lastActiveDate: true,
        _count: {
          select: {
            habits: true,
            journals: true,
            workouts: true,
          },
        },
      },
    })

    if (!user) return errorResponse('User not found', 404)

    return successResponse(user)
  } catch (error) {
    console.error(error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const body = await request.json()
    const { name, bio, timezone } = body

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: { name, bio, timezone },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        timezone: true,
        xp: true,
        level: true,
        disciplineScore: true,
        streak: true,
      },
    })

    return successResponse(user)
  } catch (error) {
    console.error(error)
    return errorResponse('Internal server error', 500)
  }
}
