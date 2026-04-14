'use client'

import React, { useState, useEffect, useRef } from 'react'

interface ClientPerformanceData {
  clientId: string
  clientName: string
  timestamp: string
  metrics: {
    metaSpend: number
    metaRoas: number
    metaCpm: number
    metaCtr: number
    googleSpend: number
    googleRoas: number
    googleCpc: number
    googleCtr: number
    revenue: number
    conversions: number
    cac: number
    ltv: number
    budgetUtilization: number
    campaignActivity: number
    landingPageSpeed: number
    conversionRate: number
  }
  trends: {
    spendTrend: 'up' | 'down' | 'stable'
    roasTrend: 'up' | 'down' | 'stable'
    conversionTrend: 'up' | 'down' | 'stable'
  }
  alertLevel: 'healthy' | 'warning' | 'critical' | 'urgent'
  healthScore: number
  predictions: {
    nextWeekSpend: number
    nextWeekRoas: number
    riskOfChurn: number
  }
}

interface PerformanceAlert {
  id: string
  clientId: string
  clientName: string
  type: 'performance' | 'budget' | 'technical' | 'predictive'
  severity: 'info' | 'warning' | 'critical' | 'urgent'
  title: string
  description: string
  recommendation: string
  metrics: Record<string, number>
  timestamp: string
  acknowledged: boolean
  autoResolved: boolean
  clientNotified: boolean
}

