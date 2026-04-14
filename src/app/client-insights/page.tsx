'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler)

// ============================================
// NODEFY CLIENT INSIGHTS DASHBOARD
// Aggregate analytics across all clients
// Revenue distribution, platform mix, health trends, churn signals
// ============================================

interface HealthScores {
  performance: number
  budgetPacing: number
  communication: number
  retention: number
}

interface HealthAlert {
  type: string
  message: string
  severity: 'high' | 'medium' | 'low'
}

interface ClientHealth {
  clientName: string
  slug: string
  accountManager: string
  vertical: string
  contractStart: string
  contractEnd: string | null
  retainerValue: number
  platforms: string[]
  healthScore: number
  scores: HealthScores
  status: 'healthy' | 'attention' | 'at-risk' | 'critical'
  lastReportDate: string | null
  lastMeetingDate: string | null
  nextMeetingDate: string | null
  alerts: HealthAlert[]
  notes: string
  updatedAt: string
}

const STATUS_CONFIG = {
  healthy: { label: 'Gezond', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  attention: { label: 'Aandacht', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  'at-risk': { label: 'Risico', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  critical: { label: 'Kritiek', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
}

const VERTICAL_COLORS: Record<string, string> = {
  'e-commerce': '#3b82f6',
  'hospitality': '#f59e0b',
  'saas': '#8b5cf6',
  'b2b': '#10b981',
  'retail': '#ec4899',
  'finance': '#06b6d4',
  'healthcare': '#14b8a6',
  'education': '#a78bfa',
  'food': '#f97316',
  'fashion': '#e879f9',
  'automotive': '#6366f1',
  'real-estate': '#84cc16',
}

const PLATFORM_COLORS: Record<string, string> = {
  meta: '#1877F2',
  google: '#34A853',
  linkedin: '#0A66C2',
  tiktok: '#ff0050',
  email: '#f59e0b',
  seo: '#10b981',
  analytics: '#8b5cf6',
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(val)
}

function daysSince(d: string | null): number | null {
  if (!d) return null
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
}

export default function ClientInsightsPage() {
  const [clients, setClients] = useState<Record<string, ClientHealth>>({})
  const [loading, setLoading] = useState(true)
  const [selectedAM, setSelectedAM] = useState<string>('all')

  useEffect(() => {
    fetch('/api/client-health')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) setClients(res.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const allClients = useMemo(() => Object.values(clients), [clients])
  const filteredClients = useMemo(() =>
    selectedAM === 'all' ? allClients : allClients.filter(c => c.accountManager === selectedAM)
  , [allClients, selectedAM])

  const accountManagers = useMemo(() => [...new Set(allClients.map(c => c.accountManager))].sort(), [allClients])

  // === COMPUTED METRICS ===
  const metrics = useMemo(() => {
    const c = filteredClients
    if (c.length === 0) return null

    const totalMRR = c.reduce((s, cl) => s + cl.retainerValue, 0)
    const avgHealth = Math.round(c.reduce((s, cl) => s + cl.healthScore, 0) / c.length)
    const avgPerformance = Math.round(c.reduce((s, cl) => s + cl.scores.performance, 0) / c.length)
    const avgBudgetPacing = Math.round(c.reduce((s, cl) => s + cl.scores.budgetPacing, 0) / c.length)
    const avgCommunication = Math.round(c.reduce((s, cl) => s + cl.scores.communication, 0) / c.length)
    const avgRetention = Math.round(c.reduce((s, cl) => s + cl.scores.retention, 0) / c.length)

    const statusCounts = { healthy: 0, attention: 0, 'at-risk': 0, critical: 0 }
    const statusMRR = { healthy: 0, attention: 0, 'at-risk': 0, critical: 0 }
    c.forEach(cl => {
      statusCounts[cl.status]++
      statusMRR[cl.status] += cl.retainerValue
    })

    const mrrAtRisk = statusMRR['at-risk'] + statusMRR.critical
    const totalAlerts = c.reduce((s, cl) => s + cl.alerts.length, 0)
    const highAlerts = c.reduce((s, cl) => s + cl.alerts.filter(a => a.severity === 'high').length, 0)

    // Revenue by vertical
    const verticalMRR: Record<string, number> = {}
    const verticalCount: Record<string, number> = {}
    c.forEach(cl => {
      const v = cl.vertical || 'unknown'
      verticalMRR[v] = (verticalMRR[v] || 0) + cl.retainerValue
      verticalCount[v] = (verticalCount[v] || 0) + 1
    })

    // Platform distribution
    const platformCount: Record<string, number> = {}
    c.forEach(cl => cl.platforms.forEach(p => { platformCount[p] = (platformCount[p] || 0) + 1 }))

    // Revenue concentration (top client % of total)
    const sorted = [...c].sort((a, b) => b.retainerValue - a.retainerValue)
    const topClientPct = c.length > 0 ? Math.round((sorted[0].retainerValue / totalMRR) * 100) : 0
    const top3Pct = c.length >= 3
      ? Math.round(sorted.slice(0, 3).reduce((s, cl) => s + cl.retainerValue, 0) / totalMRR * 100)
      : 100

    // AM distribution
    const amMRR: Record<string, number> = {}
    const amCount: Record<string, number> = {}
    c.forEach(cl => {
      amMRR[cl.accountManager] = (amMRR[cl.accountManager] || 0) + cl.retainerValue
      amCount[cl.accountManager] = (amCount[cl.accountManager] || 0) + 1
    })

    // Churn signals
    const churnRisks = c.filter(cl => {
      const noMeeting = daysSince(cl.lastMeetingDate)
      const noReport = daysSince(cl.lastReportDate)
      return cl.status === 'critical' ||
        cl.status === 'at-risk' ||
        cl.scores.retention < 40 ||
        (noMeeting !== null && noMeeting > 45) ||
        (noReport !== null && noReport > 30)
    }).sort((a, b) => a.healthScore - b.healthScore)

    // Clients needing reports (>14 days since last report)
    const needsReport = c.filter(cl => {
      const days = daysSince(cl.lastReportDate)
      return days === null || days > 14
    })

    // Clients needing meetings (>21 days since last)
    const needsMeeting = c.filter(cl => {
      const days = daysSince(cl.lastMeetingDate)
      return days === null || days > 21
    })

    // Upsell candidates (healthy + good performance + low retainer)
    const upsellCandidates = c.filter(cl =>
      cl.status === 'healthy' && cl.scores.performance >= 70 && cl.platforms.length < 3
    ).sort((a, b) => b.scores.performance - a.scores.performance)

    // Revenue tier breakdown
    const tiers = {
      'Enterprise (€5K+)': c.filter(cl => cl.retainerValue >= 5000),
      'Growth (€3-5K)': c.filter(cl => cl.retainerValue >= 3000 && cl.retainerValue < 5000),
      'Starter (€1-3K)': c.filter(cl => cl.retainerValue >= 1000 && cl.retainerValue < 3000),
      'Micro (<€1K)': c.filter(cl => cl.retainerValue < 1000),
    }

    return {
      totalMRR, avgHealth, avgPerformance, avgBudgetPacing, avgCommunication, avgRetention,
      statusCounts, statusMRR, mrrAtRisk, totalAlerts, highAlerts,
      verticalMRR, verticalCount, platformCount,
      topClientPct, top3Pct, sorted,
      amMRR, amCount,
      churnRisks, needsReport, needsMeeting, upsellCandidates, tiers,
    }
  }, [filteredClients])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <div style={{ color: '#9ca3af', fontSize: 14 }}>Client Insights laden...</div>
        </div>
      </div>
    )
  }

  if (!metrics || filteredClients.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📊</div>
          <h1 style={{ color: '#f9fafb', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Geen Client Data</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Voeg klanten toe aan Client Health om insights te zien.</p>
          <a href="/client-health" style={{ color: '#0047FF', textDecoration: 'none', fontSize: 14, marginTop: 16, display: 'inline-block' }}>→ Client Health openen</a>
        </div>
      </div>
    )
  }

  const sectionStyle: React.CSSProperties = {
    background: '#0a0f1c',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 24,
  }

  // === CHART DATA ===
  const statusDoughnutData = {
    labels: Object.keys(STATUS_CONFIG).map(k => STATUS_CONFIG[k as keyof typeof STATUS_CONFIG].label),
    datasets: [{
      data: Object.keys(STATUS_CONFIG).map(k => metrics.statusCounts[k as keyof typeof metrics.statusCounts]),
      backgroundColor: Object.keys(STATUS_CONFIG).map(k => STATUS_CONFIG[k as keyof typeof STATUS_CONFIG].bg),
      borderColor: Object.keys(STATUS_CONFIG).map(k => STATUS_CONFIG[k as keyof typeof STATUS_CONFIG].color),
      borderWidth: 2,
    }],
  }

  const verticalLabels = Object.keys(metrics.verticalMRR).sort((a, b) => metrics.verticalMRR[b] - metrics.verticalMRR[a])
  const verticalBarData = {
    labels: verticalLabels.map(v => v.charAt(0).toUpperCase() + v.slice(1)),
    datasets: [{
      label: 'MRR',
      data: verticalLabels.map(v => metrics.verticalMRR[v]),
      backgroundColor: verticalLabels.map(v => VERTICAL_COLORS[v] || '#6b7280'),
      borderRadius: 6,
    }],
  }

  const platformLabels = Object.keys(metrics.platformCount).sort((a, b) => metrics.platformCount[b] - metrics.platformCount[a])
  const platformDoughnutData = {
    labels: platformLabels.map(p => p.charAt(0).toUpperCase() + p.slice(1)),
    datasets: [{
      data: platformLabels.map(p => metrics.platformCount[p]),
      backgroundColor: platformLabels.map(p => PLATFORM_COLORS[p] || '#6b7280'),
      borderColor: '#0a0f1c',
      borderWidth: 2,
    }],
  }

  // Revenue concentration chart - simple bar chart
  const concLabels = metrics.sorted.map(c => c.clientName.length > 12 ? c.clientName.substring(0, 12) + '…' : c.clientName)
  const concentrationData = {
    labels: concLabels,
    datasets: [
      {
        label: 'MRR',
        data: metrics.sorted.map(c => c.retainerValue),
        backgroundColor: metrics.sorted.map(c =>
          c.status === 'critical' ? 'rgba(239,68,68,0.5)' :
          c.status === 'at-risk' ? 'rgba(249,115,22,0.5)' :
          'rgba(0,71,255,0.4)'
        ),
        borderRadius: 4,
      }
    ],
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: '#9ca3af', font: { size: 11 }, padding: 12 } },
    },
    cutout: '65%',
  }

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { display: false } },
      y: { ticks: { color: '#6b7280', callback: (v: number | string) => `€${v}` }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  }

  const concentrationOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#6b7280', font: { size: 9 }, maxRotation: 45 }, grid: { display: false } },
      y: { ticks: { color: '#6b7280', callback: (v: number | string) => `€${v}` }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f9fafb' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #030712, #0a0f1c)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '24px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <a href="/client-health" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 13 }}>← Client Health</a>
                <a href="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 13 }}>🏠 Command Center</a>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
                📊 Client Insights
              </h1>
              <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>
                Aggregate analytics · {filteredClients.length} klanten · {formatCurrency(metrics.totalMRR)}/mnd MRR
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ fontSize: 12, color: '#6b7280' }}>Account Manager:</label>
              <select
                value={selectedAM}
                onChange={e => setSelectedAM(e.target.value)}
                style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#d1d5db', padding: '6px 12px', fontSize: 13 }}
              >
                <option value="all">Alle ({allClients.length})</option>
                {accountManagers.map(am => (
                  <option key={am} value={am}>{am} ({metrics.amCount[am] || 0})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 80px' }}>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total MRR', value: formatCurrency(metrics.totalMRR), sub: `ARR: ${formatCurrency(metrics.totalMRR * 12)}`, color: '#0047FF' },
            { label: 'Gemiddelde Health', value: `${metrics.avgHealth}/100`, sub: `${metrics.statusCounts.healthy} gezond`, color: metrics.avgHealth >= 70 ? '#10b981' : metrics.avgHealth >= 50 ? '#f59e0b' : '#ef4444' },
            { label: 'MRR at Risk', value: formatCurrency(metrics.mrrAtRisk), sub: `${metrics.statusCounts['at-risk'] + metrics.statusCounts.critical} klanten`, color: metrics.mrrAtRisk > 0 ? '#ef4444' : '#10b981' },
            { label: 'Active Alerts', value: `${metrics.totalAlerts}`, sub: `${metrics.highAlerts} high priority`, color: metrics.highAlerts > 0 ? '#ef4444' : '#f59e0b' },
            { label: 'Top Client Conc.', value: `${metrics.topClientPct}%`, sub: `Top 3: ${metrics.top3Pct}%`, color: metrics.topClientPct > 30 ? '#ef4444' : '#10b981' },
            { label: 'Avg Performance', value: `${metrics.avgPerformance}`, sub: `Budget: ${metrics.avgBudgetPacing}`, color: metrics.avgPerformance >= 70 ? '#10b981' : '#f59e0b' },
          ].map((kpi, i) => (
            <div key={i} style={{ background: '#0a0f1c', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '16px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{kpi.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
              <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts Row 1: Status Distribution + Revenue by Vertical + Platform Mix */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#d1d5db' }}>Status Verdeling</h3>
            <div style={{ maxWidth: 200, margin: '0 auto' }}>
              <Doughnut data={statusDoughnutData} options={doughnutOptions} />
            </div>
            <div style={{ marginTop: 16 }}>
              {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map(status => (
                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 12, color: STATUS_CONFIG[status].color }}>{STATUS_CONFIG[status].label}</span>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>{metrics.statusCounts[status]} · {formatCurrency(metrics.statusMRR[status])}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#d1d5db' }}>MRR per Vertical</h3>
            <Bar data={verticalBarData} options={barOptions} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
              {verticalLabels.slice(0, 6).map(v => (
                <div key={v} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                  <span style={{ color: VERTICAL_COLORS[v] || '#6b7280' }}>{v}</span>
                  <span style={{ color: '#9ca3af' }}>{metrics.verticalCount[v]}x · {formatCurrency(metrics.verticalMRR[v])}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#d1d5db' }}>Platform Mix</h3>
            <div style={{ maxWidth: 200, margin: '0 auto' }}>
              <Doughnut data={platformDoughnutData} options={doughnutOptions} />
            </div>
            <div style={{ marginTop: 16 }}>
              {platformLabels.map(p => (
                <div key={p} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 12, color: PLATFORM_COLORS[p] || '#6b7280' }}>{p}</span>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>{metrics.platformCount[p]} klanten</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Concentration (Pareto) */}
        <div style={{ ...sectionStyle, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#d1d5db' }}>💰 Revenue Concentratie (Pareto)</h3>
          <div style={{ height: 280 }}>
            <Bar data={concentrationData} options={concentrationOptions} />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#6b7280' }}>🔵 Top client: <strong style={{ color: '#f9fafb' }}>{metrics.sorted[0]?.clientName}</strong> ({metrics.topClientPct}%)</span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>📊 Top 3: <strong style={{ color: '#f9fafb' }}>{metrics.top3Pct}%</strong> van MRR</span>
            <span style={{ fontSize: 11, color: metrics.topClientPct > 25 ? '#ef4444' : '#10b981' }}>
              {metrics.topClientPct > 25 ? '⚠️ Hoge concentratie — diversificeer!' : '✅ Gezonde diversificatie'}
            </span>
          </div>
        </div>

        {/* Revenue Tiers + AM Distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#d1d5db' }}>📈 Revenue Tiers</h3>
            {Object.entries(metrics.tiers).map(([tier, cls]) => {
              const tierMRR = cls.reduce((s, c) => s + c.retainerValue, 0)
              const pct = metrics.totalMRR > 0 ? Math.round((tierMRR / metrics.totalMRR) * 100) : 0
              return (
                <div key={tier} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#d1d5db' }}>{tier}</span>
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{cls.length} klanten · {formatCurrency(tierMRR)}/mnd</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct > 40 ? '#0047FF' : pct > 20 ? '#3b82f6' : '#6b7280', borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>{pct}% van totale MRR</div>
                </div>
              )
            })}
          </div>

          <div style={sectionStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#d1d5db' }}>👥 Account Manager Verdeling</h3>
            {Object.entries(metrics.amMRR).sort((a, b) => b[1] - a[1]).map(([am, mrr]) => {
              const pct = metrics.totalMRR > 0 ? Math.round((mrr / metrics.totalMRR) * 100) : 0
              const count = metrics.amCount[am] || 0
              return (
                <div key={am} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#d1d5db' }}>{am}</span>
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{count} klanten · {formatCurrency(mrr)}/mnd</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#0047FF', borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>Avg health: {Math.round(filteredClients.filter(c => c.accountManager === am).reduce((s, c) => s + c.healthScore, 0) / count)}/100</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Tables: Churn Risks + Needs Report + Needs Meeting */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Churn Risks */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#ef4444' }}>🚨 Churn Risico ({metrics.churnRisks.length})</h3>
            {metrics.churnRisks.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', color: '#10b981', fontSize: 13 }}>✅ Geen churn risico&apos;s</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {metrics.churnRisks.slice(0, 8).map(cl => (
                  <a key={cl.slug} href={`/meeting-prep/${cl.slug}`} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(239,68,68,0.04)', borderRadius: 6, borderLeft: `3px solid ${STATUS_CONFIG[cl.status].color}` }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#f9fafb' }}>{cl.clientName}</div>
                      <div style={{ fontSize: 10, color: '#6b7280' }}>Health: {cl.healthScore} · {formatCurrency(cl.retainerValue)}/mnd</div>
                    </div>
                    <span style={{ fontSize: 20 }}>{cl.healthScore < 40 ? '🔴' : '🟠'}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Needs Report */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#f59e0b' }}>📋 Rapport Nodig ({metrics.needsReport.length})</h3>
            {metrics.needsReport.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', color: '#10b981', fontSize: 13 }}>✅ Alle rapporten up-to-date</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {metrics.needsReport.slice(0, 8).map(cl => {
                  const days = daysSince(cl.lastReportDate)
                  return (
                    <div key={cl.slug} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#f9fafb' }}>{cl.clientName}</div>
                        <div style={{ fontSize: 10, color: '#6b7280' }}>{cl.accountManager}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: days !== null && days > 30 ? '#ef4444' : '#f59e0b' }}>
                        {days !== null ? `${days}d geleden` : 'Nooit'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Needs Meeting */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#f59e0b' }}>📅 Meeting Nodig ({metrics.needsMeeting.length})</h3>
            {metrics.needsMeeting.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', color: '#10b981', fontSize: 13 }}>✅ Alle meetings op schema</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {metrics.needsMeeting.slice(0, 8).map(cl => {
                  const days = daysSince(cl.lastMeetingDate)
                  return (
                    <div key={cl.slug} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#f9fafb' }}>{cl.clientName}</div>
                        <div style={{ fontSize: 10, color: '#6b7280' }}>{cl.accountManager}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: days !== null && days > 30 ? '#ef4444' : '#f59e0b' }}>
                        {days !== null ? `${days}d geleden` : 'Nooit'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Upsell Candidates */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#10b981' }}>🚀 Upsell Kandidaten ({metrics.upsellCandidates.length})</h3>
          {metrics.upsellCandidates.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>Geen directe upsell kandidaten gevonden</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {metrics.upsellCandidates.map(cl => {
                const missing = ['meta', 'google', 'linkedin', 'tiktok'].filter(p => !cl.platforms.includes(p))
                return (
                  <div key={cl.slug} style={{ padding: '14px 16px', background: 'rgba(16,185,129,0.04)', borderRadius: 8, borderLeft: '3px solid #10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f9fafb' }}>{cl.clientName}</span>
                      <span style={{ fontSize: 12, color: '#10b981' }}>{cl.healthScore}/100</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>
                      {formatCurrency(cl.retainerValue)}/mnd · Performance: {cl.scores.performance}/100
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>
                      💡 Uitbreiden naar: {missing.slice(0, 2).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                    </div>
                    <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>
                      Est. upsell: +{formatCurrency(cl.retainerValue * 0.3)}/mnd
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#374151', fontSize: 11 }}>
          Client Insights · {filteredClients.length} klanten · {formatCurrency(metrics.totalMRR)}/mnd · Nodefy Cockpit
        </div>
      </div>
    </div>
  )
}
