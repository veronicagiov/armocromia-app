import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

export const DATA_DIR = process.env.STORAGE_PATH || (fs.existsSync('/storage') ? '/storage' : path.join(process.cwd(), 'data'))
const DB_PATH = path.join(DATA_DIR, 'armocromia.db')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

declare global {
  var _db: Database.Database | undefined
}

let db: Database.Database

if (process.env.NODE_ENV === 'production') {
  db = new Database(DB_PATH)
} else {
  if (!global._db) {
    global._db = new Database(DB_PATH)
  }
  db = global._db
}

db.exec(`
  CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stripe_session_id TEXT UNIQUE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    season TEXT NOT NULL,
    subgroup TEXT,
    notes TEXT DEFAULT '',
    photos TEXT DEFAULT '[]',
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  )
`)

// Migration: add pdf_path column if missing
try {
  db.exec(`ALTER TABLE analyses ADD COLUMN pdf_path TEXT DEFAULT NULL`)
} catch { /* column already exists */ }

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    season TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  )
`)

export interface Analysis {
  id: number
  stripe_session_id: string
  customer_name: string
  customer_email: string
  season: string
  subgroup: string | null
  notes: string
  photos: string
  status: 'pending' | 'sent'
  pdf_path: string | null
  created_at: string
}

export const SUBGROUPS: Record<string, string[]> = {
  'Primavera': ['Primavera Assoluta', 'Spring Light', 'Spring Warm', 'Spring Bright'],
  'Estate': ['Estate Assoluta', 'Summer Light', 'Summer Soft', 'Summer Cool'],
  'Autunno': ['Autunno Assoluto', 'Autumn Soft', 'Autumn Warm', 'Autumn Deep'],
  'Inverno': ['Inverno Assoluto', 'Winter Cool', 'Winter Bright', 'Winter Deep'],
}

export function getAllAnalyses(): Analysis[] {
  return db.prepare('SELECT * FROM analyses ORDER BY created_at DESC').all() as Analysis[]
}

export function getAnalysisById(id: number): Analysis | undefined {
  return db.prepare('SELECT * FROM analyses WHERE id = ?').get(id) as Analysis | undefined
}

const SEASON_TO_ASSOLUTO: Record<string, string> = {
  'Primavera': 'Primavera Assoluta',
  'Estate': 'Estate Assoluta',
  'Autunno': 'Autunno Assoluto',
  'Inverno': 'Inverno Assoluto',
}

export function seasonToAssoluto(season: string): string {
  return SEASON_TO_ASSOLUTO[season] || season
}

export function insertAnalysis(data: {
  stripe_session_id: string
  customer_name: string
  customer_email: string
  season: string
  notes: string
  photos: string[]
}): number {
  const result = db.prepare(`
    INSERT INTO analyses (stripe_session_id, customer_name, customer_email, season, subgroup, notes, photos)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.stripe_session_id,
    data.customer_name,
    data.customer_email,
    data.season,
    seasonToAssoluto(data.season), // subgroup iniziale = variante Assoluta della stagione
    data.notes,
    JSON.stringify(data.photos)
  )
  return result.lastInsertRowid as number
}

export function updateSubgroup(id: number, subgroup: string): void {
  db.prepare('UPDATE analyses SET subgroup = ? WHERE id = ?').run(subgroup, id)
}

export function markAsSent(id: number): void {
  db.prepare("UPDATE analyses SET status = 'sent' WHERE id = ?").run(id)
}

/**
 * Cancella fisicamente i file foto di un'analisi e svuota il campo photos nel DB.
 * Chiamato dopo l'invio del PDF al cliente per onorare la promessa di privacy
 * ("le tue foto vengono cancellate dopo l'analisi"). Le directory vuote parent
 * vengono pure rimosse se possibile. Non lancia errori: ogni failure e' silente.
 */
export function clearAnalysisPhotoFiles(id: number): void {
  const row = db.prepare('SELECT photos FROM analyses WHERE id = ?').get(id) as { photos: string } | undefined
  if (!row) return
  let paths: string[] = []
  try { paths = JSON.parse(row.photos || '[]') } catch { /* malformed */ }
  const uploadsRoot = path.join(DATA_DIR, 'uploads')
  const parents = new Set<string>()
  for (const p of paths) {
    try {
      const full = path.join(uploadsRoot, p)
      if (fs.existsSync(full)) fs.unlinkSync(full)
      parents.add(path.dirname(full))
    } catch { /* skip */ }
  }
  // Se la cartella parent e' vuota, rimuovila
  for (const dir of parents) {
    try {
      if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir)
    } catch { /* skip */ }
  }
  db.prepare("UPDATE analyses SET photos = '[]' WHERE id = ?").run(id)
}

