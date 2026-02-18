import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

const KV_KEY = 'dashboard:nightshift'

export async function GET() {
  try {
    const data = await redis.get(KV_KEY) as any
    if (!data) return NextResponse.json({ days: [] })
    return NextResponse.json(typeof data === 'string' ? JSON.parse(data) : data)
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
      parsed.days = parsed.days.slice(0, 30)
    } else if (body.days) {
      parsed.days = body.days
    }

    await redis.set(KV_KEY, JSON.stringify(parsed))
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
