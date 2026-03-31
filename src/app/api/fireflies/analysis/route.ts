import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const REDIS_KEY = 'nodefy-dashboard:meeting-analysis'
const TAGS_KEY = 'nodefy-dashboard:meeting-tags'
const ALL_TAGS_KEY = 'nodefy-dashboard:all-tags'

export interface MeetingAnalysis {
  date: string
  title: string
  client: string
  type: 'client' | 'sales' | 'intern' | 'demo'
  duration: number
  nodefy_team: string[]
  client_contacts: string[]
  sentiment: 'positief' | 'neutraal' | 'negatief'
  sentiment_score: number
  analysis: string
  risk: string
  action_needed: string
}

export async function GET() {
  try {
    const analysis: MeetingAnalysis[] = (await redis.get(REDIS_KEY)) || []
    const meetingTags: Record<string, string[]> = (await redis.get(TAGS_KEY)) || {}
    const allTags: string[] = (await redis.get(ALL_TAGS_KEY)) || []
    return NextResponse.json({ ok: true, analysis, meetingTags, allTags })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (body.analysis !== undefined) await redis.set(REDIS_KEY, body.analysis)
    if (body.meetingTags !== undefined) await redis.set(TAGS_KEY, body.meetingTags)
    if (body.allTags !== undefined) await redis.set(ALL_TAGS_KEY, body.allTags)
    return NextResponse.json({ ok: true, count: (body.analysis || []).length })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