export function setPdfPath(id: number, pdfPath: string): void {
  db.prepare('UPDATE analyses SET pdf_path = ? WHERE id = ?').run(pdfPath, id)
}

export function deleteAnalysis(id: number): void {
  db.prepare('DELETE FROM analyses WHERE id = ?').run(id)
}

export function deleteAnalysesBulk(ids: number[]): void {
  const placeholders = ids.map(() => '?').join(',')
  db.prepare(`DELETE FROM analyses WHERE id IN (${placeholders})`).run(...ids)
}

// ── Wardrobe ──────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS wardrobe_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    color_name TEXT,
    frequency TEXT NOT NULL DEFAULT 'sometimes',
    photo TEXT,
    note TEXT DEFAULT '',
    season TEXT NOT NULL,
    in_palette INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  )
`)

export interface WardrobeItem {
  id: number
  category: string
  color_hex: string
  color_name: string | null
  frequency: 'often' | 'sometimes' | 'never'
  photo: string | null
  note: string
  season: string
  in_palette: number
  created_at: string
}

export function getAllWardrobeItems(): WardrobeItem[] {
  return db.prepare('SELECT * FROM wardrobe_items ORDER BY created_at DESC').all() as WardrobeItem[]
}

export function insertWardrobeItem(data: {
  category: string
  color_hex: string
  color_name: string | null
  frequency: string
  photo: string | null
  note: string
  season: string
  in_palette: boolean
}): number {
  const result = db.prepare(`
    INSERT INTO wardrobe_items (category, color_hex, color_name, frequency, photo, note, season, in_palette)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(data.category, data.color_hex, data.color_name, data.frequency, data.photo, data.note, data.season, data.in_palette ? 1 : 0)
  return result.lastInsertRowid as number
}

export function deleteWardrobeItem(id: number): void {
  db.prepare('DELETE FROM wardrobe_items WHERE id = ?').run(id)
}

export function updateWardrobeFrequency(id: number, frequency: string): void {
  db.prepare('UPDATE wardrobe_items SET frequency = ? WHERE id = ?').run(frequency, id)
}

// ── Subquiz submissions (pre-pagamento, per analytics) ──
db.exec(`
  CREATE TABLE IF NOT EXISTS subquiz_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    season TEXT NOT NULL,
    subgroup_guess TEXT,
    photos TEXT DEFAULT '[]',
    paid INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  )
`)

// Aggiunge colonna reminder_sent se non esiste
try {
  db.exec(`ALTER TABLE subquiz_submissions ADD COLUMN reminder_sent INTEGER DEFAULT 0`)
} catch (e) {
  // Colonna già esistente, ignora
}

// Aggiunge colonna reminder_sent_at (timestamp) per scadenza sconto
try {
  db.exec(`ALTER TABLE subquiz_submissions ADD COLUMN reminder_sent_at TEXT DEFAULT NULL`)
} catch (e) {
  // Colonna già esistente, ignora
}

// Aggiunge colonne per il secondo reminder (+24h dopo il primo)
try {
  db.exec(`ALTER TABLE subquiz_submissions ADD COLUMN reminder2_sent INTEGER DEFAULT 0`)
} catch (e) { /* esiste già */ }
try {
  db.exec(`ALTER TABLE subquiz_submissions ADD COLUMN reminder2_sent_at TEXT DEFAULT NULL`)
} catch (e) { /* esiste già */ }

// Aggiunge colonne per il terzo reminder (+48h dopo il secondo = +72h dopo il primo)
try {
  db.exec(`ALTER TABLE subquiz_submissions ADD COLUMN reminder3_sent INTEGER DEFAULT 0`)
} catch (e) { /* esiste già */ }
try {
  db.exec(`ALTER TABLE subquiz_submissions ADD COLUMN reminder3_sent_at TEXT DEFAULT NULL`)
} catch (e) { /* esiste già */ }

