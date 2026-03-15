import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

const KV_KEY = 'dashboard:weekly-digest'

export interface WeeklyDigest {
  weekNumber: number
  year: number
  period: string // "2026-03-09 — 2026-03-15"
  generatedAt: string
  
  revenue: {
    mrr: number
    arr: number
    mrrChange: number // vs prev week
    newDeals: number
    newDealValue: number
    churnedMrr: number
  }
  
  pipeline: {
    totalDeals: number
    newDeals: number
    closedWon: number
    closedLost: number
    staleDeals: number // >14 days no activity
    totalValue: number
  }
  
  clients: {
    totalActive: number
    healthScore: number // 0-100
    alerts: { high: number; medium: number; positive: number }
    topPerformer: string
    atRisk: string[]
  }
  
  content: {
    postsCreated: number
    postsPublished: number
    articlesWritten: number
    caseStudies: number
  }
  
  nightshift: {
    shiftsRun: number
    prospectsResearched: number
    featuresBuilt: number
    deploysCount: number
  }
  
  highlights: string[]
  actionItems: string[]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const week = searchParams.get('week')
    
    if (week) {
      const digest = await redis.get<WeeklyDigest>(`${KV_KEY}:${week}`)
      return NextResponse.json({ success: true, data: digest })
    }
    
    // Return last 12 weeks
    const index = await redis.get<string[]>(`${KV_KEY}:index`) || []
    const digests: WeeklyDigest[] = []
    for (const key of index.slice(0, 12)) {
      const d = await redis.get<WeeklyDigest>(`${KV_KEY}:${key}`)
      if (d) digests.push(d)
    }
    
    return NextResponse.json({ success: true, data: digests })
  } catch (error) {
    console.error('Load digest error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const digest = await request.json() as WeeklyDigest
    if (!digest.weekNumber || !digest.year) {
      return NextResponse.json({ success: false, error: 'Missing weekNumber or year' }, { status: 400 })
    }
    
    const key = `${digest.year}-W${String(digest.weekNumber).padStart(2, '0')}`
    await redis.set(`${KV_KEY}:${key}`, digest)
    
    // Update index
    const index = await redis.get<string[]>(`${KV_KEY}:index`) || []
    if (!index.includes(key)) {
      index.unshift(key)
      await redis.set(`${KV_KEY}:index`, index.slice(0, 52))
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save digest error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
