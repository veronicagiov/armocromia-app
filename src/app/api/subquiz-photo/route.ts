import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * Upload di una singola foto (background upload dalla pagina selfie).
 * Il client invia il file appena selezionato, il server lo scrive in una
 * cartella temporanea e ritorna il path. Il finalize della submission
 * avviene poi in /api/subquiz-upload con i path gia' ottenuti.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('photo') as File | null
    if (!file) {
      return NextResponse.json({ error: 'no photo' }, { status: 400 })
    }

    const baseDir = process.env.STORAGE_PATH || (fs.existsSync('/storage') ? '/storage' : path.join(process.cwd(), 'data'))
    const subdir = `subquiz_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const uploadDir = path.join(baseDir, 'uploads', subdir)
    fs.mkdirSync(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    const safeName = (file.name || 'photo.jpg').replace(/[^a-zA-Z0-9._-]/g, '_')
    fs.writeFileSync(path.join(uploadDir, safeName), buffer)

    const photoPath = `${subdir}/${safeName}`
    return NextResponse.json({ path: photoPath })
  } catch (err: any) {
    console.error('Subquiz photo upload error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
