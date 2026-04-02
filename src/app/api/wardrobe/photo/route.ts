import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get('path')
  if (!filePath) return new NextResponse('Missing path', { status: 400 })

  const safePath = filePath.replace(/\.\./g, '').replace(/^\/+/, '')
  const baseDir = process.env.STORAGE_PATH || (fs.existsSync('/storage') ? '/storage' : path.join(process.cwd(), 'data'))
  const fullPath = path.join(baseDir, safePath)

  if (!fs.existsSync(fullPath)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const buffer = fs.readFileSync(fullPath)
  const ext = path.extname(fullPath).toLowerCase()
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.heic': 'image/heic',
  }

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': mimeMap[ext] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
