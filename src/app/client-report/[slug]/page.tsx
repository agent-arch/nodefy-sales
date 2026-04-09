'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

// ============================================
// NODEFY CLIENT PERFORMANCE REPORT v2
// Enhanced with charts, budget pacing, print CSS
// ============================================

interface MetricGroup {
  platform: string
  data: Record<string, string | number>
}

interface TrendPoint {
  label: string // e.g. "Week 1", "Maart", "Q1"
  values: Record<string, number> // e.g. { spend: 1200, conversions: 45, roas: 3.2 }
}

interface BudgetPacing {
  platform: string
  monthlyBudget: number
  spent: number
  daysInMonth: number
  daysPassed: number
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
    accentColor?: string
    logoUrl: string | null
  }
  // v2 fields
  trends?: TrendPoint[]
  trendMetrics?: string[] // which metrics to chart from trends
  budgetPacing?: BudgetPacing[]
  kpiSummary?: { label: string; value: string; change?: string; good?: boolean }[]
  executiveSummary?: string
  periodComparison?: {
    current: string
    previous: string
    changes: { metric: string; current: number; previous: number; unit?: string }[]
  }
}

// ---- Utility Functions ----

function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace('Ctr', 'CTR').replace('Cpc', 'CPC').replace('Roas', 'ROAS').replace('Cpa', 'CPA')
    .replace('Poas', 'POAS')
}

function changeDirection(val: string): 'up' | 'down' | 'neutral' {
  if (!val) return 'neutral'
  const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''))
  if (isNaN(num) || num === 0) return 'neutral'
  return num > 0 ? 'up' : 'down'
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Chart color palette
const CHART_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

// ---- Components ----

function PlatformIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase()
  if (p.includes('facebook') || p.includes('meta')) return <span className="platform-icon">📘</span>
  if (p.includes('google')) return <span className="platform-icon">🔍</span>
  if (p.includes('linkedin')) return <span className="platform-icon">💼</span>
  if (p.includes('tiktok')) return <span className="platform-icon">🎵</span>
  if (p.includes('budget') || p.includes('pacing')) return <span className="platform-icon">💰</span>
  return <span className="platform-icon">📊</span>
}

