import { NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth'
import { getAllAnalyses } from '@/lib/db'

export async function GET() {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const analyses = getAllAnalyses()
  return NextResponse.json(analyses)
}
