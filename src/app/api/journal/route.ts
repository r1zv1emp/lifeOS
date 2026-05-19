import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAuthUser, successResponse, errorResponse, calculateXP } from '@/lib/utils-server'

const journalSchema = z.object({
  date: z.string(),
  title: z.string().optional(),
  content: z.string().min(1),
  type: z.enum(['daily', 'gratitude', 'reflection', 'goals']).default('daily'),
  mood: z.number().min(1).max(10).optional(),
  tags: z.array(z.string()).default([]),
})

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const type = searchParams.get('type')

  try {
    const journals = await prisma.journal.findMany({
      where: {
        userId: auth.userId,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return successResponse(journals)
  } catch (error) {
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const body = await request.json()
    const parsed = journalSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message)
    }

    const journal = await prisma.journal.create({
      data: {
        ...parsed.data,
        userId: auth.userId,
        date: new Date(parsed.data.date),
      },
    })

    // Log mood if provided
    if (parsed.data.mood) {
      await prisma.moodLog.upsert({
        where: { userId_date: { userId: auth.userId, date: new Date(parsed.data.date) } },
        update: { mood: parsed.data.mood },
        create: {
          userId: auth.userId,
          date: new Date(parsed.data.date),
          mood: parsed.data.mood,
        },
      })
    }

    await prisma.user.update({
      where: { id: auth.userId },
      data: { xp: { increment: calculateXP('journal_entry') } },
    })

    return successResponse(journal, 201)
  } catch (error) {
    console.error(error)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthUser(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return errorResponse('ID required')

  try {
    await prisma.journal.deleteMany({
      where: { id, userId: auth.userId },
    })

    return successResponse({ deleted: true })
  } catch (error) {
    return errorResponse('Internal server error', 500)
  }
}
