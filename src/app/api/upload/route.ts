import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import Stripe from 'stripe'
import { insertAnalysis } from '@/lib/db'
import fs from 'fs'
import path from 'path'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

function getMailer() {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
  })
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const sessionId = formData.get('session_id') as string
    const season = formData.get('season') as string
    const customerName = formData.get('name') as string
    const customerEmail = formData.get('email') as string
    const notes = (formData.get('notes') as string) || ''
    const files = formData.getAll('photos') as File[]

    // 1. Verifica pagamento Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Pagamento non completato' }, { status: 403 })
    }

    // 2. Salva foto su filesystem
    const uploadDir = path.join(process.cwd(), 'data', 'uploads', sessionId)
    fs.mkdirSync(uploadDir, { recursive: true })

    const photoPaths: string[] = []
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      fs.writeFileSync(path.join(uploadDir, safeName), buffer)
      photoPaths.push(`${sessionId}/${safeName}`)
    }

    // 3. Salva analisi nel database
    insertAnalysis({
      stripe_session_id: sessionId,
      customer_name: customerName,
      customer_email: customerEmail,
      season,
      notes,
      photos: photoPaths,
    })

    const mailer = getMailer()

    // 4. Email di notifica a Veronica
    await mailer.sendMail({
      from: `"YouGlamour" <${process.env.MAIL_USER}>`,
      to: process.env.NOTIFY_EMAIL,
      subject: `🎨 Nuova analisi da fare — ${customerName} (${season})`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #1a1614;">
          <h2 style="color: #c9a96e;">Nuova analisi armocromia ricevuta</h2>
          <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
            <tr><td style="padding:8px 0; color:#7a6e68; width:140px;">Cliente</td><td style="padding:8px 0; font-weight:bold;">${customerName}</td></tr>
            <tr><td style="padding:8px 0; color:#7a6e68;">Email</td><td style="padding:8px 0;">${customerEmail}</td></tr>
            <tr><td style="padding:8px 0; color:#7a6e68;">Stagione quiz</td><td style="padding:8px 0;">${season}</td></tr>
            <tr><td style="padding:8px 0; color:#7a6e68;">Foto caricate</td><td style="padding:8px 0;">${files.length} foto</td></tr>
            <tr><td style="padding:8px 0; color:#7a6e68;">Pagamento</td><td style="padding:8px 0; color:#2a7a2a;">✓ Confermato (25€)</td></tr>
            ${notes ? `<tr><td style="padding:8px 0; color:#7a6e68; vertical-align:top;">Note</td><td style="padding:8px 0;">${notes}</td></tr>` : ''}
          </table>
          <p style="color:#7a6e68; font-size:13px; border-top:1px solid #e8e0d8; padding-top:16px;">
            Accedi al pannello admin per rivedere le foto e inviare l'analisi.
          </p>
        </div>
      `,
    })

    // 5. Email di conferma all'utente
    await mailer.sendMail({
      from: `"YouGlamour" <${process.env.MAIL_USER}>`,
      to: customerEmail,
      subject: `✨ Abbiamo ricevuto le tue foto — ${customerName}!`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #1a1614; background: #faf7f2;">
          <h2 style="color: #c9a96e; margin-bottom: 8px;">Le tue foto sono arrivate!</h2>
          <p style="color: #7a6e68; margin-bottom: 32px; font-size: 15px;">Ciao ${customerName}, grazie per aver acquistato l'analisi personalizzata.</p>

          <div style="background:#fff9f4; border:1px solid #e8e0d8; border-radius:16px; padding:24px; margin-bottom:32px;">
            <p style="margin:0 0 12px; font-size:15px;"><strong>Cosa succede adesso:</strong></p>
            <ol style="margin:0; padding-left:20px; color:#7a6e68; line-height:2;">
              <li>Analizziamo le tue foto e determiniamo il tuo <strong>sottogruppo armocromatico</strong></li>
              <li>Creiamo il tuo <strong>PDF personalizzato</strong> con palette, consigli e outfit</li>
              <li>Ti inviamo tutto per email entro <strong>48 ore</strong></li>
            </ol>
          </div>

          <div style="background:#fff9f4; border:1px solid #e8e0d8; border-radius:16px; padding:20px; margin-bottom:32px;">
            <p style="margin:0 0 4px; color:#7a6e68; font-size:13px;">La tua stagione dal quiz</p>
            <p style="margin:0; font-size:18px; font-weight:bold;">${season}</p>
          </div>

          <p style="color:#7a6e68; font-size:13px; border-top:1px solid #e8e0d8; padding-top:16px;">
            Hai domande? Rispondi a questa email.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export const maxDuration = 60
