import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, getToday } from '@/lib/utils-server'

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') || getToday()

  try {
    const meals = await prisma.mealLog.findMany({
      where: {
        userId: auth.userId,
        date: { gte: new Date(date), lte: new Date(date + 'T23:59:59') },
      },
      orderBy: { createdAt: 'asc' },
    })

    const water = await prisma.waterLog.aggregate({
      where: {
        userId: auth.userId,
        date: { gte: new Date(date), lte: new Date(date + 'T23:59:59') },
      },
      _sum: { amount: true },
    })

    const waterLogs = await prisma.waterLog.findMany({
      where: {
        userId: auth.userId,
        date: { gte: new Date(date), lte: new Date(date + 'T23:59:59') },
      },
      orderBy: { createdAt: 'asc' },
    })

    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fat: acc.fat + (meal.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )

    return successResponse({
      meals,
      water: { total: water._sum.amount || 0, logs: waterLogs },
      totals,
    })
  } catch (error) {
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const body = await request.json()
    const { type, ...data } = body

    if (type === 'water') {
      const log = await prisma.waterLog.create({
        data: {
          userId: auth.userId,
          date: new Date(data.date || getToday()),
          amount: data.amount,
        },
      })
      return successResponse(log, 201)
    }

    const meal = await prisma.mealLog.create({
      data: {
        userId: auth.userId,
        date: new Date(data.date || getToday()),
        mealType: data.mealType || 'lunch',
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        notes: data.notes,
      },
    })

    return successResponse(meal, 201)
  } catch (error) {
    console.error(error)
    return errorResponse('Internal server error', 500)
  }
}
