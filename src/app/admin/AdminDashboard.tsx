'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Analysis {
  id: number
  customer_name: string
  customer_email: string
  season: string
  subgroup: string | null
  notes: string
  photos: string
  status: 'pending' | 'sent'
  created_at: string
}

const SUBGROUPS: Record<string, string[]> = {
  Primavera: ['Primavera Assoluta', 'Spring Light', 'Spring Warm', 'Spring Bright'],
  Estate: ['Estate Assoluta', 'Summer Light', 'Summer Soft', 'Summer Cool'],
  Autunno: ['Autunno Assoluto', 'Autumn Soft', 'Autumn Warm', 'Autumn Deep'],
  Inverno: ['Inverno Assoluto', 'Winter Cool', 'Winter Bright', 'Winter Deep'],
}

const SEASON_COLORS: Record<string, string> = {
  Primavera: '#E8895A',
  Estate: '#9B7FA6',
  Autunno: '#A0522D',
  Inverno: '#1A3A6E',
}

export default function AdminDashboard() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)
  const [sending, setSending] = useState<Record<number, boolean>>({})
  const [sent, setSent] = useState<Record<number, boolean>>({})
  const [subgroups, setSubgroups] = useState<Record<number, string>>({})
  const router = useRouter()

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/analyses')
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setAnalyses(data)
    const initial: Record<number, string> = {}
    for (const a of data) initial[a.id] = a.subgroup || a.season
    setSubgroups(initial)
  }, [router])

  useEffect(() => { load() }, [load])

  async function handleSubgroupChange(id: number, value: string) {
    setSubgroups(prev => ({ ...prev, [id]: value }))
    await fetch(`/api/admin/analyses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subgroup: value }),
    })
  }

  async function handleSend(id: number) {
    setSending(prev => ({ ...prev, [id]: true }))
    const res = await fetch(`/api/admin/analyses/${id}/send`, { method: 'POST' })
    if (res.ok) {
      setSent(prev => ({ ...prev, [id]: true }))
      setAnalyses(prev => prev.map(a => a.id === id ? { ...a, status: 'sent' } : a))
    } else {
      const err = await res.json()
      alert('Errore: ' + (err.error || 'Invio fallito'))
    }
    setSending(prev => ({ ...prev, [id]: false }))
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const pending = analyses.filter(a => a.status === 'pending').length
  const sentCount = analyses.filter(a => a.status === 'sent').length

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3F0', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: '#1a1614', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#c9a96e', fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase' }}>YouGlamour</span>
          <span style={{ color: '#555', fontSize: 12 }}>|</span>
          <span style={{ color: '#ccc', fontSize: 13 }}>Admin Panel</span>
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #333', color: '#999', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
          Esci
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Totale', value: analyses.length, color: '#555' },
            { label: 'In attesa', value: pending, color: '#D4845A' },
            { label: 'Inviate', value: sentCount, color: '#2A7A2A' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 12, padding: '16px 24px', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400, color: '#1a1614', marginBottom: 20 }}>
          Analisi ricevute
        </h1>

        {analyses.length === 0 && (
          <div style={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 12, padding: 48, textAlign: 'center', color: '#999' }}>
            Nessuna analisi ancora ricevuta.
          </div>
        )}

        {/* Cards */}
        {analyses.map(a => {
          const photos: string[] = JSON.parse(a.photos || '[]')
          const seasonKey = Object.keys(SEASON_COLORS).find(k => a.season.includes(k)) || 'Primavera'
          const accentColor = SEASON_COLORS[seasonKey] || '#c9a96e'
          const options = SUBGROUPS[seasonKey] || []
          const isExpanded = expanded === a.id
          const isSending = sending[a.id]
          const alreadySent = a.status === 'sent' || sent[a.id]

          return (
            <div key={a.id} style={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>
              {/* Top accent bar */}
              <div style={{ height: 4, background: accentColor }} />

              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
                  {/* Info cliente */}
                  <div style={{ flex: 2, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: 600, color: '#1a1614' }}>{a.customer_name}</span>
                      <span style={{
                        fontSize: 11, padding: '2px 10px', borderRadius: 100,
                        background: alreadySent ? '#E8F5E9' : '#FFF3E0',
                        color: alreadySent ? '#2E7D32' : '#E65100',
                        fontWeight: 500,
                      }}>
                        {alreadySent ? '✓ Inviata' : '● In attesa'}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#888', marginBottom: 2 }}>{a.customer_email}</div>
                    <div style={{ fontSize: 12, color: '#BBBBBB' }}>
                      {new Date(a.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {a.notes && (
                      <div style={{ marginTop: 8, fontSize: 12, color: '#888', background: '#FAFAF8', border: '1px solid #EEE', borderRadius: 8, padding: '8px 12px' }}>
                        <span style={{ color: '#BBB', fontWeight: 600 }}>Note: </span>{a.notes}
                      </div>
                    )}
                  </div>

                  {/* Stagione + Sottogruppo */}
                  <div style={{ flex: 2, minWidth: 200 }}>
                    <div style={{ fontSize: 11, color: '#BBBBBB', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Stagione dal quiz</div>
                    <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 100, background: accentColor + '22', color: accentColor, fontWeight: 600, fontSize: 13, marginBottom: 12 }}>
                      {a.season}
                    </div>
                    <div style={{ fontSize: 11, color: '#BBBBBB', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Sottogruppo</div>
                    <select
                      value={subgroups[a.id] || ''}
                      onChange={e => handleSubgroupChange(a.id, e.target.value)}
                      style={{ padding: '8px 12px', border: `1.5px solid ${accentColor}`, borderRadius: 8, fontSize: 13, color: '#1a1614', background: '#FAFAFA', cursor: 'pointer', width: '100%', maxWidth: 240 }}
                    >
                      {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Azioni */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', minWidth: 160 }}>
                    {photos.length > 0 && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : a.id)}
                        style={{ padding: '8px 16px', background: '#F5F3F0', border: '1px solid #E8E0D8', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#555' }}
                      >
                        {isExpanded ? '▲ Nascondi foto' : `📷 Foto (${photos.length})`}
                      </button>
                    )}
                    <button
                      onClick={() => handleSend(a.id)}
                      disabled={isSending || alreadySent}
                      style={{
                        padding: '10px 24px', borderRadius: 100, border: 'none', cursor: alreadySent ? 'default' : 'pointer',
                        background: alreadySent ? '#E8F5E9' : accentColor,
                        color: alreadySent ? '#2E7D32' : '#fff',
                        fontSize: 13, fontWeight: 600,
                        opacity: isSending ? 0.7 : 1,
                        minWidth: 130,
                      }}
                    >
                      {isSending ? 'Invio...' : alreadySent ? '✓ Inviata' : 'Invia PDF'}
                    </button>
                  </div>
                </div>

                {/* Foto espanse */}
                {isExpanded && photos.length > 0 && (
                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #F0EBE5' }}>
                    <div style={{ fontSize: 11, color: '#BBBBBB', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>Foto caricate</div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {photos.map((photo, i) => (
                        <a key={i} href={`/api/admin/photo?file=${encodeURIComponent(photo)}`} target="_blank" rel="noreferrer">
                          <img
                            src={`/api/admin/photo?file=${encodeURIComponent(photo)}`}
                            alt={`Foto ${i + 1}`}
                            style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 10, border: '2px solid #E8E0D8', cursor: 'pointer' }}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
