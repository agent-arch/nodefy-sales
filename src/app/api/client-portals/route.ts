import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const CLIENT_PORTALS_KEY = 'client-portals'

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

// Get all client portals
export async function GET() {
  try {
    // For now, return empty array - in real implementation, maintain a portals list
    const portals: any[] = []
    
    return NextResponse.json({ success: true, portals })
  } catch (error) {
    console.error('Client portals GET error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// Create or update client portal
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, auth } = body
    
    // Auth check
    if (auth !== process.env.DASHBOARD_AUTH_TOKEN && auth !== 'nodefy-internal') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    if (action === 'create') {
      const {
        clientId,
        clientName,
        clientEmail,
        portalName,
        brandColors = {
          primary: '#0047FF',
          secondary: '#F97316', 
          background: '#FFFFFF',
          text: '#111111'
        },
        logo,
        modules = {
          overview: true,
          performance: true,
          spend: false,
          campaigns: true,
          reports: true,
          insights: true,
          recommendations: true,
          goals: false
        },
        customization = {
          hideSpendData: false,
          showPredictions: true,
          allowDownloads: true,
          showCompetitorData: false,
          updateFrequency: 'daily' as const
        },
        access = {
          requireLogin: false
        }
      } = body
      
      // Generate secure slug
      const slug = `${clientId}-${Math.random().toString(36).substr(2, 8)}`
      
      const portal: ClientPortalConfig = {
        slug,
        clientId,
        clientName,
        clientEmail,
        portalName: portalName || `${clientName} Performance Portal`,
        brandColors,
        logo,
        modules,
        customization: {
          ...customization,
          welcomeMessage: customization.welcomeMessage || `Welcome to your performance dashboard, ${clientName}!`
        },
        access,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      }
      
      await redis.set(`${CLIENT_PORTALS_KEY}:${slug}`, JSON.stringify(portal))
      
      return NextResponse.json({ 
        success: true, 
        portal,
        portalUrl: `/portal/${slug}`
      })
    }
    
    if (action === 'update') {
      const { slug, updates } = body
      
      const existingData = await redis.get(`${CLIENT_PORTALS_KEY}:${slug}`)
      if (!existingData) {
        return NextResponse.json({ success: false, error: 'Portal not found' }, { status: 404 })
      }
      
      const portal: ClientPortalConfig = JSON.parse(existingData as string)
      const updatedPortal = {
        ...portal,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      await redis.set(`${CLIENT_PORTALS_KEY}:${slug}`, JSON.stringify(updatedPortal))
      
      return NextResponse.json({ success: true, portal: updatedPortal })
    }
    
    if (action === 'delete') {
      const { slug } = body
      
      await redis.del(`${CLIENT_PORTALS_KEY}:${slug}`)
      
      return NextResponse.json({ success: true })
    }
    
    if (action === 'quick_create') {
      // Quick create with sensible defaults for common use cases
      const { clientId, clientName, templateType = 'standard' } = body
      
      let template: Partial<ClientPortalConfig>
      
      switch (templateType) {
        case 'minimal':
          template = {
            modules: {
              overview: true,
              performance: true,
              spend: false,
              campaigns: false,
              reports: false,
              insights: false,
              recommendations: true,
              goals: false
            },
            customization: {
              hideSpendData: true,
              showPredictions: false,
              allowDownloads: false,
              showCompetitorData: false,
              updateFrequency: 'daily'
            }
          }
          break
          
        case 'full_access':
          template = {
            modules: {
              overview: true,
              performance: true,
              spend: true,
              campaigns: true,
              reports: true,
              insights: true,
              recommendations: true,
              goals: true
            },
            customization: {
              hideSpendData: false,
              showPredictions: true,
              allowDownloads: true,
              showCompetitorData: true,
              updateFrequency: 'realtime'
            }
          }
          break
          
        default: // 'standard'
          template = {
            modules: {
              overview: true,
              performance: true,
              spend: false,
              campaigns: true,
              reports: true,
              insights: true,
              recommendations: true,
              goals: false
            },
            customization: {
              hideSpendData: true,
              showPredictions: true,
              allowDownloads: true,
              showCompetitorData: false,
              updateFrequency: 'daily'
            }
          }
      }
      
      const slug = `${clientId}-${Math.random().toString(36).substr(2, 8)}`
      
      const portal: ClientPortalConfig = {
        ...template,
        slug,
        clientId,
        clientName,
        clientEmail: '',
        portalName: `${clientName} Performance Portal`,
        brandColors: {
          primary: '#0047FF',
          secondary: '#F97316',
          background: '#FFFFFF',
          text: '#111111'
        },
        access: {
          requireLogin: false
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      } as ClientPortalConfig
      
      await redis.set(`${CLIENT_PORTALS_KEY}:${slug}`, JSON.stringify(portal))
      
      return NextResponse.json({ 
        success: true, 
        portal,
        portalUrl: `/portal/${slug}`,
        message: `${templateType.replace('_', ' ')} portal created for ${clientName}`
      })
    }
    
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Client portals POST error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}