const PerformanceMonitor: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [performanceData, setPerformanceData] = useState<ClientPerformanceData[]>([])
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Theme colors
  const colors = {
    bgCard: isDark ? 'bg-[#222225]' : 'bg-white',
    bgCardHover: isDark ? 'hover:bg-[#2A2A2E]' : 'hover:bg-gray-50',
    border: isDark ? 'border-[#2E2E32]' : 'border-[#E4E4E8]',
    textPrimary: isDark ? 'text-[#E8E8ED]' : 'text-gray-900',
    textSecondary: isDark ? 'text-[#8B8B93]' : 'text-gray-500',
    textTertiary: isDark ? 'text-[#5C5C63]' : 'text-gray-400',
    bgInput: isDark ? 'bg-[#18181B]' : 'bg-[#F9F9FB]',
    bgActive: isDark ? 'bg-[#2A2A2E]' : 'bg-gray-100',
  }

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/performance-monitor')
      const result = await response.json()
      
      if (result.success) {
        setPerformanceData(result.data.performance || [])
        setAlerts(result.data.alerts || [])
        setLastUpdate(new Date().toLocaleString('nl-NL'))
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchPerformanceData()
    
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchPerformanceData, 30000)
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoRefresh])

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch('/api/performance-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'acknowledge_alert', 
          alertId,
          auth: 'nodefy-internal' 
        })
      })
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ))
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      await fetch('/api/performance-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'resolve_alert', 
          alertId,
          auth: 'nodefy-internal' 
        })
      })
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  const getHealthColor = (healthScore: number) => {
    if (healthScore >= 80) return '#22C55E'
    if (healthScore >= 60) return '#F59E0B'
    if (healthScore >= 40) return '#EF4444'
    return '#DC2626'
  }

  const getAlertColor = (severity: PerformanceAlert['severity']) => {
    switch (severity) {
      case 'info': return '#3B82F6'
      case 'warning': return '#F59E0B'
      case 'critical': return '#EF4444'
      case 'urgent': return '#DC2626'
      default: return '#6B7280'
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈'
      case 'down': return '📉'
      case 'stable': return '➡️'
    }
  }

  // Summary stats
  const healthyClients = performanceData.filter(c => c.healthScore >= 80).length
  const warningClients = performanceData.filter(c => c.healthScore >= 60 && c.healthScore < 80).length
  const criticalClients = performanceData.filter(c => c.healthScore < 60).length
  const urgentAlerts = alerts.filter(a => a.severity === 'urgent' && !a.acknowledged).length
  const criticalAlertsCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length

  if (loading) {
    return (
      <div className={`${colors.bgCard} rounded-md p-8 border ${colors.border}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className={`ml-3 ${colors.textPrimary}`}>Loading performance data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-semibold ${colors.textPrimary}`}>🎯 Real-time Performance Monitor</h2>
          <p className={`text-sm ${colors.textSecondary}`}>AI-powered client performance tracking with predictive alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              autoRefresh 
                ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                : `${colors.bgInput} ${colors.textTertiary} border ${colors.border}`
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {autoRefresh ? 'Live' : 'Paused'}
          </button>
          <span className={`text-xs ${colors.textTertiary}`}>
            Last update: {lastUpdate}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${colors.textSecondary}`}>Healthy Clients</span>
            <span className="text-green-500">😊</span>
          </div>
          <p className={`text-2xl font-bold ${colors.textPrimary} mt-1`}>{healthyClients}</p>
          <p className={`text-xs ${colors.textTertiary}`}>Score ≥ 80</p>
        </div>

        <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${colors.textSecondary}`}>Need Attention</span>
            <span className="text-yellow-500">⚠️</span>
          </div>
          <p className={`text-2xl font-bold ${colors.textPrimary} mt-1`}>{warningClients}</p>
          <p className={`text-xs ${colors.textTertiary}`}>Score 60-79</p>
        </div>

        <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${colors.textSecondary}`}>Critical Issues</span>
            <span className="text-red-500">🚨</span>
          </div>
          <p className={`text-2xl font-bold ${colors.textPrimary} mt-1`}>{criticalClients}</p>
          <p className={`text-xs ${colors.textTertiary}`}>Score &lt; 60</p>
        </div>

        <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${colors.textSecondary}`}>Active Alerts</span>
            <span className="text-red-500">🔔</span>
          </div>
          <p className={`text-2xl font-bold ${colors.textPrimary} mt-1`}>{urgentAlerts + criticalAlertsCount}</p>
          <p className={`text-xs ${colors.textTertiary}`}>{urgentAlerts} urgent</p>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.filter(a => !a.acknowledged).length > 0 && (
        <div className={`${colors.bgCard} rounded-md border ${colors.border}`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-sm font-medium ${colors.textPrimary}`}>🚨 Active Alerts</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {alerts.filter(a => !a.acknowledged).slice(0, 10).map((alert) => (
              <div key={alert.id} className={`p-4 border-b ${colors.border} last:border-0 ${colors.bgCardHover}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getAlertColor(alert.severity) }}
                      />
                      <span className={`text-sm font-medium ${colors.textPrimary}`}>
                        {alert.title}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${colors.bgInput} ${colors.textTertiary}`}>
                        {alert.type}
                      </span>
                    </div>
                    <p className={`text-sm ${colors.textSecondary} mb-2`}>{alert.description}</p>
                    <p className={`text-xs ${colors.textTertiary} mb-2`}>
                      💡 {alert.recommendation}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className={colors.textTertiary}>
                        Client: <span className={colors.textSecondary}>{alert.clientName}</span>
                      </span>
                      <span className={colors.textTertiary}>
                        {new Date(alert.timestamp).toLocaleString('nl-NL')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1 text-xs bg-blue-500/10 text-blue-600 rounded hover:bg-blue-500/20 transition-colors"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1 text-xs bg-green-500/10 text-green-600 rounded hover:bg-green-500/20 transition-colors"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client Performance Grid */}
      <div className={`${colors.bgCard} rounded-md border ${colors.border}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-sm font-medium ${colors.textPrimary}`}>📊 Client Performance Overview</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {performanceData.map((client) => (
              <div 
                key={client.clientId} 
                className={`p-4 rounded-md border transition-all cursor-pointer ${colors.border} ${colors.bgCardHover}
                  ${selectedClient === client.clientId ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedClient(selectedClient === client.clientId ? null : client.clientId)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-medium ${colors.textPrimary}`}>{client.clientName}</span>
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getHealthColor(client.healthScore) }}
                    />
                    <span className={`text-sm font-mono ${colors.textSecondary}`}>
                      {client.healthScore}
                    </span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className={`${colors.bgInput} rounded p-2`}>
                    <p className={`text-xs ${colors.textTertiary}`}>Meta ROAS</p>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-mono ${colors.textPrimary}`}>
                        {client.metrics.metaRoas.toFixed(1)}x
                      </span>
                      <span className="text-xs">{getTrendIcon(client.trends.roasTrend)}</span>
                    </div>
                  </div>
                  <div className={`${colors.bgInput} rounded p-2`}>
                    <p className={`text-xs ${colors.textTertiary}`}>Google ROAS</p>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-mono ${colors.textPrimary}`}>
                        {client.metrics.googleRoas.toFixed(1)}x
                      </span>
                      <span className="text-xs">{getTrendIcon(client.trends.roasTrend)}</span>
                    </div>
                  </div>
                  <div className={`${colors.bgInput} rounded p-2`}>
                    <p className={`text-xs ${colors.textTertiary}`}>Total Spend</p>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-mono ${colors.textPrimary}`}>
                        €{((client.metrics.metaSpend + client.metrics.googleSpend) / 1000).toFixed(1)}K
                      </span>
                      <span className="text-xs">{getTrendIcon(client.trends.spendTrend)}</span>
                    </div>
                  </div>
                  <div className={`${colors.bgInput} rounded p-2`}>
                    <p className={`text-xs ${colors.textTertiary}`}>Conv. Rate</p>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-mono ${colors.textPrimary}`}>
                        {client.metrics.conversionRate.toFixed(1)}%
                      </span>
                      <span className="text-xs">{getTrendIcon(client.trends.conversionTrend)}</span>
                    </div>
                  </div>
                </div>

                {/* Predictions */}
                <div className={`${colors.bgInput} rounded p-2`}>
                  <p className={`text-xs ${colors.textTertiary} mb-1`}>AI Predictions</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs">Next week ROAS:</span>
                      <span className={`text-xs font-mono ${colors.textPrimary}`}>
                        {client.predictions.nextWeekRoas.toFixed(1)}x
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs">Churn risk:</span>
                      <span 
                        className={`text-xs font-mono`}
                        style={{ 
                          color: client.predictions.riskOfChurn > 70 ? '#EF4444' : 
                                 client.predictions.riskOfChurn > 40 ? '#F59E0B' : '#22C55E' 
                        }}
                      >
                        {client.predictions.riskOfChurn.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expand for more details */}
                {selectedClient === client.clientId && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Budget Util: {client.metrics.budgetUtilization.toFixed(0)}%</div>
                      <div>Page Speed: {client.metrics.landingPageSpeed.toFixed(0)}</div>
                      <div>Meta CPM: €{client.metrics.metaCpm.toFixed(2)}</div>
                      <div>Google CPC: €{client.metrics.googleCpc.toFixed(2)}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceMonitor