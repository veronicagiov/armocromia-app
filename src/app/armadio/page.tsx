'use client'

import { useState, useEffect } from 'react'

// ── Palette per stagione (colori principali) ──
const SEASON_PALETTES: Record<string, string[]> = {
  Primavera: [
    '#FF6B47','#FFAE94','#FA8072','#E2725B','#C19A6B','#FFF0C8',
    '#90EE90','#40E0D0','#FFD700','#FFDAB9','#8DB600','#FF8C00',
    '#40C8B0','#F0C060','#F88070',
  ],
  Estate: [
    '#F4C2C2','#D8A8D8','#C8C8E8','#CCCCCC','#A8CCDC','#B8D8E8',
    '#AABAA0','#F0F0F8','#C8A0C8','#C08888','#E8E0D8','#A0C8D0',
    '#D0A8D0','#E0C8D8','#B0C0D8',
  ],
  Autunno: [
    '#A0522D','#C89040','#507840','#8B4513','#804030','#D0A050',
    '#DAA520','#556B2F','#8B6914','#CD853F','#6B3A2A','#C87830',
    '#7A6840','#B87333','#6B4226',
  ],
  Inverno: [
    '#2040A0','#CC1020','#F0F0F8','#101018','#8030A0','#0058B0',
    '#E00050','#006040','#FFD700','#4B0082','#00CED1','#FF1493',
    '#000080','#DC143C','#228B22',
  ],
}

const CATEGORIES = [
  { value: 'top', label: 'Top', icon: '👚' },
  { value: 'bottom', label: 'Bottom', icon: '👖' },
  { value: 'dress', label: 'Abiti', icon: '👗' },
  { value: 'outer', label: 'Capospalla', icon: '🧥' },
  { value: 'shoes', label: 'Scarpe', icon: '👠' },
  { value: 'bags', label: 'Borse', icon: '👜' },
  { value: 'accessories', label: 'Accessori', icon: '💍' },
]

const FREQUENCY_OPTIONS = [
  { value: 'often', label: 'Lo metto spesso', color: '#4CAF50' },
  { value: 'sometimes', label: 'Ogni tanto', color: '#FF9800' },
  { value: 'never', label: 'Non me lo ricordo neanche', color: '#F44336' },
]

const SEASON_COLORS: Record<string, { accent: string; light: string }> = {
  Primavera: { accent: '#D4845A', light: '#FFF5EE' },
  Estate: { accent: '#9B7FA6', light: '#F8F0FF' },
  Autunno: { accent: '#A0522D', light: '#FDF5ED' },
  Inverno: { accent: '#1A3A6E', light: '#F0F4FA' },
}

interface WardrobeItem {
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

// Calcola la distanza tra due colori hex
function colorDistance(hex1: string, hex2: string): number {
  const r1 = parseInt(hex1.slice(1, 3), 16)
  const g1 = parseInt(hex1.slice(3, 5), 16)
  const b1 = parseInt(hex1.slice(5, 7), 16)
  const r2 = parseInt(hex2.slice(1, 3), 16)
  const g2 = parseInt(hex2.slice(3, 5), 16)
  const b2 = parseInt(hex2.slice(5, 7), 16)
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

function isInPalette(hex: string, season: string): boolean {
  const palette = SEASON_PALETTES[season]
  if (!palette) return false
  // Soglia di tolleranza: 80 su scala 0-441
  return palette.some(p => colorDistance(hex, p) < 80)
}

type View = 'armadio' | 'add' | 'declutter'

export default function ArmadioPage() {
  const [view, setView] = useState<View>('armadio')
  const [season, setSeason] = useState<string>('')
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Form state
  const [formCategory, setFormCategory] = useState('top')
  const [formColor, setFormColor] = useState('')
  const [formColorName, setFormColorName] = useState('')
  const [formInPalette, setFormInPalette] = useState(false)
  const [formClosestColor, setFormClosestColor] = useState('')
  const [formFrequency, setFormFrequency] = useState('sometimes')
  const [formNote, setFormNote] = useState('')
  const [formPhoto, setFormPhoto] = useState<File | null>(null)
  const [formPhotoPreview, setFormPhotoPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('armadio_season')
    if (saved) setSeason(saved)
    loadItems()
  }, [])

  async function loadItems() {
    setLoading(true)
    const res = await fetch('/api/wardrobe')
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }

  function chooseSeason(s: string) {
    setSeason(s)
    localStorage.setItem('armadio_season', s)
  }

  async function handlePhotoUpload(file: File) {
    setFormPhoto(file)
    setFormPhotoPreview(URL.createObjectURL(file))
    setAnalyzing(true)
    setAnalyzed(false)
    setAnalyzeError('')

    const fd = new FormData()
    fd.append('photo', file)
    fd.append('season', season)

    try {
      const res = await fetch('/api/analyze-color', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) {
        setAnalyzeError(data.error)
      } else {
        setFormColor(data.color_hex)
        setFormColorName(data.color_name)
        setFormInPalette(data.in_palette)
        setFormClosestColor(data.closest_palette_color || '')
        setAnalyzed(true)
      }
    } catch {
      setAnalyzeError('Errore durante l\'analisi della foto')
    }
    setAnalyzing(false)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!season || !formPhoto || !analyzed) return
    setSaving(true)

    const fd = new FormData()
    fd.append('category', formCategory)
    fd.append('color_hex', formColor)
    fd.append('color_name', formColorName)
    fd.append('frequency', formFrequency)
    fd.append('note', formNote)
    fd.append('season', season)
    fd.append('in_palette', String(formInPalette))
    fd.append('photo', formPhoto)

    await fetch('/api/wardrobe', { method: 'POST', body: fd })
    setFormNote('')
    setFormPhoto(null)
    setFormPhotoPreview(null)
    setAnalyzed(false)
    setFormColor('')
    setFormColorName('')
    setSaving(false)
    await loadItems()
    setView('armadio')
  }

