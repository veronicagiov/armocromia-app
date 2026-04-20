import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { checkAdminAuth } from '@/lib/auth'
import { DATA_DIR } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Scarica una copia del DB SQLite di produzione per analisi locale.
// Utile per debug ("dove sono finiti i miei lead?") senza dover fare ssh sul server.
export async function GET(_req: NextRequest) {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dbPath = path.join(DATA_DIR, 'armocromia.db')
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: 'DB non trovato' }, { status: 404 })
    }
    const buffer = fs.readFileSync(dbPath)
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="armocromia-${timestamp}.db"`,
        'Content-Length': String(buffer.length),
      },
    })
  } catch (err: any) {
    console.error('download-db error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
