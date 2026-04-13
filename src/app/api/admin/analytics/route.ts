import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth'
import { getQuizEventsAggregated } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const dateFrom = searchParams.get('from') || undefined
    const dateTo = searchParams.get('to') || undefined

    const data = getQuizEventsAggregated(dateFrom, dateTo)
    return NextResponse.json(data)
  } catch (e) {
    console.error('analytics error:', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
