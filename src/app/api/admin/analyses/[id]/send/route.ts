import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth'
import { getAnalysisById, markAsSent } from '@/lib/db'
import { generatePDF } from '@/lib/pdf'
import nodemailer from 'nodemailer'

function getMailer() {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAdminAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const analysis = getAnalysisById(Number(params.id))
  if (!analysis) {
    return NextResponse.json({ error: 'Non trovata' }, { status: 404 })
  }

  const pdfBuffer = await generatePDF({
    customerName: analysis.customer_name,
    customerEmail: analysis.customer_email,
    season: analysis.season,
    subgroup: analysis.subgroup || analysis.season,
    notes: analysis.notes,
  })

  const mailer = getMailer()
  await mailer.sendMail({
    from: `"YouGlamour" <${process.env.MAIL_USER}>`,
    to: analysis.customer_email,
    subject: `La tua analisi armocromatica — ${analysis.customer_name}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #1a1614; background: #faf7f2;">
        <h2 style="color: #c9a96e; margin-bottom: 8px;">La tua analisi è pronta!</h2>
        <p style="color: #7a6e68; font-size: 15px; margin-bottom: 24px;">Ciao ${analysis.customer_name}, ecco il tuo PDF personalizzato allegato a questa email.</p>

        <div style="background:#fff9f4; border:1px solid #e8e0d8; border-radius:16px; padding:20px; margin-bottom:24px;">
          <p style="margin:0 0 4px; color:#7a6e68; font-size:13px;">Il tuo sottogruppo armocromatico</p>
          <p style="margin:0; font-size:20px; font-weight:bold; color:#1a1614;">${analysis.subgroup || analysis.season}</p>
        </div>

        <p style="color:#7a6e68; font-size:13px;">
          Nel PDF trovi la tua palette completa, i consigli make-up e di stile personalizzati.<br>
          Per qualsiasi domanda, rispondi a questa email.
        </p>
        <p style="color:#c9a96e; font-size:13px; margin-top:24px; border-top:1px solid #e8e0d8; padding-top:16px;">
          YouGlamour · veronica@youglamour.it
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `analisi-armocromia-${analysis.customer_name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  })

  markAsSent(Number(params.id))
  return NextResponse.json({ ok: true })
}