  async function handleDelete(id: number) {
    await fetch('/api/wardrobe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await loadItems()
  }

  const sc = SEASON_COLORS[season] || { accent: '#888', light: '#f9f9f9' }

  // ── Selezione stagione ──
  if (!season) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 300, color: '#1a1614', marginBottom: 8 }}>Il Mio Armadio</h1>
        <p style={{ color: '#7a6e68', marginBottom: 32, textAlign: 'center' }}>Qual è la tua stagione armocromatica?</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 360 }}>
          {Object.entries(SEASON_COLORS).map(([s, c]) => (
            <button key={s} onClick={() => chooseSeason(s)} style={{
              padding: '24px 16px', border: 'none', borderRadius: 16, cursor: 'pointer',
              background: c.light, color: c.accent, fontSize: 18, fontWeight: 500,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.2s',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {s}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const inPaletteItems = items.filter(i => i.in_palette)
  const outPaletteItems = items.filter(i => !i.in_palette)
  const filteredItems = filterCategory === 'all' ? items : items.filter(i => i.category === filterCategory)

  // Stats per il declutter
  const stats = {
    total: items.length,
    inPalette: inPaletteItems.length,
    outPalette: outPaletteItems.length,
    often: items.filter(i => i.frequency === 'often').length,
    sometimes: items.filter(i => i.frequency === 'sometimes').length,
    never: items.filter(i => i.frequency === 'never').length,
  }

  // Matrice per declutter
  const matrix = {
    perfectKeep: items.filter(i => i.in_palette && i.frequency === 'often'),
    reconsider: items.filter(i => !i.in_palette && i.frequency === 'often'),
    rediscover: items.filter(i => i.in_palette && i.frequency === 'sometimes'),
    candidate: items.filter(i => !i.in_palette && i.frequency === 'sometimes'),
    whyNot: items.filter(i => i.in_palette && i.frequency === 'never'),
    letGo: items.filter(i => !i.in_palette && i.frequency === 'never'),
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: sc.light, borderBottom: `2px solid ${sc.accent}20`, padding: '16px 20px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 300, color: '#1a1614', margin: 0 }}>Il Mio Armadio</h1>
            <span style={{ fontSize: 13, color: sc.accent, cursor: 'pointer' }} onClick={() => { setSeason(''); localStorage.removeItem('armadio_season') }}>
              {season} &middot; cambia
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['armadio', 'declutter'] as View[]).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '8px 16px', border: 'none', borderRadius: 20, cursor: 'pointer',
                background: view === v ? sc.accent : 'white', color: view === v ? 'white' : '#1a1614',
                fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
              }}>
                {v === 'armadio' ? 'Armadio' : 'Decluttering'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px' }}>

        {/* ── VISTA ARMADIO ── */}
        {view === 'armadio' && (
          <>
            {/* Filtri categoria */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
              <button onClick={() => setFilterCategory('all')} style={{
                padding: '6px 14px', border: 'none', borderRadius: 16, cursor: 'pointer', whiteSpace: 'nowrap',
                background: filterCategory === 'all' ? sc.accent : 'white', color: filterCategory === 'all' ? 'white' : '#1a1614',
                fontSize: 13, fontFamily: "'DM Sans', sans-serif",
              }}>Tutti ({items.length})</button>
              {CATEGORIES.map(c => {
                const count = items.filter(i => i.category === c.value).length
                return (
                  <button key={c.value} onClick={() => setFilterCategory(c.value)} style={{
                    padding: '6px 14px', border: 'none', borderRadius: 16, cursor: 'pointer', whiteSpace: 'nowrap',
                    background: filterCategory === c.value ? sc.accent : 'white', color: filterCategory === c.value ? 'white' : '#1a1614',
                    fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                  }}>{c.icon} {c.label} ({count})</button>
                )
              })}
            </div>

            {/* Griglia capi */}
            {loading ? (
              <p style={{ textAlign: 'center', color: '#7a6e68' }}>Caricamento...</p>
            ) : filteredItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7a6e68' }}>
                <p style={{ fontSize: 40, marginBottom: 16 }}>🪺</p>
                <p style={{ fontSize: 16 }}>Il tuo armadio è vuoto</p>
                <p style={{ fontSize: 14 }}>Aggiungi il primo capo!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {filteredItems.map(item => {
                  const cat = CATEGORIES.find(c => c.value === item.category)
                  const freq = FREQUENCY_OPTIONS.find(f => f.value === item.frequency)
                  return (
                    <div key={item.id} style={{
                      background: 'white', borderRadius: 16, overflow: 'hidden',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      border: item.in_palette ? `2px solid ${sc.accent}40` : '2px solid #F4433640',
                    }}>
                      {/* Foto o color swatch */}
                      <div style={{ height: 100, position: 'relative', background: item.color_hex }}>
                        {item.photo && (
                          <img src={`/api/wardrobe/photo?path=${encodeURIComponent(item.photo)}`} alt="" style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                          }} />
                        )}
                        <span style={{
                          position: 'absolute', top: 6, right: 6, background: item.in_palette ? '#4CAF50' : '#F44336',
                          color: 'white', fontSize: 10, padding: '2px 8px', borderRadius: 10,
                        }}>
                          {item.in_palette ? 'In palette' : 'Fuori palette'}
                        </span>
                        <div style={{
                          position: 'absolute', bottom: 6, left: 6, width: 20, height: 20,
                          borderRadius: 4, background: item.color_hex, border: '2px solid white',
                        }} />
                      </div>
                      <div style={{ padding: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                          {cat?.icon} {cat?.label}
                        </div>
                        <div style={{ fontSize: 11, color: freq?.color, marginBottom: 8 }}>
                          {freq?.label}
                        </div>
                        {item.note && <div style={{ fontSize: 11, color: '#7a6e68', marginBottom: 8 }}>{item.note}</div>}
                        <button onClick={() => handleDelete(item.id)} style={{
                          width: '100%', padding: '6px', border: '1px solid #eee', borderRadius: 8,
                          background: 'transparent', color: '#999', fontSize: 11, cursor: 'pointer',
                          fontFamily: "'DM Sans', sans-serif",
                        }}>Rimuovi</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Bottone aggiungi */}
            <button onClick={() => setView('add')} style={{
              position: 'fixed', bottom: 24, right: 24, width: 56, height: 56,
              borderRadius: '50%', border: 'none', background: sc.accent, color: 'white',
              fontSize: 28, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>+</button>
          </>
        )}

        {/* ── VISTA AGGIUNGI CAPO ── */}
        {view === 'add' && (
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <button type="button" onClick={() => { setView('armadio'); setAnalyzed(false); setFormPhoto(null); setFormPhotoPreview(null); setAnalyzeError('') }} style={{
              alignSelf: 'flex-start', background: 'none', border: 'none', color: sc.accent,
              cursor: 'pointer', fontSize: 14, padding: 0, fontFamily: "'DM Sans', sans-serif",
            }}>&larr; Torna all&apos;armadio</button>

            <h2 style={{ fontSize: 22, fontWeight: 300, margin: 0, color: '#1a1614' }}>Aggiungi un capo</h2>

            {/* Foto — step principale */}
            <div>
              <label style={{ fontSize: 13, color: '#7a6e68', display: 'block', marginBottom: 8 }}>Fotografa il capo</label>
              {!formPhotoPreview ? (
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '40px 20px', border: '2px dashed #d0c8c0', borderRadius: 16, cursor: 'pointer',
                  background: 'white', textAlign: 'center',
                }}>
                  <span style={{ fontSize: 40, marginBottom: 12 }}>📸</span>
                  <span style={{ fontSize: 14, color: '#1a1614', fontWeight: 500 }}>Scatta o carica una foto</span>
                  <span style={{ fontSize: 12, color: '#999', marginTop: 4 }}>L&apos;AI riconoscerà il colore per te</span>
                  <input type="file" accept="image/*" capture="environment" onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) handlePhotoUpload(f)
                  }} style={{ display: 'none' }} />
                </label>
              ) : (
                <div style={{ position: 'relative' }}>
                  <img src={formPhotoPreview} alt="Anteprima" style={{
                    width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 16,
                  }} />
                  <button type="button" onClick={() => {
                    setFormPhoto(null); setFormPhotoPreview(null); setAnalyzed(false); setAnalyzeError('')
                  }} style={{
                    position: 'absolute', top: 8, right: 8, width: 32, height: 32,
                    borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.5)', color: 'white',
                    fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>&times;</button>
                </div>
              )}
            </div>

            {/* Analisi in corso */}
            {analyzing && (
              <div style={{
                background: `${sc.accent}10`, borderRadius: 16, padding: 24, textAlign: 'center',
              }}>
                <div style={{ fontSize: 14, color: sc.accent, fontWeight: 500 }}>Analizzo il colore del capo...</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>L&apos;AI sta esaminando la foto</div>
              </div>
            )}

            {/* Errore analisi */}
            {analyzeError && (
              <div style={{
                background: '#FFF0F0', borderRadius: 16, padding: 16, textAlign: 'center',
              }}>
                <div style={{ fontSize: 14, color: '#F44336' }}>{analyzeError}</div>
                <button type="button" onClick={() => {
                  setFormPhoto(null); setFormPhotoPreview(null); setAnalyzeError('')
                }} style={{
                  marginTop: 8, padding: '6px 16px', border: 'none', borderRadius: 8,
                  background: '#F44336', color: 'white', fontSize: 13, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}>Riprova</button>
              </div>
            )}

            {/* Risultato analisi colore */}
            {analyzed && (
              <div style={{
                background: formInPalette ? '#F0FFF0' : '#FFF5F0',
                borderRadius: 16, padding: 20,
                border: `2px solid ${formInPalette ? '#4CAF5040' : '#F4433640'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 12, background: formColor,
                    border: '2px solid #eee', flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 500, color: '#1a1614' }}>{formColorName}</div>
                    <div style={{
                      fontSize: 13, fontWeight: 500, marginTop: 4,
                      color: formInPalette ? '#4CAF50' : '#F44336',
                    }}>
                      {formInPalette
                        ? `In palette ${season}`
                        : `Fuori dalla palette ${season}`
                      }
                    </div>
                    {formClosestColor && (
                      <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                        Colore più vicino in palette: {formClosestColor}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Categoria — visibile dopo analisi */}
            {analyzed && (
              <>
                <div>
                  <label style={{ fontSize: 13, color: '#7a6e68', display: 'block', marginBottom: 8 }}>Categoria</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {CATEGORIES.map(c => (
                      <button type="button" key={c.value} onClick={() => setFormCategory(c.value)} style={{
                        padding: '8px 16px', border: 'none', borderRadius: 12, cursor: 'pointer',
                        background: formCategory === c.value ? sc.accent : 'white',
                        color: formCategory === c.value ? 'white' : '#1a1614',
                        fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                      }}>{c.icon} {c.label}</button>
                    ))}
                  </div>
                </div>

                {/* Frequenza d'uso */}
                <div>
                  <label style={{ fontSize: 13, color: '#7a6e68', display: 'block', marginBottom: 8 }}>Quanto lo indossi?</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {FREQUENCY_OPTIONS.map(f => (
                      <button type="button" key={f.value} onClick={() => setFormFrequency(f.value)} style={{
                        padding: '12px 16px', border: 'none', borderRadius: 12, cursor: 'pointer',
                        textAlign: 'left', fontSize: 14,
                        background: formFrequency === f.value ? `${f.color}18` : 'white',
                        color: formFrequency === f.value ? f.color : '#1a1614',
                        fontWeight: formFrequency === f.value ? 500 : 400,
                        fontFamily: "'DM Sans', sans-serif",
                      }}>{f.label}</button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label style={{ fontSize: 13, color: '#7a6e68', display: 'block', marginBottom: 8 }}>Note (opzionale)</label>
                  <input type="text" value={formNote} onChange={e => setFormNote(e.target.value)} placeholder="es. il vestito blu per le occasioni"
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #e8e0d8', borderRadius: 12, fontSize: 14, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }} />
                </div>

                <button type="submit" disabled={saving} style={{
                  padding: '14px', border: 'none', borderRadius: 12, cursor: 'pointer',
                  background: sc.accent, color: 'white', fontSize: 16, fontWeight: 500,
                  opacity: saving ? 0.6 : 1, fontFamily: "'DM Sans', sans-serif",
                }}>
                  {saving ? 'Salvataggio...' : 'Aggiungi al mio armadio'}
                </button>
              </>
            )}
          </form>
        )}

        {/* ── VISTA DECLUTTERING ── */}
        {view === 'declutter' && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 300, margin: '0 0 20px', color: '#1a1614' }}>Decluttering</h2>

            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7a6e68' }}>
                <p>Aggiungi prima qualche capo al tuo armadio.</p>
              </div>
            ) : (
              <>
                {/* Stats riepilogo */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                  <StatCard label="Totale capi" value={stats.total} color="#1a1614" />
                  <StatCard label="In palette" value={stats.inPalette} color="#4CAF50" />
                  <StatCard label="Fuori palette" value={stats.outPalette} color="#F44336" />
                </div>

                {/* Barra visuale palette */}
                {stats.total > 0 && (
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ fontSize: 13, color: '#7a6e68', marginBottom: 8 }}>Allineamento alla tua palette</div>
                    <div style={{ height: 12, borderRadius: 6, overflow: 'hidden', display: 'flex', background: '#eee' }}>
                      <div style={{ width: `${(stats.inPalette / stats.total) * 100}%`, background: '#4CAF50', transition: 'width 0.5s' }} />
                      <div style={{ width: `${(stats.outPalette / stats.total) * 100}%`, background: '#F44336', transition: 'width 0.5s' }} />
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      {Math.round((stats.inPalette / stats.total) * 100)}% in palette
                    </div>
                  </div>
                )}

                {/* Matrice */}
                <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16, color: '#1a1614' }}>La matrice del tuo armadio</h3>

                <MatrixSection
                  title="Perfetti, tienili!"
                  subtitle="In palette + li metti spesso"
                  items={matrix.perfectKeep}
                  color="#4CAF50"
                  onDelete={handleDelete}
                />
                <MatrixSection
                  title="Ti piacciono ma non ti valorizzano"
                  subtitle="Fuori palette + li metti spesso"
                  items={matrix.reconsider}
                  color="#FF9800"
                  onDelete={handleDelete}
                />
                <MatrixSection
                  title="Da riscoprire"
                  subtitle="In palette + ogni tanto"
                  items={matrix.rediscover}
                  color="#2196F3"
                  onDelete={handleDelete}
                />
                <MatrixSection
                  title="Candidati all'uscita"
                  subtitle="Fuori palette + ogni tanto"
                  items={matrix.candidate}
                  color="#FF5722"
                  onDelete={handleDelete}
                />
                <MatrixSection
                  title="Perché non li metti?"
                  subtitle="In palette + mai indossati"
                  items={matrix.whyNot}
                  color="#9C27B0"
                  onDelete={handleDelete}
                />
                <MatrixSection
                  title="Via senza sensi di colpa"
                  subtitle="Fuori palette + mai indossati"
                  items={matrix.letGo}
                  color="#F44336"
                  onDelete={handleDelete}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: 'white', borderRadius: 12, padding: 16, textAlign: 'center',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontSize: 28, fontWeight: 300, color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#7a6e68' }}>{label}</div>
    </div>
  )
}

function MatrixSection({ title, subtitle, items, color, onDelete }: {
  title: string; subtitle: string; items: WardrobeItem[]; color: string;
  onDelete: (id: number) => void
}) {
  if (items.length === 0) return null
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1614' }}>{title}</div>
          <div style={{ fontSize: 11, color: '#999' }}>{subtitle}</div>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 13, color, fontWeight: 500 }}>{items.length}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {items.map(item => (
          <div key={item.id} style={{
            minWidth: 80, background: 'white', borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0,
          }}>
            <div style={{ height: 48, background: item.color_hex }} />
            <div style={{ padding: '6px 8px', fontSize: 11, color: '#7a6e68' }}>
              {CATEGORIES.find(c => c.value === item.category)?.icon} {CATEGORIES.find(c => c.value === item.category)?.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
