import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    const { season, name, email } = await req.json()

    const session = await stripe.checkout.sessions.create({
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
            unit_amount: 700, // 7.00 €
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Dopo il pagamento, redirect alla pagina upload con session_id
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upload?session_id={CHECKOUT_SESSION_ID}&season=${encodeURIComponent(season)}&name=${encodeURIComponent(name)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?cancelled=true`,
      customer_email: email || undefined,
      // Salviamo i dati del cliente nei metadata per trovarli dopo
      metadata: {
        season,
        customer_name: name,
        customer_email: email,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
