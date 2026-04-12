import { NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth'
import { getQuizEventsAggregated } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = getQuizEventsAggregated()
    return NextResponse.json(data)
  } catch (e) {
    console.error('analytics error:', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
