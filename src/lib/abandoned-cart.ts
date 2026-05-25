import { Resend } from 'resend'
import {
  getSubquizById,
  markReminderSent,
  markReminder2Sent,
  markReminder3Sent,
  getPendingFollowup2Submissions,
  getPendingFollowup3Submissions,
  DISCOUNT_EXPIRY_DAYS,
  type SubquizSubmission,
} from './db'

const REMINDER_DELAY_MS = 15 * 60 * 1000 // 15 minuti per la prima mail
export const REMINDER2_DELAY_HOURS = 24  // mail 2: +24h dopo la mail 1
export const REMINDER3_DELAY_HOURS = 48  // mail 3: +48h dopo la mail 2 (= +72h dopo mail 1)

function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY)
}

function getScontoUrl(sub: SubquizSubmission): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://armocromia-app-production.up.railway.app'
  return `${baseUrl}/sconto?email=${encodeURIComponent(sub.email)}&name=${encodeURIComponent(sub.name)}&season=${encodeURIComponent(sub.season)}`
}

// ─── MAIL 1 — +15 min dopo subquiz abbandonato ────────────────────────────
async function sendFirstReminder(sub: SubquizSubmission): Promise<void> {
  const scontoUrl = getScontoUrl(sub)

  await getResend().emails.send({
    from: 'Veronica di YouGlamour <veronica@youglamour.it>',
    to: sub.email,
    subject: `${sub.name}, manca poco per scoprire il tuo sottogruppo`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #1a1614; background: #ffffff;">

        <p style="font-size: 16px; line-height: 1.8; color: #3a3430; margin-bottom: 20px;">
          Ciao ${sub.name},
        </p>

        <p style="font-size: 15px; line-height: 1.8; color: #3a3430; margin-bottom: 20px;">
          sono Veronica, la fondatrice di YouGlamour. Ho visto che hai completato
          il test dell'armocromia: sai gi&agrave; la tua stagione, ma non ancora il tuo sottogruppo.
        </p>

        <p style="font-size: 15px; line-height: 1.8; color: #3a3430; margin-bottom: 20px;">
          Ti scrivo personalmente perch&eacute; ho un progetto che mi sta molto a cuore:
          aiutare le persone a scoprire i colori che le valorizzano davvero.
          Non parlo di trend o mode passeggere, ma dei <strong>colori che fanno brillare
          la tua pelle, i tuoi occhi, i tuoi capelli</strong>.
        </p>

        <p style="font-size: 15px; line-height: 1.8; color: #3a3430; margin-bottom: 20px;">
          L'analisi che riceverai non la fa un algoritmo: <strong>studio personalmente
          ogni caso</strong>, uno per uno, per identificare il <strong>tuo sottogruppo
          preciso</strong> fra i 16 possibili. E con la scoperta del sottogruppo ricevi
          anche un <strong>PDF completo, fatto a mano per te</strong>, con:
        </p>

        <ul style="font-size: 15px; line-height: 2; color: #3a3430; padding-left: 20px; margin-bottom: 24px;">
          <li>il tuo sottogruppo armocromatico preciso</li>
          <li>una palette di 30+ colori perfetti per te</li>
          <li>consigli make-up: fondotinta, blush, rossetto, ombretti</li>
          <li>guida outfit con abbinamenti e colori da indossare</li>
          <li>i colori da evitare e quelli in "prestito" dalle stagioni vicine</li>
        </ul>

        <p style="font-size: 15px; line-height: 1.8; color: #3a3430; margin-bottom: 28px;">
          Per ringraziarti di aver completato il test, ho riservato per te
          uno <strong style="color: #c9a96e;">sconto speciale</strong>: invece di 9,90&euro;,
          la tua analisi ti costa solo <strong style="color: #c9a96e;">7&euro;</strong>.
          Pi&ugrave; o meno una colazione al bar sotto casa mia a Milano &mdash;
          cappuccino d'avena e brioche. Solo che la colazione la finisci in dieci minuti,
          l'analisi ti resta.
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
}

// ─── MAIL 2 — +24h dopo la mail 1, breve e diretta ────────────────────────
async function sendSecondReminder(sub: SubquizSubmission): Promise<void> {
  const scontoUrl = getScontoUrl(sub)

  await getResend().emails.send({
    from: 'Veronica di YouGlamour <veronica@youglamour.it>',
    to: sub.email,
    subject: `${sub.name}, il tuo sottogruppo ti aspetta ancora`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #1a1614; background: #ffffff;">

        <p style="font-size: 16px; line-height: 1.8; color: #3a3430; margin-bottom: 20px;">
          Ciao ${sub.name},
        </p>

        <p style="font-size: 15px; line-height: 1.8; color: #3a3430; margin-bottom: 20px;">
          ieri ti ho scritto a proposito della tua analisi: <strong>il tuo sottogruppo
          preciso fra i 16 possibili</strong>, pi&ugrave; il PDF personalizzato con palette,
          make-up e outfit. Volevo solo ricordarti che lo sconto &egrave; ancora qui per te.
        </p>

        <p style="font-size: 15px; line-height: 1.8; color: #3a3430; margin-bottom: 28px;">
          Hai ancora qualche giorno per averla a
          <strong style="color: #c9a96e;">7&euro;</strong> invece di 9,90&euro;
          &mdash; lo sconto che ho riservato per chi ha completato il test.
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
}

// ─── MAIL 3 — +48h dopo la mail 2 (= +72h dopo la 1), urgenza ────────────
// Calcola dinamicamente le ore restanti prima della scadenza dello sconto,
// basandosi su DISCOUNT_EXPIRY_DAYS e sulla timeline (mail 1 + 72h = mail 3,
// quindi residuo = DISCOUNT_EXPIRY_DAYS*24 - 72).
function getDiscountHoursRemaining(): number {
  return Math.max(0, DISCOUNT_EXPIRY_DAYS * 24 - 72)
}

async function sendThirdReminder(sub: SubquizSubmission): Promise<void> {
  const scontoUrl = getScontoUrl(sub)

  await getResend().emails.send({
    from: 'Veronica di YouGlamour <veronica@youglamour.it>',
    to: sub.email,
    subject: `${sub.name}, una nota veloce sulla tua analisi`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #1a1614; background: #ffffff;">

        <p style="font-size: 16px; line-height: 1.8; color: #3a3430; margin-bottom: 20px;">
          Ciao ${sub.name},
        </p>

        <p style="font-size: 15px; line-height: 1.8; color: #3a3430; margin-bottom: 20px;">
          volevo dirti che <strong>domani lo sconto che ho riservato per te scade</strong>.
          Non voglio essere insistente &mdash; solo non volevo che ti sfuggisse tra le altre mail.
        </p>

        <p style="font-size: 15px; line-height: 1.8; color: #3a3430; margin-bottom: 20px;">
          Non perch&eacute; voglia metterti fretta: lo sconto del 20% &egrave; pensato come piccolo
          ringraziamento per chi sceglie di completare il percorso subito dopo il test.
          Dopo, semplicemente, l'analisi torna al suo prezzo normale di 9,90&euro;.
        </p>

        <p style="font-size: 15px; line-height: 1.8; color: #3a3430; margin-bottom: 28px;">
          Se in questi giorni hai pensato di farla e l'hai lasciata l&igrave;,
          questo &egrave; il momento giusto. E se invece preferisci aspettare, va benissimo
          &mdash; puoi sempre tornare quando vorrai, al prezzo intero.
        </p>

        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${scontoUrl}"
             style="display: inline-block; background: #1a1614; color: #faf7f2; text-decoration: none;
                    padding: 16px 40px; border-radius: 100px; font-family: 'Helvetica Neue', Arial, sans-serif;
                    font-size: 15px; font-weight: 600;">
            Ricevi la tua analisi a 7&euro; &#x2726;
          </a>
        </div>

        <div style="border-top: 1px solid #e8e0d8; padding-top: 20px;">
          <p style="font-size: 14px; line-height: 1.7; color: #3a3430; margin-bottom: 4px;">
            A presto,
          </p>
          <p style="font-size: 14px; line-height: 1.7; color: #3a3430; margin-bottom: 0;">
            <strong>Veronica</strong>
          </p>
        </div>

      </div>
    `,
  })
}

// ─── LAZY POLLING — invia follow-up pending (mail 2 e mail 3) ─────────────
// Triggherato a ogni nuova submission. Recupera dal DB le submission eligible
// per mail 2 (+24h dalla mail 1) e per mail 3 (+48h dalla mail 2 = +72h dalla 1),
// e invia. Robusto ai riavvii del server (non dipende da setTimeout in memoria).
async function processPendingFollowups(): Promise<void> {
  // Mail 2
  try {
    const pending2 = getPendingFollowup2Submissions(REMINDER2_DELAY_HOURS)
    for (const sub of pending2) {
      const fresh = getSubquizById(sub.id)
      if (!fresh || fresh.paid === 1 || fresh.reminder2_sent === 1) continue
      if (!fresh.email || !fresh.email.includes('@')) continue

      try {
        await sendSecondReminder(fresh)
        markReminder2Sent(fresh.id)
        console.log(`[abandoned-cart] Mail 2 inviata a ${fresh.email} (submission #${fresh.id})`)
      } catch (err) {
        console.error(`[abandoned-cart] Errore invio mail 2 per submission #${fresh.id}:`, err)
      }
    }
  } catch (err) {
    console.error('[abandoned-cart] Errore in processing mail 2:', err)
  }

  // Mail 3
  try {
    const pending3 = getPendingFollowup3Submissions(REMINDER3_DELAY_HOURS)
    for (const sub of pending3) {
      const fresh = getSubquizById(sub.id)
      if (!fresh || fresh.paid === 1 || fresh.reminder3_sent === 1) continue
      if (!fresh.email || !fresh.email.includes('@')) continue

      try {
        await sendThirdReminder(fresh)
        markReminder3Sent(fresh.id)
        console.log(`[abandoned-cart] Mail 3 inviata a ${fresh.email} (submission #${fresh.id})`)
      } catch (err) {
        console.error(`[abandoned-cart] Errore invio mail 3 per submission #${fresh.id}:`, err)
      }
    }
  } catch (err) {
    console.error('[abandoned-cart] Errore in processing mail 3:', err)
  }
}

// ─── ENTRY POINT — chiamato da /api/subquiz-upload su nuova submission ────
export function scheduleAbandonedCartReminder(submissionId: number) {
  // Lazy polling: ogni nuova submission triggera anche un check sui follow-up
  // pending da inviare ad altre submission vecchie. Fire-and-forget.
  processPendingFollowups().catch(err => console.error('[abandoned-cart] polling error:', err))

  // Schedule mail 1 a +15 minuti per questa nuova submission
  setTimeout(async () => {
    try {
      const sub = getSubquizById(submissionId)
      if (!sub || sub.paid === 1 || sub.reminder_sent === 1) return
      if (!sub.email || !sub.email.includes('@')) return

      await sendFirstReminder(sub)
      markReminderSent(submissionId)
      console.log(`[abandoned-cart] Mail 1 inviata a ${sub.email} (submission #${submissionId})`)
    } catch (err) {
      console.error(`[abandoned-cart] Errore invio mail 1 per submission #${submissionId}:`, err)
    }
  }, REMINDER_DELAY_MS)
}