function KPICard({ label, value, change, good }: { label: string; value: string; change?: string; good?: boolean }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {change && (
        <div className={`kpi-change ${good === true ? 'positive' : good === false ? 'negative' : ''}`}>
          {good === true ? '↑' : good === false ? '↓' : '→'} {change}
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, change }: { label: string; value: string | number; change?: string }) {
  const dir = change ? changeDirection(change) : 'neutral'
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {change && (
        <div className={`metric-change ${dir === 'up' ? 'positive' : dir === 'down' ? 'negative' : ''}`}>
          {dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→'} {change} vs vorige periode
        </div>
      )}
    </div>
  )
}

function BudgetPacingChart({ pacing, primaryColor }: { pacing: BudgetPacing[]; primaryColor: string }) {
  return (
    <div className="section">
      <h2 className="section-title"><span className="section-icon">💰</span> Budget Pacing</h2>
      <div className="budget-grid">
        {pacing.map((p, i) => {
          const pct = Math.round((p.spent / p.monthlyBudget) * 100)
          const expectedPct = Math.round((p.daysPassed / p.daysInMonth) * 100)
          const isOver = pct > expectedPct + 10
          const isUnder = pct < expectedPct - 15
          const status = isOver ? 'overpacing' : isUnder ? 'underpacing' : 'on-track'
          const remaining = p.monthlyBudget - p.spent
          const dailyRemaining = remaining / Math.max(1, p.daysInMonth - p.daysPassed)
          
          const doughnutData = {
            labels: ['Besteed', 'Resterend'],
            datasets: [{
              data: [p.spent, Math.max(0, remaining)],
              backgroundColor: [
                status === 'overpacing' ? '#ef4444' : status === 'underpacing' ? '#f59e0b' : primaryColor,
                '#e5e7eb'
              ],
              borderWidth: 0,
              cutout: '75%',
            }]
          }
          
          return (
            <div key={i} className={`budget-card budget-${status}`}>
              <div className="budget-header">
                <PlatformIcon platform={p.platform} />
                <span className="budget-platform">{p.platform}</span>
                <span className={`budget-badge badge-${status}`}>
                  {status === 'on-track' ? '✅ On Track' : status === 'overpacing' ? '⚠️ Over' : '🔻 Under'}
                </span>
              </div>
              <div className="budget-chart-row">
                <div className="budget-doughnut">
                  <Doughnut data={doughnutData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                  }} />
                  <div className="budget-doughnut-label">
                    <span className="budget-pct">{pct}%</span>
                    <span className="budget-pct-sub">besteed</span>
                  </div>
                </div>
                <div className="budget-details">
                  <div className="budget-row">
                    <span>Budget</span>
                    <strong>€{p.monthlyBudget.toLocaleString('nl-NL')}</strong>
                  </div>
                  <div className="budget-row">
                    <span>Besteed</span>
                    <strong>€{p.spent.toLocaleString('nl-NL')}</strong>
                  </div>
                  <div className="budget-row">
                    <span>Resterend</span>
                    <strong>€{Math.max(0, remaining).toLocaleString('nl-NL')}</strong>
                  </div>
                  <div className="budget-row budget-row-highlight">
                    <span>Dag {p.daysPassed}/{p.daysInMonth}</span>
                    <strong>~€{Math.round(dailyRemaining).toLocaleString('nl-NL')}/dag</strong>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TrendChart({ trends, metrics, primaryColor }: { trends: TrendPoint[]; metrics: string[]; primaryColor: string }) {
  const labels = trends.map(t => t.label)
  
  const datasets = metrics.map((metric, i) => ({
    label: formatKey(metric),
    data: trends.map(t => t.values[metric] ?? 0),
    borderColor: CHART_COLORS[i % CHART_COLORS.length],
    backgroundColor: hexToRgba(CHART_COLORS[i % CHART_COLORS.length], 0.1),
    fill: i === 0,
    tension: 0.3,
    pointRadius: 4,
    pointHoverRadius: 6,
    borderWidth: 2.5,
  }))

  return (
    <div className="section">
      <h2 className="section-title"><span className="section-icon">📈</span> Trends</h2>
      <div className="chart-container">
        <Line
          data={{ labels, datasets }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
              legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, pointStyle: 'circle', font: { size: 12 } } },
              tooltip: {
                backgroundColor: '#1e293b',
                titleFont: { size: 13, weight: 'bold' },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 8,
              },
            },
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 12 } } },
              y: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 } } },
            },
          }}
        />
      </div>
    </div>
  )
}

