import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest) {
  if (!checkAdminAuth()) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const file = req.nextUrl.searchParams.get('file')
  if (!file) return new NextResponse('Missing file param', { status: 400 })

  // Sanitize: impedisce path traversal
  const safePath = file.replace(/\.\./g, '').replace(/^\/+/, '')
  const baseDir = process.env.STORAGE_PATH || (fs.existsSync('/storage') ? '/storage' : path.join(process.cwd(), 'data'))
  const fullPath = path.join(baseDir, 'uploads', safePath)

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
  const contentType = mimeMap[ext] || 'application/octet-stream'

  return new NextResponse(buffer, {
    headers: { 'Content-Type': contentType },
  })
}
