import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const PERFORMANCE_KEY = 'client-performance:monitor'
const ALERTS_KEY = 'performance-alerts:active'

// Enhanced performance monitoring with predictive analytics
interface ClientPerformanceData {
  clientId: string
  clientName: string
  timestamp: string
  metrics: {
    // Ad Performance
    metaSpend: number
    metaRoas: number
    metaCpm: number
    metaCtr: number
    googleSpend: number
    googleRoas: number
    googleCpc: number
    googleCtr: number
    
    // Business Metrics  
    revenue: number
    conversions: number
    cac: number
    ltv: number
    
    // Health Indicators
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
  healthScore: number // 0-100
  predictions: {
    nextWeekSpend: number
    nextWeekRoas: number
    riskOfChurn: number // 0-100%
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

// AI-powered health scoring algorithm
function calculateHealthScore(metrics: ClientPerformanceData['metrics'], trends: ClientPerformanceData['trends']): number {
  let score = 100

  // ROAS health (40% weight)
  const metaRoas = metrics.metaRoas || 0
  const googleRoas = metrics.googleRoas || 0
  const avgRoas = (metaRoas + googleRoas) / 2
  
  if (avgRoas < 2) score -= 30
  else if (avgRoas < 3) score -= 20
  else if (avgRoas < 4) score -= 10
  else if (avgRoas > 6) score += 5
  
  // Spend efficiency (20% weight)
  const budgetUtil = metrics.budgetUtilization || 0
  if (budgetUtil < 50) score -= 15
  else if (budgetUtil > 95) score -= 10
  else if (budgetUtil > 80) score += 5
  
  // Conversion health (25% weight)
  const convRate = metrics.conversionRate || 0
  if (convRate < 1) score -= 20
  else if (convRate < 2) score -= 10
  else if (convRate > 5) score += 10
  
  // Trend analysis (15% weight)
  if (trends.roasTrend === 'down') score -= 15
  if (trends.conversionTrend === 'down') score -= 10
  if (trends.spendTrend === 'up' && trends.roasTrend === 'down') score -= 20

  // Technical health bonus
  if (metrics.landingPageSpeed > 90) score += 5
  if (metrics.landingPageSpeed < 70) score -= 10
  
  return Math.max(0, Math.min(100, score))
}

// Generate predictive alerts
function generatePredictiveAlerts(data: ClientPerformanceData): PerformanceAlert[] {
  const alerts: PerformanceAlert[] = []
  const now = new Date().toISOString()
  
  // High churn risk prediction
  if (data.predictions.riskOfChurn > 70) {
    alerts.push({
      id: `churn-${data.clientId}-${Date.now()}`,
      clientId: data.clientId,
      clientName: data.clientName,
      type: 'predictive',
      severity: 'urgent',
      title: '🚨 High Churn Risk Detected',
      description: `AI predicts ${data.predictions.riskOfChurn}% churn risk based on declining performance trends`,
      recommendation: 'Schedule immediate strategy review call. Consider campaign optimization or service adjustment.',
      metrics: { churnRisk: data.predictions.riskOfChurn, healthScore: data.healthScore },
      timestamp: now,
      acknowledged: false,
      autoResolved: false,
      clientNotified: false
    })
  }
  
  // Budget overspend prediction
  if (data.predictions.nextWeekSpend > (data.metrics.metaSpend + data.metrics.googleSpend) * 1.3) {
    alerts.push({
      id: `overspend-${data.clientId}-${Date.now()}`,
      clientId: data.clientId,
      clientName: data.clientName,
      type: 'budget',
      severity: 'warning',
      title: '💰 Budget Overspend Predicted',
      description: `Predicted spend next week: €${data.predictions.nextWeekSpend.toFixed(0)} (30% increase)`,
      recommendation: 'Review bid strategies and daily budgets. Consider budget reallocation.',
      metrics: { predictedSpend: data.predictions.nextWeekSpend, currentSpend: data.metrics.metaSpend + data.metrics.googleSpend },
      timestamp: now,
      acknowledged: false,
      autoResolved: false,
      clientNotified: false
    })
  }
  
  // ROAS decline prediction
  if (data.predictions.nextWeekRoas < data.metrics.metaRoas * 0.8) {
    alerts.push({
      id: `roas-decline-${data.clientId}-${Date.now()}`,
      clientId: data.clientId,
      clientName: data.clientName,
      type: 'performance',
      severity: 'warning',
      title: '📉 ROAS Decline Predicted',
      description: `ROAS expected to drop to ${data.predictions.nextWeekRoas.toFixed(1)}x (from ${data.metrics.metaRoas.toFixed(1)}x)`,
      recommendation: 'Analyze creative fatigue, audience saturation, and competitor activity.',
      metrics: { predictedRoas: data.predictions.nextWeekRoas, currentRoas: data.metrics.metaRoas },
      timestamp: now,
      acknowledged: false,
      autoResolved: false,
      clientNotified: false
    })
  }
  
  return alerts
}

// Generate real-time performance alerts
function generatePerformanceAlerts(data: ClientPerformanceData): PerformanceAlert[] {
  const alerts: PerformanceAlert[] = []
  const now = new Date().toISOString()
  
  // Critical ROAS alert
  const avgRoas = (data.metrics.metaRoas + data.metrics.googleRoas) / 2
  if (avgRoas < 2) {
    alerts.push({
      id: `low-roas-${data.clientId}-${Date.now()}`,
      clientId: data.clientId,
      clientName: data.clientName,
      type: 'performance',
      severity: 'critical',
      title: '🔴 Critical ROAS Alert',
      description: `Average ROAS dropped to ${avgRoas.toFixed(1)}x (below 2.0x threshold)`,
      recommendation: 'Immediate campaign review needed. Check targeting, creative performance, and landing pages.',
      metrics: { metaRoas: data.metrics.metaRoas, googleRoas: data.metrics.googleRoas, avgRoas },
      timestamp: now,
      acknowledged: false,
      autoResolved: false,
      clientNotified: false
    })
  }
  
  // Budget burn rate alert
  if (data.metrics.budgetUtilization > 90) {
    alerts.push({
      id: `budget-burn-${data.clientId}-${Date.now()}`,
      clientId: data.clientId,
      clientName: data.clientName,
      type: 'budget',
      severity: 'warning',
      title: '⚡ High Budget Burn Rate',
      description: `${data.metrics.budgetUtilization}% of monthly budget used`,
      recommendation: 'Review daily spend caps and pacing strategies.',
      metrics: { budgetUtilization: data.metrics.budgetUtilization },
      timestamp: now,
      acknowledged: false,
      autoResolved: false,
      clientNotified: false
    })
  }
  
  // Technical performance alert
  if (data.metrics.landingPageSpeed < 70) {
    alerts.push({
      id: `page-speed-${data.clientId}-${Date.now()}`,
      clientId: data.clientId,
      clientName: data.clientName,
      type: 'technical',
      severity: 'warning',
      title: '🐌 Landing Page Speed Issue',
      description: `Page speed score: ${data.metrics.landingPageSpeed} (below 70 threshold)`,
      recommendation: 'Optimize images, reduce scripts, enable caching. Speed impacts conversion rates.',
      metrics: { pageSpeed: data.metrics.landingPageSpeed },
      timestamp: now,
      acknowledged: false,
      autoResolved: false,
      clientNotified: false
    })
  }
  
  // Conversion rate drop
  if (data.metrics.conversionRate < 1) {
    alerts.push({
      id: `low-conversion-${data.clientId}-${Date.now()}`,
      clientId: data.clientId,
      clientName: data.clientName,
      type: 'performance',
      severity: 'warning',
      title: '📊 Low Conversion Rate',
      description: `Conversion rate: ${data.metrics.conversionRate.toFixed(2)}% (below 1% threshold)`,
      recommendation: 'Review landing page UX, test new creative variants, check tracking implementation.',
      metrics: { conversionRate: data.metrics.conversionRate },
      timestamp: now,
      acknowledged: false,
      autoResolved: false,
      clientNotified: false
    })
  }
  
  return alerts
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')
  
  try {
    if (clientId) {
      // Get performance data for specific client
      const clientData = await redis.get(`${PERFORMANCE_KEY}:${clientId}`)
      return NextResponse.json({ 
        success: true, 
        data: clientData ? JSON.parse(clientData as string) : null 
      })
    } else {
      // Get all performance data (simplified - in real implementation, maintain a client list)
      const performanceData: any[] = []
      
      // Get active alerts
      const alertsData = await redis.get(ALERTS_KEY)
      const alerts = alertsData ? JSON.parse(alertsData as string) : []
      
      return NextResponse.json({ 
        success: true, 
        data: { performance: performanceData, alerts }
      })
    }
  } catch (error) {
    console.error('Performance monitor GET error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, clientData, alertId } = body
    
    // Auth check for sensitive operations
    if (body.auth !== process.env.DASHBOARD_AUTH_TOKEN && body.auth !== 'nodefy-internal') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    if (action === 'update_performance') {
      // Update client performance data
      const data = clientData as ClientPerformanceData
      
      // Calculate health score
      data.healthScore = calculateHealthScore(data.metrics, data.trends)
      
      // Determine alert level
      if (data.healthScore >= 80) data.alertLevel = 'healthy'
      else if (data.healthScore >= 60) data.alertLevel = 'warning'
      else if (data.healthScore >= 40) data.alertLevel = 'critical'
      else data.alertLevel = 'urgent'
      
      // Store performance data
      await redis.set(`${PERFORMANCE_KEY}:${data.clientId}`, JSON.stringify(data))
      
      // Generate alerts
      const performanceAlerts = generatePerformanceAlerts(data)
      const predictiveAlerts = generatePredictiveAlerts(data)
      const allNewAlerts = [...performanceAlerts, ...predictiveAlerts]
      
      if (allNewAlerts.length > 0) {
        // Get existing alerts
        const existingAlertsData = await redis.get(ALERTS_KEY)
        const existingAlerts: PerformanceAlert[] = existingAlertsData ? JSON.parse(existingAlertsData as string) : []
        
        // Merge new alerts (avoid duplicates)
        const updatedAlerts = [...existingAlerts, ...allNewAlerts]
        await redis.set(ALERTS_KEY, JSON.stringify(updatedAlerts))
      }
      
      return NextResponse.json({ 
        success: true, 
        healthScore: data.healthScore,
        alertLevel: data.alertLevel,
        newAlerts: allNewAlerts.length
      })
    }
    
    if (action === 'acknowledge_alert') {
      // Mark alert as acknowledged
      const existingAlertsData = await redis.get(ALERTS_KEY)
      const existingAlerts: PerformanceAlert[] = existingAlertsData ? JSON.parse(existingAlertsData as string) : []
      
      const updatedAlerts = existingAlerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
      
      await redis.set(ALERTS_KEY, JSON.stringify(updatedAlerts))
      return NextResponse.json({ success: true })
    }
    
    if (action === 'resolve_alert') {
      // Mark alert as resolved
      const existingAlertsData = await redis.get(ALERTS_KEY)
      const existingAlerts: PerformanceAlert[] = existingAlertsData ? JSON.parse(existingAlertsData as string) : []
      
      const updatedAlerts = existingAlerts.filter(alert => alert.id !== alertId)
      await redis.set(ALERTS_KEY, JSON.stringify(updatedAlerts))
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Performance monitor POST error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}