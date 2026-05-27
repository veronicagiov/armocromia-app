// Test runtime di generazione PDF — produce 4 PDF (uno per stagione)
// Usage: node scripts/test-pdf.mjs
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

// Usa ts-node/esm via tsx
const { generatePDF } = await import('../src/lib/pdf.tsx')

const photoPath = '/tmp/test-portrait.jpg'
const samples = [
  { customerName: 'Sofia Rossi', customerEmail: 'sofia@example.com', season: 'Autunno', subgroup: 'Autumn Deep', photoPath },
  { customerName: 'Giulia Bianchi', customerEmail: 'giulia@example.com', season: 'Primavera', subgroup: 'Spring Light', photoPath },
  { customerName: 'Martina Verdi', customerEmail: 'martina@example.com', season: 'Estate', subgroup: 'Summer Soft', photoPath },
  { customerName: 'Elena Neri', customerEmail: 'elena@example.com', season: 'Inverno', subgroup: 'Winter Bright', photoPath },
]

const outDir = path.join(process.cwd(), 'tmp-pdfs')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir)

for (const s of samples) {
  console.log(`Generating ${s.season} / ${s.subgroup}...`)
  const buf = await generatePDF(s)
  const file = path.join(outDir, `test-${s.subgroup.replace(/\s+/g, '-')}.pdf`)
  fs.writeFileSync(file, buf)
  console.log(`  → ${file} (${Math.round(buf.length / 1024)} KB)`)
}
console.log('Done.')