// Aggiunge colonne per il tracking aperture (open tracking via pixel invisibile).
// reminderN_opened = 1 alla prima apertura; reminderN_opened_at registra il primo
// timestamp. Servono a calcolare l'open rate delle 3 mail automatiche post-subquiz.
// reminderN_open_count conta TUTTE le aperture (incl. riaperture), mentre
// reminderN_opened è il flag binario "aperta almeno una volta".
for (const n of ['', '2', '3']) {
  try {
    db.exec(`ALTER TABLE subquiz_submissions ADD COLUMN reminder${n}_opened INTEGER DEFAULT 0`)
  } catch (e) { /* esiste già */ }
  try {
    db.exec(`ALTER TABLE subquiz_submissions ADD COLUMN reminder${n}_opened_at TEXT DEFAULT NULL`)
  } catch (e) { /* esiste già */ }
  try {
    db.exec(`ALTER TABLE subquiz_submissions ADD COLUMN reminder${n}_open_count INTEGER DEFAULT 0`)
  } catch (e) { /* esiste già */ }
}

export interface SubquizSubmission {
  id: number
  name: string
  email: string
  season: string
  subgroup_guess: string | null
  photos: string
  paid: number
  reminder_sent: number
  reminder_sent_at: string | null
  reminder2_sent: number
  reminder2_sent_at: string | null
  reminder3_sent: number
  reminder3_sent_at: string | null
  reminder_opened: number
  reminder_opened_at: string | null
  reminder_open_count: number
  reminder2_opened: number
  reminder2_opened_at: string | null
  reminder2_open_count: number
  reminder3_opened: number
  reminder3_opened_at: string | null
  reminder3_open_count: number
  created_at: string
}

// Lo sconto del reminder (`/sconto`, 7€ anziché 9,90€) scade dopo questo
// numero di giorni dall'invio della mail. Trascorso questo periodo,
// chi clicca il link vede il prezzo pieno.
export const DISCOUNT_EXPIRY_DAYS = 4

// UPSERT: se esiste una submission per la stessa email negli ultimi 30 minuti
// e non e' ancora pagata, la aggiorniamo invece di crearne una nuova. Cosi' chi
// salta le foto e poi cambia idea non genera duplicati ne' reminder doppi.
// `isNew` distingue il caso INSERT (schedula reminder) dal caso UPDATE
// (riusa il setTimeout gia' attivo dal primo INSERT).
export function insertSubquizSubmission(data: {
  name: string
  email: string
  season: string
  subgroup_guess: string
  photos: string[]
}): { id: number; isNew: boolean } {
  const recent = db.prepare(`
    SELECT id FROM subquiz_submissions
    WHERE email = ?
      AND paid = 0
      AND created_at >= datetime('now', '-30 minutes')
    ORDER BY created_at DESC
    LIMIT 1
  `).get(data.email) as { id: number } | undefined

  if (recent) {
    db.prepare(`
      UPDATE subquiz_submissions
      SET name = ?, season = ?, subgroup_guess = ?, photos = ?
      WHERE id = ?
    `).run(data.name, data.season, data.subgroup_guess, JSON.stringify(data.photos), recent.id)
    return { id: recent.id, isNew: false }
  }

  const result = db.prepare(`
    INSERT INTO subquiz_submissions (name, email, season, subgroup_guess, photos)
    VALUES (?, ?, ?, ?, ?)
  `).run(data.name, data.email, data.season, data.subgroup_guess, JSON.stringify(data.photos))
  return { id: result.lastInsertRowid as number, isNew: true }
}

export function getAllSubquizSubmissions(): SubquizSubmission[] {
  return db.prepare('SELECT * FROM subquiz_submissions ORDER BY created_at DESC').all() as SubquizSubmission[]
}

export function getLatestSubquizByEmail(email: string): SubquizSubmission | undefined {
  return db.prepare('SELECT * FROM subquiz_submissions WHERE email = ? ORDER BY created_at DESC LIMIT 1').get(email) as SubquizSubmission | undefined
}

export function markSubquizPaid(id: number): void {
  db.prepare('UPDATE subquiz_submissions SET paid = 1 WHERE id = ?').run(id)
}

// Marca tutte le submission non pagate per una email come pagate. Safety net
// per casi rari in cui l'UPSERT non ha deduplicato (es. cambio idea oltre i
// 30 minuti): cosi' nessun reminder pendente parte verso un cliente che ha
// gia' completato il pagamento.
export function markSubquizPaidByEmail(email: string): void {
  db.prepare('UPDATE subquiz_submissions SET paid = 1 WHERE email = ? AND paid = 0').run(email)
}

