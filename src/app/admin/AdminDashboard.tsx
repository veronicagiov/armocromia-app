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

interface Lead {
  id: number
  name: string
  email: string
  season: string
  created_at: string
}

interface SubquizSubmission {
  id: number
  name: string
  email: string
  season: string
  subgroup_guess: string | null
  photos: string
  paid: number
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
  const [tab, setTab] = useState<'analyses' | 'subquiz' | 'leads'>('analyses')
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [subquizSubs, setSubquizSubs] = useState<SubquizSubmission[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)
  const [expandedSub, setExpandedSub] = useState<number | null>(null)
  const [sending, setSending] = useState<Record<number, boolean>>({})
  const [sent, setSent] = useState<Record<number, boolean>>({})
  const [subgroups, setSubgroups] = useState<Record<number, string>>({})
  const [selectedAnalyses, setSelectedAnalyses] = useState<Set<number>>(new Set())
  const [selectedSubquiz, setSelectedSubquiz] = useState<Set<number>>(new Set())
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/analyses')
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setAnalyses(data)
    const initial: Record<number, string> = {}
    for (const a of data) initial[a.id] = a.subgroup || a.season
    setSubgroups(initial)

    const leadsRes = await fetch('/api/admin/leads')
    if (leadsRes.ok) setLeads(await leadsRes.json())

    const subRes = await fetch('/api/admin/subquiz-submissions')
    if (subRes.ok) setSubquizSubs(await subRes.json())
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

  function toggleSelect(set: Set<number>, setFn: (s: Set<number>) => void, id: number) {
    const next = new Set(set)
    if (next.has(id)) next.delete(id); else next.add(id)
    setFn(next)
  }

  function toggleSelectAll(ids: number[], set: Set<number>, setFn: (s: Set<number>) => void) {
    if (ids.every(id => set.has(id))) setFn(new Set())
    else setFn(new Set(ids))
  }

