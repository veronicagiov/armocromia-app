import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth'
import { getAllSubquizSubmissions, deleteSubquizSubmissionsBulk } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(getAllSubquizSubmissions())
}

export async function DELETE(req: NextRequest) {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { ids } = await req.json()
  if (Array.isArray(ids) && ids.length > 0) {
    deleteSubquizSubmissionsBulk(ids)
  }
  return NextResponse.json({ success: true })
}
