'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, RadialLinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Bar, Doughnut, Radar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, RadialLinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

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
  healthy: { label: 'Gezond', emoji: '🟢', color: '#10b981', bg: '#052e16', border: '#14532d' },
  attention: { label: 'Aandacht', emoji: '🟡', color: '#f59e0b', bg: '#451a03', border: '#78350f' },
  'at-risk': { label: 'Risico', emoji: '🟠', color: '#f97316', bg: '#431407', border: '#9a3412' },
  critical: { label: 'Kritiek', emoji: '🔴', color: '#ef4444', bg: '#450a0a', border: '#7f1d1d' },
}

const VERTICAL_ICONS: Record<string, string> = {
  'e-commerce': '🛒', 'hospitality': '🏨', 'saas': '💻', 'b2b': '🏢',
  'retail': '🏪', 'finance': '💰', 'healthcare': '🏥', 'education': '📚',
  'food': '🍕', 'fashion': '👗', 'automotive': '🚗', 'real-estate': '🏠',
  'default': '📊',
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#f59e0b'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatCurrency(val: number): string {
  return `€${val.toLocaleString('nl-NL')}`
}

export default function ClientHealthPage() {
  const [data, setData] = useState<Record<string, ClientHealth>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'at-risk' | 'attention' | 'healthy'>('all')
  const [sortBy, setSortBy] = useState<'healthScore' | 'retainerValue' | 'clientName'>('healthScore')
  const [selectedClient, setSelectedClient] = useState<ClientHealth | null>(null)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetch('/api/client-health')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) setData(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const clients = useMemo(() => {
    let list = Object.values(data)
    if (filter === 'at-risk') list = list.filter(c => c.status === 'at-risk' || c.status === 'critical')
    else if (filter === 'attention') list = list.filter(c => c.status === 'attention')
    else if (filter === 'healthy') list = list.filter(c => c.status === 'healthy')

    list.sort((a, b) => {
      if (sortBy === 'healthScore') return a.healthScore - b.healthScore // lowest first for attention
      if (sortBy === 'retainerValue') return b.retainerValue - a.retainerValue
      return a.clientName.localeCompare(b.clientName)
    })
    return list
  }, [data, filter, sortBy])

  const allClients = Object.values(data)
  const summary = useMemo(() => {
    const healthy = allClients.filter(c => c.status === 'healthy').length
    const attention = allClients.filter(c => c.status === 'attention').length
    const atRisk = allClients.filter(c => c.status === 'at-risk' || c.status === 'critical').length
    const totalRevenue = allClients.reduce((s, c) => s + c.retainerValue, 0)
    const atRiskRevenue = allClients.filter(c => c.status === 'at-risk' || c.status === 'critical').reduce((s, c) => s + c.retainerValue, 0)
    const avgHealth = allClients.length > 0 ? Math.round(allClients.reduce((s, c) => s + c.healthScore, 0) / allClients.length) : 0
    const totalAlerts = allClients.reduce((s, c) => s + c.alerts.length, 0)
    const highAlerts = allClients.reduce((s, c) => s + c.alerts.filter(a => a.severity === 'high').length, 0)
    return { total: allClients.length, healthy, attention, atRisk, totalRevenue, atRiskRevenue, avgHealth, totalAlerts, highAlerts }
  }, [allClients])

  // Status distribution doughnut
  const statusData = {
    labels: ['Gezond', 'Aandacht', 'Risico/Kritiek'],
    datasets: [{
      data: [summary.healthy, summary.attention, summary.atRisk],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
      cutout: '70%',
    }]
  }

  // Revenue at risk bar
  const revenueData = {
    labels: ['Gezond', 'Aandacht', 'Risico'],
    datasets: [{
      label: 'MRR',
      data: [
        allClients.filter(c => c.status === 'healthy').reduce((s, c) => s + c.retainerValue, 0),
        allClients.filter(c => c.status === 'attention').reduce((s, c) => s + c.retainerValue, 0),
        allClients.filter(c => c.status === 'at-risk' || c.status === 'critical').reduce((s, c) => s + c.retainerValue, 0),
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderRadius: 6,
      borderSkipped: false,
    }]
  }

  // Radar for selected client
  const radarData = selectedClient ? {
    labels: ['Performance', 'Budget Pacing', 'Communicatie', 'Retentie'],
    datasets: [{
      label: selectedClient.clientName,
      data: [selectedClient.scores.performance, selectedClient.scores.budgetPacing, selectedClient.scores.communication, selectedClient.scores.retention],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: '#3b82f6',
      borderWidth: 2,
      pointBackgroundColor: '#3b82f6',
      pointRadius: 4,
    }]
  } : null

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#f1f5f9' }}>
      <style>{`
        .ch-container { max-width: 1200px; margin: 0 auto; padding: 32px 24px 80px; }
        .ch-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 28px; }
        .ch-title { font-size: 28px; font-weight: 800; }
        .ch-subtitle { color: #94a3b8; font-size: 14px; margin-top: 4px; }

        .summary-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .sum-card { background: #1e293b; border-radius: 14px; padding: 18px 22px; border: 1px solid #334155; }
        .sum-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; margin-bottom: 6px; }
        .sum-val { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }

        .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .chart-box { background: #1e293b; border-radius: 14px; padding: 24px; border: 1px solid #334155; }
        .chart-title { font-size: 14px; font-weight: 700; margin-bottom: 14px; color: #e2e8f0; }
        .chart-wrap { height: 220px; position: relative; }
        .doughnut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none; }

        .controls { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; align-items: center; }
        .ctrl-btn { padding: 7px 14px; border-radius: 8px; border: none; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.15s; }
        .ctrl-btn.active { background: #2563eb; color: #fff; }
        .ctrl-btn:not(.active) { background: #1e293b; color: #94a3b8; border: 1px solid #334155; }
        .ctrl-select { padding: 7px 12px; border-radius: 8px; background: #1e293b; color: #94a3b8; border: 1px solid #334155; font-size: 12px; cursor: pointer; }
        .ctrl-sep { width: 1px; height: 24px; background: #334155; margin: 0 4px; }

        .client-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
        .client-list { display: grid; gap: 8px; }
        .c-card { background: #1e293b; border-radius: 14px; padding: 20px; border: 1px solid #334155; cursor: pointer; transition: all 0.15s; }
        .c-card:hover { border-color: #475569; transform: translateY(-1px); }
        .c-card-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .c-name { font-weight: 700; font-size: 16px; }
        .c-vertical { font-size: 12px; color: #64748b; margin-top: 2px; }
        .c-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.03em; white-space: nowrap; }
        .c-scores { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0; }
        .c-score { text-align: center; }
        .c-score-val { font-size: 20px; font-weight: 800; }
        .c-score-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .c-meta { display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; color: #94a3b8; margin-top: 10px; }
        .c-meta-item { display: flex; align-items: center; gap: 4px; }
        .c-alerts { display: flex; gap: 4px; margin-top: 8px; flex-wrap: wrap; }
        .c-alert-badge { padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; }

        .c-row { background: #1e293b; border-radius: 10px; padding: 14px 20px; border: 1px solid #334155; display: grid; grid-template-columns: 60px 200px 1fr 120px 100px 80px; gap: 14px; align-items: center; cursor: pointer; transition: all 0.15s; }
        .c-row:hover { border-color: #475569; }

        .detail-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .detail-modal { background: #1e293b; border-radius: 20px; padding: 32px; max-width: 640px; width: 100%; border: 1px solid #334155; max-height: 90vh; overflow-y: auto; }
        .detail-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .detail-name { font-size: 24px; font-weight: 800; }
        .detail-close { background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; padding: 4px 8px; }
        .detail-section { margin-bottom: 20px; }
        .detail-section-title { font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
        .detail-radar { height: 240px; margin: 0 auto; max-width: 320px; }
        .detail-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .detail-info { padding: 12px 16px; background: #0f172a; border-radius: 10px; }
        .detail-info-label { font-size: 10px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
        .detail-info-val { font-size: 15px; font-weight: 700; }
        .detail-alert { padding: 10px 14px; border-radius: 8px; margin-bottom: 6px; font-size: 13px; display: flex; align-items: center; gap: 8px; }
        .detail-notes { padding: 14px; background: #0f172a; border-radius: 10px; font-size: 13px; color: #94a3b8; line-height: 1.5; }

        @media (max-width: 768px) {
          .charts-row { grid-template-columns: 1fr; }
          .client-grid { grid-template-columns: 1fr; }
          .c-row { grid-template-columns: 1fr; gap: 8px; }
          .summary-row { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="ch-container">
        {/* Header */}
        <div className="ch-header">
          <div>
            <h1 className="ch-title">❤️‍🩹 Client Health</h1>
            <div className="ch-subtitle">
              {allClients.length} klanten · Gemiddelde health score: {summary.avgHealth}/100
            </div>
          </div>
          <a href="/" style={{ padding: '8px 16px', borderRadius: 8, background: '#1e293b', color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600, border: '1px solid #334155' }}>
            ← Cockpit
          </a>
        </div>

        {/* Summary Cards */}
        <div className="summary-row">
          <div className="sum-card">
            <div className="sum-label">Gemiddelde Score</div>
            <div className="sum-val" style={{ color: getScoreColor(summary.avgHealth) }}>{summary.avgHealth}</div>
          </div>
          <div className="sum-card">
            <div className="sum-label">🟢 Gezond</div>
            <div className="sum-val" style={{ color: '#10b981' }}>{summary.healthy}</div>
          </div>
          <div className="sum-card">
            <div className="sum-label">🟡 Aandacht</div>
            <div className="sum-val" style={{ color: '#f59e0b' }}>{summary.attention}</div>
          </div>
          <div className="sum-card">
            <div className="sum-label">🔴 Risico</div>
            <div className="sum-val" style={{ color: '#ef4444' }}>{summary.atRisk}</div>
          </div>
          <div className="sum-card">
            <div className="sum-label">Totale MRR</div>
            <div className="sum-val" style={{ color: '#f1f5f9' }}>{formatCurrency(summary.totalRevenue)}</div>
          </div>
          <div className="sum-card">
            <div className="sum-label">🚨 MRR at Risk</div>
            <div className="sum-val" style={{ color: '#ef4444' }}>{formatCurrency(summary.atRiskRevenue)}</div>
          </div>
        </div>

        {/* Charts */}
        {allClients.length > 0 && (
          <div className="charts-row">
            <div className="chart-box">
              <div className="chart-title">Status Verdeling</div>
              <div className="chart-wrap" style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: 220 }}>
                  <Doughnut data={statusData} options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, usePointStyle: true, font: { size: 12 } } },
                      tooltip: { backgroundColor: '#0f172a', padding: 10, cornerRadius: 8 },
                    },
                  }} />
                  <div className="doughnut-center">
                    <div style={{ fontSize: 32, fontWeight: 800 }}>{summary.total}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>KLANTEN</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="chart-box">
              <div className="chart-title">MRR per Status</div>
              <div className="chart-wrap">
                <Bar data={revenueData} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { backgroundColor: '#0f172a', padding: 10, cornerRadius: 8, callbacks: { label: (ctx) => `€${(ctx.parsed.y ?? 0).toLocaleString('nl-NL')}/mnd` } },
                  },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 12 } } },
                    y: { grid: { color: '#1e293b22' }, ticks: { color: '#64748b', callback: (v) => `€${(Number(v) / 1000).toFixed(0)}K` } },
                  },
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="controls">
          {(['all', 'at-risk', 'attention', 'healthy'] as const).map(f => (
            <button key={f} className={`ctrl-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? `Alle (${allClients.length})` : f === 'at-risk' ? `🔴 Risico (${summary.atRisk})` : f === 'attention' ? `🟡 Aandacht (${summary.attention})` : `🟢 Gezond (${summary.healthy})`}
            </button>
          ))}
          <div className="ctrl-sep" />
          <select className="ctrl-select" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}>
            <option value="healthScore">Sorteer: Health Score ↑</option>
            <option value="retainerValue">Sorteer: MRR ↓</option>
            <option value="clientName">Sorteer: Naam A-Z</option>
          </select>
          <div className="ctrl-sep" />
          <button className={`ctrl-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>▦ Grid</button>
          <button className={`ctrl-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>☰ Lijst</button>
        </div>

        {/* Loading / Empty */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            Laden...
          </div>
        ) : allClients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❤️‍🩹</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Geen client health data</div>
            <div>Gebruik de API (<code>/api/client-health</code>) om client data te laden.</div>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {view === 'grid' && (
              <div className="client-grid">
                {clients.map(client => {
                  const sc = STATUS_CONFIG[client.status]
                  const vertIcon = VERTICAL_ICONS[client.vertical?.toLowerCase()] || VERTICAL_ICONS.default
                  const daysContract = daysUntil(client.contractEnd)
                  const daysReport = daysSince(client.lastReportDate)
                  const daysMeeting = daysSince(client.lastMeetingDate)
                  return (
                    <div key={client.slug} className="c-card" onClick={() => setSelectedClient(client)}>
                      <div className="c-card-head">
                        <div>
                          <div className="c-name">{vertIcon} {client.clientName}</div>
                          <div className="c-vertical">{client.vertical} · {formatCurrency(client.retainerValue)}/mnd · {client.accountManager}</div>
                        </div>
                        <span className="c-badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                          {sc.emoji} {client.healthScore}
                        </span>
                      </div>
                      <div className="c-scores">
                        {[
                          { label: 'Perf', val: client.scores.performance },
                          { label: 'Budget', val: client.scores.budgetPacing },
                          { label: 'Comm', val: client.scores.communication },
                          { label: 'Retentie', val: client.scores.retention },
                        ].map(s => (
                          <div key={s.label} className="c-score">
                            <div className="c-score-val" style={{ color: getScoreColor(s.val) }}>{s.val}</div>
                            <div className="c-score-label">{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="c-meta">
                        {client.platforms.map(p => (
                          <span key={p} className="c-meta-item" style={{ background: '#0f172a', padding: '2px 8px', borderRadius: 6 }}>
                            {p === 'meta' ? '📘' : p === 'google' ? '🔍' : p === 'linkedin' ? '💼' : '📊'} {p}
                          </span>
                        ))}
                        {daysReport !== null && (
                          <span className="c-meta-item" style={{ color: daysReport > 30 ? '#ef4444' : daysReport > 14 ? '#f59e0b' : '#94a3b8' }}>
                            📋 {daysReport}d geleden
                          </span>
                        )}
                        {daysContract !== null && daysContract < 60 && (
                          <span className="c-meta-item" style={{ color: daysContract < 30 ? '#ef4444' : '#f59e0b' }}>
                            ⏰ {daysContract}d tot einde
                          </span>
                        )}
                      </div>
                      {client.alerts.length > 0 && (
                        <div className="c-alerts">
                          {client.alerts.slice(0, 3).map((a, i) => (
                            <span key={i} className="c-alert-badge" style={{
                              background: a.severity === 'high' ? '#450a0a' : a.severity === 'medium' ? '#451a03' : '#1e293b',
                              color: a.severity === 'high' ? '#ef4444' : a.severity === 'medium' ? '#f59e0b' : '#94a3b8',
                            }}>
                              {a.severity === 'high' ? '🔴' : a.severity === 'medium' ? '🟡' : '🔵'} {a.type}
                            </span>
                          ))}
                          {client.alerts.length > 3 && (
                            <span className="c-alert-badge" style={{ background: '#1e293b', color: '#64748b' }}>+{client.alerts.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* List View */}
            {view === 'list' && (
              <div className="client-list">
                <div className="c-row" style={{ background: 'transparent', border: 'none', cursor: 'default', padding: '8px 20px' }}>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Score</div>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Klant</div>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Scores</div>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>MRR</div>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Platforms</div>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Alerts</div>
                </div>
                {clients.map(client => {
                  const sc = STATUS_CONFIG[client.status]
                  return (
                    <div key={client.slug} className="c-row" onClick={() => setSelectedClient(client)}>
                      <div>
                        <span className="c-badge" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontSize: 14, fontWeight: 800, padding: '6px 12px' }}>
                          {client.healthScore}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{client.clientName}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{client.vertical} · {client.accountManager}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[
                          { l: 'P', v: client.scores.performance },
                          { l: 'B', v: client.scores.budgetPacing },
                          { l: 'C', v: client.scores.communication },
                          { l: 'R', v: client.scores.retention },
                        ].map(s => (
                          <div key={s.l} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: getScoreColor(s.v) }}>{s.v}</div>
                            <div style={{ fontSize: 9, color: '#64748b' }}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{formatCurrency(client.retainerValue)}</div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {client.platforms.map(p => (
                          <span key={p} style={{ fontSize: 14 }}>{p === 'meta' ? '📘' : p === 'google' ? '🔍' : p === 'linkedin' ? '💼' : '📊'}</span>
                        ))}
                      </div>
                      <div>
                        {client.alerts.length > 0 ? (
                          <span style={{ background: '#450a0a', color: '#ef4444', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                            {client.alerts.length}
                          </span>
                        ) : (
                          <span style={{ color: '#334155', fontSize: 12 }}>—</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedClient && (
        <div className="detail-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedClient(null) }}>
          <div className="detail-modal">
            <div className="detail-head">
              <div>
                <div className="detail-name">
                  {VERTICAL_ICONS[selectedClient.vertical?.toLowerCase()] || '📊'} {selectedClient.clientName}
                </div>
                <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
                  {selectedClient.vertical} · {selectedClient.accountManager} · {formatCurrency(selectedClient.retainerValue)}/mnd
                </div>
              </div>
              <button className="detail-close" onClick={() => setSelectedClient(null)}>✕</button>
            </div>

            {/* Health Score */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 100, height: 100, borderRadius: '50%',
                background: `conic-gradient(${getScoreColor(selectedClient.healthScore)} ${selectedClient.healthScore * 3.6}deg, #1e293b 0deg)`,
                position: 'relative',
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', background: '#1e293b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column',
                }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: getScoreColor(selectedClient.healthScore) }}>{selectedClient.healthScore}</div>
                  <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase' }}>Health</div>
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <span className="c-badge" style={{
                  background: STATUS_CONFIG[selectedClient.status].bg,
                  color: STATUS_CONFIG[selectedClient.status].color,
                  border: `1px solid ${STATUS_CONFIG[selectedClient.status].border}`,
                  fontSize: 13, padding: '5px 14px',
                }}>
                  {STATUS_CONFIG[selectedClient.status].emoji} {STATUS_CONFIG[selectedClient.status].label}
                </span>
              </div>
            </div>

            {/* Radar */}
            {radarData && (
              <div className="detail-section">
                <div className="detail-section-title">Score Breakdown</div>
                <div className="detail-radar">
                  <Radar data={radarData} options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      r: {
                        min: 0, max: 100,
                        ticks: { display: false, stepSize: 20 },
                        grid: { color: '#334155' },
                        angleLines: { color: '#334155' },
                        pointLabels: { color: '#94a3b8', font: { size: 12, weight: 'bold' } },
                      }
                    },
                  }} />
                </div>
              </div>
            )}

            {/* Info Grid */}
            <div className="detail-section">
              <div className="detail-section-title">Details</div>
              <div className="detail-info-grid">
                <div className="detail-info">
                  <div className="detail-info-label">Contract Start</div>
                  <div className="detail-info-val">{formatDate(selectedClient.contractStart)}</div>
                </div>
                <div className="detail-info">
                  <div className="detail-info-label">Contract Einde</div>
                  <div className="detail-info-val">{selectedClient.contractEnd ? formatDate(selectedClient.contractEnd) : 'Doorlopend'}</div>
                </div>
                <div className="detail-info">
                  <div className="detail-info-label">Laatste Rapport</div>
                  <div className="detail-info-val" style={{ color: daysSince(selectedClient.lastReportDate) !== null && daysSince(selectedClient.lastReportDate)! > 30 ? '#ef4444' : '#f1f5f9' }}>
                    {selectedClient.lastReportDate ? `${formatDate(selectedClient.lastReportDate)} (${daysSince(selectedClient.lastReportDate)}d)` : '—'}
                  </div>
                </div>
                <div className="detail-info">
                  <div className="detail-info-label">Volgende Meeting</div>
                  <div className="detail-info-val">
                    {selectedClient.nextMeetingDate ? formatDate(selectedClient.nextMeetingDate) : '—'}
                  </div>
                </div>
                <div className="detail-info">
                  <div className="detail-info-label">Platforms</div>
                  <div className="detail-info-val">{selectedClient.platforms.join(', ')}</div>
                </div>
                <div className="detail-info">
                  <div className="detail-info-label">Retainer</div>
                  <div className="detail-info-val">{formatCurrency(selectedClient.retainerValue)}/mnd</div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {selectedClient.alerts.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">Alerts ({selectedClient.alerts.length})</div>
                {selectedClient.alerts.map((a, i) => (
                  <div key={i} className="detail-alert" style={{
                    background: a.severity === 'high' ? '#450a0a' : a.severity === 'medium' ? '#451a03' : '#1e293b',
                    border: `1px solid ${a.severity === 'high' ? '#7f1d1d' : a.severity === 'medium' ? '#78350f' : '#334155'}`,
                  }}>
                    <span>{a.severity === 'high' ? '🔴' : a.severity === 'medium' ? '🟡' : '🔵'}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{a.type}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{a.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Links */}
            <div className="detail-section">
              <div className="detail-section-title">Quick Links</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a href={`/meeting-prep/${selectedClient.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 14px', background: '#0047FF', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                  📋 Meeting Prep
                </a>
                <a href={`/portal/${selectedClient.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 14px', background: '#0f172a', borderRadius: 8, color: '#94a3b8', fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid #334155' }}>
                  🌐 Client Portal
                </a>
                <a href={`/client-report/${selectedClient.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 14px', background: '#0f172a', borderRadius: 8, color: '#94a3b8', fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid #334155' }}>
                  📊 Performance Report
                </a>
                <a href="/client-insights" target="_blank" rel="noopener noreferrer" style={{ padding: '8px 14px', background: '#0f172a', borderRadius: 8, color: '#94a3b8', fontSize: 12, fontWeight: 600, textDecoration: 'none', border: '1px solid #334155' }}>
                  📈 Insights
                </a>
              </div>
            </div>

            {/* Notes */}
            {selectedClient.notes && (
              <div className="detail-section">
                <div className="detail-section-title">Notities</div>
                <div className="detail-notes">{selectedClient.notes}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
