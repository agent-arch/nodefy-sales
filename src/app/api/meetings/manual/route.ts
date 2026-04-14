import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const REDIS_KEY = 'nodefy-dashboard:manual-meetings'

export async function GET() {
  try {
    const meetings: any[] = (await redis.get(REDIS_KEY)) || []
    return NextResponse.json({ 
      ok: true, 
      meetings,
      source: 'manual'
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ 
      ok: false, 
      error: message 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { action, meeting } = await request.json()
    
    const meetings: any[] = (await redis.get(REDIS_KEY)) || []
    
    if (action === 'add') {
      const newMeeting = {
        id: `manual-${Date.now()}`,
        ...meeting,
        createdAt: new Date().toISOString(),
        source: 'manual'
      }
      meetings.push(newMeeting)
      await redis.set(REDIS_KEY, meetings)
      
      return NextResponse.json({ 
        ok: true, 
        meeting: newMeeting 
      })
    }
    
    if (action === 'update') {
      const index = meetings.findIndex((m: any) => m.id === meeting.id)
      if (index !== -1) {
        meetings[index] = { ...meetings[index], ...meeting, updatedAt: new Date().toISOString() }
        await redis.set(REDIS_KEY, meetings)
        
        return NextResponse.json({ 
          ok: true, 
          meeting: meetings[index] 
        })
      }
    }
    
    if (action === 'delete') {
      const filtered = meetings.filter((m: any) => m.id !== meeting.id)
      await redis.set(REDIS_KEY, filtered)
      
      return NextResponse.json({ 
        ok: true 
      })
    }
    
    return NextResponse.json({ 
      ok: false, 
      error: 'Invalid action' 
    }, { status: 400 })
    
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ 
      ok: false, 
      error: message 
    }, { status: 500 })
  }
}