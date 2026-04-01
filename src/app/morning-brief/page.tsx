'use client'

import React, { useState, useEffect } from 'react'

// Retainer data (mirrored from main page — shared module would be ideal)
const RETAINER_CLIENTS = [
  { klant: 'Tours & Tickets', status: 'Actief', bedrag: 72000, months: [6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000], startJaar: 2022 },
  { klant: 'Kisch', status: 'Actief', bedrag: 3000, months: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1000, 1000, 1000], startJaar: 2022 },
  { klant: 'Spirit', status: 'Actief', bedrag: 51000, months: [4250, 4250, 4250, 4250, 4250, 4250, 4250, 4250, 4250, 4250, 4250, 4250], startJaar: 2022 },
  { klant: 'SB+WAA+Fun', status: 'Actief', bedrag: 16800, months: [1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400], startJaar: 2022 },
  { klant: 'Caron', status: 'Actief', bedrag: 7650, months: [2325, 2325, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300], startJaar: 2023 },
  { klant: 'The Branding Club NL', status: 'Actief', bedrag: 30000, months: [2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500], startJaar: 2023 },
  { klant: 'Talent Care', status: 'Actief', bedrag: 31200, months: [2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600], startJaar: 2023 },
  { klant: 'Restaurants Shaul', status: 'Actief', bedrag: 12000, months: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000], startJaar: 2024 },
  { klant: 'Digital Notary', status: 'Actief', bedrag: 43200, months: [3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600], startJaar: 2024 },
  { klant: 'Padelpoints', status: 'Actief', bedrag: 21600, months: [1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800], startJaar: 2024 },
  { klant: 'Franky Amsterdam', status: 'Actief', bedrag: 36000, months: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000], startJaar: 2024 },
  { klant: 'The Core', status: 'Actief', bedrag: 6000, months: [1500, 1500, 1500, 1500, 0, 0, 0, 0, 0, 0, 0, 0], startJaar: 2024 },
  { klant: 'Ripple Surf Therapy', status: 'Actief', bedrag: 12000, months: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000], startJaar: 2025 },
  { klant: 'FlorisDaken / Mankracht', status: 'Actief', bedrag: 9600, months: [800, 800, 800, 800, 800, 800, 800, 800, 800, 800, 800, 800], startJaar: 2025 },
  { klant: 'Rust Zacht', status: 'Actief', bedrag: 24000, months: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000], startJaar: 2025 },
  { klant: 'Eginstill', status: 'Actief', bedrag: 14400, months: [1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200], startJaar: 2025 },
  { klant: 'Floryn', status: 'Actief', bedrag: 38640, months: [3220, 3220, 3220, 3220, 3220, 3220, 3220, 3220, 3220, 3220, 3220, 3220], startJaar: 2025 },
  { klant: 'Student Experience', status: 'Actief', bedrag: 10800, months: [900, 900, 900, 900, 900, 900, 900, 900, 900, 900, 900, 900], startJaar: 2025 },
  { klant: 'BunBun/Little Bonfire', status: 'Actief', bedrag: 18000, months: [1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500], startJaar: 2025 },
  { klant: 'Momentum', status: 'Actief', bedrag: 33600, months: [2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800], startJaar: 2025 },
  { klant: 'Stories', status: 'Actief', bedrag: 31200, months: [2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600], startJaar: 2025 },
  { klant: 'Unity Units', status: 'Actief', bedrag: 86400, months: [8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 5600, 5600, 5600, 5600], startJaar: 2025 },
  { klant: 'Displine', status: 'Actief', bedrag: 40800, months: [3400, 3400, 3400, 3400, 3400, 3400, 3400, 3400, 3400, 3400, 3400, 3400], startJaar: 2025 },
  { klant: 'Distillery / Phima', status: 'Actief', bedrag: 38400, months: [3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200], startJaar: 2025 },
  { klant: 'Lake Cycling', status: 'Actief', bedrag: 74400, months: [6200, 6200, 6200, 6200, 6200, 6200, 6200, 6200, 6200, 6200, 6200, 6200], startJaar: 2025 },
  { klant: 'Bikeshoe4u / Grutto', status: 'Actief', bedrag: 59400, months: [6600, 4800, 4800, 4800, 4800, 4800, 4800, 4800, 4800, 4800, 4800, 4800], startJaar: 2026 },
  { klant: 'Synvest', status: 'Actief', bedrag: 30300, months: [6150, 6150, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800], startJaar: 2026 },
  { klant: 'Renaissance / CIMA', status: 'Actief', bedrag: 59800, months: [0, 4800, 5500, 5500, 5500, 5500, 5500, 5500, 5500, 5500, 5500, 5500], startJaar: 2026 },
  { klant: 'Carelli', status: 'Actief', bedrag: 34000, months: [0, 5000, 2900, 2900, 2900, 2900, 2900, 2900, 2900, 2900, 2900, 2900], startJaar: 2026 },
  { klant: 'Mr Fris', status: 'Actief', bedrag: 30200, months: [0, 2200, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800], startJaar: 2026 },
  { klant: 'Insetto', status: 'Actief', bedrag: 8400, months: [0, 0, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 0, 0, 0], startJaar: 2026 },
  { klant: 'Code Zero', status: 'Actief', bedrag: 36700, months: [0, 0, 2500, 3800, 3800, 3800, 3800, 3800, 3800, 3800, 3800, 3800], startJaar: 2026 },
  { klant: 'Travelteq', status: 'Actief', bedrag: 34200, months: [0, 0, 0, 3800, 3800, 3800, 3800, 3800, 3800, 3800, 3800, 3800], startJaar: 2026 },
  { klant: 'ESTG', status: 'Actief', bedrag: 32900, months: [0, 0, 0, 2500, 3800, 3800, 3800, 3800, 3800, 3800, 3800, 3800], startJaar: 2026 },
  { klant: 'Mellow', status: 'Actief', bedrag: 18000, months: [0, 0, 0, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000], startJaar: 2026 },
] as const