function PeriodComparison({ comparison, primaryColor }: { comparison: NonNullable<ClientReport['periodComparison']>; primaryColor: string }) {
  const labels = comparison.changes.map(c => formatKey(c.metric))
  const currentData = comparison.changes.map(c => c.current)
  const previousData = comparison.changes.map(c => c.previous)
  
  return (
    <div className="section">
      <h2 className="section-title"><span className="section-icon">⚖️</span> Periode Vergelijking</h2>
      <div className="comparison-legend">
        <span className="legend-dot" style={{ background: primaryColor }}></span> {comparison.current}
        <span className="legend-dot" style={{ background: '#d1d5db', marginLeft: 16 }}></span> {comparison.previous}
      </div>
      <div className="chart-container">
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: comparison.current,
                data: currentData,
                backgroundColor: hexToRgba(primaryColor, 0.85),
                borderRadius: 6,
                borderSkipped: false,
              },
              {
                label: comparison.previous,
                data: previousData,
                backgroundColor: '#d1d5db',
                borderRadius: 6,
                borderSkipped: false,
              },
            ]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1e293b',
                padding: 12,
                cornerRadius: 8,
              },
            },
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 11 } } },
              y: { grid: { color: '#f0f0f0' }, beginAtZero: true },
            },
          }}
        />
      </div>
      {/* Comparison table */}
      <div className="comparison-table">
        {comparison.changes.map((c, i) => {
          const pctChange = c.previous > 0 ? ((c.current - c.previous) / c.previous * 100) : 0
          const isPositive = pctChange > 0
          return (
            <div key={i} className="comparison-row">
              <span className="comparison-metric">{formatKey(c.metric)}</span>
              <span className="comparison-prev">{c.unit === '€' ? '€' : ''}{c.previous.toLocaleString('nl-NL')}{c.unit === '%' ? '%' : ''}</span>
              <span className="comparison-arrow">→</span>
              <span className="comparison-curr">{c.unit === '€' ? '€' : ''}{c.current.toLocaleString('nl-NL')}{c.unit === '%' ? '%' : ''}</span>
              <span className={`comparison-pct ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? '+' : ''}{pctChange.toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---- Main Page ----

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
            setError(data.error === 'Report expired' 
              ? 'Dit rapport is verlopen. Neem contact op met Nodefy voor een actueel rapport.' 
              : 'Rapport niet gevonden.')
          }
          setLoading(false)
        })
        .catch(() => { setError('Kan rapport niet laden.'); setLoading(false) })
    })
  }, [params])

  if (loading) {
    return (
      <div className="report-loading">
        <div className="spinner" />
        <div className="loading-text">Rapport laden...</div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="report-error-container">
        <div className="report-error-card">
          <div className="error-icon">📋</div>
          <h2>Rapport niet beschikbaar</h2>
          <p>{error}</p>
          <div className="error-footer">
            <a href="https://nodefy.nl">nodefy.nl</a> — Performance Marketing
          </div>
        </div>
      </div>
    )
  }

  const primaryColor = report.branding?.primaryColor || '#2563eb'
  const accentColor = report.branding?.accentColor || '#10b981'

  return (
    <>
      <style>{`
        /* ---- CSS Reset & Base ---- */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body { 
          background: #f8fafc; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
          color: #1e293b;
          -webkit-font-smoothing: antialiased;
        }

        /* ---- Loading ---- */
        .report-loading {
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center; background: #f8fafc;
        }
        .spinner {
          width: 48px; height: 48px; border: 3px solid #e5e7eb; border-top-color: ${primaryColor};
          border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px;
        }
        @keyframes spin { to { transform: rotate(360deg) } }
        .loading-text { color: #6b7280; font-size: 14px; }

        /* ---- Error ---- */
        .report-error-container {
          min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc;
        }
        .report-error-card {
          text-align: center; max-width: 400px; padding: 48px; background: #fff;
          border-radius: 20px; box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        .error-icon { font-size: 48px; margin-bottom: 16px; }
        .report-error-card h2 { color: #111827; margin-bottom: 8px; }
        .report-error-card p { color: #6b7280; line-height: 1.6; }
        .error-footer { margin-top: 24px; font-size: 13px; color: #9ca3af; }
        .error-footer a { color: ${primaryColor}; text-decoration: none; }

        /* ---- Header ---- */
        .report-header {
          background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc);
          color: #fff; padding: 56px 0 64px; position: relative; overflow: hidden;
        }
        .report-header::before {
          content: ''; position: absolute; top: -50%; right: -10%; width: 50%; height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);
        }
        .header-inner {
          max-width: 1000px; margin: 0 auto; padding: 0 28px; position: relative; z-index: 1;
          display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px;
        }
        .header-badge {
          font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.8;
          font-weight: 600; margin-bottom: 8px;
        }
        .header-title { font-size: 40px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
        .header-period { margin-top: 12px; font-size: 15px; opacity: 0.9; display: flex; align-items: center; gap: 6px; }
        .header-right { text-align: right; opacity: 0.9; }
        .header-right .label { font-size: 12px; margin-bottom: 2px; }
        .header-right .date { font-size: 15px; font-weight: 600; }
        .header-powered { margin-top: 16px; font-size: 13px; }
        .header-powered strong { font-weight: 700; }

        ${report.branding?.logoUrl ? `
        .client-logo { 
          height: 48px; margin-bottom: 16px; filter: brightness(0) invert(1); opacity: 0.9;
        }` : ''}

        /* ---- Print Button ---- */
        .print-btn {
          position: fixed; bottom: 24px; right: 24px; z-index: 100;
          background: ${primaryColor}; color: #fff; border: none; border-radius: 12px;
          padding: 12px 20px; font-size: 14px; font-weight: 600; cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.15s, box-shadow 0.15s;
          display: flex; align-items: center; gap: 8px;
        }
        .print-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }

        /* ---- Main Content ---- */
        .report-main {
          max-width: 1000px; margin: -36px auto 0; padding: 0 28px 80px; position: relative;
        }

        /* ---- KPI Summary ---- */
        .kpi-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px; margin-bottom: 24px;
        }
        .kpi-card {
          background: #fff; border-radius: 14px; padding: 24px 28px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04); border: 1px solid #f1f5f9;
          transition: box-shadow 0.2s;
        }
        .kpi-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .kpi-label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px; }
        .kpi-value { font-size: 32px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; }
        .kpi-change { font-size: 13px; margin-top: 6px; font-weight: 600; color: #64748b; }
        .kpi-change.positive { color: #10b981; }
        .kpi-change.negative { color: #ef4444; }

        /* ---- Sections ---- */
        .section {
          background: #fff; border-radius: 16px; padding: 32px;
          margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          border: 1px solid #f1f5f9;
        }
        .section-title {
          font-size: 20px; font-weight: 700; color: #0f172a;
          display: flex; align-items: center; gap: 10px; margin-bottom: 24px;
        }
        .section-icon { font-size: 20px; }

        /* ---- Executive Summary ---- */
        .executive-summary {
          font-size: 15px; line-height: 1.8; color: #374151;
          padding: 20px 24px; background: #f8fafc; border-radius: 12px;
          border-left: 4px solid ${primaryColor};
        }

        /* ---- Metric Cards Grid ---- */
        .metrics-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px;
        }
        .metric-card {
          background: #f8fafc; border-radius: 12px; padding: 20px 24px;
          border: 1px solid #e2e8f0; transition: border-color 0.2s;
        }
        .metric-card:hover { border-color: ${primaryColor}44; }
        .metric-label { font-size: 12px; color: #64748b; font-weight: 500; margin-bottom: 8px; }
        .metric-value { font-size: 26px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; }
        .metric-change { font-size: 12px; margin-top: 6px; font-weight: 600; color: #64748b; }
        .metric-change.positive { color: #10b981; }
        .metric-change.negative { color: #ef4444; }

        /* ---- Chart ---- */
        .chart-container { height: 320px; position: relative; margin-top: 8px; }

        /* ---- Budget Pacing ---- */
        .budget-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
        .budget-card {
          background: #f8fafc; border-radius: 14px; padding: 24px;
          border: 1px solid #e2e8f0;
        }
        .budget-card.budget-overpacing { border-color: #fca5a5; background: #fef2f2; }
        .budget-card.budget-underpacing { border-color: #fed7aa; background: #fffbeb; }
        .budget-card.budget-on-track { border-color: #a7f3d0; background: #f0fdf4; }
        .budget-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .budget-platform { font-weight: 700; font-size: 15px; flex: 1; }
        .budget-badge {
          font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px;
        }
        .badge-on-track { background: #dcfce7; color: #166534; }
        .badge-overpacing { background: #fee2e2; color: #991b1b; }
        .badge-underpacing { background: #fef3c7; color: #92400e; }
        .budget-chart-row { display: flex; gap: 24px; align-items: center; }
        .budget-doughnut { width: 110px; height: 110px; position: relative; flex-shrink: 0; }
        .budget-doughnut-label {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          text-align: center;
        }
        .budget-pct { font-size: 22px; font-weight: 800; display: block; color: #0f172a; }
        .budget-pct-sub { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .budget-details { flex: 1; }
        .budget-row {
          display: flex; justify-content: space-between; padding: 6px 0;
          font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f022;
        }
        .budget-row strong { color: #0f172a; }
        .budget-row-highlight { border-top: 1px dashed #cbd5e1; margin-top: 4px; padding-top: 10px; }

        /* ---- Comparison ---- */
        .comparison-legend { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #64748b; margin-bottom: 16px; }
        .legend-dot { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
        .comparison-table { margin-top: 20px; }
        .comparison-row {
          display: flex; align-items: center; gap: 12px; padding: 10px 16px;
          border-radius: 8px; font-size: 14px;
        }
        .comparison-row:nth-child(odd) { background: #f8fafc; }
        .comparison-metric { flex: 1; font-weight: 600; color: #0f172a; }
        .comparison-prev { color: #94a3b8; min-width: 80px; text-align: right; }
        .comparison-arrow { color: #cbd5e1; }
        .comparison-curr { font-weight: 700; color: #0f172a; min-width: 80px; text-align: right; }
        .comparison-pct { min-width: 70px; text-align: right; font-weight: 700; font-size: 13px; }
        .comparison-pct.positive { color: #10b981; }
        .comparison-pct.negative { color: #ef4444; }

        /* ---- Highlights ---- */
        .highlight-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 18px; background: #f0fdf4; border-radius: 10px;
          border: 1px solid #dcfce7; margin-bottom: 8px;
        }
        .highlight-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
        .highlight-text { color: #166534; font-size: 14px; line-height: 1.6; }

        /* ---- Recommendations ---- */
        .rec-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 18px; background: #eff6ff; border-radius: 10px;
          border: 1px solid #dbeafe; margin-bottom: 8px;
        }
        .rec-number {
          font-size: 13px; font-weight: 800; color: ${primaryColor};
          width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
          background: #dbeafe; border-radius: 8px; flex-shrink: 0;
        }
        .rec-text { color: #1e40af; font-size: 14px; line-height: 1.6; }

        /* ---- Next Steps ---- */
        .step-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 18px; background: #faf5ff; border-radius: 10px;
          border: 1px solid #f3e8ff; margin-bottom: 8px;
        }
        .step-arrow { font-size: 16px; flex-shrink: 0; color: #7c3aed; margin-top: 1px; }
        .step-text { color: #6b21a8; font-size: 14px; line-height: 1.6; }

        /* ---- Footer ---- */
        .report-footer {
          text-align: center; padding: 36px 0; border-top: 1px solid #e5e7eb; margin-top: 20px;
        }
        .footer-brand { font-size: 14px; color: #64748b; margin-bottom: 8px; }
        .footer-brand strong { color: #0f172a; }
        .footer-links { font-size: 13px; color: #94a3b8; }
        .footer-links a { color: ${primaryColor}; text-decoration: none; }

        /* ---- Responsive ---- */
        @media (max-width: 640px) {
          .header-title { font-size: 28px; }
          .kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .kpi-value { font-size: 24px; }
          .kpi-card { padding: 16px 20px; }
          .section { padding: 20px; }
          .report-main { padding: 0 16px 60px; }
          .budget-chart-row { flex-direction: column; }
          .budget-doughnut { width: 90px; height: 90px; }
          .metrics-grid { grid-template-columns: repeat(2, 1fr); }
          .metric-value { font-size: 20px; }
          .comparison-row { flex-wrap: wrap; }
        }

        /* ---- Print ---- */
        @media print {
          body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-btn { display: none !important; }
          .report-header { padding: 32px 0 40px; break-after: avoid; }
          .section { break-inside: avoid; box-shadow: none; border: 1px solid #e5e7eb; }
          .kpi-card { box-shadow: none; border: 1px solid #e5e7eb; }
          .chart-container { height: 240px; }
          .report-main { margin-top: -24px; }
          .budget-doughnut canvas, .chart-container canvas { max-width: 100% !important; }
        }

        .platform-icon { font-size: 20px; }
      `}</style>

      {/* Print button */}
      <button className="print-btn" onClick={() => window.print()}>
        🖨️ Print / PDF
      </button>

      {/* Header */}
      <header className="report-header">
        <div className="header-inner">
          <div>
            {report.branding?.logoUrl && (
              <img src={report.branding.logoUrl} alt={report.clientName} className="client-logo" />
            )}
            <div className="header-badge">Performance Report</div>
            <h1 className="header-title">{report.clientName}</h1>
            <div className="header-period">📅 {report.period}</div>
          </div>
          <div className="header-right">
            <div className="label">Gegenereerd</div>
            <div className="date">
              {new Date(report.generatedAt).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="header-powered">
              Powered by <strong>Nodefy</strong>
            </div>
          </div>
        </div>
      </header>

      <main className="report-main">
        {/* KPI Summary */}
        {report.kpiSummary && report.kpiSummary.length > 0 && (
          <div className="kpi-grid">
            {report.kpiSummary.map((kpi, i) => (
              <KPICard key={i} {...kpi} />
            ))}
          </div>
        )}

        {/* Executive Summary */}
        {report.executiveSummary && (
          <div className="section">
            <h2 className="section-title"><span className="section-icon">📋</span> Samenvatting</h2>
            <div className="executive-summary">{report.executiveSummary}</div>
          </div>
        )}

        {/* Highlights */}
        {report.highlights.length > 0 && (
          <div className="section">
            <h2 className="section-title"><span className="section-icon">⭐</span> Highlights</h2>
            {report.highlights.map((h, i) => (
              <div key={i} className="highlight-item">
                <span className="highlight-icon">✅</span>
                <span className="highlight-text">{h}</span>
              </div>
            ))}
          </div>
        )}

        {/* Trend Chart */}
        {report.trends && report.trends.length > 0 && report.trendMetrics && (
          <TrendChart trends={report.trends} metrics={report.trendMetrics} primaryColor={primaryColor} />
        )}

        {/* Period Comparison */}
        {report.periodComparison && (
          <PeriodComparison comparison={report.periodComparison} primaryColor={primaryColor} />
        )}

        {/* Budget Pacing */}
        {report.budgetPacing && report.budgetPacing.length > 0 && (
          <BudgetPacingChart pacing={report.budgetPacing} primaryColor={primaryColor} />
        )}

        {/* Metrics per Platform */}
        {report.metrics.map((group, gi) => (
          <div key={gi} className="section">
            <h2 className="section-title">
              <PlatformIcon platform={group.platform} />
              {group.platform}
            </h2>
            <div className="metrics-grid">
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
          </div>
        ))}

        {/* Recommendations */}
        {report.recommendations.length > 0 && (
          <div className="section">
            <h2 className="section-title"><span className="section-icon">💡</span> Aanbevelingen</h2>
            {report.recommendations.map((r, i) => (
              <div key={i} className="rec-item">
                <span className="rec-number">{i + 1}</span>
                <span className="rec-text">{r}</span>
              </div>
            ))}
          </div>
        )}

        {/* Next Steps */}
        {report.nextSteps.length > 0 && (
          <div className="section">
            <h2 className="section-title"><span className="section-icon">🚀</span> Volgende Stappen</h2>
            {report.nextSteps.map((s, i) => (
              <div key={i} className="step-item">
                <span className="step-arrow">→</span>
                <span className="step-text">{s}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="report-footer">
          <div className="footer-brand">
            Dit rapport is gegenereerd door <strong>Nodefy</strong> — Performance Marketing
          </div>
          <div className="footer-links">
            <a href="https://nodefy.nl">nodefy.nl</a> · Vragen? Mail <a href="mailto:info@nodefy.nl">info@nodefy.nl</a>
          </div>
        </footer>
      </main>
    </>
  )
}
