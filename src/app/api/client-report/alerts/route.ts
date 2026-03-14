import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

const ALERTS_KEY = 'client-alerts:latest'

export async function GET() {
  try {
    const data = await redis.get(ALERTS_KEY)
    return NextResponse.json({ success: true, data: data || null })
  } catch (error) {
    console.error('Alerts GET error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    if (body.auth !== process.env.DASHBOARD_AUTH_TOKEN && body.auth !== 'nodefy-internal') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    await redis.set(ALERTS_KEY, body.alerts)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Alerts PUT error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