export function markReminderSent(id: number): void {
  db.prepare(`UPDATE subquiz_submissions SET reminder_sent = 1, reminder_sent_at = datetime('now', 'localtime') WHERE id = ?`).run(id)
}

// Registra l'apertura di una mail reminder (1, 2 o 3) per una submission, tramite
// il pixel invisibile incluso nell'email. `_open_count` viene incrementato a OGNI
// caricamento (conta anche le riaperture), mentre `_opened`/`_opened_at` restano
// fissati alla PRIMA apertura (COALESCE preserva il timestamp originale).
export function markReminderOpened(id: number, mailNumber: 1 | 2 | 3): void {
  const n = mailNumber === 1 ? '' : String(mailNumber)
  db.prepare(
    `UPDATE subquiz_submissions
     SET reminder${n}_open_count = reminder${n}_open_count + 1,
         reminder${n}_opened = 1,
         reminder${n}_opened_at = COALESCE(reminder${n}_opened_at, datetime('now', 'localtime'))
     WHERE id = ?`
  ).run(id)
}

export interface ReminderOpenStat {
  sent: number
  opened: number      // aperture uniche (persone diverse che hanno aperto almeno 1 volta)
  totalOpens: number  // aperture totali, incluse le riaperture
  rate: number        // 0..1 (opened / sent); 0 se sent === 0
}

// Open rate aggregato delle 3 mail automatiche post-subquiz.
// Denominatore = mail effettivamente inviate (reminderN_sent = 1), così la
// percentuale è "aperte su inviate", non su tutte le submission.
// Il filtro date (opzionale) si applica al created_at della submission, coerente
// con le altre metriche dell'analytics.
export function getReminderOpenStats(dateFrom?: string, dateTo?: string): { mail1: ReminderOpenStat; mail2: ReminderOpenStat; mail3: ReminderOpenStat } {
  const conditions: string[] = []
  const params: string[] = []
  if (dateFrom) { conditions.push('created_at >= ?'); params.push(dateFrom + ' 00:00:00') }
  if (dateTo) { conditions.push('created_at <= ?'); params.push(dateTo + ' 23:59:59') }
  const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''

  const row = db.prepare(`
    SELECT
      SUM(reminder_sent)    AS sent1,  SUM(reminder_opened)    AS opened1,  SUM(reminder_open_count)    AS opens1,
      SUM(reminder2_sent)   AS sent2,  SUM(reminder2_opened)   AS opened2,  SUM(reminder2_open_count)   AS opens2,
      SUM(reminder3_sent)   AS sent3,  SUM(reminder3_opened)   AS opened3,  SUM(reminder3_open_count)   AS opens3
    FROM subquiz_submissions${where}
  `).get(...params) as Record<string, number | null>

  const stat = (sent: number | null, opened: number | null, totalOpens: number | null): ReminderOpenStat => {
    const s = sent || 0
    const o = opened || 0
    return { sent: s, opened: o, totalOpens: totalOpens || 0, rate: s > 0 ? o / s : 0 }
  }

  return {
    mail1: stat(row.sent1, row.opened1, row.opens1),
    mail2: stat(row.sent2, row.opened2, row.opens2),
    mail3: stat(row.sent3, row.opened3, row.opens3),
  }
}

// Verifica se lo sconto del reminder è scaduto per una certa email.
// Cerca la submission più recente con reminder inviato e calcola se sono
// passati più di DISCOUNT_EXPIRY_DAYS giorni dall'invio.
// Ritorna false se non c'è nessun reminder inviato per quella email
// (così chi clicca un link "vecchio stile" senza mai aver ricevuto reminder
// non viene bloccato — fallback al comportamento attuale).
export function isDiscountExpiredForEmail(email: string): boolean {
  const row = db.prepare(`
    SELECT
      CASE
        WHEN datetime(reminder_sent_at) < datetime('now', 'localtime', '-${DISCOUNT_EXPIRY_DAYS} days') THEN 1
        ELSE 0
      END as expired
    FROM subquiz_submissions
    WHERE email = ? AND reminder_sent = 1 AND reminder_sent_at IS NOT NULL
    ORDER BY reminder_sent_at DESC LIMIT 1
  `).get(email) as { expired: number } | undefined

  if (!row) return false
  return row.expired === 1
}

export function getSubquizById(id: number): SubquizSubmission | undefined {
  return db.prepare('SELECT * FROM subquiz_submissions WHERE id = ?').get(id) as SubquizSubmission | undefined
}

export function deleteSubquizSubmission(id: number): void {
  db.prepare('DELETE FROM subquiz_submissions WHERE id = ?').run(id)
}

export function deleteSubquizSubmissionsBulk(ids: number[]): void {
  const placeholders = ids.map(() => '?').join(',')
  db.prepare(`DELETE FROM subquiz_submissions WHERE id IN (${placeholders})`).run(...ids)
}

export interface Lead {
  id: number
  name: string
  email: string
  season: string
  created_at: string
}

export function deleteLead(id: number): void {
  db.prepare('DELETE FROM leads WHERE id = ?').run(id)
}

export function deleteLeadsBulk(ids: number[]): void {
  const placeholders = ids.map(() => '?').join(',')
  db.prepare(`DELETE FROM leads WHERE id IN (${placeholders})`).run(...ids)
}

export function insertLead(data: { name: string; email: string; season: string }): void {
  db.prepare(`
    INSERT OR IGNORE INTO leads (name, email, season)
    VALUES (?, ?, ?)
  `).run(data.name, data.email, data.season)
}

export function updateLeadSeason(email: string, season: string): void {
  db.prepare('UPDATE leads SET season = ? WHERE email = ? AND season = ?').run(season, email, 'sottogruppo-quiz')
}

/**
 * Aggiorna il nome del lead piu' recente per questa email, solo se il nome
 * corrente e' vuoto. Chiamato dalla pagina upload foto quando l'utente
 * inserisce il nome (che non viene piu' chiesto nella lead capture).
 */
export function updateLeadName(email: string, name: string): void {
  if (!email || !name) return
  db.prepare(`
    UPDATE leads SET name = ?
    WHERE id = (
      SELECT id FROM leads
      WHERE email = ? AND (name IS NULL OR name = '')
      ORDER BY id DESC LIMIT 1
    )
  `).run(name, email)
}

export function getAllLeads(): Lead[] {
  return db.prepare(`
    SELECT l.id, l.name, l.email,
      CASE
        WHEN l.season = 'sottogruppo-quiz' AND s.season IS NOT NULL THEN s.season
        ELSE l.season
      END AS season,
      l.created_at
    FROM leads l
    LEFT JOIN (
      SELECT email, season,
        ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) AS rn
      FROM subquiz_submissions
    ) s ON s.email = l.email AND s.rn = 1
    ORDER BY l.created_at DESC
  `).all() as Lead[]
}

// ── Quiz Events (analytics tracking) ──────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS quiz_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    event TEXT NOT NULL,
    data TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  )
`)

export interface QuizEvent {
  id: number
  session_id: string
  event: string
  data: string
  created_at: string
}

export function insertQuizEvent(data: { session_id: string; event: string; data?: Record<string, unknown> }): void {
  db.prepare(`
    INSERT INTO quiz_events (session_id, event, data)
    VALUES (?, ?, ?)
  `).run(data.session_id, data.event, JSON.stringify(data.data || {}))
}

export function getQuizEventsAggregated(dateFrom?: string, dateTo?: string): {
  funnel: Record<string, number>
  quizAnswerTimes: { question: number; avg_ms: number; count: number }[]
  subquizAnswerTimes: { question: number; avg_ms: number; count: number }[]
  leadFormTime: { avg_ms: number; count: number } | null
  photoUploadTime: { avg_ms: number; count: number } | null
  dailyActivity: { date: string; leads: number; subquiz: number; payments: number }[]
  seasonDistribution: { season: string; count: number }[]
  reminderOpenStats: { mail1: ReminderOpenStat; mail2: ReminderOpenStat; mail3: ReminderOpenStat }
} {
  // Costruisci clausola WHERE per filtro date
  const dateConditions: string[] = []
  const dateParams: string[] = []
  if (dateFrom) { dateConditions.push('created_at >= ?'); dateParams.push(dateFrom + ' 00:00:00') }
  if (dateTo) { dateConditions.push('created_at <= ?'); dateParams.push(dateTo + ' 23:59:59') }
  const dateWhere = dateConditions.length > 0 ? ' WHERE ' + dateConditions.join(' AND ') : ''
  const dateAnd = dateConditions.length > 0 ? ' AND ' + dateConditions.join(' AND ') : ''

  // Funnel: count unique sessions per event
  const funnelRows = db.prepare(`
    SELECT event, COUNT(DISTINCT session_id) as cnt
    FROM quiz_events${dateWhere}
    GROUP BY event
  `).all(...dateParams) as { event: string; cnt: number }[]
  const funnel: Record<string, number> = {}
  for (const r of funnelRows) funnel[r.event] = r.cnt

  // Pagamenti reali: conteggio dalla tabella analyses (fonte di verita',
  // include anche le vendite via /sconto che bypassano payment_click).
  // Usiamo la chiave speciale 'payment_success' nel funnel.
  const analysesDateConditions: string[] = []
  const analysesDateParams: string[] = []
  if (dateFrom) { analysesDateConditions.push('created_at >= ?'); analysesDateParams.push(dateFrom + ' 00:00:00') }
  if (dateTo) { analysesDateConditions.push('created_at <= ?'); analysesDateParams.push(dateTo + ' 23:59:59') }
  const analysesDateWhere = analysesDateConditions.length > 0 ? ' WHERE ' + analysesDateConditions.join(' AND ') : ''
  const paidRow = db.prepare(`
    SELECT COUNT(*) as cnt FROM analyses${analysesDateWhere}
  `).get(...analysesDateParams) as { cnt: number }
  funnel['payment_success'] = paidRow?.cnt || 0

  // Fetch answer rows and aggregate in JS (avoids json_extract compatibility issues)
  const quizAnswerRows = db.prepare(`
    SELECT data FROM quiz_events WHERE event = 'quiz_answer'${dateAnd}
  `).all(...dateParams) as { data: string }[]

  const subquizAnswerRows = db.prepare(`
    SELECT data FROM quiz_events WHERE event = 'subquiz_answer'${dateAnd}
  `).all(...dateParams) as { data: string }[]

  function aggregateAnswers(rows: { data: string }[]) {
    const timesMap: Record<number, { total: number; count: number }> = {}
    const distMap: Record<string, number> = {}

    for (const row of rows) {
      try {
        const d = JSON.parse(row.data)
        const q = d.question as number
        const opt = d.option as number
        const timeMs = d.time_ms as number | undefined

        if (q != null && timeMs != null) {
          if (!timesMap[q]) timesMap[q] = { total: 0, count: 0 }
          timesMap[q].total += timeMs
          timesMap[q].count++
        }
        if (q != null && opt != null) {
          const key = `${q}:${opt}`
          distMap[key] = (distMap[key] || 0) + 1
        }
      } catch { /* skip malformed */ }
    }

    const times = Object.entries(timesMap)
      .map(([q, v]) => ({ question: Number(q), avg_ms: v.total / v.count, count: v.count }))
      .sort((a, b) => a.question - b.question)

    const dist = Object.entries(distMap)
      .map(([key, count]) => {
        const [q, o] = key.split(':')
        return { question: Number(q), option: Number(o), count }
      })
      .sort((a, b) => a.question - b.question || a.option - b.option)

    return { times, dist }
  }

  const quizAgg = aggregateAnswers(quizAnswerRows)
  const subAgg = aggregateAnswers(subquizAnswerRows)

  // Tempo medio tra lead_view e lead_submit (quanto ci mettono a inserire l'email)
  const leadFormRow = db.prepare(`
    SELECT AVG(diff_s) as avg_s, COUNT(*) as cnt FROM (
      SELECT
        (strftime('%s', MIN(CASE WHEN event='lead_submit' THEN created_at END))
         - strftime('%s', MIN(CASE WHEN event='lead_view' THEN created_at END))) as diff_s
      FROM quiz_events
      WHERE event IN ('lead_view','lead_submit')${dateAnd}
      GROUP BY session_id
      HAVING diff_s IS NOT NULL AND diff_s >= 0
    )
  `).get(...dateParams) as { avg_s: number | null; cnt: number }
  const leadFormTime = leadFormRow && leadFormRow.cnt > 0 && leadFormRow.avg_s != null
    ? { avg_ms: Math.round(leadFormRow.avg_s * 1000), count: leadFormRow.cnt }
    : null

  // Tempo medio tra photo_view e photo_confirm (quanto ci mettono a caricare le foto)
  // Delta sui timestamp created_at di entrambi gli eventi per la stessa sessione.
  const photoUploadRow = db.prepare(`
    SELECT AVG(diff_s) as avg_s, COUNT(*) as cnt FROM (
      SELECT
        (strftime('%s', MIN(CASE WHEN event='photo_confirm' THEN created_at END))
         - strftime('%s', MIN(CASE WHEN event='photo_view' THEN created_at END))) as diff_s
      FROM quiz_events
      WHERE event IN ('photo_view','photo_confirm')${dateAnd}
      GROUP BY session_id
      HAVING diff_s IS NOT NULL AND diff_s >= 0
    )
  `).get(...dateParams) as { avg_s: number | null; cnt: number }
  const photoUploadTime = photoUploadRow && photoUploadRow.cnt > 0 && photoUploadRow.avg_s != null
    ? { avg_ms: Math.round(photoUploadRow.avg_s * 1000), count: photoUploadRow.cnt }
    : null

  // Daily activity — leads/subquiz da quiz_events, payments dalla tabella analyses
  // (fonte di verita' Stripe-verificata, include vendite via /sconto)
  const dailyEventsQuery = dateFrom || dateTo
    ? `SELECT date(created_at) as date,
        SUM(CASE WHEN event = 'lead_submit' THEN 1 ELSE 0 END) as leads,
        SUM(CASE WHEN event = 'photo_confirm' THEN 1 ELSE 0 END) as subquiz
      FROM quiz_events WHERE 1=1${dateAnd}
      GROUP BY date(created_at) ORDER BY date`
    : `SELECT date(created_at) as date,
        SUM(CASE WHEN event = 'lead_submit' THEN 1 ELSE 0 END) as leads,
        SUM(CASE WHEN event = 'photo_confirm' THEN 1 ELSE 0 END) as subquiz
      FROM quiz_events WHERE created_at >= datetime('now', '-30 days', 'localtime')
      GROUP BY date(created_at) ORDER BY date`
  const dailyEvents = db.prepare(dailyEventsQuery).all(...(dateFrom || dateTo ? dateParams : [])) as { date: string; leads: number; subquiz: number }[]

  const dailyPaymentsQuery = dateFrom || dateTo
    ? `SELECT date(created_at) as date, COUNT(*) as payments
      FROM analyses WHERE 1=1${analysesDateWhere.replace(' WHERE ', ' AND ')}
      GROUP BY date(created_at) ORDER BY date`
    : `SELECT date(created_at) as date, COUNT(*) as payments
      FROM analyses WHERE created_at >= datetime('now', '-30 days', 'localtime')
      GROUP BY date(created_at) ORDER BY date`
  const dailyPayments = db.prepare(dailyPaymentsQuery).all(...(dateFrom || dateTo ? analysesDateParams : [])) as { date: string; payments: number }[]

  // Merge per data (unione di tutte le date presenti in entrambe)
  const paymentsByDate: Record<string, number> = {}
  for (const p of dailyPayments) paymentsByDate[p.date] = p.payments
  const allDates = new Set<string>([...dailyEvents.map(d => d.date), ...dailyPayments.map(d => d.date)])
  const eventsByDate: Record<string, { leads: number; subquiz: number }> = {}
  for (const e of dailyEvents) eventsByDate[e.date] = { leads: e.leads, subquiz: e.subquiz }
  const dailyActivity = Array.from(allDates).sort().map(date => ({
    date,
    leads: eventsByDate[date]?.leads || 0,
    subquiz: eventsByDate[date]?.subquiz || 0,
    payments: paymentsByDate[date] || 0,
  })) as { date: string; leads: number; subquiz: number; payments: number }[]

  // Season distribution from leads table
  const leadsDateConditions: string[] = []
  const leadsDateParams: string[] = []
  if (dateFrom) { leadsDateConditions.push('created_at >= ?'); leadsDateParams.push(dateFrom + ' 00:00:00') }
  if (dateTo) { leadsDateConditions.push('created_at <= ?'); leadsDateParams.push(dateTo + ' 23:59:59') }
  const leadsDateWhere = leadsDateConditions.length > 0 ? ' WHERE ' + leadsDateConditions.join(' AND ') : ''

  const seasonDistribution = db.prepare(`
    SELECT season, COUNT(*) as count
    FROM leads${leadsDateWhere}
    GROUP BY season
    ORDER BY count DESC
  `).all(...leadsDateParams) as { season: string; count: number }[]

  return {
    funnel,
    quizAnswerTimes: quizAgg.times,
    subquizAnswerTimes: subAgg.times,
    leadFormTime,
    photoUploadTime,
    dailyActivity,
    seasonDistribution,
    reminderOpenStats: getReminderOpenStats(dateFrom, dateTo),
  }
}

export default db
