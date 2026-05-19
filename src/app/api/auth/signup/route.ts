import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { hashPassword, createToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/utils-server'
import { cookies } from 'next/headers'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)
    
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message)
    }

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return errorResponse('An account with this email already exists')
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        lastActiveDate: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        xp: true,
        level: true,
        disciplineScore: true,
        streak: true,
      },
    })

    const token = await createToken({ userId: user.id, email: user.email })

    const cookieStore = cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return successResponse({ user, token }, 201)
  } catch (error) {
    console.error('Signup error:', error)
    return errorResponse('Internal server error', 500)
  }
}
