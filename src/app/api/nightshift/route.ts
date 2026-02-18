import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

// GET: read nightshift data from KV
export async function GET() {
  try {
    const data = await kv.get('dashboard:nightshift') as any
    if (!data) {
      return NextResponse.json({ days: [] })
    }
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ days: [] })
  }
}

// PUT: write nightshift data to KV (called by nightshift cron)
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    // Get existing data
    const existing = (await kv.get('dashboard:nightshift') as any) || { days: [] }
    
    if (body.day) {
      // Add/update a single day
      const idx = existing.days.findIndex((d: any) => d.date === body.day.date)
      if (idx >= 0) {
        existing.days[idx] = body.day
      } else {
        existing.days.unshift(body.day)
      }
      // Keep last 30 days
      existing.days = existing.days.slice(0, 30)
    } else if (body.days) {
      // Replace all
      existing.days = body.days
    }
    
    await kv.set('dashboard:nightshift', existing)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
