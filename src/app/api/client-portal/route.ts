import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

// Client portal configuration
export interface ClientPortalConfig {
  clientName: string
  slug: string
  brandColor: string
  logoUrl: string | null
  welcomeMessage: string
  accountManager: string
  accountManagerEmail: string
  accountManagerPhoto: string | null
  sections: {
    reports: boolean
    budgetPacing: boolean
    alerts: boolean
    meetings: boolean
    recommendations: boolean
  }
  reports: { slug: string; title: string; period: string; createdAt: string }[]
  quickLinks: { label: string; url: string; icon: string }[]
  nextMeeting: { date: string; title: string; link: string | null } | null
  updatedAt: string
  active: boolean
}

const PORTAL_KEY = 'client-portal:configs'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    const data = await redis.get<Record<string, ClientPortalConfig>>(PORTAL_KEY)
    
    if (slug) {
      const portal = data?.[slug]
      if (!portal || !portal.active) {
        return NextResponse.json({ success: false, error: 'Portal not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: portal })
    }
    
    return NextResponse.json({ success: true, data: data || {} })
  } catch (error) {
    console.error('Client portal GET error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { portal } = body as { portal: ClientPortalConfig }

    if (!portal?.clientName) {
      return NextResponse.json({ success: false, error: 'Missing portal data' }, { status: 400 })
    }

    const data = await redis.get<Record<string, ClientPortalConfig>>(PORTAL_KEY) || {}
    const slug = portal.slug || portal.clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    
    data[slug] = {
      ...portal,
      slug,
      updatedAt: new Date().toISOString(),
    }

    await redis.set(PORTAL_KEY, data)
    return NextResponse.json({ success: true, slug })
  } catch (error) {
    console.error('Client portal PUT error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { portals } = body as { portals: ClientPortalConfig[] }

    if (!portals || !Array.isArray(portals)) {
      return NextResponse.json({ success: false, error: 'Missing portals array' }, { status: 400 })
    }

    const data: Record<string, ClientPortalConfig> = {}
    for (const p of portals) {
      const slug = p.slug || p.clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      data[slug] = { ...p, slug, updatedAt: new Date().toISOString() }
    }

    await redis.set(PORTAL_KEY, data)
    return NextResponse.json({ success: true, count: portals.length })
  } catch (error) {
    console.error('Client portal POST error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
