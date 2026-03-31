import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const REDIS_KEY = 'nodefy-dashboard:tasks'

export interface Task {
  id: string
  title: string
  description?: string
  owner: string
  status: 'todo' | 'bezig' | 'klaar'
  priority: 'hoog' | 'normaal' | 'laag'
  category: string
  deadline?: string
  source?: string
  meetingId?: string
  meetingTitle?: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export async function GET() {
  try {
    const tasks: Task[] = (await redis.get(REDIS_KEY)) || []
    return NextResponse.json({ ok: true, tasks })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const tasks: Task[] = (await redis.get(REDIS_KEY)) || []

    if (body.action === 'add') {
      const task: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title: body.title,
        description: body.description || '',
        owner: body.owner || 'ruben',
        status: body.status || 'todo',
        priority: body.priority || 'normaal',
        category: body.category || 'overig',
        deadline: body.deadline || undefined,
        source: body.source || 'manual',
        meetingId: body.meetingId || undefined,
        meetingTitle: body.meetingTitle || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: body.createdBy || 'ruben',
      }
      tasks.unshift(task)
      await redis.set(REDIS_KEY, tasks)
      return NextResponse.json({ ok: true, task })
    }

    if (body.action === 'update') {
      const idx = tasks.findIndex(t => t.id === body.id)
      if (idx === -1) return NextResponse.json({ ok: false, error: 'Task not found' }, { status: 404 })
      tasks[idx] = { ...tasks[idx], ...body.updates, updatedAt: new Date().toISOString() }
      await redis.set(REDIS_KEY, tasks)
      return NextResponse.json({ ok: true, task: tasks[idx] })
    }

    if (body.action === 'delete') {
      const filtered = tasks.filter(t => t.id !== body.id)
      await redis.set(REDIS_KEY, filtered)
      return NextResponse.json({ ok: true })
    }

    if (body.action === 'bulk_add') {
      const newTasks: Task[] = (body.tasks || []).map((t: Partial<Task>) => ({
        id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title: t.title || '',
        description: t.description || '',
        owner: t.owner || 'ruben',
        status: 'todo' as const,
        priority: t.priority || 'normaal',
        category: t.category || 'overig',
        deadline: t.deadline || undefined,
        source: t.source || 'fireflies',
        meetingId: t.meetingId || undefined,
        meetingTitle: t.meetingTitle || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: t.createdBy || 'system',
      }))
      tasks.unshift(...newTasks)
      await redis.set(REDIS_KEY, tasks)
      return NextResponse.json({ ok: true, added: newTasks.length })
    }

    return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
