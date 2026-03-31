import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const REDIS_KEY = 'nodefy-dashboard:meetings'

export async function GET() {
  try {
    const meetings = (await redis.get(REDIS_KEY)) || []
    return NextResponse.json({ ok: true, meetings })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
