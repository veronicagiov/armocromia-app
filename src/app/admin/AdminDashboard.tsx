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
  pdf_path: string | null
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

interface AnalyticsData {
  funnel: Record<string, number>
  quizAnswerTimes: { question: number; avg_ms: number; count: number }[]
  subquizAnswerTimes: { question: number; avg_ms: number; count: number }[]
  leadFormTime: { avg_ms: number; count: number } | null
  photoUploadTime: { avg_ms: number; count: number } | null
  dailyActivity: { date: string; leads: number; subquiz: number; payments: number }[]
  seasonDistribution: { season: string; count: number }[]
}

const SEASON_COLORS: Record<string, string> = {
  Primavera: '#E8895A',
  Estate: '#9B7FA6',
  Autunno: '#A0522D',
  Inverno: '#1A3A6E',
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<'analyses' | 'subquiz' | 'leads' | 'analytics'>('analyses')
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [subquizSubs, setSubquizSubs] = useState<SubquizSubmission[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)
  const [expandedSub, setExpandedSub] = useState<number | null>(null)
  const [sending, setSending] = useState<Record<number, boolean>>({})
  const [sent, setSent] = useState<Record<number, boolean>>({})
  const [generating, setGenerating] = useState<Record<number, boolean>>({})
  const [subgroups, setSubgroups] = useState<Record<number, string>>({})
  const [selectedAnalyses, setSelectedAnalyses] = useState<Set<number>>(new Set())
  const [selectedSubquiz, setSelectedSubquiz] = useState<Set<number>>(new Set())
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
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

    try {
      const analyticsRes = await fetch('/api/admin/analytics')
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json())
    } catch (e) { console.error('analytics fetch error:', e) }
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
      let msg = 'Invio fallito'
      try { const err = await res.json(); msg = err.error || msg } catch {}
      alert('Errore: ' + msg)
    }
    setSending(prev => ({ ...prev, [id]: false }))
  }

  async function handleGeneratePdf(id: number) {
    setGenerating(prev => ({ ...prev, [id]: true }))
    const res = await fetch(`/api/admin/analyses/${id}/generate-pdf`, { method: 'POST' })
    if (res.ok) {
      setAnalyses(prev => prev.map(a => a.id === id ? { ...a, pdf_path: 'generated' } : a))
      window.open(`/api/admin/analyses/${id}/pdf`, '_blank')
    } else {
      const err = await res.json()
      alert('Errore: ' + (err.error || 'Generazione fallita'))
    }
    setGenerating(prev => ({ ...prev, [id]: false }))
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
            { key: 'analyses' as const, label: `Analisi ricevute (${analyses.length})` },
            { key: 'subquiz' as const, label: `Subquiz foto (${subquizSubs.length})` },
            { key: 'leads' as const, label: `Lead quiz (${leads.length})` },
            { key: 'analytics' as const, label: `Analytics` },
          ]).map(t => (
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
                        {!alreadySent && (
                          <button
                            onClick={() => handleGeneratePdf(a.id)}
                            disabled={generating[a.id]}
                            style={{
                              padding: '10px 24px', borderRadius: 100, cursor: 'pointer',
                              background: a.pdf_path ? '#F5F3F0' : accentColor,
                              color: a.pdf_path ? accentColor : '#fff',
                              border: a.pdf_path ? `1.5px solid ${accentColor}` : 'none',
                              fontSize: 13, fontWeight: 600,
                              opacity: generating[a.id] ? 0.7 : 1,
                              minWidth: 160,
                            }}
                          >
                            {generating[a.id] ? 'Generazione...' : a.pdf_path ? '👁 Rivedi PDF' : 'Genera PDF'}
                          </button>
                        )}
                        {a.pdf_path && !alreadySent && (
                          <button
                            onClick={() => handleSend(a.id)}
                            disabled={isSending}
                            style={{
                              padding: '10px 24px', borderRadius: 100, border: 'none', cursor: 'pointer',
                              background: accentColor, color: '#fff',
                              fontSize: 13, fontWeight: 600,
                              opacity: isSending ? 0.7 : 1,
                              minWidth: 160,
                            }}
                          >
                            {isSending ? 'Invio...' : 'Invia PDF'}
                          </button>
                        )}
                        {alreadySent && (
                          <div style={{
                            padding: '10px 24px', borderRadius: 100,
                            background: '#E8F5E9', color: '#2E7D32',
                            fontSize: 13, fontWeight: 600, minWidth: 130, textAlign: 'center',
                          }}>
                            ✓ Inviata
                          </div>
                        )}
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

        {/* ── TAB ANALYTICS ── */}
        {tab === 'analytics' && (
          <AnalyticsTab initialAnalytics={analytics} />
        )}
      </div>
    </div>
  )
}

