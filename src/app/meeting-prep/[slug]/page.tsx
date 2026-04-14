'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Radar, Bar } from 'react-chartjs-2'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

// ============================================
// NODEFY MEETING PREP
// Auto-generated meeting preparation document
// Opens before every client call
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

interface MeetingPrepData {
  client: ClientHealth
  agenda: AgendaItem[]
  talkingPoints: TalkingPoint[]
  risks: RiskItem[]
  opportunities: OpportunityItem[]
  actionItems: ActionItem[]
  budgetSummary: BudgetLine[]
}

interface AgendaItem {
  topic: string
  duration: string
  priority: 'high' | 'medium' | 'low'
  notes: string
}

interface TalkingPoint {
  category: string
  point: string
  sentiment: 'positive' | 'negative' | 'neutral'
  data?: string
}

interface RiskItem {
  risk: string
  impact: 'high' | 'medium' | 'low'
  mitigation: string
}

interface OpportunityItem {
  opportunity: string
  potential: string
  nextStep: string
}

interface ActionItem {
  action: string
  owner: 'nodefy' | 'client'
  deadline: string
  status: 'open' | 'in-progress' | 'done'
}

interface BudgetLine {
  platform: string
  budget: number
  spent: number
  pacing: number // percentage
}

const STATUS_CONFIG = {
  healthy: { label: 'Gezond', emoji: '🟢', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  attention: { label: 'Aandacht', emoji: '🟡', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  'at-risk': { label: 'Risico', emoji: '🟠', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  critical: { label: 'Kritiek', emoji: '🔴', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
}

const SEVERITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6b7280',
}

const PLATFORM_ICONS: Record<string, string> = {
  meta: '📘', google: '🔍', linkedin: '💼', tiktok: '🎵',
  email: '📧', seo: '🌐', analytics: '📊',
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(val)
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}

function daysSince(d: string | null): number | null {
  if (!d) return null
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
}

function daysUntil(d: string | null): number | null {
  if (!d) return null
  return Math.floor((new Date(d).getTime() - Date.now()) / 86400000)
}

function generateMeetingPrep(client: ClientHealth): MeetingPrepData {
  const agenda: AgendaItem[] = []
  const talkingPoints: TalkingPoint[] = []
  const risks: RiskItem[] = []
  const opportunities: OpportunityItem[] = []
  const actionItems: ActionItem[] = []

  // === AGENDA GENERATION ===
  // Always start with performance review
  agenda.push({
    topic: 'Performance Review',
    duration: '15 min',
    priority: client.scores.performance < 60 ? 'high' : 'medium',
    notes: `Health score: ${client.healthScore}/100. ${client.scores.performance < 60 ? 'Performance needs urgent attention.' : 'Performance is on track.'}`,
  })

  // Budget discussion if pacing is off
  if (client.scores.budgetPacing < 70) {
    agenda.push({
      topic: 'Budget & Pacing Review',
      duration: '10 min',
      priority: 'high',
      notes: `Budget pacing score: ${client.scores.budgetPacing}/100. Significant deviation detected.`,
    })
  }

  // Strategy discussion
  agenda.push({
    topic: 'Strategie & Roadmap',
    duration: '15 min',
    priority: 'medium',
    notes: 'Bespreken van komende initiatieven en optimalisatiekansen.',
  })

  // Contract review if near end
  if (client.contractEnd) {
    const daysLeft = daysUntil(client.contractEnd)
    if (daysLeft !== null && daysLeft < 90) {
      agenda.push({
        topic: 'Contract Verlenging',
        duration: '10 min',
        priority: 'high',
        notes: `Contract eindigt over ${daysLeft} dagen (${formatDate(client.contractEnd)}). Verlenging bespreken.`,
      })
    }
  }

  // Q&A
  agenda.push({
    topic: 'Vragen & Actiepunten',
    duration: '10 min',
    priority: 'low',
    notes: 'Open vragen bespreken en concrete vervolgacties vastleggen.',
  })

  // === TALKING POINTS ===
  // Performance-based
  if (client.scores.performance >= 80) {
    talkingPoints.push({
      category: 'Performance',
      point: 'Sterke resultaten — benoem successen en wat goed werkt',
      sentiment: 'positive',
      data: `Score: ${client.scores.performance}/100`,
    })
  } else if (client.scores.performance < 50) {
    talkingPoints.push({
      category: 'Performance',
      point: 'Performance onder verwachting — kom met concreet verbeterplan',
      sentiment: 'negative',
      data: `Score: ${client.scores.performance}/100`,
    })
  }

  // Communication-based
  const daysSinceLastMeeting = daysSince(client.lastMeetingDate)
  if (daysSinceLastMeeting && daysSinceLastMeeting > 30) {
    talkingPoints.push({
      category: 'Communicatie',
      point: `${daysSinceLastMeeting} dagen sinds laatste meeting — erken de gap, plan vaste cadans`,
      sentiment: 'negative',
      data: `Laatste meeting: ${formatDate(client.lastMeetingDate)}`,
    })
  }

  // Report-based
  const daysSinceLastReport = daysSince(client.lastReportDate)
  if (daysSinceLastReport && daysSinceLastReport > 14) {
    talkingPoints.push({
      category: 'Rapportage',
      point: `Rapport is ${daysSinceLastReport} dagen oud — presenteer verse data in de meeting`,
      sentiment: 'neutral',
      data: `Laatste rapport: ${formatDate(client.lastReportDate)}`,
    })
  }

  // Platform-specific
  client.platforms.forEach(p => {
    talkingPoints.push({
      category: `Platform: ${p.charAt(0).toUpperCase() + p.slice(1)}`,
      point: `${p.charAt(0).toUpperCase() + p.slice(1)} resultaten bespreken — trends, optimalisaties, learnings`,
      sentiment: 'neutral',
    })
  })

  // Retention
  if (client.scores.retention < 50) {
    talkingPoints.push({
      category: 'Retentie',
      point: 'Lage retentie score — proactief bespreken of verwachtingen nog aligned zijn',
      sentiment: 'negative',
      data: `Score: ${client.scores.retention}/100`,
    })
  }

  // === RISKS ===
  client.alerts.forEach(alert => {
    risks.push({
      risk: alert.message,
      impact: alert.severity,
      mitigation: alert.severity === 'high'
        ? 'Bespreek direct in meeting, kom met actieplan'
        : 'Monitor en neem mee als agendapunt',
    })
  })

  if (client.status === 'at-risk' || client.status === 'critical') {
    risks.push({
      risk: `Klant status is ${STATUS_CONFIG[client.status].label} — churn risico`,
      impact: 'high',
      mitigation: 'Proactief bespreken: "Hoe tevreden zijn jullie? Waar kunnen we verbeteren?"',
    })
  }

  if (client.contractEnd) {
    const daysLeft = daysUntil(client.contractEnd)
    if (daysLeft !== null && daysLeft < 60) {
      risks.push({
        risk: `Contract eindigt over ${daysLeft} dagen`,
        impact: 'high',
        mitigation: 'Verlengingsvoorstel presenteren met resultaten-overzicht en roadmap',
      })
    }
  }

  // === OPPORTUNITIES ===
  if (client.platforms.length < 3) {
    const missing = ['meta', 'google', 'linkedin', 'tiktok'].filter(p => !client.platforms.includes(p))
    if (missing.length > 0) {
      opportunities.push({
        opportunity: `Cross-channel uitbreiding naar ${missing.slice(0, 2).join(' & ')}`,
        potential: `+${formatCurrency(client.retainerValue * 0.3)}/mnd upsell`,
        nextStep: 'Mini-audit of business case presenteren voor nieuw kanaal',
      })
    }
  }

  if (client.scores.performance >= 80) {
    opportunities.push({
      opportunity: 'Budget verhoging op basis van sterke performance',
      potential: 'Hogere spend = meer conversies bij bewezen ROI',
      nextStep: 'Bespreek budget schaling scenario met concrete projecties',
    })
  }

  if (client.retainerValue < 3000) {
    opportunities.push({
      opportunity: 'Upgrade naar premium tier met uitgebreidere rapportage en strategie',
      potential: `+${formatCurrency(1500)}/mnd retainer upgrade`,
      nextStep: 'Toon waarde van premium: dedicated strategist, weekly calls, custom dashboards',
    })
  }

  // === ACTION ITEMS ===
  actionItems.push({
    action: 'Performance rapport bijwerken met laatste data',
    owner: 'nodefy',
    deadline: 'Voor de meeting',
    status: daysSinceLastReport && daysSinceLastReport <= 7 ? 'done' : 'open',
  })

  if (client.scores.budgetPacing < 70) {
    actionItems.push({
      action: 'Budget herverdelingsvoorstel opstellen',
      owner: 'nodefy',
      deadline: 'Tijdens meeting bespreken',
      status: 'open',
    })
  }

  client.alerts.filter(a => a.severity === 'high').forEach(alert => {
    actionItems.push({
      action: `Oplossen: ${alert.message}`,
      owner: 'nodefy',
      deadline: 'Binnen 48 uur',
      status: 'open',
    })
  })

  actionItems.push({
    action: 'Meeting notes & actiepunten mailen naar klant',
    owner: 'nodefy',
    deadline: 'Dezelfde dag',
    status: 'open',
  })

  // === BUDGET SUMMARY (simulated from platforms) ===
  const budgetPerPlatform = client.retainerValue * 2 / Math.max(client.platforms.length, 1)
  const budgetSummary: BudgetLine[] = client.platforms.map((p, i) => {
    const budget = Math.round(budgetPerPlatform * (1 + (i % 2 === 0 ? 0.2 : -0.1)))
    const pacingScore = client.scores.budgetPacing
    const variance = (Math.random() * 0.3 - 0.15) // -15% to +15%
    const spent = Math.round(budget * (0.4 + Math.random() * 0.25) * (1 + variance))
    return {
      platform: p,
      budget,
      spent,
      pacing: Math.round((spent / (budget * 0.4)) * 100), // rough mid-month pacing
    }
  })

  return { client, agenda, talkingPoints, risks, opportunities, actionItems, budgetSummary }
}

export default function MeetingPrepPage() {
  const params = useParams()
  const slug = params.slug as string
  const [prep, setPrep] = useState<MeetingPrepData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [printMode, setPrintMode] = useState(false)

  useEffect(() => {
    fetch('/api/client-health')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data && res.data[slug]) {
          setPrep(generateMeetingPrep(res.data[slug]))
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <div style={{ color: '#9ca3af', fontSize: 14 }}>Meeting prep laden...</div>
        </div>
      </div>
    )
  }

  if (error || !prep) {
    return (
      <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
          <h1 style={{ color: '#f9fafb', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Klant niet gevonden</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Geen health data gevonden voor &quot;{slug}&quot;. Voeg de klant eerst toe aan Client Health.</p>
          <a href="/client-health" style={{ color: '#0047FF', fontSize: 14, textDecoration: 'none', marginTop: 16, display: 'inline-block' }}>← Terug naar Client Health</a>
        </div>
      </div>
    )
  }

  const { client, agenda, talkingPoints, risks, opportunities, actionItems, budgetSummary } = prep
  const statusCfg = STATUS_CONFIG[client.status]
  const nextMeetingDays = daysUntil(client.nextMeetingDate)

  const radarData = {
    labels: ['Performance', 'Budget Pacing', 'Communicatie', 'Retentie'],
    datasets: [{
      label: client.clientName,
      data: [client.scores.performance, client.scores.budgetPacing, client.scores.communication, client.scores.retention],
      backgroundColor: 'rgba(0,71,255,0.15)',
      borderColor: '#0047FF',
      borderWidth: 2,
      pointBackgroundColor: '#0047FF',
      pointBorderColor: '#fff',
      pointBorderWidth: 1,
      pointRadius: 4,
    }],
  }

  const radarOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { display: false, stepSize: 25 },
        grid: { color: 'rgba(255,255,255,0.06)' },
        angleLines: { color: 'rgba(255,255,255,0.06)' },
        pointLabels: { color: '#9ca3af', font: { size: 11 } },
      },
    },
  }

  const budgetBarData = {
    labels: budgetSummary.map(b => b.platform.charAt(0).toUpperCase() + b.platform.slice(1)),
    datasets: [
      {
        label: 'Budget',
        data: budgetSummary.map(b => b.budget),
        backgroundColor: 'rgba(107,114,128,0.3)',
        borderColor: 'rgba(107,114,128,0.6)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Besteed',
        data: budgetSummary.map(b => b.spent),
        backgroundColor: budgetSummary.map(b => b.pacing > 120 ? 'rgba(239,68,68,0.6)' : b.pacing > 105 ? 'rgba(245,158,11,0.6)' : 'rgba(0,71,255,0.6)'),
        borderColor: budgetSummary.map(b => b.pacing > 120 ? '#ef4444' : b.pacing > 105 ? '#f59e0b' : '#0047FF'),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const budgetBarOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#9ca3af', font: { size: 11 } } },
    },
    scales: {
      x: { ticks: { color: '#9ca3af' }, grid: { display: false } },
      y: { ticks: { color: '#6b7280', callback: (v: number | string) => `€${v}` }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  }

  const sectionStyle: React.CSSProperties = {
    background: '#0a0f1c',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  }

  const headerTagStyle = (color: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f9fafb' }}>
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          * { color: black !important; background: white !important; border-color: #e5e7eb !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #030712, #0a0f1c)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '24px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <a href="/client-health" className="no-print" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 13 }}>← Client Health</a>
                <span style={{ color: '#374151' }}>|</span>
                <span style={{ ...headerTagStyle(statusCfg.color), color: statusCfg.color, background: statusCfg.bg }}>
                  {statusCfg.emoji} {statusCfg.label}
                </span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
                📋 Meeting Prep — {client.clientName}
              </h1>
              <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                <span style={{ color: '#6b7280', fontSize: 13 }}>📊 Health: <strong style={{ color: statusCfg.color }}>{client.healthScore}/100</strong></span>
                <span style={{ color: '#6b7280', fontSize: 13 }}>💰 Retainer: <strong style={{ color: '#f9fafb' }}>{formatCurrency(client.retainerValue)}/mnd</strong></span>
                <span style={{ color: '#6b7280', fontSize: 13 }}>👤 AM: <strong style={{ color: '#f9fafb' }}>{client.accountManager}</strong></span>
                <span style={{ color: '#6b7280', fontSize: 13 }}>📁 {client.vertical}</span>
              </div>
            </div>
            <div className="no-print" style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => window.print()}
                style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#d1d5db', fontSize: 13, cursor: 'pointer' }}
              >
                🖨️ Print
              </button>
              <a
                href={`/portal/${slug}`}
                style={{ padding: '8px 16px', background: '#0047FF', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center' }}
              >
                🔗 Portal
              </a>
            </div>
          </div>

          {/* Quick stats bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 20 }}>
            {[
              { label: 'Volgende Meeting', value: client.nextMeetingDate ? formatDate(client.nextMeetingDate) : 'Niet gepland', color: nextMeetingDays !== null && nextMeetingDays <= 3 ? '#10b981' : '#f59e0b' },
              { label: 'Dagen sinds Meeting', value: daysSince(client.lastMeetingDate)?.toString() ?? '—', color: (daysSince(client.lastMeetingDate) ?? 0) > 30 ? '#ef4444' : '#10b981' },
              { label: 'Dagen sinds Rapport', value: daysSince(client.lastReportDate)?.toString() ?? '—', color: (daysSince(client.lastReportDate) ?? 0) > 14 ? '#f59e0b' : '#10b981' },
              { label: 'Open Alerts', value: client.alerts.length.toString(), color: client.alerts.length > 2 ? '#ef4444' : client.alerts.length > 0 ? '#f59e0b' : '#10b981' },
              { label: 'Platforms', value: client.platforms.map(p => PLATFORM_ICONS[p] || '📊').join(' '), color: '#9ca3af' },
            ].map((stat, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 24px 80px' }}>

        {/* Two-column: Radar + Key Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={sectionStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#d1d5db' }}>📊 Health Radar</h2>
            <div style={{ maxWidth: 280, margin: '0 auto' }}>
              <Radar data={radarData} options={radarOptions} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
              {Object.entries(client.scores).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                  <span style={{ color: '#9ca3af', fontSize: 12, textTransform: 'capitalize' }}>{key === 'budgetPacing' ? 'Budget' : key}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: val >= 70 ? '#10b981' : val >= 40 ? '#f59e0b' : '#ef4444' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#d1d5db' }}>💰 Budget Overzicht</h2>
            {budgetSummary.length > 0 ? (
              <>
                <Bar data={budgetBarData} options={budgetBarOptions} />
                <div style={{ marginTop: 12 }}>
                  {budgetSummary.map((b, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>{PLATFORM_ICONS[b.platform] || '📊'} {b.platform}</span>
                      <span style={{ fontSize: 12, color: b.pacing > 120 ? '#ef4444' : b.pacing > 105 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                        {b.pacing}% pacing
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', padding: 40 }}>Geen budget data beschikbaar</div>
            )}
          </div>
        </div>

        {/* Agenda */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#d1d5db' }}>📅 Voorgestelde Agenda</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {agenda.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, borderLeft: `3px solid ${SEVERITY_COLORS[item.priority]}` }}>
                <div style={{ minWidth: 24, height: 24, borderRadius: '50%', background: 'rgba(0,71,255,0.15)', color: '#0047FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{item.topic}</span>
                    <span style={{ fontSize: 11, color: '#6b7280', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 4 }}>{item.duration}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{item.notes}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(0,71,255,0.06)', borderRadius: 8, fontSize: 12, color: '#6b7280' }}>
            ⏱️ Geschatte duur: {agenda.reduce((sum, a) => sum + parseInt(a.duration), 0)} minuten
          </div>
        </div>

        {/* Talking Points */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#d1d5db' }}>💬 Gesprekspunten</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {talkingPoints.map((tp, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>
                  {tp.sentiment === 'positive' ? '✅' : tp.sentiment === 'negative' ? '⚠️' : '💡'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{tp.category}</div>
                  <div style={{ fontSize: 13, color: '#d1d5db' }}>{tp.point}</div>
                  {tp.data && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>📊 {tp.data}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-column: Risks + Opportunities */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Risks */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#d1d5db' }}>⚠️ Risico&apos;s</h2>
            {risks.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#10b981', fontSize: 13 }}>✅ Geen actieve risico&apos;s gedetecteerd</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {risks.map((risk, i) => (
                  <div key={i} style={{ padding: '12px', background: 'rgba(239,68,68,0.04)', borderRadius: 8, borderLeft: `3px solid ${SEVERITY_COLORS[risk.impact]}` }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f9fafb', marginBottom: 4 }}>{risk.risk}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>💡 {risk.mitigation}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Opportunities */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#d1d5db' }}>🚀 Kansen</h2>
            {opportunities.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>Geen specifieke kansen gedetecteerd</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {opportunities.map((opp, i) => (
                  <div key={i} style={{ padding: '12px', background: 'rgba(0,71,255,0.04)', borderRadius: 8, borderLeft: '3px solid #0047FF' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f9fafb', marginBottom: 2 }}>{opp.opportunity}</div>
                    <div style={{ fontSize: 12, color: '#10b981', marginBottom: 4 }}>💰 {opp.potential}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>→ {opp.nextStep}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Items */}
        <div style={sectionStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#d1d5db' }}>✅ Actiepunten</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {actionItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <span style={{ fontSize: 16 }}>
                  {item.status === 'done' ? '✅' : item.status === 'in-progress' ? '🔄' : '⬜'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#d1d5db' }}>{item.action}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>⏰ {item.deadline}</div>
                </div>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: 4,
                  background: item.owner === 'nodefy' ? 'rgba(0,71,255,0.15)' : 'rgba(245,158,11,0.15)',
                  color: item.owner === 'nodefy' ? '#3b82f6' : '#f59e0b',
                  letterSpacing: '0.5px',
                }}>
                  {item.owner === 'nodefy' ? 'Nodefy' : 'Klant'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {client.notes && (
          <div style={sectionStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#d1d5db' }}>📝 Notities</h2>
            <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>{client.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#374151', fontSize: 11 }}>
          Meeting Prep gegenereerd op {new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · Nodefy Cockpit
        </div>
      </div>
    </div>
  )
}
