import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

const KV_KEY = 'dashboard:pipeline-nextsteps'
const KV_PROB_KEY = 'dashboard:pipeline-probability'

export async function GET() {
  try {
    const [data, probability] = await Promise.all([
      redis.get(KV_KEY),
      redis.get(KV_PROB_KEY),
    ])
    return NextResponse.json({ success: true, data: data || {}, probability: probability || {} })
  } catch (error) {
    console.error('Load pipeline nextsteps error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 })
    }
    
    // Support saving probability alongside nextsteps
    if (body._probability) {
      const prob = body._probability
      delete body._probability
      await Promise.all([
        redis.set(KV_KEY, body),
        redis.set(KV_PROB_KEY, prob),
      ])
    } else {
      await redis.set(KV_KEY, body)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save pipeline nextsteps error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
