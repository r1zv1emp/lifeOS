import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse } from '@/lib/utils-server'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const logs = await prisma.weightLog.findMany({
      where: { userId: auth.userId },
      orderBy: { date: 'desc' },
      take: 90,
    })

    return successResponse(logs)
  } catch (error) {
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const { date, weight, bodyFat, note } = await request.json()

    const log = await prisma.weightLog.upsert({
      where: { userId_date: { userId: auth.userId, date: new Date(date) } },
      update: { weight, bodyFat, note },
      create: { userId: auth.userId, date: new Date(date), weight, bodyFat, note },
    })

    return successResponse(log, 201)
  } catch (error) {
    return errorResponse('Internal server error', 500)
  }
}
