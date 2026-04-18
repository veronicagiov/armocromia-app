import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { checkAdminAuth } from '@/lib/auth'
import { getAnalysisById, setPdfPath, DATA_DIR, seasonToAssoluto } from '@/lib/db'
import { generatePDF } from '@/lib/pdf'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const analysis = getAnalysisById(Number(params.id))
  if (!analysis) {
    return NextResponse.json({ error: 'Non trovata' }, { status: 404 })
  }

  try {
    const pdfBuffer = await generatePDF({
      customerName: analysis.customer_name,
      customerEmail: analysis.customer_email,
      season: analysis.season,
      subgroup: analysis.subgroup || seasonToAssoluto(analysis.season),
      notes: analysis.notes,
    })

    const pdfDir = path.join(DATA_DIR, 'pdfs')
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true })
    }

    const filename = `analisi-${params.id}.pdf`
    const pdfPath = path.join(pdfDir, filename)
    fs.writeFileSync(pdfPath, pdfBuffer)

    setPdfPath(Number(params.id), pdfPath)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('generate-pdf error:', e)
    return NextResponse.json({ error: 'Errore generazione PDF' }, { status: 500 })
  }
}
