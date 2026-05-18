import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { isDiscountExpiredForEmail, DISCOUNT_EXPIRY_DAYS } from '@/lib/db'

export const dynamic = 'force-dynamic'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

async function createCheckoutSession(amount: number, season: string, name: string, email: string, discountTag: string) {
  return getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Analisi Armocromia Personalizzata',
            description: `Sottogruppo dettagliato + PDF personalizzato — Stagione ${season}`,
            images: [],
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upload?session_id={CHECKOUT_SESSION_ID}&season=${encodeURIComponent(season)}&name=${encodeURIComponent(name)}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?cancelled=true`,
    customer_email: email,
    metadata: {
      season,
      customer_name: name,
      customer_email: email,
      discount: discountTag,
    },
  })
}

export default async function ScontoPage({ searchParams }: { searchParams: { email?: string; name?: string; season?: string } }) {
  const { email, name, season } = searchParams

  if (!email || !name || !season) {
    redirect('/')
  }

  const expired = isDiscountExpiredForEmail(email)

  if (!expired) {
    const session = await createCheckoutSession(700, season, name, email, 'abandoned_cart_20')
    redirect(session.url!)
  }

  // Sconto scaduto: mostra pagina con messaggio + bottone per checkout a prezzo pieno
  const fullPriceSession = await createCheckoutSession(990, season, name, email, 'expired_discount_full_price')

  return (
    <div style={{
      minHeight: '100vh',
      background: '#faf7f2',
      fontFamily: 'DM Sans, Helvetica Neue, Arial, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      color: '#1a1614',
    }}>
      <div style={{
        maxWidth: 520,
        background: '#ffffff',
        borderRadius: 24,
        border: '1px solid #e8e0d8',
        padding: '48px 36px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(26,22,20,0.06)',
      }}>
        <div style={{
          fontSize: 11,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: '#c9a96e',
          fontWeight: 500,
          marginBottom: 18,
        }}>
          ✦ Sconto scaduto
        </div>
        <h2 style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 34,
          fontWeight: 300,
          lineHeight: 1.2,
          marginBottom: 18,
        }}>
          Lo sconto speciale è scaduto
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.75, color: '#7a6e68', marginBottom: 28 }}>
          Ciao {name}, lo sconto del 20% (7€) era valido per {DISCOUNT_EXPIRY_DAYS} giorni dall'invio della mail.
          <br /><br />
          Puoi comunque ricevere la tua <strong>analisi personalizzata</strong> al prezzo standard di <strong style={{ color: '#c9a96e' }}>9,90€</strong>.
        </p>
        <a
          href={fullPriceSession.url!}
          style={{
            display: 'inline-block',
            background: '#1a1614',
            color: '#faf7f2',
            textDecoration: 'none',
            padding: '16px 40px',
            borderRadius: 100,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: 0.3,
            boxShadow: '0 6px 20px rgba(26,22,20,0.18)',
          }}
        >
          Ricevi la tua analisi · 9,90€
        </a>
        <p style={{ fontSize: 12, color: '#9a8e88', marginTop: 24 }}>
          🔒 Pagamento sicuro con Stripe · PDF pronto in poche ore
        </p>
      </div>
    </div>
  )
}
