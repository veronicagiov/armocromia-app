// La pagina principale serve il quiz HTML.
// Copia il contenuto del tuo test-armocromia.html qui sotto
// oppure usa un iframe che lo include.
// Per semplicità, questo file fa da entry point e rimanda al quiz statico.

export default function HomePage() {
  return (
    <div style={{ margin: 0, padding: 0 }}>
      {/* 
        ISTRUZIONE: 
        Il quiz principale è il file test-armocromia.html.
        Copialo nella cartella /public/quiz.html
        e questo componente lo caricherà automaticamente.
      */}
      <iframe
        src="/quiz.html"
        style={{ width: '100%', height: '100vh', border: 'none', display: 'block' }}
        title="Test Armocromia"
      />
    </div>
  )
}
