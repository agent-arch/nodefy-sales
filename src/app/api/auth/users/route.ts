import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const emails = await redis.smembers('users:index')
    if (!emails || emails.length === 0) {
      return NextResponse.json({ success: true, users: [] })
    }

    const users = []
    for (const email of emails) {
      const user = await redis.get<Record<string, unknown>>(`user:${email}`)
      if (user) {
        const { password: _, ...safeUser } = user
        users.push(safeUser)
      }
    }

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error('List users error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, role, permissions } = body

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Naam, email en wachtwoord zijn verplicht' }, { status: 400 })
    }

    const existing = await redis.get(`user:${email.toLowerCase()}`)
    if (existing) {
      return NextResponse.json({ success: false, error: 'Gebruiker met dit email bestaat al' }, { status: 409 })
    }

    const user = {
      id: `u${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'viewer',
      permissions: permissions || {},
      lastLogin: null,
      createdAt: new Date().toISOString()
    }

    await redis.set(`user:${email.toLowerCase()}`, user)
    await redis.sadd('users:index', email.toLowerCase())

    const { password: _, ...safeUser } = user
    return NextResponse.json({ success: true, user: safeUser })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { email, ...updates } = body

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is verplicht' }, { status: 400 })
    }

    const existing = await redis.get<Record<string, unknown>>(`user:${email.toLowerCase()}`)
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    const updatedUser = { ...existing, ...updates, email: email.toLowerCase() }
    await redis.set(`user:${email.toLowerCase()}`, updatedUser)

    const { password: _, ...safeUser } = updatedUser
    return NextResponse.json({ success: true, user: safeUser })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is verplicht' }, { status: 400 })
    }

    await redis.del(`user:${email.toLowerCase()}`)
    await redis.srem('users:index', email.toLowerCase())

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
