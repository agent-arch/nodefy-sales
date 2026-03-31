import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const FIREFLIES_API = 'https://api.fireflies.ai/graphql'
const FIREFLIES_KEY = process.env.FIREFLIES_API_KEY || ''
const REDIS_KEY = 'nodefy-dashboard:meetings'

interface FirefliesMeeting {
  id: string
  title: string
  date: number
  duration: number
  participants: string[]
  speakers: { id: number; name: string }[]
  meeting_attendees: { displayName: string | null; email: string }[]
  summary: {
    action_items: string | null
    overview: string | null
    short_summary: string | null
    keywords: string[] | null
    meeting_type: string | null
  }
}

export async function GET(request: Request) {
  try {
    if (!FIREFLIES_KEY) return NextResponse.json({ ok: false, error: 'FIREFLIES_API_KEY not configured' }, { status: 500 })

    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)

    const query = `query { transcripts(limit: ${limit}) { id title date duration participants speakers { id name } meeting_attendees { displayName email } summary { action_items overview short_summary keywords meeting_type } } }`

    const res = await fetch(FIREFLIES_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${FIREFLIES_KEY}` },
      body: JSON.stringify({ query }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json({ ok: false, error: `Fireflies ${res.status}: ${text.slice(0, 200)}` }, { status: 500 })
    }

    const data = await res.json()
    if (data.errors) return NextResponse.json({ ok: false, error: `GraphQL: ${JSON.stringify(data.errors).slice(0, 200)}` }, { status: 500 })

    const meetings: FirefliesMeeting[] = data?.data?.transcripts || []

    const existing: FirefliesMeeting[] = (await redis.get(REDIS_KEY)) || []
    const map = new Map(existing.map(m => [m.id, m]))
    for (const m of meetings) map.set(m.id, m)
    const merged = Array.from(map.values()).sort((a, b) => (b.date || 0) - (a.date || 0))

    await redis.set(REDIS_KEY, merged)

    return NextResponse.json({ ok: true, synced: meetings.length, total: merged.length })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