  async function handleDeleteBulk(endpoint: string, ids: number[], setFn: (s: Set<number>) => void) {
    if (ids.length === 0) return
    if (!confirm(`Eliminare ${ids.length} elemento/i?`)) return
    setDeleting(true)
    await fetch(endpoint, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) })
    setFn(new Set())
    await load()
    setDeleting(false)
  }

  async function handleDeleteSingle(endpoint: string, id: number) {
    if (!confirm('Eliminare questo elemento?')) return
    setDeleting(true)
    await fetch(endpoint, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [id] }) })
    await load()
    setDeleting(false)
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
            { label: 'Analisi totali', value: analyses.length, color: '#555' },
            { label: 'In attesa', value: pending, color: '#D4845A' },
            { label: 'Inviate', value: sentCount, color: '#2A7A2A' },
            { label: 'Subquiz foto', value: subquizSubs.length, color: '#9B7FA6' },
            { label: 'Lead quiz', value: leads.length, color: '#1A3A6E' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 12, padding: '16px 24px', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid #E8E0D8' }}>
          {([
            { key: 'analyses', label: `Analisi ricevute (${analyses.length})` },
            { key: 'subquiz', label: `Subquiz foto (${subquizSubs.length})` },
            { key: 'leads', label: `Lead quiz (${leads.length})` },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '10px 24px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: 'none', borderBottom: tab === t.key ? '2px solid #c9a96e' : '2px solid transparent',
                color: tab === t.key ? '#1a1614' : '#999', marginBottom: -2,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB ANALISI ── */}
        {tab === 'analyses' && (
          <>
            {analyses.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666', cursor: 'pointer' }}>
                  <input type="checkbox" checked={analyses.length > 0 && analyses.every(a => selectedAnalyses.has(a.id))} onChange={() => toggleSelectAll(analyses.map(a => a.id), selectedAnalyses, setSelectedAnalyses)} style={{ accentColor: '#c9a96e', width: 16, height: 16 }} />
                  Seleziona tutti
                </label>
                {selectedAnalyses.size > 0 && (
                  <button onClick={() => handleDeleteBulk('/api/admin/analyses', [...selectedAnalyses], setSelectedAnalyses)} disabled={deleting} style={{ padding: '6px 16px', background: '#cc4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Elimina selezionati ({selectedAnalyses.size})
                  </button>
                )}
              </div>
            )}
            {analyses.length === 0 && (
              <div style={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 12, padding: 48, textAlign: 'center', color: '#999' }}>
                Nessuna analisi ancora ricevuta.
              </div>
            )}

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
                  <div style={{ height: 4, background: accentColor }} />

                  <div style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
                      {/* Checkbox */}
                      <input type="checkbox" checked={selectedAnalyses.has(a.id)} onChange={() => toggleSelect(selectedAnalyses, setSelectedAnalyses, a.id)} style={{ accentColor: '#c9a96e', width: 16, height: 16, marginTop: 4, cursor: 'pointer', flexShrink: 0 }} />
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
                        <button
                          onClick={() => handleDeleteSingle('/api/admin/analyses', a.id)}
                          disabled={deleting}
                          style={{ padding: '6px 14px', background: 'none', border: '1px solid #E8E0D8', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#cc4444' }}
                        >
                          Elimina
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
          </>
        )}

        {/* ── TAB SUBQUIZ ── */}
        {tab === 'subquiz' && (
          <>
            {subquizSubs.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666', cursor: 'pointer' }}>
                  <input type="checkbox" checked={subquizSubs.length > 0 && subquizSubs.every(s => selectedSubquiz.has(s.id))} onChange={() => toggleSelectAll(subquizSubs.map(s => s.id), selectedSubquiz, setSelectedSubquiz)} style={{ accentColor: '#c9a96e', width: 16, height: 16 }} />
                  Seleziona tutti
                </label>
                {selectedSubquiz.size > 0 && (
                  <button onClick={() => handleDeleteBulk('/api/admin/subquiz-submissions', [...selectedSubquiz], setSelectedSubquiz)} disabled={deleting} style={{ padding: '6px 16px', background: '#cc4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Elimina selezionati ({selectedSubquiz.size})
                  </button>
                )}
              </div>
            )}
            {subquizSubs.length === 0 && (
              <div style={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 12, padding: 48, textAlign: 'center', color: '#999' }}>
                Nessuna submission del subquiz ancora ricevuta.
              </div>
            )}

            {subquizSubs.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 12, overflow: 'hidden' }}>
                {/* Intestazione tabella */}
                <div style={{ display: 'grid', gridTemplateColumns: '30px 1.5fr 2fr 1fr 1.5fr 1fr 1fr 60px', gap: 12, padding: '12px 24px', background: '#F5F3F0', borderBottom: '1px solid #E8E0D8' }}>
                  <div></div>
                  {['Nome', 'Email', 'Stagione', 'Sottogruppo (quiz)', 'Foto', 'Data'].map(h => (
                    <div key={h} style={{ fontSize: 11, color: '#999', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>{h}</div>
                  ))}
                </div>

                {subquizSubs.map((s, i) => {
                  const photos: string[] = JSON.parse(s.photos || '[]')
                  const seasonKey = Object.keys(SEASON_COLORS).find(k => s.season.includes(k)) || 'Primavera'
                  const accentColor = SEASON_COLORS[seasonKey] || '#c9a96e'
                  const isExpSub = expandedSub === s.id

                  return (
                    <div key={s.id}>
                      <div
                        style={{
                          display: 'grid', gridTemplateColumns: '30px 1.5fr 2fr 1fr 1.5fr 1fr 1fr 60px', gap: 12,
                          padding: '14px 24px', borderBottom: i < subquizSubs.length - 1 ? '1px solid #F0EBE5' : 'none',
                          alignItems: 'center',
                        }}
                      >
                        <input type="checkbox" checked={selectedSubquiz.has(s.id)} onChange={() => toggleSelect(selectedSubquiz, setSelectedSubquiz, s.id)} style={{ accentColor: '#c9a96e', width: 16, height: 16, cursor: 'pointer' }} />
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1614' }}>{s.name}</div>
                        <div style={{ fontSize: 13, color: '#666' }}>{s.email}</div>
                        <div>
                          <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 100, background: accentColor + '22', color: accentColor, fontSize: 12, fontWeight: 600 }}>
                            {s.season}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#555' }}>{s.subgroup_guess || '—'}</div>
                        <div>
                          {photos.length > 0 ? (
                            <button
                              onClick={() => setExpandedSub(isExpSub ? null : s.id)}
                              style={{ padding: '4px 12px', background: '#F5F3F0', border: '1px solid #E8E0D8', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#555' }}
                            >
                              {isExpSub ? '▲' : `📷 ${photos.length}`}
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: '#ccc' }}>—</span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#BBB' }}>
                          {new Date(s.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <button onClick={() => handleDeleteSingle('/api/admin/subquiz-submissions', s.id)} disabled={deleting} style={{ padding: '4px 10px', background: 'none', border: '1px solid #E8E0D8', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#cc4444' }}>Elimina</button>
                      </div>

                      {isExpSub && photos.length > 0 && (
                        <div style={{ padding: '12px 24px 20px', borderBottom: '1px solid #F0EBE5' }}>
                          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {photos.map((photo, pi) => (
                              <a key={pi} href={`/api/admin/photo?file=${encodeURIComponent(photo)}`} target="_blank" rel="noreferrer">
                                <img
                                  src={`/api/admin/photo?file=${encodeURIComponent(photo)}`}
                                  alt={`Foto ${pi + 1}`}
                                  style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '2px solid #E8E0D8', cursor: 'pointer' }}
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── TAB LEAD ── */}
        {tab === 'leads' && (
          <>
            {leads.length === 0 && (
              <div style={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 12, padding: 48, textAlign: 'center', color: '#999' }}>
                Nessun lead ancora registrato.
              </div>
            )}

            {leads.length > 0 && (
              <>
              {(() => {
                const STORAGE_KEY = 'yg_last_export'
                const lastExportTs = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
                const lastExportDate = lastExportTs ? new Date(parseInt(lastExportTs)) : null
                const newLeads = lastExportDate
                  ? leads.filter(l => new Date(l.created_at) > lastExportDate)
                  : leads

                function downloadCsv(list: Lead[], filename: string) {
                  const rows = [['email', 'name'], ...list.map(l => [l.email, l.name])]
                  const csv = rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n')
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url; a.download = filename; a.click()
                  URL.revokeObjectURL(url)
                  localStorage.setItem(STORAGE_KEY, Date.now().toString())
                }

                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      {lastExportDate
                        ? <>Ultimo export: <strong style={{ color: '#555' }}>{lastExportDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong> · <strong style={{ color: newLeads.length > 0 ? '#c9a96e' : '#999' }}>{newLeads.length} nuovi</strong></>
                        : <span>Nessun export precedente</span>
                      }
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => downloadCsv(newLeads, `lead-nuovi-${new Date().toISOString().slice(0,10)}.csv`)}
                        disabled={newLeads.length === 0}
                        style={{
                          padding: '10px 20px', borderRadius: 8, border: '1.5px solid #c9a96e',
                          background: newLeads.length === 0 ? '#f5f3f0' : '#c9a96e',
                          color: newLeads.length === 0 ? '#bbb' : '#fff',
                          fontSize: 13, fontWeight: 600, cursor: newLeads.length === 0 ? 'default' : 'pointer',
                        }}
                      >
                        ↓ Nuovi dall'ultimo export ({newLeads.length})
                      </button>
                      <button
                        onClick={() => downloadCsv(leads, `lead-tutti-${new Date().toISOString().slice(0,10)}.csv`)}
                        style={{
                          padding: '10px 20px', borderRadius: 8, border: '1.5px solid #1a1614',
                          background: '#1a1614', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        ↓ Tutti ({leads.length})
                      </button>
                    </div>
                  </div>
                )
              })()}

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666', cursor: 'pointer' }}>
                  <input type="checkbox" checked={leads.length > 0 && leads.every(l => selectedLeads.has(l.id))} onChange={() => toggleSelectAll(leads.map(l => l.id), selectedLeads, setSelectedLeads)} style={{ accentColor: '#c9a96e', width: 16, height: 16 }} />
                  Seleziona tutti
                </label>
                {selectedLeads.size > 0 && (
                  <button onClick={() => handleDeleteBulk('/api/admin/leads', [...selectedLeads], setSelectedLeads)} disabled={deleting} style={{ padding: '6px 16px', background: '#cc4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Elimina selezionati ({selectedLeads.size})
                  </button>
                )}
              </div>

              <div style={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 12, overflow: 'hidden' }}>
                {/* Intestazione tabella */}
                <div style={{ display: 'grid', gridTemplateColumns: '30px 2fr 2fr 1.5fr 1.5fr 60px', gap: 16, padding: '12px 24px', background: '#F5F3F0', borderBottom: '1px solid #E8E0D8' }}>
                  <div></div>
                  {['Nome', 'Email', 'Stagione', 'Data'].map(h => (
                    <div key={h} style={{ fontSize: 11, color: '#999', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>{h}</div>
                  ))}
                  <div></div>
                </div>

                {leads.map((l, i) => {
                  const seasonKey = Object.keys(SEASON_COLORS).find(k => l.season.includes(k)) || 'Primavera'
                  const accentColor = SEASON_COLORS[seasonKey] || '#c9a96e'
                  return (
                    <div
                      key={l.id}
                      style={{
                        display: 'grid', gridTemplateColumns: '30px 2fr 2fr 1.5fr 1.5fr 60px', gap: 16,
                        padding: '14px 24px', borderBottom: i < leads.length - 1 ? '1px solid #F0EBE5' : 'none',
                        alignItems: 'center',
                      }}
                    >
                      <input type="checkbox" checked={selectedLeads.has(l.id)} onChange={() => toggleSelect(selectedLeads, setSelectedLeads, l.id)} style={{ accentColor: '#c9a96e', width: 16, height: 16, cursor: 'pointer' }} />
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1614' }}>{l.name}</div>
                      <div style={{ fontSize: 13, color: '#666' }}>{l.email}</div>
                      <div>
                        <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 100, background: accentColor + '22', color: accentColor, fontSize: 12, fontWeight: 600 }}>
                          {l.season}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#BBB' }}>
                        {new Date(l.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <button onClick={() => handleDeleteSingle('/api/admin/leads', l.id)} disabled={deleting} style={{ padding: '4px 10px', background: 'none', border: '1px solid #E8E0D8', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#cc4444' }}>Elimina</button>
                    </div>
                  )
                })}
              </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
