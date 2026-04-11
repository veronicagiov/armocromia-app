import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth'
import { getAllAnalyses, deleteAnalysis, deleteAnalysesBulk } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const analyses = getAllAnalyses()
  return NextResponse.json(analyses)
}

export async function DELETE(req: NextRequest) {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { ids } = await req.json()
  if (Array.isArray(ids) && ids.length > 0) {
    deleteAnalysesBulk(ids)
  }
  return NextResponse.json({ success: true })
}
