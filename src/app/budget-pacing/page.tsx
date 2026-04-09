'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

// ============================================
// BUDGET PACING DASHBOARD
// Internal tool for monitoring client ad budgets
// ============================================

interface ClientBudget {
  clientName: string
  metaBudget: number | null
  googleBudget: number | null
  notes: string
  updatedAt: string
  updatedBy: string
}

type PacingStatus = 'on-track' | 'overpacing' | 'underpacing' | 'no-budget'

function getPacingStatus(spent: number, budget: number, daysPassed: number, daysInMonth: number): PacingStatus {
  if (!budget || budget === 0) return 'no-budget'
  const pct = (spent / budget) * 100
  const expectedPct = (daysPassed / daysInMonth) * 100
  if (pct > expectedPct + 12) return 'overpacing'
  if (pct < expectedPct - 18) return 'underpacing'
  return 'on-track'
}

function statusConfig(status: PacingStatus) {
  switch (status) {
    case 'on-track': return { label: '✅ On Track', bg: '#052e16', border: '#14532d', text: '#10b981', badge: '#dcfce7', badgeText: '#166534' }
    case 'overpacing': return { label: '⚠️ Over', bg: '#450a0a', border: '#7f1d1d', text: '#ef4444', badge: '#fee2e2', badgeText: '#991b1b' }
    case 'underpacing': return { label: '🔻 Under', bg: '#451a03', border: '#78350f', text: '#f59e0b', badge: '#fef3c7', badgeText: '#92400e' }
    case 'no-budget': return { label: '—', bg: '#1e293b', border: '#334155', text: '#64748b', badge: '#374151', badgeText: '#9ca3af' }
  }
}

