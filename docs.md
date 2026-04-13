# Documentazione Armocromia App

## Panoramica

App web per analisi armocromatica personalizzata. Permette agli utenti di scoprire la propria stagione e sottogruppo armocromatico, caricare foto per l'analisi e ricevere un PDF personalizzato con palette colori, consigli make-up e outfit.

**Stack:** Next.js 14 (App Router) · SQLite · Stripe · Resend · Claude API · pdfkit

---

## Pagine pubbliche

### `/` (Home)
Carica `quiz.html` in iframe. Punto di ingresso principale.

### `/quiz.html` — Quiz stagione + sottogruppo
Flusso completo:
1. **Hero** — "Qual e' la tua stagione armocromatica?"
2. **Quiz stagione** — 6 domande (carnagione, occhi, capelli, rossetto, sole, palette)
3. **Lead capture** — nome, email, privacy checkbox
4. **Risultato stagione** — nome stagione, descrizione, palette colori, libro Amazon
5. **CTA sottogruppo** — "Ora scopri il tuo sottogruppo!"
6. **Quiz sottogruppo** — 4 domande (contrasto, vivacita', chiaro/scuro, accessori). La stagione e' gia' nota, quindi viene saltata la prima domanda
7. **Upload foto** — 1-2 selfie in luce naturale, conferma e salvataggio pre-pagamento
8. **Pagamento** — upsell PDF 7 EUR, checkout Stripe
9. **Redirect** → `/upload` → `/grazie`

### `/analisi.html` — Quiz sottogruppo standalone
Versione per utenti che arrivano dalle newsletter. Stessa logica del subquiz ma:
- Ha la propria hero e lead capture
- Il quiz parte dalla domanda 1 "Che stagione sei?" (5 domande totali)
- Stesso flusso upload foto + pagamento
- **URL:** `https://armocromia-app-production.up.railway.app/analisi.html`

### `/upload` — Conferma pagamento
Pagina intermedia post-Stripe. Salva l'analisi nel DB collegando le foto dal subquiz, poi redirect immediato a `/grazie`.

### `/grazie` — Thank you page
Conferma ricezione, lista di cosa conterra' il PDF, contatto email.

### `/armadio` — Organizzatore armadio
Richiede selezione stagione. Tre viste:
- **Armadio** — sfoglia capi per categoria (top, bottom, abiti, capospalla, scarpe, borse, accessori)
- **Aggiungi** — upload foto capo, analisi AI del colore dominante (Claude API), matching con palette stagione
- **Declutter** — matrice 6 categorie (Perfect Keep, Reconsider, Rediscover, Candidates, Why Not, Let Go) basata su frequenza d'uso e compatibilita' palette

---

## Pannello Admin (`/admin`)

### Autenticazione
- Login con password (`ADMIN_PASSWORD` env var, fallback: `changeme`)
- Cookie `admin_auth` con scadenza 7 giorni

### Tab: Analisi ricevute
- Card per ogni analisi con: nome, email, data, stagione, stato (in attesa/inviata)
- Dropdown per selezionare sottogruppo tra i 4 della stagione
- Espandi per vedere foto caricate
- **Genera PDF** — genera il PDF personalizzato, lo salva su disco e lo apre in nuova tab per anteprima
- **Invia PDF** — appare dopo la generazione, invia via email il PDF gia' generato (stesso file dell'anteprima)
- Eliminazione singola e bulk (checkbox + seleziona tutti)

### Tab: Subquiz foto
- Tabella con submission pre-pagamento: nome, email, stagione, sottogruppo stimato, foto, data
- Utile per analytics: chi ha fatto il subquiz ma non ha pagato
- Eliminazione singola e bulk

