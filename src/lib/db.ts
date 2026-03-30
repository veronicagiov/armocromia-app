import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATA_DIR = path.join(process.cwd(), 'data')
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

export default db
