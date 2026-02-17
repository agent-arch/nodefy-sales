import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

const DEFAULT_USERS = [
  {
    id: 'u1',
    name: 'Ruben Strootman',
    email: 'ruben@nodefy.nl',
    password: 'nodefy123',
    role: 'superadmin',
    permissions: { overview: true, klanten: true, reports: true, pipeline: true, masterplan: true, cases: true, agencyos: true, content: true, strategy: true, retainers: true, settings: true, admin: true },
    lastLogin: null,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'u2',
    name: 'Matthijs',
    email: 'matthijs@nodefy.nl',
    password: 'nodefy123',
    role: 'superadmin',
    permissions: { overview: true, klanten: true, reports: true, pipeline: true, masterplan: true, cases: true, agencyos: true, content: true, strategy: true, retainers: true, settings: true, admin: true },
    lastLogin: null,
    createdAt: '2024-01-01T00:00:00Z'
  }
]

export async function POST() {
  try {
    let seeded = 0

    for (const user of DEFAULT_USERS) {
      const existing = await redis.get(`user:${user.email}`)
      if (!existing) {
        await redis.set(`user:${user.email}`, user)
        await redis.sadd('users:index', user.email)
        seeded++
      }
    }

    return NextResponse.json({ success: true, seeded })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
