'use client'
import React, { useState } from 'react'
import { RETAINER_CLIENTS, ACTIVE_RETAINER_CLIENTS, CURRENT_MONTH_IDX } from '../../data/config'
import { DEFAULT_CLIENTS } from '../../data/defaults'
import type { Client } from '../../types'

interface TeamTabProps {
  colors: Record<string, string>
}

interface LeadStats {
  lead: string
  clientCount: number
  totalRetainer: number
  avgRetainer: number
  currentMRR: number
  clients: Array<{
    name: string
    bedrag: number
    status: string
    monthlyRevenue: number
    health: 'good' | 'warning' | 'inactive'
  }>
}

export default function TeamTab({ colors }: TeamTabProps) {
  const [selectedLead, setSelectedLead] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'revenue' | 'clients' | 'avg'>('revenue')

  // Aggregate data per account lead
  const leadMap = new Map<string, LeadStats>()

  ACTIVE_RETAINER_CLIENTS.forEach(client => {
    const lead = client.lead || 'Unassigned'
    if (!lead) return

    if (!leadMap.has(lead)) {
      leadMap.set(lead, {
        lead,
        clientCount: 0,
        totalRetainer: 0,
        avgRetainer: 0,
        currentMRR: 0,
        clients: [],
      })
    }

    const stats = leadMap.get(lead)!
    stats.clientCount++
    stats.totalRetainer += client.bedrag
    stats.currentMRR += client.months[CURRENT_MONTH_IDX]

    const monthlyRev = client.months[CURRENT_MONTH_IDX]
    stats.clients.push({
      name: client.klant,
      bedrag: client.bedrag,
      status: client.status,
      monthlyRevenue: monthlyRev,
      health: monthlyRev === 0 ? 'inactive' : monthlyRev >= 2000 ? 'good' : 'warning',
    })
  })

  // Calculate averages
  leadMap.forEach(stats => {
    stats.avgRetainer = stats.clientCount > 0 ? Math.round(stats.totalRetainer / stats.clientCount) : 0
  })

  // Sort leads
  const leads = Array.from(leadMap.values()).sort((a, b) => {
    if (sortBy === 'revenue') return b.totalRetainer - a.totalRetainer
    if (sortBy === 'clients') return b.clientCount - a.clientCount
    return b.avgRetainer - a.avgRetainer
  })

  const maxRevenue = Math.max(...leads.map(l => l.totalRetainer), 1)
  const totalARR = leads.reduce((sum, l) => sum + l.totalRetainer, 0)
  const totalMRR = leads.reduce((sum, l) => sum + l.currentMRR, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${colors.textPrimary}`}>👥 Team Performance</h2>
          <p className={`text-[13px] ${colors.textSecondary} mt-1`}>
            Revenue per account lead • {leads.length} leads • ARR €{totalARR.toLocaleString('nl-NL')} • MRR €{totalMRR.toLocaleString('nl-NL')}
          </p>
        </div>
        <div className="flex gap-2">
          {(['revenue', 'clients', 'avg'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-3 py-1 rounded text-[12px] font-medium transition-colors ${sortBy === s ? 'bg-[#0047FF] text-white' : `${colors.bgCard} ${colors.textSecondary} border ${colors.border}`}`}>
              {s === 'revenue' ? '💰 Revenue' : s === 'clients' ? '👥 Clients' : '📊 Avg'}
            </button>
          ))}
        </div>
      </div>

      {/* Bar Chart - CSS only */}
      <div className={`${colors.bgCard} rounded-xl border ${colors.border} p-6`}>
        <h3 className={`text-[14px] font-semibold ${colors.textPrimary} mb-4`}>Annual Retainer Revenue per Lead</h3>
        <div className="space-y-3">
          {leads.map(lead => {
            const pct = Math.round((lead.totalRetainer / maxRevenue) * 100)
            return (
              <div key={lead.lead} className="group cursor-pointer" onClick={() => setSelectedLead(selectedLead === lead.lead ? null : lead.lead)}>
                <div className="flex items-center gap-3">
                  <div className={`w-28 text-[12px] font-medium ${colors.textSecondary} truncate`} title={lead.lead}>
                    {lead.lead}
                  </div>
                  <div className="flex-1 h-7 rounded-md overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div
                      className="h-full rounded-md transition-all duration-500 flex items-center justify-end pr-2"
                      style={{
                        width: `${Math.max(pct, 3)}%`,
                        background: `linear-gradient(90deg, #0047FF ${Math.max(0, 100 - pct)}%, #00C2FF 100%)`,
                      }}
                    >
                      {pct > 20 && (
                        <span className="text-[11px] font-mono text-white/90">
                          €{lead.totalRetainer.toLocaleString('nl-NL')}
                        </span>
                      )}
                    </div>
                    {pct <= 20 && (
                      <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-mono ${colors.textSecondary}`}>
                        €{lead.totalRetainer.toLocaleString('nl-NL')}
                      </span>
                    )}
                  </div>
                  <div className={`w-16 text-right text-[11px] ${colors.textTertiary}`}>
                    {lead.clientCount} clients
                  </div>
                </div>

                {/* Expanded client list */}
                {selectedLead === lead.lead && (
                  <div className={`mt-2 ml-32 space-y-1 animate-[fadeIn_0.2s_ease-out]`}>
                    {lead.clients.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue).map(client => (
                      <div key={client.name} className={`flex items-center gap-2 px-3 py-1.5 rounded ${colors.bgInput}`}>
                        <span className={`w-2 h-2 rounded-full ${
                          client.health === 'good' ? 'bg-emerald-500' :
                          client.health === 'warning' ? 'bg-amber-500' : 'bg-gray-500'
                        }`} />
                        <span className={`text-[12px] ${colors.textSecondary} flex-1`}>{client.name}</span>
                        <span className={`text-[11px] font-mono ${colors.textTertiary}`}>
                          €{client.monthlyRevenue.toLocaleString('nl-NL')}/mo
                        </span>
                        <span className={`text-[11px] font-mono ${colors.accent}`}>
                          €{client.bedrag.toLocaleString('nl-NL')}/yr
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Lead Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {leads.map(lead => (
          <div key={lead.lead} className={`${colors.bgCard} rounded-xl border ${colors.border} p-5 hover:border-[#0047FF]/30 transition-colors`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-[15px] font-semibold ${colors.textPrimary}`}>{lead.lead}</h3>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${colors.bgInput} ${colors.textTertiary}`}>
                {lead.clientCount} clients
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <p className={`text-[10px] uppercase tracking-wider ${colors.textTertiary}`}>ARR</p>
                <p className={`text-[16px] font-bold font-mono ${colors.accent}`}>
                  €{(lead.totalRetainer / 1000).toFixed(0)}K
                </p>
              </div>
              <div>
                <p className={`text-[10px] uppercase tracking-wider ${colors.textTertiary}`}>MRR</p>
                <p className={`text-[16px] font-bold font-mono ${colors.textPrimary}`}>
                  €{lead.currentMRR.toLocaleString('nl-NL')}
                </p>
              </div>
              <div>
                <p className={`text-[10px] uppercase tracking-wider ${colors.textTertiary}`}>Avg</p>
                <p className={`text-[16px] font-bold font-mono ${colors.textSecondary}`}>
                  €{lead.avgRetainer.toLocaleString('nl-NL')}
                </p>
              </div>
            </div>

            {/* Mini client list */}
            <div className="space-y-1">
              {lead.clients.sort((a, b) => b.bedrag - a.bedrag).slice(0, 5).map(client => (
                <div key={client.name} className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    client.health === 'good' ? 'bg-emerald-500' :
                    client.health === 'warning' ? 'bg-amber-500' : 'bg-gray-500'
                  }`} />
                  <span className={`text-[11px] ${colors.textSecondary} flex-1 truncate`}>{client.name}</span>
                  <span className={`text-[10px] font-mono ${colors.textTertiary}`}>
                    €{client.monthlyRevenue.toLocaleString('nl-NL')}/mo
                  </span>
                </div>
              ))}
              {lead.clients.length > 5 && (
                <p className={`text-[10px] ${colors.textTertiary} pl-4`}>
                  +{lead.clients.length - 5} more
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className={`flex items-center gap-4 text-[11px] ${colors.textTertiary}`}>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> ≥€2K/mo</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> &lt;€2K/mo</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-500" /> Inactive this month</span>
      </div>
    </div>
  )
}
