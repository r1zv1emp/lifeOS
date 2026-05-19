import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { verifyPassword, createToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/utils-server'
import { cookies } from 'next/headers'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message)
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        password: true,
        xp: true,
        level: true,
        disciplineScore: true,
        streak: true,
      },
    })

    if (!user || !user.password) {
      return errorResponse('Invalid email or password')
    }

    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      return errorResponse('Invalid email or password')
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveDate: new Date() },
    })

    const token = await createToken({ userId: user.id, email: user.email })

    const cookieStore = cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    const { password: _, ...safeUser } = user

    return successResponse({ user: safeUser, token })
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('Internal server error', 500)
  }
}
