import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

const KV_KEY = 'dashboard:timeline'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = parseInt(searchParams.get('range') || '7', 10)
    const data = await redis.get(KV_KEY) as any
    if (!data) return NextResponse.json({ days: [] })
    const parsed = typeof data === 'string' ? JSON.parse(data) : data
    // Return only days within range
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - range)
    const cutoffStr = cutoff.toISOString().split('T')[0]
    const filtered = (parsed.days || []).filter((d: any) => d.date >= cutoffStr).sort((a: any, b: any) => b.date.localeCompare(a.date))
    return NextResponse.json({ days: filtered })
  } catch {
    return NextResponse.json({ days: [] })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const existing = ((await redis.get(KV_KEY)) as any) || { days: [] }
    const parsed = typeof existing === 'string' ? JSON.parse(existing) : existing

    if (body.day) {
      const idx = parsed.days.findIndex((d: any) => d.date === body.day.date)
      if (idx >= 0) {
        parsed.days[idx] = body.day
      } else {
        parsed.days.unshift(body.day)
      }
      parsed.days = parsed.days.slice(0, 90)
    } else if (body.days) {
      parsed.days = body.days.slice(0, 90)
    }

    await redis.set(KV_KEY, JSON.stringify(parsed))
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
