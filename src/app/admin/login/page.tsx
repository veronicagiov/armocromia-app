'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Password errata.')
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#faf7f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: '#fff', border: '1px solid #e8e0d8', borderRadius: 16, padding: '48px 40px', width: '100%', maxWidth: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', color: '#c9a96e', marginBottom: 8, textAlign: 'center' }}>YouGlamour</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 400, color: '#1a1614', marginBottom: 32, textAlign: 'center' }}>Admin Panel</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e8e0d8', borderRadius: 10, fontSize: 15, background: '#faf7f2', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
          />
          {error && <p style={{ color: '#cc4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#1a1614', color: '#faf7f2', border: 'none', borderRadius: 100, fontSize: 14, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Accesso...' : 'Accedi'}
          </button>
        </form>
      </div>
    </main>
  )
}
