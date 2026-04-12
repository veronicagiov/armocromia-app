import { NextRequest, NextResponse } from 'next/server'
import { insertQuizEvent } from '@/lib/db'

const VALID_EVENTS = [
  'quiz_start', 'quiz_answer', 'lead_view', 'lead_submit',
  'subquiz_start', 'subquiz_answer', 'photo_view', 'photo_confirm',
  'payment_view', 'payment_click',
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { session_id, event, data } = body

    if (!session_id || !event) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }
    if (!VALID_EVENTS.includes(event)) {
      return NextResponse.json({ error: 'invalid event' }, { status: 400 })
    }

    insertQuizEvent({ session_id, event, data: data || {} })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('quiz-events error:', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
