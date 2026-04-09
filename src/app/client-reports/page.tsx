'use client'

import React, { useState, useEffect } from 'react'

// ============================================
// CLIENT REPORTS MANAGEMENT
// Admin page for creating/managing client reports
// ============================================

interface ReportSummary {
  slug: string
  clientName: string
  period: string
  generatedAt: string
  expiresAt: string | null
}

interface ReportFormData {
  slug: string
  clientName: string
  period: string
  primaryColor: string
  executiveSummary: string
  highlights: string[]
  recommendations: string[]
  nextSteps: string[]
  metrics: { platform: string; data: Record<string, string | number> }[]
  kpiSummary: { label: string; value: string; change?: string; good?: boolean }[]
  budgetPacing: { platform: string; monthlyBudget: number; spent: number; daysInMonth: number; daysPassed: number }[]
  trends: { label: string; values: Record<string, number> }[]
  trendMetrics: string[]
  periodComparison: {
    current: string; previous: string;
    changes: { metric: string; current: number; previous: number; unit?: string }[]
  } | null
  expiresAt: string
}

const EMPTY_FORM: ReportFormData = {
  slug: '',
  clientName: '',
  period: '',
  primaryColor: '#2563eb',
  executiveSummary: '',
  highlights: [''],
  recommendations: [''],
  nextSteps: [''],
  metrics: [],
  kpiSummary: [],
  budgetPacing: [],
  trends: [],
  trendMetrics: [],
  periodComparison: null,
  expiresAt: '',
}

