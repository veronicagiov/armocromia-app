'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useRef, Suspense } from 'react'

function UploadContent() {
  const params = useSearchParams()
  const router = useRouter()
  const sessionId = params.get('session_id') || ''
  const season = params.get('season') || ''
  const name = params.get('name') || ''

  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const newFiles = Array.from(files).slice(0, 5 - photos.length)
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))
    setPhotos(prev => [...prev, ...newFiles])
    setPreviews(prev => [...prev, ...newPreviews])
  }

  function removePhoto(i: number) {
    setPhotos(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit() {
    if (photos.length === 0) { setError('Carica almeno una foto.'); return }
    if (!email || !email.includes('@')) { setError('Inserisci la tua email.'); return }

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('session_id', sessionId)
    formData.append('season', season)
    formData.append('name', name)
    formData.append('email', email)
    formData.append('notes', notes)
    photos.forEach(f => formData.append('photos', f))

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Errore durante l\'invio')
      router.push('/grazie')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#faf7f2', fontFamily: "'DM Sans', sans-serif", padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ display: 'inline-block', padding: '8px 20px', borderRadius: 100, background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.3)', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' as const, color: '#c9a96e', marginBottom: 20 }}>
            ✦ Pagamento confermato
          </span>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 300, lineHeight: 1.1, marginBottom: 12, color: '#1a1614' }}>
            Carica le tue foto,<br /><em style={{ fontStyle: 'italic', color: '#c9a96e' }}>{name || 'cara'}</em>
          </h1>
          <p style={{ fontSize: 15, color: '#7a6e68', lineHeight: 1.7, maxWidth: 440, margin: '0 auto' }}>
            Riceverai l'analisi del tuo sottogruppo e il PDF personalizzato entro <strong>48 ore</strong>.
          </p>
        </div>

        {/* Istruzioni foto */}
        <div style={{ background: '#fff9f4', border: '1px solid #e8e0d8', borderRadius: 16, padding: 24, marginBottom: 32 }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: '#c9a96e', marginBottom: 16 }}>Come fare le foto</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['😊', 'Viso frontale', 'Luce naturale, senza trucco'],
              ['👤', 'Viso di lato', 'Profilo sinistro o destro'],
              ['👁️', 'Occhi in primo piano', 'Vedi bene il colore'],
              ['🤚', 'Polso interno', 'Si vedono le venature'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ background: '#faf7f2', borderRadius: 12, padding: '12px 14px' }}>
                <span style={{ fontSize: 20, display: 'block', marginBottom: 6 }}>{icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 2 }}>{title}</span>
                <span style={{ fontSize: 12, color: '#7a6e68' }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upload area */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
          style={{
            border: '2px dashed #e8e0d8', borderRadius: 16, padding: '32px 24px',
            textAlign: 'center' as const, cursor: 'pointer', marginBottom: 24,
            background: '#fff9f4', transition: 'border-color .2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#c9a96e')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e0d8')}
        >
          <input ref={inputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
          <span style={{ fontSize: 32, display: 'block', marginBottom: 12 }}>📷</span>
          <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 4, color: '#1a1614' }}>Trascina le foto qui</p>
          <p style={{ fontSize: 13, color: '#7a6e68' }}>oppure clicca per scegliere • max 5 foto • JPG/PNG</p>
        </div>

        {/* Anteprime */}
        {previews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 24 }}>
            {previews.map((src, i) => (
              <div key={i} style={{ position: 'relative' as const }}>
                <img src={src} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' as const, borderRadius: 10, display: 'block' }} />
                <button
                  onClick={() => removePhoto(i)}
                  style={{ position: 'absolute' as const, top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(26,22,20,0.75)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >✕</button>
              </div>
            ))}
            {photos.length < 5 && (
              <div
                onClick={() => inputRef.current?.click()}
                style={{ aspectRatio: '1', border: '2px dashed #e8e0d8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 24, color: '#c9a96e' }}
              >+</div>
            )}
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: '#7a6e68', marginBottom: 8, fontWeight: 500 }}>La tua email (per ricevere il PDF)</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Es. sofia@email.com"
            style={{ width: '100%', padding: '14px 18px', border: '1.5px solid #e8e0d8', borderRadius: 10, fontSize: 15, background: '#faf7f2', color: '#1a1614', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }}
          />
        </div>

        {/* Note opzionali */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: '#7a6e68', marginBottom: 8, fontWeight: 500 }}>Note aggiuntive (opzionale)</label>
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Es. ho i capelli tinti, uso spesso fondotinta beige, ecc."
            rows={3}
            style={{ width: '100%', padding: '14px 18px', border: '1.5px solid #e8e0d8', borderRadius: 10, fontSize: 14, background: '#faf7f2', color: '#1a1614', outline: 'none', fontFamily: 'inherit', resize: 'vertical' as const, boxSizing: 'border-box' as const }}
          />
        </div>

        {error && <p style={{ color: '#cc4444', fontSize: 14, marginBottom: 16, padding: '12px 16px', background: '#fff0f0', borderRadius: 10 }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', background: loading ? '#888' : '#1a1614', color: '#faf7f2',
            border: 'none', padding: '17px', borderRadius: 12, fontSize: 15,
            fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'background .2s',
          }}
        >
          {loading ? 'Invio in corso...' : 'Invia le foto ✦'}
        </button>

        <p style={{ textAlign: 'center' as const, fontSize: 12, color: '#7a6e68', marginTop: 16, lineHeight: 1.5 }}>
          🔒 Le tue foto sono private e usate solo per l'analisi. Vengono eliminate dopo 30 giorni.
        </p>
      </div>
    </main>
  )
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#faf7f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#7a6e68' }}>Caricamento...</div>}>
      <UploadContent />
    </Suspense>
  )
}
