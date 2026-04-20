import { NextRequest, NextResponse } from 'next/server'
import { insertLead, updateLeadSeason, updateLeadName } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { name, email, season } = await req.json()
    // Solo email e season sono obbligatori. Il nome puo' essere vuoto
    // perche' nella nuova lead capture viene chiesto solo dopo (pagina upload foto).
    if (!email || !season) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }
    insertLead({ name: name || '', email, season })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Aggiorna campi del lead piu' recente per una email.
// - season: usato da analisi.html quando l'utente completa il subquiz (rimpiazza il placeholder 'sottogruppo-quiz')
// - name: usato dalla pagina upload foto di quiz.html e analisi.html quando l'utente inserisce il nome
export async function PATCH(req: NextRequest) {
  try {
    const { email, season, name } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'email mancante' }, { status: 400 })
    }
    if (season) updateLeadSeason(email, season)
    if (name) updateLeadName(email, name)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
