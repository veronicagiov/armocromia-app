'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, Suspense } from 'react'

function UploadContent() {
  const params = useSearchParams()
  const router = useRouter()
  const sessionId = params.get('session_id') || ''
  const season = params.get('season') || ''
  const name = params.get('name') || ''

  useEffect(() => {
    // Salva l'analisi in background, poi redirect immediato alla thank you page
    if (sessionId) {
      const formData = new FormData()
      formData.append('session_id', sessionId)
      formData.append('season', season)
      formData.append('name', name)
      formData.append('email', '')
      formData.append('notes', 'Foto caricate nel subquiz (pre-pagamento)')
      fetch('/api/upload', { method: 'POST', body: formData }).catch(() => {})
    }

    // Redirect immediato — non aspettare la risposta
    router.push('/grazie')
  }, [sessionId, season, name, router])

  return (
    <main style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 500, width: '100%', textAlign: 'center' as const }}>
        <span style={{ fontSize: 40, display: 'block', marginBottom: 20 }}>⏳</span>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, color: '#1a1614', marginBottom: 12 }}>
          Stiamo confermando il pagamento...
        </h1>
        <p style={{ fontSize: 15, color: '#7a6e68' }}>Un momento, verrai reindirizzata automaticamente.</p>
      </div>
    </main>
  )
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#7a6e68' }}>Caricamento...</div>}>
      <UploadContent />
    </Suspense>
  )
}
