import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

// Client health data — composite scores from multiple sources
export interface ClientHealthEntry {
  clientName: string
  slug: string
  accountManager: string
  vertical: string
  contractStart: string
  contractEnd: string | null
  retainerValue: number
  platforms: string[] // ['meta', 'google', 'linkedin']
  healthScore: number // 0-100
  scores: {
    performance: number // KPI trends (0-100)
    budgetPacing: number // on-track = 100, deviation = lower
    communication: number // meeting frequency, report views
    retention: number // contract health, upsell potential
  }
  status: 'healthy' | 'attention' | 'at-risk' | 'critical'
  lastReportDate: string | null
  lastMeetingDate: string | null
  nextMeetingDate: string | null
  alerts: { type: string; message: string; severity: 'high' | 'medium' | 'low' }[]
  notes: string
  updatedAt: string
}

const HEALTH_KEY = 'client-health:data'

export async function GET() {
  try {
    const data = await redis.get<Record<string, ClientHealthEntry>>(HEALTH_KEY)
    return NextResponse.json({ success: true, data: data || {} })
  } catch (error) {
    console.error('Client health GET error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { client } = body as { client: ClientHealthEntry }

    if (!client?.clientName) {
      return NextResponse.json({ success: false, error: 'Missing client data' }, { status: 400 })
    }

    const data = await redis.get<Record<string, ClientHealthEntry>>(HEALTH_KEY) || {}
    const slug = client.clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    
    data[slug] = {
      ...client,
      slug,
      updatedAt: new Date().toISOString(),
    }

    await redis.set(HEALTH_KEY, data)
    return NextResponse.json({ success: true, slug })
  } catch (error) {
    console.error('Client health PUT error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clients } = body as { clients: ClientHealthEntry[] }

    if (!clients || !Array.isArray(clients)) {
      return NextResponse.json({ success: false, error: 'Missing clients array' }, { status: 400 })
    }

    const data: Record<string, ClientHealthEntry> = {}
    for (const client of clients) {
      const slug = client.clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      data[slug] = { ...client, slug, updatedAt: new Date().toISOString() }
    }

    await redis.set(HEALTH_KEY, data)
    return NextResponse.json({ success: true, count: clients.length })
  } catch (error) {
    console.error('Client health POST error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
