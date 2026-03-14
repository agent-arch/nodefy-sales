'use client'

import React, { useState, useEffect } from 'react'

// ============================================
// NODEFY CLIENT PERFORMANCE REPORT
// Client-facing report portal
// ============================================

interface MetricGroup {
  platform: string
  data: Record<string, string | number>
}

interface ClientReport {
  slug: string
  clientName: string
  period: string
  generatedAt: string
  expiresAt: string | null
  metrics: MetricGroup[]
  highlights: string[]
  recommendations: string[]
  nextSteps: string[]
  branding: {
    primaryColor: string
    logoUrl: string | null
  }
}

// Format metric keys nicely
function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace('Ctr', 'CTR')
    .replace('Cpc', 'CPC')
    .replace('Roas', 'ROAS')
    .replace('Cpa', 'CPA')
}

// Determine if a change value is positive or negative
function changeDirection(val: string): 'up' | 'down' | 'neutral' {
  if (!val) return 'neutral'
  const str = String(val)
  // If the key context suggests "cost" going up is bad, handle separately
  const num = parseFloat(str.replace(/[^0-9.-]/g, ''))
  if (isNaN(num) || num === 0) return 'neutral'
  return num > 0 ? 'up' : 'down'
}

// Platform icon
function PlatformIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase()
  if (p.includes('facebook') || p.includes('meta')) {
    return <span style={{ fontSize: 20 }}>📘</span>
  }
  if (p.includes('google')) {
    return <span style={{ fontSize: 20 }}>🔍</span>
  }
  if (p.includes('linkedin')) {
    return <span style={{ fontSize: 20 }}>💼</span>
  }
  if (p.includes('tiktok')) {
    return <span style={{ fontSize: 20 }}>🎵</span>
  }
  return <span style={{ fontSize: 20 }}>📊</span>
}

function MetricCard({ label, value, change }: { label: string; value: string | number; change?: string }) {
  const dir = change ? changeDirection(change) : 'neutral'
  const changeColor = dir === 'up' ? '#10b981' : dir === 'down' ? '#ef4444' : '#6b7280'
  const arrow = dir === 'up' ? '↑' : dir === 'down' ? '↓' : ''

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      border: '1px solid #f0f0f0',
      minWidth: 160,
    }}>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {change && (
        <div style={{ fontSize: 13, color: changeColor, marginTop: 6, fontWeight: 600 }}>
          {arrow} {change} vs vorige periode
        </div>
      )}
    </div>
  )
}

export default function ClientReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const [report, setReport] = useState<ClientReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(({ slug }) => {
      fetch(`/api/client-report?slug=${slug}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setReport(data.report)
          } else {
            setError(data.error === 'Report expired' ? 'Dit rapport is verlopen. Neem contact op met Nodefy voor een actueel rapport.' : 'Rapport niet gevonden.')
          }
          setLoading(false)
        })
        .catch(() => {
          setError('Kan rapport niet laden.')
          setLoading(false)
        })
    })
  }, [params])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, border: '3px solid #e5e7eb', borderTopColor: '#2563eb',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <div style={{ color: '#6b7280', fontSize: 14 }}>Rapport laden...</div>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: 400,
          padding: 40,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h2 style={{ margin: '0 0 8px', color: '#111827' }}>Rapport niet beschikbaar</h2>
          <p style={{ color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{error}</p>
          <div style={{ marginTop: 24, fontSize: 13, color: '#9ca3af' }}>
            <a href="https://nodefy.nl" style={{ color: '#2563eb', textDecoration: 'none' }}>nodefy.nl</a> — Performance Marketing
          </div>
        </div>
      </div>
    )
  }

  const primaryColor = report.branding?.primaryColor || '#2563eb'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
        color: '#fff',
        padding: '48px 0 56px',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Performance Report
              </div>
              <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em' }}>
                {report.clientName}
              </h1>
              <div style={{ marginTop: 12, fontSize: 15, opacity: 0.9 }}>
                📅 {report.period}
              </div>
            </div>
            <div style={{ textAlign: 'right', opacity: 0.9 }}>
              <div style={{ fontSize: 13, marginBottom: 4 }}>Gegenereerd</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                {new Date(report.generatedAt).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div style={{ marginTop: 12, fontSize: 13 }}>
                Powered by <strong>Nodefy</strong>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: '-32px auto 0', padding: '0 24px 60px', position: 'relative' }}>
        {/* Highlights */}
        {report.highlights.length > 0 && (
          <section style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0',
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
              ⭐ Highlights
            </h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {report.highlights.map((h, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  background: '#f0fdf4',
                  borderRadius: 10,
                  border: '1px solid #dcfce7',
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>✅</span>
                  <span style={{ color: '#166534', fontSize: 14, lineHeight: 1.5 }}>{h}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Metrics per Platform */}
        {report.metrics.map((group, gi) => (
          <section key={gi} style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0',
          }}>
            <h2 style={{
              margin: '0 0 24px',
              fontSize: 20,
              fontWeight: 700,
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <PlatformIcon platform={group.platform} />
              {group.platform}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16,
            }}>
              {Object.entries(group.data)
                .filter(([k]) => !k.endsWith('_change'))
                .map(([key, value]) => (
                  <MetricCard
                    key={key}
                    label={formatKey(key)}
                    value={String(value)}
                    change={group.data[`${key}_change`] as string | undefined}
                  />
                ))}
            </div>
          </section>
        ))}

        {/* Recommendations */}
        {report.recommendations.length > 0 && (
          <section style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0',
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
              💡 Aanbevelingen
            </h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {report.recommendations.map((r, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  background: '#eff6ff',
                  borderRadius: 10,
                  border: '1px solid #dbeafe',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#2563eb', flexShrink: 0, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#dbeafe', borderRadius: 6 }}>
                    {i + 1}
                  </span>
                  <span style={{ color: '#1e40af', fontSize: 14, lineHeight: 1.5 }}>{r}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Next Steps */}
        {report.nextSteps.length > 0 && (
          <section style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0',
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
              🚀 Volgende Stappen
            </h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {report.nextSteps.map((s, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  background: '#faf5ff',
                  borderRadius: 10,
                  border: '1px solid #f3e8ff',
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>→</span>
                  <span style={{ color: '#6b21a8', fontSize: 14, lineHeight: 1.5 }}>{s}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          padding: '32px 0',
          borderTop: '1px solid #e5e7eb',
          marginTop: 16,
        }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
            Dit rapport is gegenereerd door <strong style={{ color: '#111827' }}>Nodefy</strong> — Performance Marketing
          </div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>
            <a href="https://nodefy.nl" style={{ color: '#2563eb', textDecoration: 'none' }}>nodefy.nl</a> · Vragen? Mail <a href="mailto:info@nodefy.nl" style={{ color: '#2563eb', textDecoration: 'none' }}>info@nodefy.nl</a>
          </div>
        </footer>
      </main>
    </div>
  )
}
