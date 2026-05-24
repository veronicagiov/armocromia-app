import { NextResponse } from 'next/server'
import { getLeadsCount } from '@/lib/db'

export const dynamic = 'force-dynamic'

const BASELINE = 150

export async function GET() {
  try {
    const count = BASELINE + getLeadsCount()
    return NextResponse.json(
      { count },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
    )
  } catch {
    return NextResponse.json({ count: BASELINE })
  }
}
