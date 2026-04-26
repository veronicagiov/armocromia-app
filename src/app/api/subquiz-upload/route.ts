import { NextRequest, NextResponse } from 'next/server'
import { insertSubquizSubmission } from '@/lib/db'
import { scheduleAbandonedCartReminder } from '@/lib/abandoned-cart'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''

    let name = ''
    let email = ''
    let season = ''
    let subgroup = ''
    let photoPaths: string[] = []

    if (contentType.includes('application/json')) {
      // Nuovo flusso: foto gia' caricate via /api/subquiz-photo, qui arrivano solo i path
      const body = await req.json()
      name = body.name || ''
      email = body.email || ''
      season = body.season || ''
      subgroup = body.subgroup || ''
      photoPaths = Array.isArray(body.photoPaths) ? body.photoPaths : []
    } else {
      // Flusso legacy: foto binary in FormData
      const formData = await req.formData()
      name = (formData.get('name') as string) || ''
      email = (formData.get('email') as string) || ''
      season = (formData.get('season') as string) || ''
      subgroup = (formData.get('subgroup') as string) || ''
      const files = formData.getAll('photos') as File[]

      const baseDir = process.env.STORAGE_PATH || (fs.existsSync('/storage') ? '/storage' : path.join(process.cwd(), 'data'))
      const timestamp = Date.now()
      const uploadDir = path.join(baseDir, 'uploads', `subquiz_${timestamp}`)
      fs.mkdirSync(uploadDir, { recursive: true })

      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        fs.writeFileSync(path.join(uploadDir, safeName), buffer)
        photoPaths.push(`subquiz_${timestamp}/${safeName}`)
      }
    }

    // Salva nel database (pre-pagamento). insertSubquizSubmission fa UPSERT:
    // se esiste gia' una submission recente non pagata per la stessa email,
    // la aggiorna invece di crearne una nuova (caso "cambio idea" tra skip
    // foto e poi carica foto). isNew=false significa che il setTimeout del
    // reminder e' gia' stato schedulato dal primo insert e leggera' i dati
    // aggiornati al momento dello scatto — non bisogna schedularne un altro.
    const { id: submissionId, isNew } = insertSubquizSubmission({
      name,
      email,
      season,
      subgroup_guess: subgroup,
      photos: photoPaths,
    })

    if (isNew) {
      scheduleAbandonedCartReminder(submissionId)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Subquiz upload error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
