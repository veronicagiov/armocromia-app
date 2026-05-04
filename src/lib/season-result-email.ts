import { Resend } from 'resend'

type SeasonKey = 'spring' | 'summer' | 'autumn' | 'winter'

const seasonContent: Record<SeasonKey, { name: string; hook: string; palette: string[] }> = {
  spring: {
    name: 'Primavera',
    hook: 'La tua bellezza è calda, fresca e luminosa &mdash; come un mattino di aprile in fiore. I tuoi colori sono pesca, corallo, giallo burro, verde erba e albicocca: toni caldi e vivaci che esaltano la tua carnagione dorata.',
    palette: ['#f0b080', '#e88060', '#80b858', '#f0d060', '#e8a048', '#f8d0a0'],
  },
  summer: {
    name: 'Estate',
    hook: 'La tua bellezza è delicata, raffinata e poetica &mdash; come un cielo di luglio velato da una leggera foschia. I tuoi colori sono rosa cipria, lavanda, azzurro pastello, grigio perla: toni freddi e tenui che esaltano la tua eleganza naturale.',
    palette: ['#c0b0d8', '#e8c8cc', '#a8c0d8', '#d0d0d8', '#e0c8d0', '#b8c8e0'],
  },
  autumn: {
    name: 'Autunno',
    hook: 'La tua bellezza è ricca, profonda e magnetica &mdash; come un bosco al tramonto di ottobre. I tuoi colori sono ruggine, bronzo, verde muschio, caramello e senape: toni caldi e profondi che esaltano il tuo sottotono dorato-ambrato.',
    palette: ['#a04820', '#c89040', '#507840', '#9a6028', '#804030', '#d0a050'],
  },
  winter: {
    name: 'Inverno',
    hook: 'La tua bellezza è forte, elegante e magnetica &mdash; come un paesaggio innevato sotto un cielo stellato. I tuoi colori sono bianco brillante, nero profondo, rosso puro, blu elettrico: toni freddi e contrastati che esaltano la tua presenza.',
    palette: ['#2040a0', '#cc1020', '#f0f0f8', '#101018', '#8030a0', '#0058b0'],
  },
}

const seasonByItalianName: Record<string, SeasonKey> = {
  Primavera: 'spring',
  Estate: 'summer',
  Autunno: 'autumn',
  Inverno: 'winter',
}

function resolveSeasonKey(season: string): SeasonKey | null {
  if (season in seasonContent) return season as SeasonKey
  if (season in seasonByItalianName) return seasonByItalianName[season]
  return null
}

export async function sendSeasonResultEmail(opts: { name: string; email: string; season: string }) {
  try {
    if (!opts.email || !opts.email.includes('@')) return
    const key = resolveSeasonKey(opts.season)
    if (!key) return

    const data = seasonContent[key]
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://armocromia-app-production.up.railway.app'
    const subquizUrl = `${baseUrl}/analisi.html?start=1&utm_source=mail-stagione`

    const greeting = opts.name ? `Ciao ${opts.name},` : 'Ciao,'
    const paletteHtml = data.palette
      .map(
        (c) => `<td style="padding:0 4px;"><div style="width:42px;height:42px;border-radius:50%;background:${c};border:1px solid rgba(0,0,0,0.06);"></div></td>`
      )
      .join('')

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Veronica di YouGlamour <veronica@youglamour.it>',
      to: opts.email,
      subject: `Ecco la tua stagione: ${data.name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #1a1614; background: #ffffff;">

          <p style="font-size: 16px; line-height: 1.8; color: #3a3430; margin-bottom: 18px;">
            ${greeting}
          </p>

          <p style="font-size: 15px; line-height: 1.7; color: #3a3430; margin-bottom: 22px;">
            ecco un piccolo recap del test che hai appena fatto. La tua stagione armocromatica &egrave;:
          </p>

          <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 300; font-size: 36px; color: #c9a96e; text-align: center; margin: 0 0 18px; letter-spacing: 0.5px;">
            ${data.name}
          </h2>

          <table cellpadding="0" cellspacing="0" style="margin: 0 auto 24px; border-collapse: separate;">
            <tr>${paletteHtml}</tr>
          </table>

          <p style="font-size: 15px; line-height: 1.8; color: #3a3430; margin-bottom: 28px;">
            ${data.hook}
          </p>

          <div style="border-top: 1px solid #e8e0d8; padding-top: 24px; margin-bottom: 24px;">
            <p style="font-size: 15px; line-height: 1.75; color: #3a3430; margin-bottom: 14px;">
              Conoscere la tua stagione &egrave; il primo passo, ma &egrave; solo l'inizio.
              Dentro ogni stagione ci sono <strong>4 sottogruppi</strong>, e tra l'uno e l'altro
              cambia tutto: intensit&agrave;, profondit&agrave;, sottotono. Due donne della stessa
              stagione possono avere palette quasi opposte.
            </p>
            <p style="font-size: 15px; line-height: 1.75; color: #3a3430; margin-bottom: 14px;">
              Trovare il tuo sottogruppo significa avere la certezza dei colori che ti valorizzano
              davvero &mdash; e smettere di tirare a indovinare davanti allo specchio.
              Bastano <strong>4 domande in meno di 2 minuti</strong>, e per te un PDF su misura
              con la tua palette esatta, consigli make-up e abbinamenti outfit gi&agrave; pronti.
            </p>
            <div style="text-align: center; margin: 22px 0 6px;">
              <a href="${subquizUrl}"
                 style="display: inline-block; background: #1a1614; color: #faf7f2; text-decoration: none;
                        padding: 14px 32px; border-radius: 100px; font-family: 'Helvetica Neue', Arial, sans-serif;
                        font-size: 14px; font-weight: 600;">
                Scopri il sottogruppo &rarr;
              </a>
            </div>
          </div>

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

    console.log(`[season-result] Email inviata a ${opts.email} (stagione: ${data.name})`)
  } catch (err) {
    console.error(`[season-result] Errore invio email a ${opts.email}:`, err)
  }
}
