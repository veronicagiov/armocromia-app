import { NextRequest, NextResponse } from 'next/server'
import { insertSubquizSubmission } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const name = (formData.get('name') as string) || ''
    const email = (formData.get('email') as string) || ''
    const season = (formData.get('season') as string) || ''
    const subgroup = (formData.get('subgroup') as string) || ''
    const files = formData.getAll('photos') as File[]

    // Salva foto su filesystem
    const baseDir = process.env.STORAGE_PATH || (fs.existsSync('/storage') ? '/storage' : path.join(process.cwd(), 'data'))
    const timestamp = Date.now()
    const uploadDir = path.join(baseDir, 'uploads', `subquiz_${timestamp}`)
    fs.mkdirSync(uploadDir, { recursive: true })

    const photoPaths: string[] = []
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      fs.writeFileSync(path.join(uploadDir, safeName), buffer)
      photoPaths.push(`subquiz_${timestamp}/${safeName}`)
    }

    // Salva nel database (pre-pagamento)
    insertSubquizSubmission({
      name,
      email,
      season,
      subgroup_guess: subgroup,
      photos: photoPaths,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Subquiz upload error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
