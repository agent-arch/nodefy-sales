import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

const REPORTS_KEY = 'client-reports:data'

// Client report data structure
interface ClientReport {
  slug: string
  clientName: string
  period: string
  generatedAt: string
  expiresAt: string | null
  metrics: {
    platform: string
    data: Record<string, string | number>
  }[]
  highlights: string[]
  recommendations: string[]
  nextSteps: string[]
  branding: {
    primaryColor: string
    logoUrl: string | null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  
  if (!slug) {
    return NextResponse.json({ success: false, error: 'Missing slug parameter' }, { status: 400 })
  }
  
  try {
    const reports = await redis.get<Record<string, ClientReport>>(REPORTS_KEY)
    
    if (!reports || !reports[slug]) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 })
    }
    
    const report = reports[slug]
    
    // Check expiry
    if (report.expiresAt && new Date(report.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, error: 'Report expired' }, { status: 410 })
    }
    
    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error('Client report GET error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { slug, report, auth } = body
    
    // Simple auth check - require dashboard auth token
    if (auth !== process.env.DASHBOARD_AUTH_TOKEN && auth !== 'nodefy-internal') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!slug || !report) {
      return NextResponse.json({ success: false, error: 'Missing slug or report' }, { status: 400 })
    }
    
    const reports = await redis.get<Record<string, ClientReport>>(REPORTS_KEY) || {}
    reports[slug] = { ...report, slug }
    
    await redis.set(REPORTS_KEY, reports)
    return NextResponse.json({ success: true, slug })
  } catch (error) {
    console.error('Client report PUT error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// List all reports (admin)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (body.auth !== process.env.DASHBOARD_AUTH_TOKEN && body.auth !== 'nodefy-internal') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    const reports = await redis.get<Record<string, ClientReport>>(REPORTS_KEY) || {}
    const list = Object.values(reports).map(r => ({
      slug: r.slug,
      clientName: r.clientName,
      period: r.period,
      generatedAt: r.generatedAt,
      expiresAt: r.expiresAt,
    }))
    
    return NextResponse.json({ success: true, reports: list })
  } catch (error) {
    console.error('Client report list error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
