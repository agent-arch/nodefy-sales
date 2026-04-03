import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

const ACTIVITY_KEY = 'nodefy:activity-feed'
const MAX_ACTIVITIES = 50

export interface ActivityItem {
  id: string
  type: 'deal_moved' | 'deal_new' | 'deal_won' | 'deal_lost' | 'client_health' | 'task_completed' | 'prospect_added'
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, string | number>
}

export async function GET() {
  try {
    const activities = await redis.lrange(ACTIVITY_KEY, 0, 19) as ActivityItem[]
    return NextResponse.json({ success: true, activities: activities || [] })
  } catch (error) {
    console.error('Activity feed error:', error)
    return NextResponse.json({ success: true, activities: [] })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as ActivityItem
    
    if (!body.type || !body.title) {
      return NextResponse.json({ success: false, error: 'Missing type or title' }, { status: 400 })
    }

    const activity: ActivityItem = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: body.type,
      title: body.title,
      description: body.description || '',
      timestamp: new Date().toISOString(),
      metadata: body.metadata,
    }

    await redis.lpush(ACTIVITY_KEY, activity)
    await redis.ltrim(ACTIVITY_KEY, 0, MAX_ACTIVITIES - 1)

    return NextResponse.json({ success: true, activity })
  } catch (error) {
    console.error('Activity post error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
