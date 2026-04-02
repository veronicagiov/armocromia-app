import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dataDir = process.env.STORAGE_PATH || (fs.existsSync('/storage') ? '/storage' : path.join(process.cwd(), 'data'))
  const dbPath = path.join(dataDir, 'armocromia.db')

  let dirContents: string[] = []
  let dbExists = false
  let dbSize = 0

  try {
    dirContents = fs.readdirSync(dataDir)
  } catch (e: any) {
    dirContents = [`ERRORE lettura dir: ${e.message}`]
  }

  try {
    const stat = fs.statSync(dbPath)
    dbExists = true
    dbSize = stat.size
  } catch {
    dbExists = false
  }

  return NextResponse.json({
    STORAGE_PATH: process.env.STORAGE_PATH,
    dataDir,
    dbPath,
    dbExists,
    dbSizeBytes: dbSize,
    dirContents,
  })
}
