import { Resend } from 'resend'
import { getSubquizById, markReminderSent } from './db'

const REMINDER_DELAY_MS = 15 * 60 * 1000 // 15 minuti

export function scheduleAbandonedCartReminder(submissionId: number) {
  setTimeout(async () => {
    try {
      const sub = getSubquizById(submissionId)

      // Se ha già pagato o reminder già inviato, non fare nulla
      if (!sub || sub.paid === 1 || sub.reminder_sent === 1) return
      if (!sub.email || !sub.email.includes('@')) return

      const resend = new Resend(process.env.RESEND_API_KEY)
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://armocromia-app-production.up.railway.app'

      const scontoUrl = `${baseUrl}/sconto?email=${encodeURIComponent(sub.email)}&name=${encodeURIComponent(sub.name)}&season=${encodeURIComponent(sub.season)}`

      await resend.emails.send({
        from: 'Veronica di YouGlamour <veronica@youglamour.it>',
        to: sub.email,
        subject: `Ciao ${sub.name}, ti scrivo a proposito della tua analisi`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #1a1614; background: #ffffff;">

            <p style="font-size: 16px; line-height: 1.8; color: #3a3430; margin-bottom: 20px;">
              Ciao ${sub.name},
            </p>

            <p style="font-size: 15px; line-height: 1.8; color: #3a3430; margin-bottom: 20px;">
              sono Veronica, la fondatrice di YouGlamour. Ho visto che hai completato il test dell'armocromia
              e hai anche caricato le tue foto &mdash; ottimo!
            </p>

            <p style="font-size: 15px; line-height: 1.8; color: #3a3430; margin-bottom: 20px;">
              Ti scrivo personalmente perch&eacute; ho un progetto che mi sta molto a cuore:
              aiutare le persone a scoprire i colori che le valorizzano davvero.
              Non parlo di trend o mode passeggere, ma dei <strong>colori che fanno brillare
              la tua pelle, i tuoi occhi, i tuoi capelli</strong>.
            </p>

            <p style="font-size: 15px; line-height: 1.8; color: #3a3430; margin-bottom: 20px;">
              L'analisi che riceverai non &egrave; generata da un algoritmo: <strong>studio personalmente ogni foto</strong>,
              una per una, per determinare il tuo sottogruppo preciso tra i 16 possibili.
              Poi creo a mano il tuo PDF personalizzato con:
            </p>

            <ul style="font-size: 15px; line-height: 2; color: #3a3430; padding-left: 20px; margin-bottom: 24px;">
              <li>il tuo sottogruppo armocromatico preciso</li>
              <li>una palette di 30+ colori perfetti per te</li>
              <li>consigli make-up: fondotinta, blush, rossetto, ombretti</li>
              <li>guida outfit con abbinamenti e colori da indossare</li>
              <li>i colori da evitare e quelli in "prestito" dalle stagioni vicine</li>
            </ul>

            <p style="font-size: 15px; line-height: 1.8; color: #3a3430; margin-bottom: 20px;">
              Il prezzo &egrave; davvero simbolico &mdash; chiedo solo un piccolo contributo
              per il tempo che dedico a ogni singola analisi.
            </p>

            <p style="font-size: 15px; line-height: 1.8; color: #3a3430; margin-bottom: 28px;">
              Per ringraziarti di aver completato il test, ho riservato per te
              uno <strong style="color: #c9a96e;">sconto speciale</strong>: invece di 9,90&euro;,
              la tua analisi ti costa solo <strong style="color: #c9a96e;">7&euro;</strong>.
            </p>

            <div style="text-align: center; margin-bottom: 28px;">
              <a href="${scontoUrl}"
                 style="display: inline-block; background: #1a1614; color: #faf7f2; text-decoration: none;
                        padding: 16px 40px; border-radius: 100px; font-family: 'Helvetica Neue', Arial, sans-serif;
                        font-size: 15px; font-weight: 600;">
                Ricevi la tua analisi a 7&euro; &#x2726;
              </a>
            </div>

            <p style="font-size: 13px; color: #9a8e88; text-align: center; margin-bottom: 28px;">
              &#x1F512; Pagamento sicuro con Stripe
            </p>

            <div style="border-top: 1px solid #e8e0d8; padding-top: 20px;">
              <p style="font-size: 14px; line-height: 1.7; color: #3a3430; margin-bottom: 4px;">
                A presto,
              </p>
              <p style="font-size: 14px; line-height: 1.7; color: #3a3430; margin-bottom: 0;">
                <strong>Veronica</strong><br>
                <span style="color: #9a8e88; font-size: 13px;">Fondatrice di YouGlamour &middot; Consulente di armocromia</span>
              </p>
            </div>

          </div>
        `,
      })

      markReminderSent(submissionId)
      console.log(`[abandoned-cart] Reminder inviato a ${sub.email} (submission #${submissionId})`)
    } catch (err) {
      console.error(`[abandoned-cart] Errore invio reminder per submission #${submissionId}:`, err)
    }
  }, REMINDER_DELAY_MS)
}
