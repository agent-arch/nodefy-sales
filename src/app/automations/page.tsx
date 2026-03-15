'use client'

import React, { useState, useEffect } from 'react'

interface AutomationRun {
  id: string
  script: string
  status: 'success' | 'error' | 'running'
  startedAt: string
  completedAt?: string
  durationMs?: number
  output?: string
  error?: string
  metrics?: Record<string, number | string>
  trigger: 'manual' | 'cron' | 'nightshift'
}

interface AutomationScript {
  id: string
  name: string
  file: string
  description: string
  category: 'health' | 'pipeline' | 'content' | 'reporting' | 'intelligence' | 'sales'
  schedule?: string
  lastRun?: AutomationRun
  enabled: boolean
}

interface AutomationsData {
  scripts: AutomationScript[]
  runs: AutomationRun[]
  lastUpdated: string
}

const CATEGORY_COLORS: Record<string, string> = {
  health: '#10b981',
  pipeline: '#3b82f6',
  content: '#8b5cf6',
  reporting: '#f59e0b',
  intelligence: '#ec4899',
  sales: '#0047FF',
}

const CATEGORY_ICONS: Record<string, string> = {
  health: '🏥',
  pipeline: '📊',
  content: '✍️',
  reporting: '📋',
  intelligence: '🔍',
  sales: '💰',
}

const STATUS_ICONS: Record<string, string> = {
  success: '✅',
  error: '❌',
  running: '⏳',
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

export default function AutomationsPage() {
  const [data, setData] = useState<AutomationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [view, setView] = useState<'scripts' | 'history'>('scripts')
  const [selectedRun, setSelectedRun] = useState<AutomationRun | null>(null)

  useEffect(() => {
    fetch('/api/automations')
      .then(r => r.json())
      .then(r => { setData(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/60 text-lg">Loading automations...</div>
      </div>
    )
  }

  const scripts = data?.scripts || []
  const runs = data?.runs || []
  const categories = ['all', ...new Set(scripts.map(s => s.category))]
  const filteredScripts = filter === 'all' ? scripts : scripts.filter(s => s.category === filter)
  
  const stats = {
    total: scripts.length,
    enabled: scripts.filter(s => s.enabled).length,
    successRate: runs.length > 0 
      ? Math.round((runs.filter(r => r.status === 'success').length / runs.length) * 100) 
      : 0,
    totalRuns: runs.length,
    lastRun: runs.length > 0 ? runs[0].startedAt : null,
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-white/40 hover:text-white/70 transition text-sm">← Cockpit</a>
            <div className="w-px h-5 bg-white/20" />
            <h1 className="text-xl font-bold">⚡ Automations Hub</h1>
          </div>
          <div className="text-xs text-white/40">
            {data?.lastUpdated ? `Updated ${timeAgo(data.lastUpdated)}` : ''}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total Scripts', value: stats.total, icon: '📜' },
            { label: 'Enabled', value: stats.enabled, icon: '✅' },
            { label: 'Success Rate', value: `${stats.successRate}%`, icon: '📈' },
            { label: 'Total Runs', value: stats.totalRuns, icon: '🔄' },
            { label: 'Last Run', value: stats.lastRun ? timeAgo(stats.lastRun) : 'Never', icon: '🕐' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-white/50">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* View Toggle + Filter */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setView('scripts')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === 'scripts' ? 'bg-[#0047FF] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              📜 Scripts
            </button>
            <button
              onClick={() => setView('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === 'history' ? 'bg-[#0047FF] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              📋 Run History
            </button>
          </div>
          
          {view === 'scripts' && (
            <div className="flex gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filter === cat ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {cat === 'all' ? '🔗 All' : `${CATEGORY_ICONS[cat] || '📦'} ${cat}`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scripts Grid */}
        {view === 'scripts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScripts.map(script => (
              <div
                key={script.id}
                className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-white/20 transition group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{CATEGORY_ICONS[script.category] || '📦'}</span>
                    <h3 className="font-semibold text-sm">{script.name}</h3>
                  </div>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: script.enabled ? '#10b981' : '#6b7280' }}
                  />
                </div>
                
                <p className="text-xs text-white/50 mb-3 line-clamp-2">{script.description}</p>
                
                <div className="flex items-center justify-between text-xs">
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${CATEGORY_COLORS[script.category]}20`, color: CATEGORY_COLORS[script.category] }}
                  >
                    {script.category}
                  </span>
                  
                  {script.lastRun ? (
                    <span className="text-white/40 flex items-center gap-1">
                      {STATUS_ICONS[script.lastRun.status]} {timeAgo(script.lastRun.startedAt)}
                      {script.lastRun.durationMs && (
                        <span className="text-white/30">({formatDuration(script.lastRun.durationMs)})</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-white/30">Never run</span>
                  )}
                </div>
                
                {script.schedule && (
                  <div className="mt-2 text-xs text-white/30">
                    🕐 {script.schedule}
                  </div>
                )}
              </div>
            ))}
            
            {filteredScripts.length === 0 && (
              <div className="col-span-full text-center py-12 text-white/30">
                No scripts found. Push automation data via the API.
              </div>
            )}
          </div>
        )}

        {/* Run History */}
        {view === 'history' && (
          <div className="space-y-2">
            {runs.length === 0 ? (
              <div className="text-center py-12 text-white/30">No runs recorded yet.</div>
            ) : (
              runs.slice(0, 50).map(run => (
                <div
                  key={run.id}
                  onClick={() => setSelectedRun(selectedRun?.id === run.id ? null : run)}
                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{STATUS_ICONS[run.status]}</span>
                      <div>
                        <div className="font-medium text-sm">{run.script}</div>
                        <div className="text-xs text-white/40">
                          {new Date(run.startedAt).toLocaleString('nl-NL')} · {run.trigger}
                          {run.durationMs && ` · ${formatDuration(run.durationMs)}`}
                        </div>
                      </div>
                    </div>
                    
                    {run.metrics && (
                      <div className="flex gap-3 text-xs text-white/50">
                        {Object.entries(run.metrics).slice(0, 3).map(([k, v]) => (
                          <span key={k}>{k}: <strong className="text-white/70">{v}</strong></span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {selectedRun?.id === run.id && (run.output || run.error) && (
                    <pre className="mt-3 p-3 bg-black/40 rounded-lg text-xs text-white/60 overflow-x-auto whitespace-pre-wrap max-h-64">
                      {run.error || run.output}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