const MONTHLY_COSTS = { totalMonthly: 57580 }

export default function MorningBrief() {
  const [time, setTime] = useState(new Date())
  
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const monthIdx = time.getMonth()
  const monthNames = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
  const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']
  
  const active = RETAINER_CLIENTS.filter(c => c.status === 'Actief')
  const mrr = active.reduce((s, c) => s + c.months[monthIdx], 0)
  const arr = active.reduce((s, c) => s + c.bedrag, 0)
  const profit = mrr - MONTHLY_COSTS.totalMonthly
  const margin = mrr > 0 ? Math.round((profit / mrr) * 100) : 0
  
  // Q2 
  const q2Months = [3, 4, 5]
  const q2Revenue = q2Months.reduce((sum, mi) => sum + active.reduce((s, c) => s + c.months[mi], 0), 0)
  const q2Target = 350000
  
  // New clients this month
  const newThisMonth = RETAINER_CLIENTS.filter(c => {
    if (monthIdx === 0) return false
    return c.months[monthIdx] > 0 && c.months[monthIdx - 1] === 0
  })
  
  // MRR change vs last month
  const lastMrr = monthIdx > 0 ? active.reduce((s, c) => s + c.months[monthIdx - 1], 0) : mrr
  const mrrChange = mrr - lastMrr
  const mrrChangePercent = lastMrr > 0 ? ((mrrChange / lastMrr) * 100).toFixed(1) : '0'
  
  // Top 5 clients by current month revenue
  const topClients = [...active]
    .map(c => ({ name: c.klant, revenue: c.months[monthIdx] }))
    .filter(c => c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
  
  // Clients with revenue drop
  const droppingClients = monthIdx > 0 ? active
    .filter(c => c.months[monthIdx] < c.months[monthIdx - 1] && c.months[monthIdx - 1] > 0)
    .map(c => ({
      name: c.klant,
      was: c.months[monthIdx - 1],
      now: c.months[monthIdx],
      drop: c.months[monthIdx - 1] - c.months[monthIdx]
    }))
    .sort((a, b) => b.drop - a.drop) : []

  const quarter = Math.floor(monthIdx / 3) + 1

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-zinc-500 text-sm font-mono mb-1">
            {dayNames[time.getDay()]} {time.getDate()} {monthNames[monthIdx]} {time.getFullYear()} — {time.getHours().toString().padStart(2, '0')}:{time.getMinutes().toString().padStart(2, '0')}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Goedemorgen, Ruben ☀️
          </h1>
          <p className="text-zinc-400 mt-1">Q{quarter} 2026 · Week {Math.ceil(time.getDate() / 7)} van {monthNames[monthIdx]}</p>
        </div>

        {/* Financial Pulse */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
            <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">MRR</p>
            <p className="text-2xl font-bold font-mono">€{mrr.toLocaleString('nl-NL')}</p>
            <p className={`text-xs mt-1 ${mrrChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {mrrChange >= 0 ? '↑' : '↓'} €{Math.abs(mrrChange).toLocaleString('nl-NL')} ({mrrChangePercent}%)
            </p>
          </div>
          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
            <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">ARR</p>
            <p className="text-2xl font-bold font-mono">€{(arr / 1000).toFixed(0)}K</p>
            <p className="text-xs text-zinc-500 mt-1">{Math.round(arr / 13000)}% van €1.3M</p>
          </div>
          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
            <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Marge</p>
            <p className={`text-2xl font-bold font-mono ${margin >= 30 ? 'text-emerald-400' : 'text-orange-400'}`}>{margin}%</p>
            <p className="text-xs text-zinc-500 mt-1">€{profit.toLocaleString('nl-NL')}/mnd</p>
          </div>
          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
            <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Klanten</p>
            <p className="text-2xl font-bold font-mono">{active.filter(c => c.months[monthIdx] > 0).length}</p>
            <p className="text-xs text-zinc-500 mt-1">actief & betalend</p>
          </div>
        </div>

        {/* Q2 Progress */}
        <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Q2 Revenue Target</h2>
            <span className="text-sm font-mono font-bold text-emerald-400">
              €{(q2Revenue / 1000).toFixed(0)}K / €{(q2Target / 1000).toFixed(0)}K
            </span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all"
              style={{ width: `${Math.min((q2Revenue / q2Target) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-2">{Math.round((q2Revenue / q2Target) * 100)}% — €{((q2Target - q2Revenue) / 1000).toFixed(0)}K te gaan</p>
        </div>

        {/* MRR Trend */}
        <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800 mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-4">MRR Trend 2026</h2>
          <div className="flex items-end gap-1" style={{ height: '100px' }}>
            {Array.from({ length: 12 }, (_, i) => {
              const val = active.reduce((s, c) => s + c.months[i], 0)
              const maxVal = Math.max(...Array.from({ length: 12 }, (_, j) => active.reduce((s, c) => s + c.months[j], 0)))
              const height = Math.max((val / maxVal) * 100, 3)
              const isCurrent = i === monthIdx
              const isPast = i < monthIdx
              const labels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-mono text-zinc-500">
                    {val > 0 ? `${(val / 1000).toFixed(0)}` : ''}
                  </span>
                  <div
                    className={`w-full rounded-t transition-all ${isCurrent ? 'bg-blue-500' : isPast ? 'bg-zinc-600' : 'bg-zinc-800 border border-dashed border-zinc-700'}`}
                    style={{ height: `${height}%`, minHeight: '3px' }}
                  />
                  <span className={`text-[10px] ${isCurrent ? 'text-white font-bold' : 'text-zinc-600'}`}>{labels[i]}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Top Clients */}
          <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-3">Top 5 Klanten</h2>
            <div className="space-y-2">
              {topClients.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-600 text-xs font-mono w-4">{i + 1}</span>
                    <span className="text-sm text-zinc-200">{c.name}</span>
                  </div>
                  <span className="text-sm font-mono text-zinc-300">€{c.revenue.toLocaleString('nl-NL')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* New Clients */}
          {newThisMonth.length > 0 ? (
            <div className="bg-zinc-900 rounded-lg p-5 border border-emerald-900/50">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-400 mb-3">
                🆕 Nieuw in {monthNames[monthIdx]}
              </h2>
              <div className="space-y-2">
                {newThisMonth.map((c, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-200">{c.klant}</span>
                    <span className="text-sm font-mono text-emerald-400">+€{c.months[monthIdx].toLocaleString('nl-NL')}/mnd</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-3">Revenue Mix</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Retainers</span>
                  <span className="font-mono text-zinc-200">€{mrr.toLocaleString('nl-NL')}/mnd</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Kosten</span>
                  <span className="font-mono text-red-400">-€{MONTHLY_COSTS.totalMonthly.toLocaleString('nl-NL')}/mnd</span>
                </div>
                <div className="border-t border-zinc-800 pt-2 flex justify-between text-sm font-semibold">
                  <span className="text-zinc-300">Netto</span>
                  <span className={`font-mono ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>€{profit.toLocaleString('nl-NL')}/mnd</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Drops */}
        {droppingClients.length > 0 && (
          <div className="bg-zinc-900 rounded-lg p-5 border border-orange-900/50 mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-orange-400 mb-3">
              ⚠️ Revenue Dalingen vs vorige maand
            </h2>
            <div className="space-y-2">
              {droppingClients.slice(0, 5).map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-200">{c.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-zinc-500">€{c.was.toLocaleString('nl-NL')} →</span>
                    <span className="text-sm font-mono text-orange-400">€{c.now.toLocaleString('nl-NL')}</span>
                    <span className="text-xs font-mono text-red-400">-€{c.drop.toLocaleString('nl-NL')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3 mb-8">
          <a href="/" className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 hover:border-zinc-600 transition-colors">
            → Dashboard
          </a>
          <a href="https://app.hubspot.com" target="_blank" className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 hover:border-zinc-600 transition-colors">
            → HubSpot
          </a>
          <a href="https://ads.google.com" target="_blank" className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 hover:border-zinc-600 transition-colors">
            → Google Ads
          </a>
          <a href="https://business.facebook.com" target="_blank" className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 hover:border-zinc-600 transition-colors">
            → Meta Business
          </a>
        </div>

        {/* Footer */}
        <p className="text-zinc-700 text-xs text-center">
          Auto-generated by Nodefy AI · {time.toISOString().split('T')[0]}
        </p>
      </div>
    </div>
  )
}
