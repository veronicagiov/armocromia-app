export default function GraziePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 500, width: '100%', textAlign: 'center' as const }}>

        <span style={{ fontSize: 56, display: 'block', marginBottom: 24 }}>✨</span>

        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(36px, 7vw, 56px)', fontWeight: 300, lineHeight: 1.1, marginBottom: 16, color: '#1a1614' }}>
          Tutto ricevuto!
        </h1>
        <p style={{ fontSize: 16, color: '#7a6e68', lineHeight: 1.7, marginBottom: 40 }}>
          Le tue foto sono al sicuro. Analizzeremo il tuo sottogruppo armocromatico e ti invieremo il PDF personalizzato entro <strong>48 ore</strong>.
        </p>

        <div style={{ background: '#ffffff', border: '1px solid #e8e0d8', borderRadius: 16, padding: 24, marginBottom: 40, textAlign: 'left' as const }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: '#c9a96e', marginBottom: 16 }}>Cosa troverai nel PDF</p>
          {[
            '🎨 Il tuo sottogruppo preciso (es. Inverno Puro, Inverno Freddo...)',
            '🎭 La tua palette completa con 30+ colori valorizzanti',
            '💄 Consigli make-up specifici per il tuo sottotono',
            '👗 Abbinamenti colore per capi e accessori',
            '🚫 Colori da evitare e perché',
          ].map(item => (
            <p key={item} style={{ fontSize: 14, color: '#1a1614', lineHeight: 1.6, marginBottom: 8 }}>{item}</p>
          ))}
        </div>

        <p style={{ fontSize: 13, color: '#7a6e68' }}>
          Hai domande? Scrivici a{' '}
          <a href="mailto:veronica@youglamour.it" style={{ color: '#c9a96e', textDecoration: 'none' }}>veronica@youglamour.it</a>
        </p>
      </div>
    </main>
  )
}
