'use client'

import React, { useState, useEffect } from 'react'

interface ClientPortalConfig {
  slug: string
  clientId: string
  clientName: string
  clientEmail: string
  portalName: string
  brandColors: {
    primary: string
    secondary: string
    background: string
    text: string
  }
  logo?: string
  modules: {
    overview: boolean
    performance: boolean
    spend: boolean
    campaigns: boolean
    reports: boolean
    insights: boolean
    recommendations: boolean
    goals: boolean
  }
  customization: {
    welcomeMessage?: string
    hideSpendData?: boolean
    showPredictions?: boolean
    allowDownloads?: boolean
    showCompetitorData?: boolean
    updateFrequency: 'realtime' | 'hourly' | 'daily'
  }
  access: {
    password?: string
    ipWhitelist?: string[]
    requireLogin: boolean
    expiresAt?: string
    maxViews?: number
  }
  createdAt: string
  updatedAt: string
  isActive: boolean
}

const ClientPortalManager: React.FC<{ isDark: boolean; clients: any[] }> = ({ isDark, clients }) => {
  const [portals, setPortals] = useState<ClientPortalConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPortal, setSelectedPortal] = useState<ClientPortalConfig | null>(null)
  const [creating, setCreating] = useState(false)
  const [copiedPortal, setCopiedPortal] = useState<string | null>(null)

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

  const fetchPortals = async () => {
    try {
      const response = await fetch('/api/client-portals')
      const result = await response.json()
      if (result.success) {
        setPortals(result.portals)
      }
    } catch (error) {
      console.error('Failed to fetch portals:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortals()
  }, [])

  const quickCreatePortal = async (clientId: string, clientName: string, templateType: string) => {
    setCreating(true)
    try {
      const response = await fetch('/api/client-portals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'quick_create',
          clientId,
          clientName,
          templateType,
          auth: 'nodefy-internal'
        })
      })
      
      const result = await response.json()
      if (result.success) {
        setPortals(prev => [...prev, result.portal])
        // Copy URL to clipboard
        navigator.clipboard.writeText(`${window.location.origin}${result.portalUrl}`)
        setCopiedPortal(result.portal.slug)
        setTimeout(() => setCopiedPortal(null), 3000)
      }
    } catch (error) {
      console.error('Failed to create portal:', error)
    } finally {
      setCreating(false)
    }
  }

  const togglePortalStatus = async (slug: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/client-portals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          slug,
          updates: { isActive },
          auth: 'nodefy-internal'
        })
      })
      
      if (response.ok) {
        setPortals(prev => prev.map(p => 
          p.slug === slug ? { ...p, isActive } : p
        ))
      }
    } catch (error) {
      console.error('Failed to update portal:', error)
    }
  }

  const copyPortalUrl = (slug: string) => {
    const url = `${window.location.origin}/portal/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedPortal(slug)
    setTimeout(() => setCopiedPortal(null), 2000)
  }

  const deletePortal = async (slug: string) => {
    if (!confirm('Weet je zeker dat je deze portal wilt verwijderen?')) return
    
    try {
      await fetch('/api/client-portals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          slug,
          auth: 'nodefy-internal'
        })
      })
      
      setPortals(prev => prev.filter(p => p.slug !== slug))
    } catch (error) {
      console.error('Failed to delete portal:', error)
    }
  }

  const getModuleCount = (modules: ClientPortalConfig['modules']) => {
    return Object.values(modules).filter(Boolean).length
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className={`${colors.bgCard} rounded-md p-8 border ${colors.border}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className={`ml-3 ${colors.textPrimary}`}>Loading client portals...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-semibold ${colors.textPrimary}`}>🏠 Client Portal Manager</h2>
          <p className={`text-sm ${colors.textSecondary}`}>Create branded portals for clients to view their performance data</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Custom Portal
        </button>
      </div>

      {/* Quick Actions */}
      <div className={`${colors.bgCard} rounded-md border ${colors.border}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-sm font-medium ${colors.textPrimary}`}>⚡ Quick Create Portals</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Minimal Template */}
            <div className={`p-4 rounded-md border ${colors.border} ${colors.bgCardHover}`}>
              <h4 className={`font-medium ${colors.textPrimary} mb-2`}>📊 Minimal Portal</h4>
              <p className={`text-xs ${colors.textSecondary} mb-3`}>Basic performance overview without sensitive data</p>
              <div className="space-y-2">
                {clients.slice(0, 3).map(client => (
                  <button
                    key={`min-${client.id}`}
                    onClick={() => quickCreatePortal(client.id, client.naam, 'minimal')}
                    disabled={creating || portals.some(p => p.clientId === client.id)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      portals.some(p => p.clientId === client.id)
                        ? `${colors.textTertiary} cursor-not-allowed`
                        : `${colors.textPrimary} ${colors.bgInput} hover:${colors.bgActive}`
                    }`}
                  >
                    {portals.some(p => p.clientId === client.id) ? '✅' : '+'} {client.naam}
                  </button>
                ))}
              </div>
            </div>

            {/* Standard Template */}
            <div className={`p-4 rounded-md border ${colors.border} ${colors.bgCardHover}`}>
              <h4 className={`font-medium ${colors.textPrimary} mb-2`}>🎯 Standard Portal</h4>
              <p className={`text-xs ${colors.textSecondary} mb-3`}>Full performance data with insights and recommendations</p>
              <div className="space-y-2">
                {clients.slice(0, 3).map(client => (
                  <button
                    key={`std-${client.id}`}
                    onClick={() => quickCreatePortal(client.id, client.naam, 'standard')}
                    disabled={creating || portals.some(p => p.clientId === client.id)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      portals.some(p => p.clientId === client.id)
                        ? `${colors.textTertiary} cursor-not-allowed`
                        : `${colors.textPrimary} ${colors.bgInput} hover:${colors.bgActive}`
                    }`}
                  >
                    {portals.some(p => p.clientId === client.id) ? '✅' : '+'} {client.naam}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Access Template */}
            <div className={`p-4 rounded-md border ${colors.border} ${colors.bgCardHover}`}>
              <h4 className={`font-medium ${colors.textPrimary} mb-2`}>🔥 Full Access Portal</h4>
              <p className={`text-xs ${colors.textSecondary} mb-3`}>Complete transparency with real-time data and spend details</p>
              <div className="space-y-2">
                {clients.slice(0, 3).map(client => (
                  <button
                    key={`full-${client.id}`}
                    onClick={() => quickCreatePortal(client.id, client.naam, 'full_access')}
                    disabled={creating || portals.some(p => p.clientId === client.id)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      portals.some(p => p.clientId === client.id)
                        ? `${colors.textTertiary} cursor-not-allowed`
                        : `${colors.textPrimary} ${colors.bgInput} hover:${colors.bgActive}`
                    }`}
                  >
                    {portals.some(p => p.clientId === client.id) ? '✅' : '+'} {client.naam}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {creating && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm text-blue-600">Creating client portal...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Existing Portals */}
      <div className={`${colors.bgCard} rounded-md border ${colors.border}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className={`text-sm font-medium ${colors.textPrimary}`}>🏠 Active Client Portals ({portals.length})</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Active ({portals.filter(p => p.isActive).length})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
              Disabled ({portals.filter(p => !p.isActive).length})
            </span>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {portals.length === 0 ? (
            <div className="p-8 text-center">
              <p className={`${colors.textSecondary}`}>Geen client portals gevonden</p>
              <p className={`text-xs ${colors.textTertiary} mt-1`}>Gebruik Quick Create om snel te starten</p>
            </div>
          ) : (
            portals.map((portal) => (
              <div key={portal.slug} className={`p-4 ${colors.bgCardHover}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span 
                          className={`w-3 h-3 rounded-full ${portal.isActive ? 'bg-green-500' : 'bg-gray-500'}`}
                        />
                        <h4 className={`font-medium ${colors.textPrimary}`}>{portal.portalName}</h4>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${colors.bgInput} ${colors.textTertiary}`}>
                        {getModuleCount(portal.modules)} modules
                      </span>
                      {copiedPortal === portal.slug && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          ✓ Link gekopieerd
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <span className={colors.textSecondary}>Client: {portal.clientName}</span>
                      <span className={colors.textTertiary}>•</span>
                      <span className={colors.textTertiary}>Created: {formatDate(portal.createdAt)}</span>
                    </div>
                    
                    {/* Portal Features */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {Object.entries(portal.modules)
                        .filter(([, enabled]) => enabled)
                        .map(([module]) => (
                          <span 
                            key={module}
                            className={`text-xs px-2 py-1 rounded-full ${colors.bgInput} ${colors.textTertiary}`}
                          >
                            {module}
                          </span>
                        ))
                      }
                    </div>
                    
                    {/* Security Features */}
                    {(portal.access.password || portal.access.maxViews || portal.access.expiresAt) && (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {portal.access.password && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            🔒 Password Protected
                          </span>
                        )}
                        {portal.access.maxViews && (
                          <span className="flex items-center gap-1 text-blue-600">
                            👁️ Max {portal.access.maxViews} views
                          </span>
                        )}
                        {portal.access.expiresAt && (
                          <span className="flex items-center gap-1 text-red-600">
                            ⏰ Expires {formatDate(portal.access.expiresAt)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyPortalUrl(portal.slug)}
                      className="px-3 py-1 text-xs bg-blue-500/10 text-blue-600 rounded hover:bg-blue-500/20 transition-colors"
                    >
                      📋 Copy Link
                    </button>
                    <a
                      href={`/portal/${portal.slug}`}
                      target="_blank"
                      className="px-3 py-1 text-xs bg-green-500/10 text-green-600 rounded hover:bg-green-500/20 transition-colors"
                    >
                      👀 Preview
                    </a>
                    <button
                      onClick={() => togglePortalStatus(portal.slug, !portal.isActive)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        portal.isActive
                          ? 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20'
                          : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                      }`}
                    >
                      {portal.isActive ? '⏸️ Disable' : '▶️ Enable'}
                    </button>
                    <button
                      onClick={() => deletePortal(portal.slug)}
                      className="px-3 py-1 text-xs bg-red-500/10 text-red-600 rounded hover:bg-red-500/20 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ClientPortalManager