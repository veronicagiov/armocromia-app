import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATA_DIR = process.env.STORAGE_PATH || (fs.existsSync('/storage') ? '/storage' : path.join(process.cwd(), 'data'))
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
    data.season, // subgroup iniziale = stagione principale
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

export interface SubquizSubmission {
  id: number
  name: string
  email: string
  season: string
  subgroup_guess: string | null
  photos: string
  paid: number
  created_at: string
}

export function insertSubquizSubmission(data: {
  name: string
  email: string
  season: string
  subgroup_guess: string
  photos: string[]
}): number {
  const result = db.prepare(`
    INSERT INTO subquiz_submissions (name, email, season, subgroup_guess, photos)
    VALUES (?, ?, ?, ?, ?)
  `).run(data.name, data.email, data.season, data.subgroup_guess, JSON.stringify(data.photos))
  return result.lastInsertRowid as number
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

export interface Lead {
  id: number
  name: string
  email: string
  season: string
  created_at: string
}

export function insertLead(data: { name: string; email: string; season: string }): void {
  db.prepare(`
    INSERT OR IGNORE INTO leads (name, email, season)
    VALUES (?, ?, ?)
  `).run(data.name, data.email, data.season)
}

export function getAllLeads(): Lead[] {
  return db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all() as Lead[]
}

export default db
