import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/utils-server'
import { cookies } from 'next/headers'

export async function POST(_request: NextRequest) {
  const cookieStore = cookies()
  cookieStore.delete('token')
  return successResponse({ message: 'Logged out successfully' })
}
