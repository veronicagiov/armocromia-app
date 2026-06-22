import { NextRequest } from 'next/server'
import { markReminderOpened } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GIF trasparente 1x1: è ciò che il pixel di tracking restituisce al client di posta.
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

function pixelResponse(): Response {
  return new Response(new Uint8Array(TRANSPARENT_GIF), {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(TRANSPARENT_GIF.length),
      // Niente cache: vogliamo che ogni apertura raggiunga il server (anche se
      // solo la prima viene contata lato DB).
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      Pragma: 'no-cache',
    },
  })
}

// GET /api/email/open?sid=<submissionId>&m=<1|2|3>
// Pixel di tracking incluso nelle 3 mail automatiche post-subquiz. Registra la
// prima apertura della mail per la submission e restituisce sempre un'immagine
// 1x1, qualunque sia l'esito (così il client di posta non mostra mai un'icona rotta).
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sid = Number(searchParams.get('sid'))
    const m = Number(searchParams.get('m'))

    if (Number.isInteger(sid) && sid > 0 && (m === 1 || m === 2 || m === 3)) {
      markReminderOpened(sid, m as 1 | 2 | 3)
    }
  } catch (err) {
    console.error('[email-open] errore tracking apertura:', err)
  }

  return pixelResponse()
}
