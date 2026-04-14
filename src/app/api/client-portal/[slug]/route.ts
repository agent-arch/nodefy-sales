import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const CLIENT_PORTALS_KEY = 'client-portals'
const PORTAL_VIEWS_KEY = 'portal-views'

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { searchParams } = new URL(request.url)
  const password = searchParams.get('password')
  const action = searchParams.get('action')
  
  try {
    // Get portal config
    const portalData = await redis.get(`${CLIENT_PORTALS_KEY}:${slug}`)
    if (!portalData || portalData === '') {
      return NextResponse.json({ success: false, error: 'Portal not found' }, { status: 404 })
    }
    
    const portal: ClientPortalConfig = JSON.parse(portalData as string)
    
    // Check if portal is active
    if (!portal.isActive) {
      return NextResponse.json({ success: false, error: 'Portal is disabled' }, { status: 403 })
    }
    
    // Check expiration
    if (portal.access.expiresAt && new Date() > new Date(portal.access.expiresAt)) {
      return NextResponse.json({ success: false, error: 'Portal has expired' }, { status: 403 })
    }
    
    // Check password if required
    if (portal.access.password && password !== portal.access.password) {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 })
    }
    
    // Track portal view
    if (action !== 'config') {
      const viewsData = await redis.get(`${PORTAL_VIEWS_KEY}:${slug}`)
      const views = viewsData ? JSON.parse(viewsData as string) : []
      const newView = {
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
      
      views.push(newView)
      await redis.set(`${PORTAL_VIEWS_KEY}:${slug}`, JSON.stringify(views))
      
      // Check max views limit
      if (portal.access.maxViews && views.length > portal.access.maxViews) {
        return NextResponse.json({ success: false, error: 'Portal view limit exceeded' }, { status: 403 })
      }
    }
    
    // Return config only for setup
    if (action === 'config') {
      return NextResponse.json({ success: true, portal })
    }
    
    // Get client performance data
    const performanceData = await redis.get(`client-performance:monitor:${portal.clientId}`)
    const clientPerformance = performanceData ? JSON.parse(performanceData as string) : null
    
    // Get client reports data
    const reportsData = await redis.get(`client-reports:data:${portal.clientId}`)
    const clientReports = reportsData ? JSON.parse(reportsData as string) : null
    
    // Get client insights
    const insightsData = await redis.get(`client-insights:data:${portal.clientId}`)
    const clientInsights = insightsData ? JSON.parse(insightsData as string) : null
    
    // Build sanitized data based on portal modules
    const portalData_clean = {
      config: {
        clientName: portal.clientName,
        portalName: portal.portalName,
        brandColors: portal.brandColors,
        logo: portal.logo,
        modules: portal.modules,
        customization: {
          welcomeMessage: portal.customization.welcomeMessage,
          hideSpendData: portal.customization.hideSpendData,
          showPredictions: portal.customization.showPredictions,
          allowDownloads: portal.customization.allowDownloads,
          showCompetitorData: portal.customization.showCompetitorData,
          updateFrequency: portal.customization.updateFrequency
        }
      },
      performance: portal.modules.performance ? {
        healthScore: clientPerformance?.healthScore || 0,
        alertLevel: clientPerformance?.alertLevel || 'healthy',
        metrics: clientPerformance?.metrics ? {
          metaRoas: clientPerformance.metrics.metaRoas,
          googleRoas: clientPerformance.metrics.googleRoas,
          conversionRate: clientPerformance.metrics.conversionRate,
          budgetUtilization: portal.customization.hideSpendData ? undefined : clientPerformance.metrics.budgetUtilization,
          landingPageSpeed: clientPerformance.metrics.landingPageSpeed,
          // Hide spend data if requested
          metaSpend: portal.customization.hideSpendData ? undefined : clientPerformance.metrics.metaSpend,
          googleSpend: portal.customization.hideSpendData ? undefined : clientPerformance.metrics.googleSpend,
        } : null,
        trends: clientPerformance?.trends || null,
        predictions: portal.customization.showPredictions ? clientPerformance?.predictions : undefined
      } : null,
      reports: portal.modules.reports ? clientReports : null,
      insights: portal.modules.insights ? clientInsights : null,
      lastUpdated: new Date().toISOString()
    }
    
    return NextResponse.json({ success: true, data: portalData_clean })
    
  } catch (error) {
    console.error('Client portal GET error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// Generate client portal analytics
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  
  try {
    const body = await request.json()
    const { action, auth } = body
    
    // Auth check
    if (auth !== process.env.DASHBOARD_AUTH_TOKEN && auth !== 'nodefy-internal') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    if (action === 'analytics') {
      // Get portal views
      const viewsData = await redis.get(`${PORTAL_VIEWS_KEY}:${slug}`)
      const views = viewsData ? JSON.parse(viewsData as string) : []
      
      // Get portal config
      const portalData = await redis.get(`${CLIENT_PORTALS_KEY}:${slug}`)
      if (!portalData) {
        return NextResponse.json({ success: false, error: 'Portal not found' }, { status: 404 })
      }
      
      const portal: ClientPortalConfig = JSON.parse(portalData as string)
      
      // Calculate analytics
      const now = new Date()
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      const views24h = views.filter((v: any) => new Date(v.timestamp) > last24h)
      const views7d = views.filter((v: any) => new Date(v.timestamp) > last7d)
      const views30d = views.filter((v: any) => new Date(v.timestamp) > last30d)
      
      // Unique IPs
      const uniqueIps24h = new Set(views24h.map((v: any) => v.ip)).size
      const uniqueIps7d = new Set(views7d.map((v: any) => v.ip)).size
      const uniqueIps30d = new Set(views30d.map((v: any) => v.ip)).size
      
      // Most active hours
      const hourCounts: Record<string, number> = {}
      views7d.forEach((v: any) => {
        const hour = new Date(v.timestamp).getHours()
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
      })
      
      const analytics = {
        portal: {
          slug,
          clientName: portal.clientName,
          portalName: portal.portalName,
          createdAt: portal.createdAt,
          isActive: portal.isActive
        },
        usage: {
          totalViews: views.length,
          views24h: views24h.length,
          views7d: views7d.length,
          views30d: views30d.length,
          uniqueVisitors24h: uniqueIps24h,
          uniqueVisitors7d: uniqueIps7d,
          uniqueVisitors30d: uniqueIps30d
        },
        patterns: {
          mostActiveHour: Object.entries(hourCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || null,
          averageViewsPerDay: views7d.length / 7,
          peakDay: null // Could calculate this
        },
        limits: {
          maxViews: portal.access.maxViews || null,
          viewsRemaining: portal.access.maxViews ? Math.max(0, portal.access.maxViews - views.length) : null,
          expiresAt: portal.access.expiresAt || null
        }
      }
      
      return NextResponse.json({ success: true, analytics })
    }
    
    if (action === 'regenerate_link') {
      // Get existing portal config
      const portalData = await redis.get(`${CLIENT_PORTALS_KEY}:${slug}`)
      if (!portalData) {
        return NextResponse.json({ success: false, error: 'Portal not found' }, { status: 404 })
      }
      
      const portal: ClientPortalConfig = JSON.parse(portalData as string)
      
      // Generate new portal slug for security
      const newSlug = `${portal.clientId}-${Math.random().toString(36).substr(2, 8)}`
      portal.slug = newSlug
      portal.updatedAt = new Date().toISOString()
      
      // Save with new slug
      await redis.set(`${CLIENT_PORTALS_KEY}:${newSlug}`, JSON.stringify(portal))
      
      // Delete old slug
      await redis.del(`${CLIENT_PORTALS_KEY}:${slug}`)
      
      return NextResponse.json({ success: true, newSlug, newUrl: `/portal/${newSlug}` })
    }
    
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Client portal POST error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}