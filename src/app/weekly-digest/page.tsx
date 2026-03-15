'use client'

import React, { useState, useEffect } from 'react'

interface WeeklyDigest {
  weekNumber: number
  year: number
  period: string
  generatedAt: string
  revenue: { mrr: number; arr: number; mrrChange: number; newDeals: number; newDealValue: number; churnedMrr: number }
  pipeline: { totalDeals: number; newDeals: number; closedWon: number; closedLost: number; staleDeals: number; totalValue: number }
  clients: { totalActive: number; healthScore: number; alerts: { high: number; medium: number; positive: number }; topPerformer: string; atRisk: string[] }
  content: { postsCreated: number; postsPublished: number; articlesWritten: number; caseStudies: number }
  nightshift: { shiftsRun: number; prospectsResearched: number; featuresBuilt: number; deploysCount: number }
  highlights: string[]
  actionItems: string[]
}

function MetricCard({ label, value, change, prefix = '', suffix = '' }: { label: string; value: string | number; change?: number; prefix?: string; suffix?: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="text-xs text-white/50 mb-1">{label}</div>
      <div className="text-2xl font-bold">{prefix}{typeof value === 'number' ? value.toLocaleString('nl-NL') : value}{suffix}</div>
      {change !== undefined && (
        <div className={`text-xs mt-1 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change).toLocaleString('nl-NL')}{suffix} vs vorige week
        </div>
      )}
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  )
}

export default function WeeklyDigestPage() {
  const [digests, setDigests] = useState<WeeklyDigest[]>([])
  const [selected, setSelected] = useState<WeeklyDigest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/weekly-digest')
      .then(r => r.json())
      .then(r => {
        const list = r.data || []
        setDigests(list)
        if (list.length > 0) setSelected(list[0])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/60">
        Loading weekly digest...
      </div>
    )
  }

  const d = selected

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-white/40 hover:text-white/70 transition text-sm">← Cockpit</a>
            <div className="w-px h-5 bg-white/20" />
            <h1 className="text-xl font-bold">📊 Weekly Digest</h1>
          </div>
          
          {digests.length > 1 && (
            <select
              value={d ? `${d.year}-W${d.weekNumber}` : ''}
              onChange={e => {
                const sel = digests.find(x => `${x.year}-W${x.weekNumber}` === e.target.value)
                if (sel) setSelected(sel)
              }}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm"
            >
              {digests.map(x => (
                <option key={`${x.year}-W${x.weekNumber}`} value={`${x.year}-W${x.weekNumber}`}>
                  Week {x.weekNumber}, {x.year} ({x.period})
                </option>
              ))}
            </select>
          )}
        </div>
      </header>

      {!d ? (
        <div className="max-w-7xl mx-auto px-6 py-20 text-center text-white/30">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-xl font-semibold mb-2">No digests yet</h2>
          <p className="text-sm">Weekly digests are auto-generated every Sunday night.</p>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-6 py-6 space-y-8">
          {/* Period Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold">Week {d.weekNumber}</h2>
            <p className="text-white/50 text-sm">{d.period}</p>
          </div>

          {/* Revenue */}
          <Section title="Revenue" icon="💰">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard label="MRR" value={d.revenue.mrr} change={d.revenue.mrrChange} prefix="€" />
              <MetricCard label="ARR" value={d.revenue.arr} prefix="€" />
              <MetricCard label="New Deals" value={d.revenue.newDeals} />
              <MetricCard label="New Deal Value" value={d.revenue.newDealValue} prefix="€" />
            </div>
          </Section>

          {/* Pipeline */}
          <Section title="Pipeline" icon="📊">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <MetricCard label="Total Deals" value={d.pipeline.totalDeals} />
              <MetricCard label="New" value={d.pipeline.newDeals} />
              <MetricCard label="Won" value={d.pipeline.closedWon} />
              <MetricCard label="Lost" value={d.pipeline.closedLost} />
              <MetricCard label="Stale (>14d)" value={d.pipeline.staleDeals} />
            </div>
          </Section>

          {/* Client Health */}
          <Section title="Client Health" icon="🏥">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard label="Active Clients" value={d.clients.totalActive} />
              <MetricCard label="Health Score" value={d.clients.healthScore} suffix="/100" />
              <MetricCard label="Alerts (High)" value={d.clients.alerts.high} />
              <MetricCard label="Positive Signals" value={d.clients.alerts.positive} />
            </div>
            {d.clients.atRisk.length > 0 && (
              <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="text-xs text-red-400 font-semibold mb-1">⚠️ At Risk</div>
                <div className="text-sm">{d.clients.atRisk.join(', ')}</div>
              </div>
            )}
          </Section>

          {/* Content & Nightshift */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section title="Content" icon="✍️">
              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="Posts Created" value={d.content.postsCreated} />
                <MetricCard label="Published" value={d.content.postsPublished} />
                <MetricCard label="Articles" value={d.content.articlesWritten} />
                <MetricCard label="Case Studies" value={d.content.caseStudies} />
              </div>
            </Section>

            <Section title="Nightshift" icon="🌙">
              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="Shifts Run" value={d.nightshift.shiftsRun} />
                <MetricCard label="Prospects" value={d.nightshift.prospectsResearched} />
                <MetricCard label="Features Built" value={d.nightshift.featuresBuilt} />
                <MetricCard label="Deploys" value={d.nightshift.deploysCount} />
              </div>
            </Section>
          </div>

          {/* Highlights & Action Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {d.highlights.length > 0 && (
              <Section title="Highlights" icon="⭐">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
                  {d.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span className="text-white/80">{h}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {d.actionItems.length > 0 && (
              <Section title="Action Items" icon="📌">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
                  {d.actionItems.map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-400 mt-0.5">→</span>
                      <span className="text-white/80">{a}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </main>
      )}
    </div>
  )
}
