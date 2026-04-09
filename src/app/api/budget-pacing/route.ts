import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

const BUDGETS_KEY = 'budget-pacing:data'

export interface ClientBudget {
  clientName: string
  metaBudget: number | null
  googleBudget: number | null
  notes: string
  updatedAt: string
  updatedBy: string
}

// GET all budgets
export async function GET() {
  try {
    const budgets = await redis.get<Record<string, ClientBudget>>(BUDGETS_KEY)
    return NextResponse.json({ success: true, data: budgets || {} })
  } catch (error) {
    console.error('Budget pacing GET error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// PUT - update a single client budget
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { clientName, metaBudget, googleBudget, notes, updatedBy } = body

    if (!clientName) {
      return NextResponse.json({ success: false, error: 'Missing clientName' }, { status: 400 })
    }

    const budgets = await redis.get<Record<string, ClientBudget>>(BUDGETS_KEY) || {}
    
    const slug = clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    budgets[slug] = {
      clientName,
      metaBudget: metaBudget ?? null,
      googleBudget: googleBudget ?? null,
      notes: notes || '',
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || 'unknown',
    }

    await redis.set(BUDGETS_KEY, budgets)
    return NextResponse.json({ success: true, slug })
  } catch (error) {
    console.error('Budget pacing PUT error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// POST - bulk update budgets
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { budgets: newBudgets } = body

    if (!newBudgets || typeof newBudgets !== 'object') {
      return NextResponse.json({ success: false, error: 'Missing budgets object' }, { status: 400 })
    }

    const existing = await redis.get<Record<string, ClientBudget>>(BUDGETS_KEY) || {}
    const merged = { ...existing, ...newBudgets }

    await redis.set(BUDGETS_KEY, merged)
    return NextResponse.json({ success: true, count: Object.keys(merged).length })
  } catch (error) {
    console.error('Budget pacing POST error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
