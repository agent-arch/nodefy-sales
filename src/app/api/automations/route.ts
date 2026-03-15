import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

const KV_KEY = 'dashboard:automations'

export interface AutomationRun {
  id: string
  script: string
  status: 'success' | 'error' | 'running'
  startedAt: string
  completedAt?: string
  durationMs?: number
  output?: string
  error?: string
  metrics?: Record<string, number | string>
  trigger: 'manual' | 'cron' | 'nightshift'
}

export interface AutomationScript {
  id: string
  name: string
  file: string
  description: string
  category: 'health' | 'pipeline' | 'content' | 'reporting' | 'intelligence' | 'sales'
  schedule?: string
  lastRun?: AutomationRun
  enabled: boolean
}

export interface AutomationsData {
  scripts: AutomationScript[]
  runs: AutomationRun[]
  lastUpdated: string
}

export async function GET() {
  try {
    const data = await redis.get<AutomationsData>(KV_KEY)
    return NextResponse.json({ success: true, data: data || { scripts: [], runs: [], lastUpdated: new Date().toISOString() } })
  } catch (error) {
    console.error('Load automations error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 })
    }
    body.lastUpdated = new Date().toISOString()
    await redis.set(KV_KEY, body)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save automations error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const run = await request.json() as AutomationRun
    if (!run.id || !run.script) {
      return NextResponse.json({ success: false, error: 'Missing id or script' }, { status: 400 })
    }

    const existing = await redis.get<AutomationsData>(KV_KEY) || { scripts: [], runs: [], lastUpdated: '' }
    
    // Add run to history (keep last 200)
    existing.runs = [run, ...existing.runs].slice(0, 200)
    
    // Update lastRun on matching script
    const scriptIdx = existing.scripts.findIndex(s => s.file === run.script)
    if (scriptIdx >= 0) {
      existing.scripts[scriptIdx].lastRun = run
    }
    
    existing.lastUpdated = new Date().toISOString()
    await redis.set(KV_KEY, existing)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Log run error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