// ── QUIZ QUESTION LABELS ────────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  'Sottotono pelle', 'Colore occhi', 'Colore capelli',
  'Preferenza rossetto', 'Reazione al sole', 'Palette attrattiva',
]
const SUBQUIZ_QUESTIONS = [
  'Conferma stagione', 'Livello contrasto', 'Saturazione colori',
  'Chiarezza/scurezza', 'Preferenza accessori',
]

const FUNNEL_STEPS: { event: string; label: string }[] = [
  { event: 'quiz_start', label: 'Quiz iniziato' },
  { event: 'lead_submit', label: 'Email inserita' },
  { event: 'quiz_complete', label: 'Risultato stagione visto' },
  { event: 'subquiz_start', label: 'Subquiz iniziato' },
  { event: 'photo_view', label: 'Pagina foto vista' },
  { event: 'photo_confirm', label: 'Foto caricate' },
  { event: 'payment_view', label: 'Banner prezzo analisi' },
  { event: 'payment_click', label: 'Click paga' },
  { event: 'payment_success', label: 'Pagamento completato' },
]

type Preset = 'today' | 'yesterday' | 'last_week' | 'current_month' | 'last_month' | 'last_30d' | 'last_60d' | 'last_90d'

function AnalyticsTab({ initialAnalytics }: { initialAnalytics: AnalyticsData | null }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(initialAnalytics)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [trendPeriod, setTrendPeriod] = useState<'30d' | '3m' | '6m' | '12m'>('30d')
  const [trendData, setTrendData] = useState(initialAnalytics?.dailyActivity || [])
  const [trendLoading, setTrendLoading] = useState(false)
  const [activePreset, setActivePreset] = useState<Preset | null>(null)

  // Aggiorna quando initialAnalytics cambia
  useEffect(() => {
    setAnalytics(initialAnalytics)
    setTrendData(initialAnalytics?.dailyActivity || [])
  }, [initialAnalytics])

  async function loadTrend(period: '30d' | '3m' | '6m' | '12m') {
    setTrendPeriod(period)
    setTrendLoading(true)
    try {
      const now = new Date()
      const from = new Date()
      if (period === '30d') from.setDate(now.getDate() - 30)
      else if (period === '3m') from.setMonth(now.getMonth() - 3)
      else if (period === '6m') from.setMonth(now.getMonth() - 6)
      else from.setFullYear(now.getFullYear() - 1)
      const params = new URLSearchParams()
      params.set('from', from.toISOString().slice(0, 10))
      params.set('to', now.toISOString().slice(0, 10))
      const res = await fetch(`/api/admin/analytics?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTrendData(data.dailyActivity || [])
      }
    } catch (e) { console.error('trend load error:', e) }
    setTrendLoading(false)
  }

  async function applyFilter(override?: { from?: string; to?: string }) {
    const from = override?.from ?? dateFrom
    const to = override?.to ?? dateTo
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      const res = await fetch(`/api/admin/analytics?${params}`)
      if (res.ok) setAnalytics(await res.json())
    } catch (e) { console.error('analytics filter error:', e) }
    setLoading(false)
  }

  function resetFilter() {
    setDateFrom('')
    setDateTo('')
    setActivePreset(null)
    setAnalytics(initialAnalytics)
  }

  // Preset di periodo rapido
  function fmtDate(d: Date) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  function computePreset(p: Preset): { from: string; to: string } {
    const today = new Date()
    const clone = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
    switch (p) {
      case 'today':
        return { from: fmtDate(today), to: fmtDate(today) }
      case 'yesterday': {
        const y = clone(today); y.setDate(today.getDate() - 1)
        return { from: fmtDate(y), to: fmtDate(y) }
      }
      case 'last_week': {
        // Settimana precedente completa (lun-dom)
        const dayOfWeek = today.getDay() // 0 = domenica
        const monThis = clone(today); monThis.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
        const monLast = clone(monThis); monLast.setDate(monThis.getDate() - 7)
        const sunLast = clone(monLast); sunLast.setDate(monLast.getDate() + 6)
        return { from: fmtDate(monLast), to: fmtDate(sunLast) }
      }
      case 'current_month': {
        const first = new Date(today.getFullYear(), today.getMonth(), 1)
        return { from: fmtDate(first), to: fmtDate(today) }
      }
      case 'last_month': {
        const first = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const last = new Date(today.getFullYear(), today.getMonth(), 0)
        return { from: fmtDate(first), to: fmtDate(last) }
      }
      case 'last_30d': {
        const from = clone(today); from.setDate(today.getDate() - 29)
        return { from: fmtDate(from), to: fmtDate(today) }
      }
      case 'last_60d': {
        const from = clone(today); from.setDate(today.getDate() - 59)
        return { from: fmtDate(from), to: fmtDate(today) }
      }
      case 'last_90d': {
        const from = clone(today); from.setDate(today.getDate() - 89)
        return { from: fmtDate(from), to: fmtDate(today) }
      }
    }
  }

  function applyPreset(p: Preset) {
    const { from, to } = computePreset(p)
    setDateFrom(from)
    setDateTo(to)
    setActivePreset(p)
    applyFilter({ from, to })
  }

  const hasFilter = dateFrom || dateTo

  if (!analytics) {
    return (
      <div style={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 12, padding: 48, textAlign: 'center', color: '#999' }}>
        Caricamento dati analytics...
      </div>
    )
  }

  const { funnel, quizAnswerTimes, subquizAnswerTimes, leadFormTime, photoUploadTime, dailyActivity, seasonDistribution } = analytics

  const funnelMax = Math.max(...FUNNEL_STEPS.map(s => funnel[s.event] || 0), 1)
  const hasData = funnelMax > 0 && Object.keys(funnel).length > 0

  const PRESET_BUTTONS: { id: Preset; label: string }[] = [
    { id: 'today', label: 'Oggi' },
    { id: 'yesterday', label: 'Ieri' },
    { id: 'last_week', label: 'Ultima settimana' },
    { id: 'current_month', label: 'Mese corrente' },
    { id: 'last_month', label: 'Mese precedente' },
    { id: 'last_30d', label: 'Ultimi 30 giorni' },
    { id: 'last_60d', label: 'Ultimi 60 giorni' },
    { id: 'last_90d', label: 'Ultimi 90 giorni' },
  ]

  const dateFilterBar = (
    <div style={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 12, padding: '16px 24px', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#999', letterSpacing: 1.5, textTransform: 'uppercase', marginRight: 4 }}>Periodo</span>
        {PRESET_BUTTONS.map(p => {
          const active = activePreset === p.id
          return (
            <button key={p.id} onClick={() => applyPreset(p.id)} disabled={loading}
              style={{
                padding: '6px 12px',
                background: active ? '#1a1614' : '#faf7f2',
                color: active ? '#fff' : '#1a1614',
                border: active ? '1.5px solid #1a1614' : '1.5px solid #E8E0D8',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: 'DM Sans, sans-serif',
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all .15s',
              }}>
              {p.label}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setActivePreset(null) }}
          style={{ padding: '8px 12px', border: '1.5px solid #E8E0D8', borderRadius: 8, fontSize: 13, fontFamily: 'DM Sans, sans-serif', color: '#1a1614', background: '#faf7f2' }}
        />
        <span style={{ color: '#999', fontSize: 13 }}>—</span>
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setActivePreset(null) }}
          style={{ padding: '8px 12px', border: '1.5px solid #E8E0D8', borderRadius: 8, fontSize: 13, fontFamily: 'DM Sans, sans-serif', color: '#1a1614', background: '#faf7f2' }}
        />
        <button onClick={() => applyFilter()} disabled={loading}
          style={{ padding: '8px 20px', background: '#1a1614', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
          {loading ? 'Carico...' : 'Filtra'}
        </button>
        {hasFilter && (
          <button onClick={resetFilter}
            style={{ padding: '8px 16px', background: 'none', border: '1.5px solid #E8E0D8', borderRadius: 8, fontSize: 12, color: '#999', cursor: 'pointer' }}>
            Resetta
          </button>
        )}
        {hasFilter && (
          <span style={{ fontSize: 12, color: '#c9a96e', fontWeight: 500 }}>
            {dateFrom && dateTo ? `${dateFrom} — ${dateTo}` : dateFrom ? `Dal ${dateFrom}` : `Fino al ${dateTo}`}
          </span>
        )}
      </div>
    </div>
  )

  if (!hasData) {
    return (
      <>
        {dateFilterBar}
        <div style={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 12, padding: 48, textAlign: 'center', color: '#999' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#555', marginBottom: 8 }}>{hasFilter ? 'Nessun dato nel periodo selezionato' : 'Nessun dato analytics ancora disponibile'}</div>
          <div style={{ fontSize: 14 }}>{hasFilter ? 'Prova a cambiare le date del filtro.' : 'I dati compariranno man mano che gli utenti utilizzano il quiz.'}</div>
        </div>
      </>
    )
  }

  const allTimes = [...quizAnswerTimes, ...subquizAnswerTimes]
  const maxTime = Math.max(...allTimes.map(t => t.avg_ms), photoUploadTime?.avg_ms || 0, leadFormTime?.avg_ms || 0, 1)

  const totalSeasons = seasonDistribution.reduce((s, r) => s + r.count, 0) || 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {dateFilterBar}

      {/* ── FUNNEL ── */}
      <div style={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 12, padding: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#999', fontWeight: 600, marginBottom: 20 }}>Funnel di conversione</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FUNNEL_STEPS.map((step, i) => {
            const val = funnel[step.event] || 0
            const pct = funnelMax > 0 ? (val / funnelMax) * 100 : 0
            const prevVal = i > 0 ? (funnel[FUNNEL_STEPS[i - 1].event] || 0) : val
            const dropPct = prevVal > 0 ? Math.round(((prevVal - val) / prevVal) * 100) : 0
            return (
              <div key={step.event} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 140, fontSize: 12, color: '#666', textAlign: 'right', flexShrink: 0 }}>{step.label}</div>
                <div style={{ flex: 1, height: 28, background: '#F5F3F0', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    height: '100%', borderRadius: 6,
                    width: `${Math.max(pct, 1)}%`,
                    background: `linear-gradient(90deg, #c9a96e, #e8a87c)`,
                    transition: 'width .5s ease',
                  }} />
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 600, color: pct > 15 ? '#fff' : '#555' }}>
                    {val}
                  </span>
                </div>
                <div style={{ width: 60, fontSize: 11, color: dropPct > 30 ? '#cc4444' : dropPct > 15 ? '#D4845A' : '#2A7A2A', fontWeight: 600, flexShrink: 0 }}>
                  {i > 0 && val < prevVal ? `−${dropPct}%` : ''}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── ROW: TEMPO + STAGIONI ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

        {/* Tempo medio per domanda */}
        <div style={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 12, padding: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#999', fontWeight: 600, marginBottom: 20 }}>Tempo medio per domanda (esitazione)</div>
          {quizAnswerTimes.length === 0 && subquizAnswerTimes.length === 0 ? (
            <div style={{ color: '#ccc', fontSize: 13, padding: 20, textAlign: 'center' }}>Nessun dato disponibile</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {quizAnswerTimes.map(t => {
                const secs = (t.avg_ms / 1000).toFixed(1)
                const pct = (t.avg_ms / maxTime) * 100
                const isHigh = t.avg_ms > 8000
                return (
                  <div key={`q${t.question}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 120, fontSize: 11, color: '#888', textAlign: 'right', flexShrink: 0 }}>
                      Q{t.question} {QUIZ_QUESTIONS[t.question - 1] || ''}
                    </div>
                    <div style={{ flex: 1, height: 22, background: '#F5F3F0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 4,
                        width: `${Math.max(pct, 2)}%`,
                        background: isHigh ? '#cc4444' : '#c9a96e',
                      }} />
                    </div>
                    <div style={{ width: 60, fontSize: 12, fontWeight: 600, color: isHigh ? '#cc4444' : '#555', flexShrink: 0 }}>
                      {secs}s
                    </div>
                  </div>
                )
              })}
              {leadFormTime && (
                <>
                  <div style={{ borderTop: '1px solid #F0EBE5', margin: '4px 0', paddingTop: 8 }}>
                    <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#BBB', marginBottom: 6 }}>Inserimento email</div>
                  </div>
                  {(() => {
                    const secs = (leadFormTime.avg_ms / 1000)
                    const pct = (leadFormTime.avg_ms / maxTime) * 100
                    const isHigh = leadFormTime.avg_ms > 20000
                    const display = secs < 60 ? `${secs.toFixed(1)}s` : `${Math.floor(secs / 60)}m ${Math.round(secs % 60)}s`
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 120, fontSize: 11, color: '#888', textAlign: 'right', flexShrink: 0 }}>
                          ✉️ Inserisci email
                        </div>
                        <div style={{ flex: 1, height: 22, background: '#F5F3F0', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 4,
                            width: `${Math.max(pct, 2)}%`,
                            background: isHigh ? '#cc4444' : '#c9a96e',
                          }} />
                        </div>
                        <div style={{ width: 60, fontSize: 12, fontWeight: 600, color: isHigh ? '#cc4444' : '#555', flexShrink: 0 }}>
                          {display}
                        </div>
                      </div>
                    )
                  })()}
                  <div style={{ fontSize: 10, color: '#BBB', marginTop: 2, paddingLeft: 130 }}>
                    tempo medio tra "form email visto" e "email inviata" · {leadFormTime.count} session{leadFormTime.count === 1 ? 'e' : 'i'}
                  </div>
                </>
              )}
              {subquizAnswerTimes.length > 0 && (
                <div style={{ borderTop: '1px solid #F0EBE5', margin: '4px 0', paddingTop: 8 }}>
                  <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#BBB', marginBottom: 6 }}>Subquiz</div>
                </div>
              )}
              {subquizAnswerTimes.map(t => {
                const secs = (t.avg_ms / 1000).toFixed(1)
                const pct = (t.avg_ms / maxTime) * 100
                const isHigh = t.avg_ms > 8000
                return (
                  <div key={`sq${t.question}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 120, fontSize: 11, color: '#888', textAlign: 'right', flexShrink: 0 }}>
                      SQ{t.question} {SUBQUIZ_QUESTIONS[t.question - 1] || ''}
                    </div>
                    <div style={{ flex: 1, height: 22, background: '#F5F3F0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 4,
                        width: `${Math.max(pct, 2)}%`,
                        background: isHigh ? '#cc4444' : '#9B7FA6',
                      }} />
                    </div>
                    <div style={{ width: 60, fontSize: 12, fontWeight: 600, color: isHigh ? '#cc4444' : '#555', flexShrink: 0 }}>
                      {secs}s
                    </div>
                  </div>
                )
              })}
              {photoUploadTime && (
                <>
                  <div style={{ borderTop: '1px solid #F0EBE5', margin: '4px 0', paddingTop: 8 }}>
                    <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#BBB', marginBottom: 6 }}>Upload foto</div>
                  </div>
                  {(() => {
                    const secs = (photoUploadTime.avg_ms / 1000)
                    const pct = (photoUploadTime.avg_ms / maxTime) * 100
                    const isHigh = photoUploadTime.avg_ms > 30000
                    const display = secs < 60 ? `${secs.toFixed(1)}s` : `${Math.floor(secs / 60)}m ${Math.round(secs % 60)}s`
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 120, fontSize: 11, color: '#888', textAlign: 'right', flexShrink: 0 }}>
                          📸 Carica foto
                        </div>
                        <div style={{ flex: 1, height: 22, background: '#F5F3F0', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 4,
                            width: `${Math.max(pct, 2)}%`,
                            background: isHigh ? '#cc4444' : '#E8895A',
                          }} />
                        </div>
                        <div style={{ width: 60, fontSize: 12, fontWeight: 600, color: isHigh ? '#cc4444' : '#555', flexShrink: 0 }}>
                          {display}
                        </div>
                      </div>
                    )
                  })()}
                  <div style={{ fontSize: 10, color: '#BBB', marginTop: 2, paddingLeft: 130 }}>
                    tempo medio tra "pagina foto vista" e "foto caricate" · {photoUploadTime.count} session{photoUploadTime.count === 1 ? 'e' : 'i'}
                  </div>
                </>
              )}
            </div>
          )}
          <div style={{ fontSize: 11, color: '#BBB', marginTop: 12 }}>Le barre rosse indicano esitazione ({'>'}8s sulle domande, {'>'}20s sull'inserimento email, {'>'}30s sull'upload foto)</div>
        </div>

        {/* Distribuzione stagioni (donut) */}
        <div style={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 12, padding: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#999', fontWeight: 600, marginBottom: 20 }}>Distribuzione stagioni</div>
          {seasonDistribution.length === 0 ? (
            <div style={{ color: '#ccc', fontSize: 13, padding: 20, textAlign: 'center' }}>Nessun dato</div>
          ) : (
            <>
              <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 20px' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  {(() => {
                    let offset = 0
                    return seasonDistribution.map((s) => {
                      const pct = (s.count / totalSeasons) * 100
                      const color = SEASON_COLORS[s.season] || '#ccc'
                      const el = (
                        <circle
                          key={s.season}
                          cx="18" cy="18" r="15.9"
                          fill="none"
                          stroke={color}
                          strokeWidth="3.5"
                          strokeDasharray={`${pct} ${100 - pct}`}
                          strokeDashoffset={`${-offset}`}
                        />
                      )
                      offset += pct
                      return el
                    })
                  })()}
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1614' }}>{totalSeasons}</div>
                  <div style={{ fontSize: 10, color: '#999' }}>lead totali</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {seasonDistribution.map(s => {
                  const color = SEASON_COLORS[s.season] || '#ccc'
                  return (
                    <div key={s.season} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: 13, color: '#555' }}>{s.season}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1614' }}>{s.count}</div>
                      <div style={{ fontSize: 11, color: '#999', width: 40, textAlign: 'right' }}>{Math.round((s.count / totalSeasons) * 100)}%</div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── TREND GIORNALIERO ── */}
      <div style={{ background: '#fff', border: '1px solid #E8E0D8', borderRadius: 12, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#999', fontWeight: 600 }}>Attività nel tempo</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {([
              { key: '30d', label: '30gg' },
              { key: '3m', label: '3 mesi' },
              { key: '6m', label: '6 mesi' },
              { key: '12m', label: '12 mesi' },
            ] as { key: '30d' | '3m' | '6m' | '12m'; label: string }[]).map(p => (
              <button key={p.key} onClick={() => loadTrend(p.key)}
                style={{
                  padding: '6px 14px', border: trendPeriod === p.key ? '1.5px solid #c9a96e' : '1.5px solid #E8E0D8',
                  borderRadius: 8, fontSize: 12, fontWeight: trendPeriod === p.key ? 600 : 400,
                  background: trendPeriod === p.key ? '#faf5ed' : '#fff',
                  color: trendPeriod === p.key ? '#c9a96e' : '#999', cursor: 'pointer',
                }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {trendLoading ? (
          <div style={{ color: '#ccc', fontSize: 13, padding: 40, textAlign: 'center' }}>Caricamento...</div>
        ) : trendData.length === 0 ? (
          <div style={{ color: '#ccc', fontSize: 13, padding: 20, textAlign: 'center' }}>Nessun dato disponibile</div>
        ) : (() => {
          const CHART_W = 700, CHART_H = 180, PAD_L = 36, PAD_R = 12, PAD_T = 16, PAD_B = 32
          const w = CHART_W - PAD_L - PAD_R
          const h = CHART_H - PAD_T - PAD_B
          const maxVal = Math.max(...trendData.map(d => Math.max(d.leads, d.subquiz, d.payments)), 1)
          const n = trendData.length

          function makePath(key: 'leads' | 'subquiz' | 'payments') {
            return trendData.map((d, i) => {
              const x = PAD_L + (n > 1 ? (i / (n - 1)) * w : w / 2)
              const y = PAD_T + h - (d[key] / maxVal) * h
              return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
            }).join(' ')
          }

          function makeArea(key: 'leads' | 'subquiz' | 'payments') {
            const baseline = PAD_T + h
            const pts = trendData.map((d, i) => {
              const x = PAD_L + (n > 1 ? (i / (n - 1)) * w : w / 2)
              const y = PAD_T + h - (d[key] / maxVal) * h
              return `${x.toFixed(1)},${y.toFixed(1)}`
            })
            const firstX = PAD_L + (n > 1 ? 0 : w / 2)
            const lastX = PAD_L + (n > 1 ? w : w / 2)
            return `M${firstX.toFixed(1)},${baseline} L${pts.join(' L')} L${lastX.toFixed(1)},${baseline} Z`
          }

          // Y axis labels (5 steps)
          const ySteps = 4
          const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => Math.round((maxVal / ySteps) * i))

          // X axis labels (max ~8 labels)
          const labelEvery = Math.max(1, Math.floor(n / 8))
          const xLabels = trendData.filter((_, i) => i % labelEvery === 0 || i === n - 1)

          const series: { key: 'leads' | 'subquiz' | 'payments'; label: string; color: string }[] = [
            { key: 'leads', label: 'Lead', color: '#c9a96e' },
            { key: 'subquiz', label: 'Subquiz', color: '#9B7FA6' },
            { key: 'payments', label: 'Pagamenti', color: '#2A7A2A' },
          ]

          return (
            <>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                {series.map(s => (
                  <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#666' }}>
                    <div style={{ width: 16, height: 3, borderRadius: 2, background: s.color }} />
                    {s.label}
                  </div>
                ))}
              </div>
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} style={{ width: '100%', height: 'auto', minWidth: 400 }}>
                  {/* Grid lines */}
                  {yLabels.map((val, i) => {
                    const y = PAD_T + h - (val / maxVal) * h
                    return (
                      <g key={i}>
                        <line x1={PAD_L} y1={y} x2={CHART_W - PAD_R} y2={y} stroke="#F0EDE8" strokeWidth={1} />
                        <text x={PAD_L - 6} y={y + 3} textAnchor="end" fontSize={9} fill="#BBB">{val}</text>
                      </g>
                    )
                  })}
                  {/* Area fills */}
                  {series.map(s => (
                    <path key={`area-${s.key}`} d={makeArea(s.key)} fill={s.color} opacity={0.08} />
                  ))}
                  {/* Lines */}
                  {series.map(s => (
                    <path key={`line-${s.key}`} d={makePath(s.key)} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  ))}
                  {/* Dots */}
                  {n <= 60 && series.map(s =>
                    trendData.map((d, i) => {
                      const x = PAD_L + (n > 1 ? (i / (n - 1)) * w : w / 2)
                      const y = PAD_T + h - (d[s.key] / maxVal) * h
                      return d[s.key] > 0 ? <circle key={`dot-${s.key}-${i}`} cx={x} cy={y} r={2.5} fill={s.color} /> : null
                    })
                  )}
                  {/* X axis labels */}
                  {xLabels.map(d => {
                    const i = trendData.indexOf(d)
                    const x = PAD_L + (n > 1 ? (i / (n - 1)) * w : w / 2)
                    const label = new Date(d.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
                    return <text key={d.date} x={x} y={CHART_H - 4} textAnchor="middle" fontSize={9} fill="#BBB">{label}</text>
                  })}
                  {/* Hover areas with tooltips */}
                  {trendData.map((d, i) => {
                    const x = PAD_L + (n > 1 ? (i / (n - 1)) * w : w / 2)
                    const sliceW = n > 1 ? w / (n - 1) : w
                    const dateLabel = new Date(d.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
                    return (
                      <rect key={`hover-${i}`} x={x - sliceW / 2} y={PAD_T} width={sliceW} height={h} fill="transparent" cursor="crosshair">
                        <title>{`${dateLabel}: ${d.leads} lead, ${d.subquiz} subquiz, ${d.payments} pagamenti`}</title>
                      </rect>
                    )
                  })}
                </svg>
              </div>
            </>
          )
        })()}
      </div>
    </div>
  )
}
