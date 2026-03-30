import { NextRequest, NextResponse } from 'next/server'
import { insertLead } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { name, email, season } = await req.json()
    if (!name || !email || !season) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }
    insertLead({ name, email, season })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
