import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import { checkAdminAuth } from '@/lib/auth'
import { getAnalysisById } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const analysis = getAnalysisById(Number(params.id))
  if (!analysis) {
    return NextResponse.json({ error: 'Non trovata' }, { status: 404 })
  }

  if (!analysis.pdf_path || !fs.existsSync(analysis.pdf_path)) {
    return NextResponse.json({ error: 'PDF non ancora generato' }, { status: 404 })
  }

  const pdfBuffer = fs.readFileSync(analysis.pdf_path)
  const filename = `analisi-armocromia-${analysis.customer_name.toLowerCase().replace(/\s+/g, '-')}.pdf`

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  })
}
