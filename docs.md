# Documentazione Armocromia App

## Panoramica

App web per analisi armocromatica personalizzata. Permette agli utenti di scoprire la propria stagione e sottogruppo armocromatico, caricare foto per l'analisi e ricevere un PDF personalizzato con palette colori, consigli make-up e outfit.

**Stack:** Next.js 14 (App Router) · SQLite · Stripe · Resend · Claude API · @react-pdf/renderer

---

## Pagine pubbliche

### `/` (Home)
Carica `quiz.html` in iframe. Punto di ingresso principale.

### `/quiz.html` — Quiz stagione + sottogruppo
Flusso completo:
1. **Hero** — "Qual e' la tua stagione armocromatica?". Il bottone "Inizia il Test Gratuito" apre il quiz in una **nuova scheda** tramite `quiz.html?start=1` (saltando l'iframe della home), dove l'hero viene bypassata e si parte subito dalla domanda 1
2. **Quiz stagione** — 6 domande (carnagione, occhi, capelli, rossetto, sole, palette)
3. **Lead capture** — nome + email obbligatori. Copy framing "Dove ti mandiamo il risultato?" (la richiesta della mail e' giustificata dal recap via mail), CTA "Scopri la mia stagione →". Preview offuscato del risultato "Sei una ▓▓▓▓▓" + palette blurrata, counter social proof dinamico
4. **Risultato stagione** — nome stagione, descrizione, palette colori, libro Amazon. Al submit del lead, parte una mail di recap col risultato (vedi sezione "Mail di recap stagione")

5. **CTA sottogruppo** — "Ora scopri il tuo sottogruppo!" (due bottoni: uno in cima al risultato stagione, uno in fondo nella sezione "Sai che la tua stagione ha 4 sottogruppi?"). Il prezzo NON viene dichiarato prima del subquiz: l'utente lo scopre solo nel banner pagamento dopo l'upload foto. Scelta editoriale per non frenare l'inizio del subquiz
6. **Quiz sottogruppo** — 4 domande (contrasto, vivacita', chiaro/scuro, accessori). La stagione e' gia' nota, quindi viene saltata la prima domanda
7. **Upload foto** — 1-2 selfie in luce naturale (il nome e' gia' stato raccolto nella lead capture). La pagina mostra un blocco **"Perche' serve la foto?"** che spiega il valore (sottotoni reali, contrasto viso, iride — dettagli non catturati dal quiz). Offre tre bottoni: "📸 Fai selfie" (apre fotocamera frontale via `capture="user"`), "🖼 Dalla galleria" e **"📝 Senza foto"** (opt-out). Cliccando "Senza foto" si apre un modale di conferma ("L'analisi potrebbe essere meno precisa — vuoi continuare cosi'?"): se confermato, la submission viene salvata con `photoPaths: []` e si salta alla pagina pagamento — in admin l'analisi arriva senza foto, il `subgroup_guess` dal quiz resta disponibile per la scelta manuale del sottogruppo. **Recupero foto sulla payment page:** se l'utente ha saltato le foto, sopra il banner prezzo appare un box tratteggiato ("Hai saltato il selfie. Vuoi caricarlo per un'analisi piu' precisa? → Carica le foto ora") che lo riporta alla photo-upload section. Se carica e conferma, la POST `/api/subquiz-upload` non duplica la riga: l'UPSERT (vedi sezione API piu' sotto) aggiorna in-place la submission esistente con le foto, e il reminder abbandoned-cart gia' schedulato a 15 min legge i dati aggiornati al momento dello scatto. Le foto selezionate vengono **compresse client-side** (max 1600px, JPEG 0.85) e **caricate in background** su `/api/subquiz-photo` appena selezionate — il click "Conferma" diventa istantaneo perche' le foto sono gia' sul server. Ogni thumb mostra un progress ring in tempo reale, con retry in caso di errore. Su mobile il bottone "Conferma" e' sticky in fondo allo schermo. **Badge privacy** ("Le tue foto sono al sicuro: usate solo per il sottogruppo e cancellate dopo l'invio") — vedi sezione Privacy foto piu' sotto. Il toast della pagina pagamento cambia testo in base al flusso ("Le tue foto sono state caricate" vs generico "Ci siamo quasi!")
8. **Pagamento** — banner upsell PDF a 9,90 EUR. Layout unificato fra `quiz.html` e `analisi.html` (price-bar orizzontale: "A SOLI 9,90€ | pagamento unico • PDF via email, pronto in poche ore"). Sotto al prezzo: **social proof cumulativo** "Unisciti a <N> donne che hanno scoperto il loro sottogruppo" dove `N = 150 (baseline) + lead totali`, fetchato da `/api/social-proof` (vedi sezione API). 4 avatar pseudo-casuali a sinistra del testo. Checkout Stripe via `/api/create-checkout`
9. **Redirect** → `/upload` → `/grazie`

### `/analisi.html` — Quiz sottogruppo standalone
Versione per utenti che arrivano dalle newsletter. Stessa logica del subquiz ma:
- Ha la propria hero, **selezione stagione**, e lead capture
- **Hero**: il bottone primario "Inizia il Test" apre il flusso in una **nuova scheda** (`analisi.html?start=1`). Il prezzo NON viene dichiarato nella hero: l'utente lo scopre solo nel banner pagamento dopo l'upload foto (scelta editoriale per non frenare l'inizio del flusso). Sotto al bottone c'e' un link secondario "Non conosci ancora la tua stagione? Scoprila ora" che rimanda a `https://www.youglamour.it/test-armocromia/` (utenti che non sanno la stagione vanno a fare prima il test base)
- **Step 1 — Selezione stagione** (`#season-section`): card visuali con palette colori per Primavera/Estate/Autunno/Inverno. La scelta viene salvata in `selectedSeason` + `answers[0]` (saltando cosi' la prima domanda del quiz). `analisi.html?start=1` apre direttamente questo step
- **Step 2 — Lead capture**: nome + email con motivazione esplicita ("Lasciaci nome ed email: ti invieremo via mail il tuo sottogruppo armocromatico preciso con la guida personalizzata"). CTA "Scopri il mio sottogruppo →". Niente trust line "risultato immediato e gratuito" (non e' ne' immediato ne' gratuito — il PDF e' a pagamento e arriva in poche ore)
- **Quiz**: 4 domande visibili (contrasto, vivacita', chiaro/scuro, accessori). Counter "X / 4", numerazione "Domanda 01-04". Il "back" si ferma alla Q1 visibile (non si torna alla selezione stagione)
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
- Export CSV (nuovi dall'ultimo export / tutti) — colonne: email, name, season, subgroup_guess, created_at. Usa chiave localStorage separata dai lead.
- Eliminazione singola e bulk

### Tab: Lead quiz
- Tabella lead dal quiz stagione: nome, email, stagione, data
- La stagione viene risolta automaticamente: se il lead ha ancora il placeholder 'sottogruppo-quiz', viene mostrata la stagione dalla submission subquiz (se presente)
- Export CSV (nuovi dall'ultimo export / tutti)
- Eliminazione singola e bulk

### Tab: Analytics (KPI)
- **Funnel di conversione** — barre orizzontali con % drop-off: quiz start → email inserita → risultato stagione visto → subquiz start → pagina foto → foto caricate o skippate → banner prezzo → click paga → **pagamento completato**
- **Tempo medio per domanda** — barre che evidenziano domande con esitazione (>8s in rosso). Contiene anche due metriche non-domanda:
  - Tra le domande quiz e il subquiz: **"✉️ Inserisci email"** = tempo medio tra `lead_view` e `lead_submit` (rosso se >20s)
  - In coda alla sezione subquiz: **"📸 Carica foto"** = tempo medio tra `photo_view` e `photo_confirm` (rosso se >30s). Utile per capire se l'upload foto e' un collo di bottiglia.
- **Distribuzione stagioni** — donut chart con percentuali per stagione
- **Trend giornaliero** — barre impilate (lead/subquiz/pagamenti) ultimi 30 giorni
- **Filtro periodo** — input data "da/a" + preset rapidi: oggi, ieri, ultima settimana (lun-dom precedente), mese corrente, mese precedente, ultimi 30/60/90 giorni. Il preset attivo viene evidenziato; modificare le date manualmente deseleziona il preset.
- **Confronta col periodo precedente** — toggle nella filter bar. Quando attivo, calcola il periodo immediatamente precedente di stessa durata e mostra **delta % + valore assoluto del periodo precedente** accanto a: ogni step del funnel, totale lead nel donut stagioni, ogni tempo medio (quiz, subquiz, email, upload foto). Il valore precedente appare in piccolo sotto la % (es. "+15% vs prec." + "prec. 200") per non dover passare col mouse sul tooltip. Sul trend giornaliero sovrappone una linea tratteggiata col periodo precedente (riferito al selettore 30gg/3m/6m/12m del chart, non al filtro). Per le metriche dei tempi i colori sono invertiti (più veloce = verde). Le delta su funnel/tempi/stagioni richiedono un filtro periodo attivo.
- Dati raccolti tramite tracking eventi anonimo (`quiz_events` table, session UUID). Il count **"Pagamento completato"** e il conteggio pagamenti del trend giornaliero vengono dalla tabella `analyses` (fonte di verita' Stripe-verificata) — include anche le vendite via link sconto `/sconto` che bypassano il tracking browser

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
| `/api/subquiz-photo` | POST | Upload di una singola foto (FormData, campo `photo`). Scrive in cartella temp, ritorna `{ path }`. Usato dal client per l'upload in background mentre l'utente compila la pagina |
| `/api/subquiz-upload` | POST | Finalizza la submission subquiz pre-pagamento. Due modalita': JSON `{name, email, season, subgroup, photoPaths}` con path gia' caricati via `/api/subquiz-photo` (nuovo flusso), oppure FormData con foto binary (legacy, retrocompatibile). **UPSERT:** se esiste gia' una submission per la stessa email negli ultimi 30 minuti e non pagata, la aggiorna invece di crearne una nuova (caso "cambio idea" tra skip foto e poi caricamento foto) — il reminder abbandoned-cart viene schedulato **solo** sul primo INSERT, e a 15 min legge i dati piu' aggiornati. |
| `/sconto` | GET | Pagina sconto reminder. Params: `?email=...&name=...&season=...`. **Scadenza:** lo sconto e' valido per `DISCOUNT_EXPIRY_DAYS` giorni (default: 4) dall'invio della mail di reminder (timestamp in `subquiz_submissions.reminder_sent_at`). Se ancora valido → redirect immediato a Stripe checkout a 7€ (metadata `discount: abandoned_cart_20`). Se scaduto → mostra pagina "Lo sconto e' scaduto" con bottone per checkout a prezzo pieno 9,90€ (metadata `discount: expired_discount_full_price`, per distinguere queste vendite in analytics da quelle organiche). Se l'email non risulta mai aver ricevuto un reminder (fallback / link "vecchio stile"), comportamento attuale: sconto attivo. |
| `/api/analyze-color` | POST | Analisi AI colore dominante foto (Claude Haiku). Ritorna hex, nome, in_palette, confidence |
| `/api/wardrobe` | GET/POST/DELETE | CRUD capi armadio |
| `/api/wardrobe/photo` | GET | Serve foto capi armadio |
| `/api/quiz-events` | POST | Salva evento analytics quiz. Body: `{session_id, event, data}` |
| `/api/social-proof` | GET | Ritorna `{count}` = baseline (150) + `COUNT(*) FROM leads`. Usato dal banner di pagamento sottogruppo (sia `quiz.html` che `analisi.html`) per il counter cumulativo "Unisciti a X donne che hanno scoperto il loro sottogruppo". Cache HTTP `s-maxage=60` per evitare hit DB ad ogni view |

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
| reminder_sent | INTEGER | 0 = mai inviato, 1 = mail reminder abbandoned cart inviata |
| reminder_sent_at | TEXT | Timestamp invio reminder 1 (NULL se mai inviato). Usato per calcolare la scadenza dello sconto su `/sconto` e per triggerare il follow-up 2 dopo 24h |
| reminder2_sent | INTEGER | 0 = mai inviato, 1 = mail follow-up 2 (+24h) inviata |
| reminder2_sent_at | TEXT | Timestamp invio reminder 2 (NULL se mai inviato). Usato per triggerare il follow-up 3 dopo 48h |
| reminder3_sent | INTEGER | 0 = mai inviato, 1 = mail follow-up 3 (+48h dopo mail 2, urgenza scadenza) inviata |
| reminder3_sent_at | TEXT | Timestamp invio reminder 3 (NULL se mai inviato) |
| created_at | TEXT | Timestamp |

### Tabella `quiz_events`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | INTEGER PK | Auto-increment |
| session_id | TEXT | UUID sessione browser (per raggruppare eventi stesso utente) |
| event | TEXT | Tipo evento (quiz_start, quiz_answer, quiz_complete, lead_view, lead_submit, amazon_book_click, subquiz_start, subquiz_answer, photo_view, photo_confirm, payment_view, payment_click). Tracciati sia da `quiz.html` sia da `analisi.html` (quest'ultimo non emette `quiz_start`/`quiz_complete` perche' parte direttamente dal subquiz). |
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

Generato con `@react-pdf/renderer` (A4, 4 pagine). Layout editoriale ispirato a una pagina magazine di armocromia. Sorgente: [src/lib/pdf.tsx](src/lib/pdf.tsx), copy per sottogruppo in [src/lib/pdf-copy.ts](src/lib/pdf-copy.ts).

**Font**: Cormorant Garamond (serif per titoli) + Inter (sans per testo). Caricati a runtime da `node_modules/@fontsource/*/files/*.woff` via `Font.register`.

**Normalizzazione**: se il sottogruppo non e' specificato o coincide col nome della stagione, viene mappato alla variante "Assoluta/Assoluto" (es. "Primavera" → "Primavera Assoluta").

**Pagine**:
1. **Copertina infografica** — foto cliente a sinistra (embedded in base64 dal path su disco; vedi sezione Privacy), titolo serif "Armocromia · personale", griglia 12 colori "Migliori colori", sezione "Il tuo sottotono" con 3 icone SVG (sole/occhio/capelli), box "Stagione più valorizzante" col sottogruppo, riga "Migliori neutri" con 7 swatch.
2. **La tua palette** — griglia 12 colori principali + sezione "Confronto con le altre stagioni" (4 strisce Primavera/Estate/Autunno/Inverno con check sulla stagione della cliente) + 5 colori dal sottogruppo confinante + 6 colori da evitare con ✕.
3. **Guida rapida** — 4 blocchi dal copy curato per sottogruppo: Punti di forza, Cosa valorizza, Cosa evitare, Consiglio di stile. Sotto, "Make-up — i tuoi alleati" con 6 micro-consigli (fondotinta, correttore, blush, illuminante, labbra, occhi).
4. **Chiusura** — messaggio personalizzato col nome cliente, box "Il tuo profilo" col sottogruppo, link al libro Amazon della stagione, email di contatto.

**Copy per sottogruppo** ([src/lib/pdf-copy.ts](src/lib/pdf-copy.ts)): 16 sottogruppi × 4 blocchi (strengths, valorizza, evita, stileAdvice). Da editare direttamente nel file `pdf-copy.ts`: ogni sottogruppo è una chiave di `SUBGROUP_COPY`.

**Foto cliente**: il route `generate-pdf` legge `analysis.photos[0]` da disco e lo passa come `photoPath` a `generatePDF`. La foto viene embeddata come data URI base64 dentro il PDF. Il file originale su disco viene poi cancellato in fase di `send` (vedi sezione Privacy) — la foto vive solo dentro il PDF inviato alla cliente.

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
- Email abandoned cart reminder — **sequenza a 3 mail** (logica in [src/lib/abandoned-cart.ts](src/lib/abandoned-cart.ts)). Timeline rispetto al momento del subquiz abbandonato:
  - T+15min → **Mail 1**
  - T+24h15min → **Mail 2** (+24h dopo mail 1)
  - T+72h15min → **Mail 3** (+48h dopo mail 2 = +72h dopo mail 1)
  - T+96h15min → **Sconto scaduto** (`DISCOUNT_EXPIRY_DAYS = 4` giorni dalla mail 1)
  - **Mail 1** — Template lunga e personale (presentazione di Veronica, value prop, sconto a 7€). Ha **due varianti condizionali** sui paragrafi che parlano delle foto (apertura + value prop "studio personalmente"): se la submission ha foto, copy invariato; se l'utente ha skippato (`photos = []`), copy adattato a "non hai caricato il selfie — nessun problema" e "studio personalmente le tue risposte al quiz". Schedulata in memoria con `setTimeout` 15min (rischio basso di perdita per riavvio server in 15min).
  - **Mail 2** — Costante `REMINDER2_DELAY_HOURS = 24`. Template breve "lo sconto è ancora valido", richiamo discreto, link diretto a `/sconto`.
  - **Mail 3** — Costante `REMINDER3_DELAY_HOURS = 48`. Template breve a tono umano-empatico (NON vendita-forte): subject "una nota veloce sulla tua analisi", corpo che comunica la scadenza imminente ma disarmando la pressione ("non voglio essere insistente", "lo sconto è pensato come ringraziamento", "se preferisci aspettare va benissimo"). Ultimo richiamo prima che `/sconto` mostri il prezzo pieno. Il tono empatico è una scelta esplicita per restare coerenti con la voce della mail 1 (personale, non aggressiva).
  - **Lazy polling** ([abandoned-cart.ts:processPendingFollowups](src/lib/abandoned-cart.ts)) — Mail 2 e Mail 3 sono triggerate da polling lazy: ogni volta che arriva una nuova submission abbandonata, prima del `setTimeout` per la mail 1 viene chiamato `processPendingFollowups()` che cerca nel DB le submission eligible per mail 2 (`reminder_sent_at <= now - 24h AND reminder2_sent = 0 AND paid = 0`) e per mail 3 (`reminder2_sent_at <= now - 48h AND reminder3_sent = 0 AND paid = 0`), e le invia. Per ogni invio fa un **double-check** rifaccendo `getSubquizById(id)` per evitare race condition con un pagamento appena completato. Approccio robusto ai riavvii del server (non dipende da timer in memoria), funziona finchè c'è traffico costante. Limite: se non arriva traffico per >24h, le mail di follow-up partono in ritardo (degradazione graceful, non bloccante).
  - **Paid tracking** — quando l'utente paga (sia via `/sconto` a 7€ sia via flusso normale a 9,90€), [src/app/api/upload/route.ts](src/app/api/upload/route.ts) chiama `markSubquizPaidByEmail(email)` che setta `paid = 1` su tutte le submission di quella email. Questo "spegne" tutti i reminder pending: il filtro `paid = 0` nelle query di polling li esclude immediatamente.
  - **Open rate tracking** — ognuna delle 3 mail include un **pixel invisibile 1×1** (`getOpenPixel` in [abandoned-cart.ts](src/lib/abandoned-cart.ts)) che punta a `GET /api/email/open?sid=<submissionId>&m=<1|2|3>` ([src/app/api/email/open/route.ts](src/app/api/email/open/route.ts)). Quando il client di posta carica l'immagine, la route chiama `markReminderOpened(id, m)` ([db.ts](src/lib/db.ts)) che incrementa `reminderN_open_count` a OGNI caricamento (conta anche le riaperture) e fissa `reminderN_opened = 1` + `reminderN_opened_at` alla PRIMA apertura (COALESCE preserva il timestamp), restituendo sempre una GIF trasparente. Approccio self-hosted: nessuna config Resend né webhook/firme. Le stats aggregate (`sent`, `opened` = aperture uniche, `totalOpens` = aperture totali incl. riaperture, `rate` = opened/sent) si calcolano con `getReminderOpenStats(dateFrom?, dateTo?)`, incluse nel return di `getQuizEventsAggregated` come `reminderOpenStats` → visualizzate nel **riquadro "Open rate mail post-subquiz"** in fondo al tab Analytics dell'admin ([AdminDashboard.tsx](src/app/admin/AdminDashboard.tsx)), che mostra per ogni mail la % di apertura, `aperte/inviate`, le aperture totali e la media `×/persona`. Eredita i filtri data (per `created_at` della submission) e il confronto col periodo precedente come le altre metriche. Caveat intrinseco dell'open tracking via pixel: i proxy immagini (es. Apple Mail Privacy Protection) gonfiano le aperture, le immagini bloccate le sottostimano — il dato è indicativo, non esatto.
- **Mail di recap stagione** — inviata immediatamente dopo il submit del lead di `quiz.html` (POST `/api/leads`) **solo per stagioni reali** (Primavera/Estate/Autunno/Inverno, non per il placeholder `sottogruppo-quiz` di analisi.html). Recap brevissimo: nome stagione + paragrafo descrittivo + palette inline (6 cerchi) + CTA "Scopri il mio sottogruppo →" verso `/analisi.html?start=1&utm_source=mail-stagione`. Invio fire-and-forget (errori loggati, non bloccano la response). Logica in [src/lib/season-result-email.ts](src/lib/season-result-email.ts). La mail giustifica la richiesta dell'email nel lead-section ("Dove ti mandiamo il risultato?") e funziona da secondo punto d'ingresso al subquiz a pagamento.

---

## Privacy foto (GDPR compliance)

**Promessa all'utente** (mostrata nel badge sulla pagina upload): "Le tue foto sono usate solo per identificare il sottogruppo e cancellate automaticamente dal nostro server dopo l'invio dell'analisi".

**Implementazione** ([src/lib/db.ts](src/lib/db.ts) funzione `clearAnalysisPhotoFiles`):
- Quando l'admin clicca "Invia PDF" ([/api/admin/analyses/[id]/send](src/app/api/admin/analyses/[id]/send/route.ts)), dopo l'invio email riuscito:
  1. `markAsSent(id)` — status passa a `sent`
  2. `clearAnalysisPhotoFiles(id)` — cancella i file dal disco (`/storage/uploads/subquiz_xxx/*.jpg`), rimuove la cartella se vuota, svuota il campo `photos` nel DB (`'[]'`)
- Se la cancellazione fallisce per qualche file (race condition, permessi), l'errore viene loggato ma non blocca il flow — il cliente ha comunque ricevuto il PDF.
- Nel pannello admin, le foto non sono piu' visualizzabili dopo l'invio (coerenza tra UI e DB).

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