function generateSlug(name: string): string {
  const now = new Date()
  const month = now.toLocaleString('nl-NL', { month: 'short' }).toLowerCase()
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${month}-${now.getFullYear()}`
}

export default function ClientReportsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'list' | 'create' | 'quick'>('list')
  const [form, setForm] = useState<ReportFormData>({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    try {
      const res = await fetch('/api/client-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth: 'nodefy-internal' }),
      })
      const data = await res.json()
      if (data.success) {
        setReports(data.reports.sort((a: ReportSummary, b: ReportSummary) => 
          new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
        ))
      }
    } catch (e) {
      console.error('Failed to load reports:', e)
    }
    setLoading(false)
  }

  async function handleSave() {
    if (!form.clientName || !form.period) {
      setMessage({ type: 'error', text: 'Vul minstens klantnaam en periode in.' })
      return
    }

    setSaving(true)
    const slug = form.slug || generateSlug(form.clientName)

    const report = {
      slug,
      clientName: form.clientName,
      period: form.period,
      generatedAt: new Date().toISOString(),
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      metrics: form.metrics,
      highlights: form.highlights.filter(h => h.trim()),
      recommendations: form.recommendations.filter(r => r.trim()),
      nextSteps: form.nextSteps.filter(s => s.trim()),
      branding: { primaryColor: form.primaryColor, logoUrl: null },
      executiveSummary: form.executiveSummary || undefined,
      kpiSummary: form.kpiSummary.length > 0 ? form.kpiSummary : undefined,
      budgetPacing: form.budgetPacing.length > 0 ? form.budgetPacing : undefined,
      trends: form.trends.length > 0 ? form.trends : undefined,
      trendMetrics: form.trendMetrics.length > 0 ? form.trendMetrics : undefined,
      periodComparison: form.periodComparison || undefined,
    }

    try {
      const res = await fetch('/api/client-report', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, report, auth: 'nodefy-internal' }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: `Rapport aangemaakt! Link: /client-report/${slug}` })
        setForm({ ...EMPTY_FORM })
        setMode('list')
        loadReports()
      } else {
        setMessage({ type: 'error', text: data.error || 'Fout bij opslaan.' })
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Netwerkfout bij opslaan.' })
    }
    setSaving(false)
  }

  async function handleQuickSave() {
    await handleSave()
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/client-report/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  // Add/remove list items
  function updateListItem(field: 'highlights' | 'recommendations' | 'nextSteps', index: number, value: string) {
    setForm(f => {
      const list = [...f[field]]
      list[index] = value
      return { ...f, [field]: list }
    })
  }

  function addListItem(field: 'highlights' | 'recommendations' | 'nextSteps') {
    setForm(f => ({ ...f, [field]: [...f[field], ''] }))
  }

  function removeListItem(field: 'highlights' | 'recommendations' | 'nextSteps', index: number) {
    setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }))
  }

  // KPI management
  function addKPI() {
    setForm(f => ({ ...f, kpiSummary: [...f.kpiSummary, { label: '', value: '', change: '', good: true }] }))
  }

  function updateKPI(index: number, field: string, value: string | boolean) {
    setForm(f => {
      const kpis = [...f.kpiSummary]
      kpis[index] = { ...kpis[index], [field]: value }
      return { ...f, kpiSummary: kpis }
    })
  }

  function removeKPI(index: number) {
    setForm(f => ({ ...f, kpiSummary: f.kpiSummary.filter((_, i) => i !== index) }))
  }

  // Metric group management
  function addMetricGroup() {
    setForm(f => ({ ...f, metrics: [...f.metrics, { platform: '', data: {} }] }))
  }

  function updateMetricGroup(index: number, platform: string) {
    setForm(f => {
      const metrics = [...f.metrics]
      metrics[index] = { ...metrics[index], platform }
      return { ...f, metrics }
    })
  }

  function addMetricToGroup(groupIndex: number, key: string, value: string) {
    setForm(f => {
      const metrics = [...f.metrics]
      metrics[groupIndex] = {
        ...metrics[groupIndex],
        data: { ...metrics[groupIndex].data, [key]: value }
      }
      return { ...f, metrics }
    })
  }

  function removeMetricGroup(index: number) {
    setForm(f => ({ ...f, metrics: f.metrics.filter((_, i) => i !== index) }))
  }

  // Budget pacing
  function addBudgetPacing() {
    const now = new Date()
    setForm(f => ({
      ...f,
      budgetPacing: [...f.budgetPacing, {
        platform: '',
        monthlyBudget: 0,
        spent: 0,
        daysInMonth: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
        daysPassed: now.getDate(),
      }]
    }))
  }

  function updateBudgetPacing(index: number, field: string, value: string | number) {
    setForm(f => {
      const bp = [...f.budgetPacing]
      bp[index] = { ...bp[index], [field]: typeof value === 'string' && field !== 'platform' ? Number(value) : value }
      return { ...f, budgetPacing: bp }
    })
  }

  function removeBudgetPacing(index: number) {
    setForm(f => ({ ...f, budgetPacing: f.budgetPacing.filter((_, i) => i !== index) }))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#f1f5f9' }}>
      <style>{`
        .mgmt-container { max-width: 1000px; margin: 0 auto; padding: 32px 24px 80px; }
        .mgmt-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 32px; }
        .mgmt-title { font-size: 28px; font-weight: 800; }
        .mgmt-subtitle { color: #94a3b8; font-size: 14px; margin-top: 4px; }
        
        .btn { padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.15s; }
        .btn-primary { background: #2563eb; color: #fff; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-secondary { background: #1e293b; color: #94a3b8; border: 1px solid #334155; }
        .btn-secondary:hover { color: #f1f5f9; border-color: #475569; }
        .btn-danger { background: #dc2626; color: #fff; }
        .btn-sm { padding: 6px 14px; font-size: 12px; }
        .btn-group { display: flex; gap: 8px; }

        .report-list { display: grid; gap: 10px; }
        .report-item {
          background: #1e293b; border-radius: 12px; padding: 20px 24px;
          border: 1px solid #334155; display: flex; align-items: center; gap: 16px;
          transition: border-color 0.2s;
        }
        .report-item:hover { border-color: #475569; }
        .report-item-info { flex: 1; }
        .report-item-name { font-weight: 700; font-size: 16px; }
        .report-item-meta { font-size: 13px; color: #94a3b8; margin-top: 4px; }
        .report-item-actions { display: flex; gap: 8px; align-items: center; }
        .copy-link-btn { cursor: pointer; padding: 6px 12px; border-radius: 8px; background: #334155; color: #94a3b8; border: none; font-size: 12px; font-weight: 600; }
        .copy-link-btn:hover { background: #475569; color: #f1f5f9; }
        .copy-link-btn.copied { background: #059669; color: #fff; }

        .form-section { background: #1e293b; border-radius: 14px; padding: 28px; margin-bottom: 20px; border: 1px solid #334155; }
        .form-section-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        
        .form-group { margin-bottom: 16px; }
        .form-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; display: block; }
        .form-input {
          width: 100%; padding: 10px 14px; background: #0f172a; border: 1px solid #334155; border-radius: 8px;
          color: #f1f5f9; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.15s;
        }
        .form-input:focus { border-color: #2563eb; }
        .form-textarea { resize: vertical; min-height: 80px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        
        .list-item-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
        .list-item-input { flex: 1; }
        .list-remove-btn {
          width: 32px; height: 32px; border-radius: 6px; border: none;
          background: #450a0a; color: #ef4444; cursor: pointer; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
        }
        .list-add-btn {
          padding: 8px 16px; border-radius: 8px; border: 1px dashed #475569;
          background: transparent; color: #64748b; cursor: pointer; font-size: 13px; width: 100%;
          transition: all 0.15s;
        }
        .list-add-btn:hover { border-color: #2563eb; color: #2563eb; }

        .kpi-row { display: grid; grid-template-columns: 1fr 100px 100px 60px 36px; gap: 8px; margin-bottom: 8px; align-items: center; }
        .metric-row { display: grid; grid-template-columns: 1fr 1fr 36px; gap: 8px; margin-bottom: 8px; align-items: center; }
        .budget-row-form { display: grid; grid-template-columns: 1fr 100px 100px 36px; gap: 8px; margin-bottom: 8px; align-items: center; }

        .msg { padding: 14px 20px; border-radius: 10px; font-size: 14px; margin-bottom: 20px; font-weight: 500; }
        .msg-success { background: #052e16; color: #10b981; border: 1px solid #14532d; }
        .msg-error { background: #450a0a; color: #ef4444; border: 1px solid #7f1d1d; }

        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
        .empty-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
        .empty-text { color: #94a3b8; font-size: 14px; }

        .color-preview { width: 32px; height: 32px; border-radius: 8px; border: 2px solid #475569; cursor: pointer; }
        .color-row { display: flex; gap: 12px; align-items: center; }

        @media (max-width: 640px) {
          .form-row, .form-row-3 { grid-template-columns: 1fr; }
          .kpi-row { grid-template-columns: 1fr 1fr; }
          .report-item { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="mgmt-container">
        {/* Header */}
        <div className="mgmt-header">
          <div>
            <h1 className="mgmt-title">📊 Client Reports</h1>
            <div className="mgmt-subtitle">Beheer client performance rapporten · {reports.length} rapport{reports.length !== 1 ? 'en' : ''}</div>
          </div>
          <div className="btn-group">
            {mode !== 'list' && (
              <button className="btn btn-secondary" onClick={() => { setMode('list'); setForm({ ...EMPTY_FORM }) }}>
                ← Terug
              </button>
            )}
            {mode === 'list' && (
              <button className="btn btn-primary" onClick={() => setMode('create')}>
                + Nieuw Rapport
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`msg msg-${message.type}`}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
            <button onClick={() => setMessage(null)} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16 }}>×</button>
          </div>
        )}

        {/* List View */}
        {mode === 'list' && (
          <>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Laden...</div>
            ) : reports.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <div className="empty-title">Nog geen rapporten</div>
                <div className="empty-text">Maak je eerste client rapport aan.</div>
                <button className="btn btn-primary" onClick={() => setMode('create')} style={{ marginTop: 20 }}>
                  + Nieuw Rapport
                </button>
              </div>
            ) : (
              <div className="report-list">
                {reports.map(r => {
                  const isExpired = r.expiresAt && new Date(r.expiresAt) < new Date()
                  return (
                    <div key={r.slug} className="report-item" style={isExpired ? { opacity: 0.5 } : {}}>
                      <div className="report-item-info">
                        <div className="report-item-name">
                          {r.clientName}
                          {isExpired && <span style={{ color: '#ef4444', fontSize: 12, marginLeft: 8 }}>VERLOPEN</span>}
                        </div>
                        <div className="report-item-meta">
                          {r.period} · {new Date(r.generatedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {r.expiresAt && !isExpired && ` · Verloopt ${new Date(r.expiresAt).toLocaleDateString('nl-NL')}`}
                        </div>
                      </div>
                      <div className="report-item-actions">
                        <button
                          className={`copy-link-btn ${copiedSlug === r.slug ? 'copied' : ''}`}
                          onClick={() => copyLink(r.slug)}
                        >
                          {copiedSlug === r.slug ? '✓ Gekopieerd' : '🔗 Link'}
                        </button>
                        <a
                          href={`/client-report/${r.slug}`}
                          target="_blank"
                          rel="noopener"
                          className="copy-link-btn"
                          style={{ textDecoration: 'none' }}
                        >
                          👁️ Bekijk
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Create/Edit View */}
        {mode === 'create' && (
          <>
            {/* Basic Info */}
            <div className="form-section">
              <div className="form-section-title">📝 Basisgegevens</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Klantnaam *</label>
                  <input
                    className="form-input"
                    value={form.clientName}
                    onChange={e => setForm(f => ({ ...f, clientName: e.target.value, slug: generateSlug(e.target.value) }))}
                    placeholder="bijv. Franky Amsterdam"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Periode *</label>
                  <input
                    className="form-input"
                    value={form.period}
                    onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
                    placeholder="bijv. Maart 2026"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Slug (URL)</label>
                  <input className="form-input" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Verloopt op</label>
                  <input className="form-input" type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Brand kleur</label>
                <div className="color-row">
                  <input type="color" value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} className="color-preview" />
                  <input className="form-input" value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} style={{ width: 120 }} />
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="form-section">
              <div className="form-section-title">📋 Samenvatting</div>
              <textarea
                className="form-input form-textarea"
                value={form.executiveSummary}
                onChange={e => setForm(f => ({ ...f, executiveSummary: e.target.value }))}
                placeholder="Korte samenvatting van de belangrijkste resultaten deze periode..."
                rows={4}
              />
            </div>

            {/* KPIs */}
            <div className="form-section">
              <div className="form-section-title">📊 KPI Samenvatting</div>
              {form.kpiSummary.map((kpi, i) => (
                <div key={i} className="kpi-row">
                  <input className="form-input" placeholder="Label (bijv. Totaal Spend)" value={kpi.label} onChange={e => updateKPI(i, 'label', e.target.value)} />
                  <input className="form-input" placeholder="Waarde" value={kpi.value} onChange={e => updateKPI(i, 'value', e.target.value)} />
                  <input className="form-input" placeholder="±%" value={kpi.change || ''} onChange={e => updateKPI(i, 'change', e.target.value)} />
                  <select className="form-input" value={kpi.good === true ? 'true' : kpi.good === false ? 'false' : ''} onChange={e => updateKPI(i, 'good', e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined as any)}>
                    <option value="true">↑</option>
                    <option value="false">↓</option>
                    <option value="">→</option>
                  </select>
                  <button className="list-remove-btn" onClick={() => removeKPI(i)}>×</button>
                </div>
              ))}
              <button className="list-add-btn" onClick={addKPI}>+ KPI toevoegen</button>
            </div>

            {/* Highlights */}
            <div className="form-section">
              <div className="form-section-title">⭐ Highlights</div>
              {form.highlights.map((h, i) => (
                <div key={i} className="list-item-row">
                  <input className="form-input list-item-input" value={h} onChange={e => updateListItem('highlights', i, e.target.value)} placeholder="bijv. ROAS steeg met 45% naar 8.2x" />
                  <button className="list-remove-btn" onClick={() => removeListItem('highlights', i)}>×</button>
                </div>
              ))}
              <button className="list-add-btn" onClick={() => addListItem('highlights')}>+ Highlight toevoegen</button>
            </div>

            {/* Metrics */}
            <div className="form-section">
              <div className="form-section-title">📈 Platform Metrics</div>
              {form.metrics.map((group, gi) => (
                <div key={gi} style={{ background: '#0f172a', borderRadius: 10, padding: 16, marginBottom: 12, border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <input className="form-input" placeholder="Platform (bijv. Google Ads)" value={group.platform} onChange={e => updateMetricGroup(gi, e.target.value)} style={{ flex: 1 }} />
                    <button className="list-remove-btn" onClick={() => removeMetricGroup(gi)}>×</button>
                  </div>
                  {Object.entries(group.data).map(([key, val], mi) => (
                    <div key={mi} className="metric-row">
                      <input className="form-input" value={key} readOnly style={{ opacity: 0.7 }} />
                      <input className="form-input" value={String(val)} readOnly style={{ opacity: 0.7 }} />
                      <button className="list-remove-btn" onClick={() => {
                        setForm(f => {
                          const metrics = [...f.metrics]
                          const newData = { ...metrics[gi].data }
                          delete newData[key]
                          metrics[gi] = { ...metrics[gi], data: newData }
                          return { ...f, metrics }
                        })
                      }}>×</button>
                    </div>
                  ))}
                  <div className="metric-row">
                    <input className="form-input" placeholder="Metric naam (bijv. spend)" id={`metric-key-${gi}`} />
                    <input className="form-input" placeholder="Waarde" id={`metric-val-${gi}`} onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const keyEl = document.getElementById(`metric-key-${gi}`) as HTMLInputElement
                        const valEl = e.target as HTMLInputElement
                        if (keyEl.value && valEl.value) {
                          addMetricToGroup(gi, keyEl.value, valEl.value)
                          keyEl.value = ''
                          valEl.value = ''
                          keyEl.focus()
                        }
                      }
                    }} />
                    <button className="btn btn-sm btn-secondary" onClick={() => {
                      const keyEl = document.getElementById(`metric-key-${gi}`) as HTMLInputElement
                      const valEl = document.getElementById(`metric-val-${gi}`) as HTMLInputElement
                      if (keyEl.value && valEl.value) {
                        addMetricToGroup(gi, keyEl.value, valEl.value)
                        keyEl.value = ''
                        valEl.value = ''
                      }
                    }}>+</button>
                  </div>
                </div>
              ))}
              <button className="list-add-btn" onClick={addMetricGroup}>+ Platform toevoegen</button>
            </div>

            {/* Budget Pacing */}
            <div className="form-section">
              <div className="form-section-title">💰 Budget Pacing</div>
              {form.budgetPacing.map((bp, i) => (
                <div key={i} className="budget-row-form">
                  <input className="form-input" placeholder="Platform" value={bp.platform} onChange={e => updateBudgetPacing(i, 'platform', e.target.value)} />
                  <input className="form-input" type="number" placeholder="Budget" value={bp.monthlyBudget || ''} onChange={e => updateBudgetPacing(i, 'monthlyBudget', e.target.value)} />
                  <input className="form-input" type="number" placeholder="Besteed" value={bp.spent || ''} onChange={e => updateBudgetPacing(i, 'spent', e.target.value)} />
                  <button className="list-remove-btn" onClick={() => removeBudgetPacing(i)}>×</button>
                </div>
              ))}
              <button className="list-add-btn" onClick={addBudgetPacing}>+ Budget toevoegen</button>
            </div>

            {/* Recommendations */}
            <div className="form-section">
              <div className="form-section-title">💡 Aanbevelingen</div>
              {form.recommendations.map((r, i) => (
                <div key={i} className="list-item-row">
                  <input className="form-input list-item-input" value={r} onChange={e => updateListItem('recommendations', i, e.target.value)} placeholder="bijv. Budget verschuiven van Display naar Search voor betere ROAS" />
                  <button className="list-remove-btn" onClick={() => removeListItem('recommendations', i)}>×</button>
                </div>
              ))}
              <button className="list-add-btn" onClick={() => addListItem('recommendations')}>+ Aanbeveling toevoegen</button>
            </div>

            {/* Next Steps */}
            <div className="form-section">
              <div className="form-section-title">🚀 Volgende Stappen</div>
              {form.nextSteps.map((s, i) => (
                <div key={i} className="list-item-row">
                  <input className="form-input list-item-input" value={s} onChange={e => updateListItem('nextSteps', i, e.target.value)} placeholder="bijv. A/B test opzetten voor nieuwe ad copy" />
                  <button className="list-remove-btn" onClick={() => removeListItem('nextSteps', i)}>×</button>
                </div>
              ))}
              <button className="list-add-btn" onClick={() => addListItem('nextSteps')}>+ Stap toevoegen</button>
            </div>

            {/* Save */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => { setMode('list'); setForm({ ...EMPTY_FORM }) }}>
                Annuleren
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: 160 }}>
                {saving ? '⏳ Opslaan...' : '✅ Rapport Opslaan'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
