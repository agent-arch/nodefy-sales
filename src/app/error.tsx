'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui', background: '#f8f9fa', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 40, maxWidth: 500, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>Er ging iets mis</h2>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>{error.message}</p>
        <pre style={{ background: '#f1f1f1', padding: 12, borderRadius: 8, fontSize: 11, textAlign: 'left', overflow: 'auto', maxHeight: 200, marginBottom: 20 }}>{error.stack}</pre>
        <button onClick={reset} style={{ background: '#0047FF', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
          Probeer opnieuw
        </button>
      </div>
    </div>
  )
}
