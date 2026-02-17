import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

const KV_KEY = 'dashboard:data'

export async function GET() {
  try {
    const data = await redis.get(KV_KEY)
    return NextResponse.json({ success: true, data: data || null })
  } catch (error) {
    console.error('Load data error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 })
    }
    
    await redis.set(KV_KEY, body)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save data error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
