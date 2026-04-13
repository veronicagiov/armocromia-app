import { redirect } from 'next/navigation'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export default async function ScontoPage({ searchParams }: { searchParams: { email?: string; name?: string; season?: string } }) {
  const { email, name, season } = searchParams

  if (!email || !name || !season) {
    redirect('/')
  }

  const session = await getStripe().checkout.sessions.create({
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
          unit_amount: 700, // 7.00 € (sconto 20% su 9.90€)
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
      discount: 'abandoned_cart_20',
    },
  })

  redirect(session.url!)
}
