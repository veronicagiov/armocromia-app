# 🌸 Guida Setup — Armocromia App

Segui questi passi nell'ordine. Ci vogliono circa 30 minuti.

---

## PASSO 1 — Installa gli strumenti (solo la prima volta)

1. Installa **Node.js**: vai su https://nodejs.org e scarica la versione LTS
2. Installa **Git**: vai su https://git-scm.com/downloads

---

## PASSO 2 — Configura Stripe

1. Vai su https://dashboard.stripe.com
2. Clicca **Sviluppatori → Chiavi API**
3. Copia **Chiave pubblica** (pk_live_...) e **Chiave segreta** (sk_live_...)
4. Vai su **Sviluppatori → Webhook → Aggiungi endpoint**
   - URL: `https://TUO-SITO.vercel.app/api/webhook`
   - Evento: `checkout.session.completed`
   - Copia il **Webhook secret** (whsec_...)

---

## PASSO 3 — Configura Gmail per le notifiche

1. Vai su https://myaccount.google.com/apppasswords
2. Seleziona "Mail" e il tuo dispositivo
3. Copia la **App Password** di 16 caratteri generata

---

## PASSO 4 — Configura Google Drive

1. Vai su https://console.cloud.google.com
2. Crea un nuovo progetto (es. "Armocromia")
3. Cerca **"Google Drive API"** e abilitala
4. Vai su **Credenziali → Crea credenziali → Account di servizio**
   - Nome: "armocromia-upload"
   - Scarica il file JSON delle credenziali
5. Dal file JSON, copia:
   - `client_email` → va in `GOOGLE_CLIENT_EMAIL`
   - `private_key` → va in `GOOGLE_PRIVATE_KEY`
6. Crea una cartella su Google Drive chiamata "Foto Armocromia"
7. Apri la cartella → clic destro → **Condividi**
   - Aggiungi l'email dell'account di servizio (`client_email`)
   - Dai permesso "Editor"
8. Dall'URL della cartella copia l'ID:
   `https://drive.google.com/drive/folders/QUI_C_E_L_ID`

---

## PASSO 5 — Crea il file .env.local

Nella cartella del progetto, copia il file `.env.local.example` e rinominalo `.env.local`.
Riempi tutti i campi con i valori ottenuti sopra:

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

NOTIFY_EMAIL=la-tua-email@gmail.com
GMAIL_USER=la-tua-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

GOOGLE_CLIENT_EMAIL=armocromia@progetto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=1BxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxX

NEXT_PUBLIC_BASE_URL=https://tuo-sito.vercel.app
```

---

## PASSO 6 — Testa in locale

Apri il terminale nella cartella del progetto e lancia:

```bash
npm install
npm run dev
```

Vai su http://localhost:3000 — dovresti vedere il quiz.

---

## PASSO 7 — Deploy su Vercel (gratuito)

1. Vai su https://vercel.com e crea un account (puoi usare Google)
2. Clicca **"Add New Project"**
3. Clicca **"Import Third-Party Git Repository"** e scegli la cartella del progetto
   *(oppure usa il CLI: `npm i -g vercel` poi `vercel` nella cartella)*
4. Vai su **Settings → Environment Variables** nel tuo progetto Vercel
5. Aggiungi una per una tutte le variabili del file `.env.local`
6. Clicca **Deploy**

Il tuo sito sarà online su `https://nome-progetto.vercel.app`

---

## PASSO 8 — Aggiorna l'URL del webhook Stripe

1. Torna su Stripe → Sviluppatori → Webhook
2. Modifica l'endpoint con l'URL Vercel reale:
   `https://nome-progetto.vercel.app/api/webhook`

---

## Struttura del progetto

```
armocromia-app/
├── public/
│   └── quiz.html          ← Il tuo quiz (già configurato)
├── src/app/
│   ├── page.tsx           ← Home (carica quiz.html)
│   ├── upload/page.tsx    ← Pagina upload foto (dopo pagamento)
│   ├── grazie/page.tsx    ← Pagina conferma finale
│   └── api/
│       ├── create-checkout/route.ts  ← Crea sessione Stripe
│       └── upload/route.ts           ← Riceve foto, Drive, email
├── .env.local             ← Le tue credenziali (NON condividere!)
└── package.json
```

---

## Flusso completo utente

1. Utente completa il quiz → vede risultato + sezione upsell
2. Clicca "Voglio l'analisi" → va su Stripe (pagamento 25€)
3. Stripe conferma → redirect a `/upload?session_id=...`
4. Utente carica le foto e inserisce l'email
5. Il server:
   - Verifica il pagamento Stripe
   - Salva le foto su Google Drive (cartella dedicata)
   - Manda email a TE con link alla cartella Drive
   - Manda email di conferma all'utente
6. Utente vede la pagina "Grazie"
7. TU analizzi, crei il PDF e lo mandi via email

---

## Problemi comuni

**"Cannot find module"** → lancia `npm install`

**Stripe non funziona in locale** → usa la chiave di test (`sk_test_...`)
e aggiungi una carta di test: `4242 4242 4242 4242`

**Google Drive dà errore di permessi** → verifica che l'email dell'account
di servizio abbia accesso alla cartella

**Le email non arrivano** → controlla che l'App Password sia corretta
e che sia per "Mail" e non per altre app