export default function BudgetPacingPage() {
  const [budgets, setBudgets] = useState<Record<string, ClientBudget>>({})
  const [loading, setLoading] = useState(true)
  const [editingClient, setEditingClient] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ clientName: '', metaBudget: '', googleBudget: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState<'all' | 'attention'>('all')

  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysPassed = now.getDate()
  const monthName = now.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })

  useEffect(() => {
    fetch('/api/budget-pacing').then(r => r.json()).then(d => {
      if (d.success) setBudgets(d.data || {})
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const clientList = useMemo(() => {
    return Object.entries(budgets).map(([slug, b]) => {
      const totalBudget = (b.metaBudget || 0) + (b.googleBudget || 0)
      // For now, use proportional estimate based on days (in production would use real spend data)
      // This is a display structure — actual spend would come from API integrations
      return {
        slug,
        ...b,
        totalBudget,
        metaStatus: b.metaBudget ? 'on-track' as PacingStatus : 'no-budget' as PacingStatus,
        googleStatus: b.googleBudget ? 'on-track' as PacingStatus : 'no-budget' as PacingStatus,
      }
    }).sort((a, b) => b.totalBudget - a.totalBudget)
  }, [budgets])

  const filteredClients = filter === 'attention'
    ? clientList.filter(c => c.metaStatus !== 'on-track' || c.googleStatus !== 'on-track')
    : clientList

  const totalMeta = clientList.reduce((sum, c) => sum + (c.metaBudget || 0), 0)
  const totalGoogle = clientList.reduce((sum, c) => sum + (c.googleBudget || 0), 0)
  const totalBudget = totalMeta + totalGoogle

  async function handleSaveBudget() {
    if (!editForm.clientName) return
    setSaving(true)
    try {
      await fetch('/api/budget-pacing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: editForm.clientName,
          metaBudget: editForm.metaBudget ? Number(editForm.metaBudget) : null,
          googleBudget: editForm.googleBudget ? Number(editForm.googleBudget) : null,
          notes: editForm.notes,
          updatedBy: 'dashboard',
        }),
      })
      // Reload
      const res = await fetch('/api/budget-pacing')
      const d = await res.json()
      if (d.success) setBudgets(d.data || {})
      setEditingClient(null)
      setShowAdd(false)
      setEditForm({ clientName: '', metaBudget: '', googleBudget: '', notes: '' })
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  // Bar chart data - budget overview per client
  const chartData = useMemo(() => {
    const top10 = clientList.slice(0, 12)
    return {
      labels: top10.map(c => c.clientName.length > 16 ? c.clientName.slice(0, 14) + '…' : c.clientName),
      datasets: [
        {
          label: 'Meta Ads',
          data: top10.map(c => c.metaBudget || 0),
          backgroundColor: '#3b82f6',
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'Google Ads',
          data: top10.map(c => c.googleBudget || 0),
          backgroundColor: '#10b981',
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    }
  }, [clientList])

  // Doughnut: total budget split
  const splitData = {
    labels: ['Meta Ads', 'Google Ads'],
    datasets: [{
      data: [totalMeta, totalGoogle],
      backgroundColor: ['#3b82f6', '#10b981'],
      borderWidth: 0,
      cutout: '65%',
    }]
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#f1f5f9' }}>
      <style>{`
        .bp-container { max-width: 1100px; margin: 0 auto; padding: 32px 24px 80px; }
        .bp-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 28px; }
        .bp-title { font-size: 28px; font-weight: 800; }
        .bp-subtitle { color: #94a3b8; font-size: 14px; margin-top: 4px; }

        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 28px; }
        .summary-card { background: #1e293b; border-radius: 14px; padding: 20px 24px; border: 1px solid #334155; }
        .summary-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; margin-bottom: 6px; }
        .summary-value { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
        .summary-value.blue { color: #3b82f6; }
        .summary-value.green { color: #10b981; }
        .summary-value.white { color: #f1f5f9; }
        .summary-value.yellow { color: #f59e0b; }

        .charts-row { display: grid; grid-template-columns: 1fr 280px; gap: 20px; margin-bottom: 28px; }
        .chart-card { background: #1e293b; border-radius: 14px; padding: 24px; border: 1px solid #334155; }
        .chart-title { font-size: 15px; font-weight: 700; margin-bottom: 16px; }
        .chart-wrapper { height: 280px; position: relative; }
        .doughnut-wrapper { height: 220px; position: relative; display: flex; justify-content: center; }
        .doughnut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
        .doughnut-total { font-size: 24px; font-weight: 800; }
        .doughnut-sub { font-size: 11px; color: #64748b; text-transform: uppercase; }

        .client-grid { display: grid; gap: 10px; }
        .client-row {
          background: #1e293b; border-radius: 12px; padding: 18px 24px;
          border: 1px solid #334155; display: grid; grid-template-columns: 200px 1fr 1fr 120px;
          gap: 16px; align-items: center; transition: border-color 0.2s;
        }
        .client-row:hover { border-color: #475569; }
        .client-name { font-weight: 700; font-size: 15px; }
        .client-notes { font-size: 12px; color: #64748b; margin-top: 2px; }
        .budget-cell { text-align: center; }
        .budget-amount { font-size: 18px; font-weight: 700; }
        .budget-label { font-size: 11px; color: #64748b; margin-top: 2px; }
        .budget-bar { height: 4px; border-radius: 2px; background: #334155; margin-top: 6px; overflow: hidden; }
        .budget-bar-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
        .client-actions { display: flex; gap: 6px; justify-content: flex-end; }
        
        .btn { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.15s; }
        .btn-primary { background: #2563eb; color: #fff; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-secondary { background: #1e293b; color: #94a3b8; border: 1px solid #334155; }
        .btn-secondary:hover { color: #f1f5f9; }
        .btn-sm { padding: 6px 12px; font-size: 12px; }
        .btn-group { display: flex; gap: 8px; }

        .filter-tabs { display: flex; gap: 6px; margin-bottom: 20px; }
        .filter-tab {
          padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer;
          font-size: 13px; font-weight: 600; transition: all 0.15s;
        }
        .filter-tab.active { background: #2563eb; color: #fff; }
        .filter-tab:not(.active) { background: #1e293b; color: #94a3b8; }

        .edit-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100;
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .edit-modal {
          background: #1e293b; border-radius: 16px; padding: 32px; max-width: 480px; width: 100%;
          border: 1px solid #334155;
        }
        .edit-title { font-size: 18px; font-weight: 700; margin-bottom: 24px; }
        .form-group { margin-bottom: 16px; }
        .form-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; display: block; }
        .form-input {
          width: 100%; padding: 10px 14px; background: #0f172a; border: 1px solid #334155; border-radius: 8px;
          color: #f1f5f9; font-size: 14px; outline: none;
        }
        .form-input:focus { border-color: #2563eb; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .progress-bar { height: 6px; border-radius: 3px; background: #334155; overflow: hidden; position: relative; }
        .progress-fill { height: 100%; border-radius: 3px; }
        .progress-expected { position: absolute; top: 0; height: 100%; width: 2px; background: #f1f5f9; opacity: 0.5; }

        @media (max-width: 768px) {
          .client-row { grid-template-columns: 1fr; gap: 12px; }
          .charts-row { grid-template-columns: 1fr; }
          .summary-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="bp-container">
        {/* Header */}
        <div className="bp-header">
          <div>
            <h1 className="bp-title">💰 Budget Pacing</h1>
            <div className="bp-subtitle">{monthName} · Dag {daysPassed}/{daysInMonth} ({Math.round(daysPassed / daysInMonth * 100)}% van de maand)</div>
          </div>
          <div className="btn-group">
            <button className="btn btn-primary" onClick={() => {
              setShowAdd(true)
              setEditForm({ clientName: '', metaBudget: '', googleBudget: '', notes: '' })
            }}>
              + Client Budget
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-label">Totaal Budget</div>
            <div className="summary-value white">€{totalBudget.toLocaleString('nl-NL')}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Meta Ads</div>
            <div className="summary-value blue">€{totalMeta.toLocaleString('nl-NL')}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Google Ads</div>
            <div className="summary-value green">€{totalGoogle.toLocaleString('nl-NL')}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Klanten</div>
            <div className="summary-value yellow">{clientList.length}</div>
          </div>
        </div>

        {/* Charts */}
        {clientList.length > 0 && (
          <div className="charts-row">
            <div className="chart-card">
              <div className="chart-title">Budget per Klant</div>
              <div className="chart-wrapper">
                <Bar data={chartData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, usePointStyle: true, font: { size: 12 } } },
                    tooltip: { backgroundColor: '#0f172a', padding: 12, cornerRadius: 8 },
                  },
                  scales: {
                    x: { stacked: true, grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
                    y: { stacked: true, grid: { color: '#1e293b' }, ticks: { color: '#64748b', callback: (v) => `€${Number(v).toLocaleString()}` } },
                  },
                }} />
              </div>
            </div>
            <div className="chart-card">
              <div className="chart-title">Platform Verdeling</div>
              <div className="doughnut-wrapper">
                <Doughnut data={splitData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, usePointStyle: true } },
                    tooltip: { backgroundColor: '#0f172a', padding: 12, cornerRadius: 8 },
                  },
                }} />
                <div className="doughnut-center">
                  <div className="doughnut-total">€{(totalBudget / 1000).toFixed(0)}K</div>
                  <div className="doughnut-sub">totaal/mnd</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="filter-tabs">
          <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            Alle ({clientList.length})
          </button>
          <button className={`filter-tab ${filter === 'attention' ? 'active' : ''}`} onClick={() => setFilter('attention')}>
            ⚠️ Aandacht nodig
          </button>
        </div>

        {/* Client List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Laden...</div>
        ) : clientList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Nog geen budgetten</div>
            <div>Voeg client budgetten toe om pacing bij te houden.</div>
          </div>
        ) : (
          <div className="client-grid">
            {filteredClients.map(client => {
              const expectedPct = Math.round((daysPassed / daysInMonth) * 100)
              return (
                <div key={client.slug} className="client-row">
                  <div>
                    <div className="client-name">{client.clientName}</div>
                    {client.notes && <div className="client-notes">{client.notes}</div>}
                    <div className="client-notes" style={{ marginTop: 4 }}>
                      Bijgewerkt {new Date(client.updatedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div className="budget-cell">
                    <div className="budget-label">📘 Meta Ads</div>
                    <div className="budget-amount" style={{ color: '#3b82f6' }}>
                      {client.metaBudget ? `€${client.metaBudget.toLocaleString('nl-NL')}` : '—'}
                    </div>
                    {client.metaBudget && (
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${expectedPct}%`,
                          background: '#3b82f6',
                        }} />
                        <div className="progress-expected" style={{ left: `${expectedPct}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="budget-cell">
                    <div className="budget-label">🔍 Google Ads</div>
                    <div className="budget-amount" style={{ color: '#10b981' }}>
                      {client.googleBudget ? `€${client.googleBudget.toLocaleString('nl-NL')}` : '—'}
                    </div>
                    {client.googleBudget && (
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${expectedPct}%`,
                          background: '#10b981',
                        }} />
                        <div className="progress-expected" style={{ left: `${expectedPct}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="client-actions">
                    <button className="btn btn-sm btn-secondary" onClick={() => {
                      setEditingClient(client.slug)
                      setEditForm({
                        clientName: client.clientName,
                        metaBudget: client.metaBudget ? String(client.metaBudget) : '',
                        googleBudget: client.googleBudget ? String(client.googleBudget) : '',
                        notes: client.notes || '',
                      })
                    }}>✏️</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {(editingClient || showAdd) && (
        <div className="edit-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setEditingClient(null); setShowAdd(false) } }}>
          <div className="edit-modal">
            <div className="edit-title">{showAdd ? '+ Nieuw Client Budget' : `✏️ ${editForm.clientName}`}</div>
            <div className="form-group">
              <label className="form-label">Klantnaam</label>
              <input className="form-input" value={editForm.clientName} onChange={e => setEditForm(f => ({ ...f, clientName: e.target.value }))} placeholder="bijv. Franky Amsterdam" disabled={!!editingClient} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Meta Ads Budget (€/mnd)</label>
                <input className="form-input" type="number" value={editForm.metaBudget} onChange={e => setEditForm(f => ({ ...f, metaBudget: e.target.value }))} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Google Ads Budget (€/mnd)</label>
                <input className="form-input" type="number" value={editForm.googleBudget} onChange={e => setEditForm(f => ({ ...f, googleBudget: e.target.value }))} placeholder="0" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notities</label>
              <input className="form-input" value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} placeholder="bijv. Seizoensgebonden, budget verhogen in december" />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => { setEditingClient(null); setShowAdd(false) }}>Annuleren</button>
              <button className="btn btn-primary" onClick={handleSaveBudget} disabled={saving}>
                {saving ? '⏳...' : '✅ Opslaan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
