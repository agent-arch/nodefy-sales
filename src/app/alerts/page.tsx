'use client'

import React, { useState, useEffect } from 'react'

interface Alert {
  client: string
  platform: string
  metric: string
  value: string
  change: string
  changePct: number
  severity: 'high' | 'medium' | 'low'
  sentiment: 'positive' | 'negative' | 'neutral'
  message: string
}

interface AlertsData {
  generatedAt: string
  period: string
  summary: {
    total: number
    high: number
    medium: number
    negative: number
    positive: number
  }
  alerts: Alert[]
}

function formatMetric(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    .replace('Ctr', 'CTR').replace('Cpc', 'CPC').replace('Roas', 'ROAS')
}

export default function AlertsPage() {
  const [data, setData] = useState<AlertsData | null>(null)
  const [filter, setFilter] = useState<'all' | 'negative' | 'positive'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/client-report/alerts')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) setData(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ color: '#94a3b8' }}>Loading alerts...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
          <h2 style={{ color: '#f1f5f9' }}>No alerts data</h2>
          <p>Run the alert system to generate alerts.</p>
        </div>
      </div>
    )
  }

  const filtered = data.alerts.filter(a => {
    if (filter === 'negative') return a.sentiment === 'negative'
    if (filter === 'positive') return a.sentiment === 'positive'
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#f1f5f9' }}>
      {/* Header */}
      <header style={{ padding: '32px 24px 24px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>🔔 Client Alerts</h1>
            <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
              {data.period} · Generated {new Date(data.generatedAt).toLocaleString('nl-NL')}
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 24 }}>
          {[
            { label: 'Total Alerts', value: data.summary.total, color: '#64748b', bg: '#1e293b' },
            { label: 'High Priority', value: data.summary.high, color: '#f59e0b', bg: '#451a03' },
            { label: '⚠️ Negative', value: data.summary.negative, color: '#ef4444', bg: '#450a0a' },
            { label: '✅ Positive', value: data.summary.positive, color: '#10b981', bg: '#052e16' },
          ].map((card, i) => (
            <div key={i} style={{ background: card.bg, borderRadius: 12, padding: '16px 20px', border: `1px solid ${card.color}33` }}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          {(['all', 'negative', 'positive'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: filter === f ? '#2563eb' : '#1e293b', color: filter === f ? '#fff' : '#94a3b8',
            }}>
              {f === 'all' ? 'All' : f === 'negative' ? '🔴 Negative' : '🟢 Positive'}
            </button>
          ))}
        </div>
      </header>

      {/* Alerts list */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gap: 8 }}>
          {filtered.map((alert, i) => {
            const bgColor = alert.sentiment === 'negative' ? '#1c0a0a' : alert.sentiment === 'positive' ? '#0a1c0f' : '#1e293b'
            const borderColor = alert.sentiment === 'negative' ? '#7f1d1d' : alert.sentiment === 'positive' ? '#14532d' : '#334155'
            const icon = alert.sentiment === 'negative' ? '🔴' : alert.sentiment === 'positive' ? '🟢' : '🟡'
            const sevBadge = alert.severity === 'high' ? { bg: '#f59e0b22', color: '#f59e0b', text: 'HIGH' } : { bg: '#64748b22', color: '#64748b', text: 'MED' }

            return (
              <div key={i} style={{
                background: bgColor, borderRadius: 10, padding: '16px 20px',
                border: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{alert.client}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                    {alert.platform} · {formatMetric(alert.metric)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 120 }}>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{alert.value}</div>
                  <div style={{ fontSize: 13, color: alert.sentiment === 'negative' ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                    {alert.changePct > 0 ? '↑' : '↓'} {alert.change}
                  </div>
                </div>
                <span style={{
                  padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800,
                  background: sevBadge.bg, color: sevBadge.color, letterSpacing: '0.05em',
                }}>
                  {sevBadge.text}
                </span>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
