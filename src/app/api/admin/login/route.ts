import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getExpectedToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const expected = Buffer.from(process.env.ADMIN_PASSWORD || 'changeme').toString('utf8')

  if (password !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = getExpectedToken()
  cookies().set('admin_auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