### Tab: Lead quiz
- Tabella lead dal quiz stagione: nome, email, stagione, data
- La stagione viene risolta automaticamente: se il lead ha ancora il placeholder 'sottogruppo-quiz', viene mostrata la stagione dalla submission subquiz (se presente)
- Export CSV (nuovi dall'ultimo export / tutti)
- Eliminazione singola e bulk

### Tab: Analytics (KPI)
- **Funnel di conversione** — barre orizzontali: quiz start → risposta → email → subquiz → foto → pagamento, con % drop-off
- **Tempo medio per domanda** — barre che evidenziano domande con esitazione (>8s in rosso)
- **Distribuzione stagioni** — donut chart con percentuali per stagione
- **Distribuzione risposte** — per ogni domanda quiz e subquiz, barre con % per opzione
- **Trend giornaliero** — barre impilate (lead/subquiz/pagamenti) ultimi 30 giorni
- Dati raccolti tramite tracking eventi anonimo (`quiz_events` table, session UUID)

### Statistiche (barra in alto)
- Analisi totali, in attesa, inviate, subquiz foto, lead quiz

---

## API Routes

### Pubbliche

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/create-checkout` | POST | Crea sessione Stripe checkout (9.90 EUR). Body: `{season, name, email}` |
| `/api/upload` | POST | Salva analisi post-pagamento. Verifica Stripe, collega foto dal subquiz, invia email conferma |
| `/api/leads` | POST | Salva lead dal quiz. Body: `{name, email, season}` |
| `/api/subquiz-upload` | POST | Salva foto e dati subquiz pre-pagamento (FormData). Schedula reminder abandoned cart dopo 15 min |
| `/sconto` | GET | Pagina redirect a Stripe con sconto 20% (7 EUR). Params: `?email=...&name=...&season=...` |
| `/api/analyze-color` | POST | Analisi AI colore dominante foto (Claude Haiku). Ritorna hex, nome, in_palette, confidence |
| `/api/wardrobe` | GET/POST/DELETE | CRUD capi armadio |
| `/api/wardrobe/photo` | GET | Serve foto capi armadio |
| `/api/quiz-events` | POST | Salva evento analytics quiz. Body: `{session_id, event, data}` |

### Admin (protette da cookie)

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/admin/login` | POST | Login admin, setta cookie |
| `/api/admin/logout` | POST | Cancella cookie |
| `/api/admin/analyses` | GET/DELETE | Lista analisi / elimina bulk |
| `/api/admin/analyses/[id]` | PATCH | Aggiorna sottogruppo |
| `/api/admin/analyses/[id]/generate-pdf` | POST | Genera PDF e lo salva su disco per anteprima |
| `/api/admin/analyses/[id]/pdf` | GET | Serve il PDF generato per visualizzazione nel browser |
| `/api/admin/analyses/[id]/send` | POST | Invia via email il PDF gia' generato |
| `/api/admin/photo` | GET | Serve foto analisi |
| `/api/admin/leads` | GET/DELETE | Lista lead / elimina bulk |
| `/api/admin/subquiz-submissions` | GET/DELETE | Lista subquiz / elimina bulk |
| `/api/admin/analytics` | GET | Dati aggregati analytics quiz (funnel, tempi, distribuzioni, trend) |
| `/api/admin/debug` | GET | Info storage e database |

---

## Database (SQLite)

File: `armocromia.db` in `STORAGE_PATH` o `/storage` o `./data`

### Tabella `analyses`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | INTEGER PK | Auto-increment |
| stripe_session_id | TEXT UNIQUE | ID sessione Stripe |
| customer_name | TEXT | Nome cliente |
| customer_email | TEXT | Email cliente |
| season | TEXT | Stagione dal quiz |
| subgroup | TEXT | Sottogruppo (impostato da admin) |
| notes | TEXT | Note del cliente |
| photos | TEXT (JSON) | Array path foto |
| status | TEXT | `pending` o `sent` |
| pdf_path | TEXT | Path del PDF generato su disco (NULL se non ancora generato) |
| created_at | TEXT | Timestamp |

### Tabella `leads`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | INTEGER PK | Auto-increment |
| name | TEXT | Nome |
| email | TEXT | Email |
| season | TEXT | Stagione |
| created_at | TEXT | Timestamp |

### Tabella `subquiz_submissions`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | INTEGER PK | Auto-increment |
| name | TEXT | Nome |
| email | TEXT | Email |
| season | TEXT | Stagione |
| subgroup_guess | TEXT | Sottogruppo stimato dal quiz |
| photos | TEXT (JSON) | Array path foto |
| paid | INTEGER | 0 = non pagato, 1 = pagato |
| created_at | TEXT | Timestamp |

### Tabella `quiz_events`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | INTEGER PK | Auto-increment |
| session_id | TEXT | UUID sessione browser (per raggruppare eventi stesso utente) |
| event | TEXT | Tipo evento (quiz_start, quiz_answer, lead_view, lead_submit, subquiz_start, subquiz_answer, photo_view, photo_confirm, payment_view, payment_click) |
| data | TEXT (JSON) | Dati extra: question, option, time_ms |
| created_at | TEXT | Timestamp |

### Tabella `wardrobe_items`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | INTEGER PK | Auto-increment |
| category | TEXT | top/bottom/dress/outer/shoes/bags/accessories |
| color_hex | TEXT | Codice hex colore |
| color_name | TEXT | Nome colore |
| frequency | TEXT | often/sometimes/never |
| photo | TEXT | Path foto |
| note | TEXT | Note |
| season | TEXT | Stagione utente |
| in_palette | INTEGER | 0/1 se colore in palette |
| created_at | TEXT | Timestamp |

---

## Sottogruppi armocromatici (16 totali)

| Stagione | Sottogruppi |
|----------|-------------|
| Primavera | Primavera Assoluta, Spring Light, Spring Warm, Spring Bright |
| Estate | Estate Assoluta, Summer Light, Summer Soft, Summer Cool |
| Autunno | Autunno Assoluto, Autumn Soft, Autumn Warm, Autumn Deep |
| Inverno | Inverno Assoluto, Winter Cool, Winter Bright, Winter Deep |

---

## PDF personalizzato

Generato con pdfkit (A4). Contenuto per ogni sottogruppo:
- Copertina con nome stagione e sottogruppo
- Descrizione dettagliata del sottogruppo
- 4 caratteristiche chiave
- Palette 30+ colori con nomi e hex
- 6 colori da evitare
- 5 colori "prestito" dal sottogruppo vicino
- Consigli make-up (fondotinta, blush, rossetto, ombretti, eyeliner)
- 6 consigli stile e outfit
- Libro consigliato con link Amazon

---

## Integrazioni esterne

### Stripe
- Checkout a 7 EUR per analisi personalizzata
- Verifica pagamento prima di salvare analisi
- Redirect post-pagamento a `/upload`

### Resend
- Email notifica admin (nuova analisi ricevuta)
- Email conferma cliente (foto ricevute)
- Email invio PDF (attachment base64)
- Email abandoned cart reminder (15 min dopo subquiz senza pagamento, link sconto 20%)

### Claude API (Anthropic)
- Modello: `claude-haiku-4-5-20251001`
- Analisi colore dominante foto abbigliamento
- Input: immagine base64 + palette stagione
- Output: hex, nome colore, in_palette, colore piu' vicino, confidence

### Google Sheets
- Salvataggio lead quiz tramite form nascosto + iframe
- Script URL configurato in `quiz.html`

---

## Variabili d'ambiente

```env
STRIPE_SECRET_KEY=sk_test_...        # Chiave segreta Stripe
ANTHROPIC_API_KEY=sk-ant-...         # API key Claude
RESEND_API_KEY=re_...                # API key Resend
ADMIN_PASSWORD=...                   # Password pannello admin
NEXT_PUBLIC_BASE_URL=https://...     # URL base per redirect Stripe
NOTIFY_EMAIL=veronica@youglamour.it  # Email notifiche admin
STORAGE_PATH=/storage                # Path storage (opzionale, default: /storage o ./data)
```

---

## File pubblici HTML

| File | Scopo |
|------|-------|
| `quiz.html` | Quiz stagione + sottogruppo (flusso completo) |
| `analisi.html` | Quiz sottogruppo standalone (da newsletter) |
| `newsletter-cover.html` | Template copertina newsletter |
| `pdf-mockup.html` | Mockup anteprima PDF |
| `popup-widget.html` | Widget popup quiz per siti esterni |

---

## Deploy

**Piattaforma:** Railway  
**URL produzione:** `https://armocromia-app-production.up.railway.app`  
**Branch:** `main`  
**Build:** `npm run build` (Next.js)  
**Storage:** Volume `/storage` su Railway per DB e foto
