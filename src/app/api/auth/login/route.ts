import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email en wachtwoord zijn verplicht' }, { status: 400 })
    }

    const user = await redis.get<Record<string, unknown>>(`user:${email.toLowerCase()}`)

    if (!user) {
      return NextResponse.json({ success: false, error: 'Gebruiker niet gevonden' }, { status: 401 })
    }

    if (user.password !== password) {
      return NextResponse.json({ success: false, error: 'Onjuist wachtwoord' }, { status: 401 })
    }

    // Update last login
    const updatedUser = { ...user, lastLogin: new Date().toISOString() }
    await redis.set(`user:${email.toLowerCase()}`, updatedUser)

    // Return user without password
    const safeUser = { ...updatedUser }
    delete (safeUser as Record<string, unknown>).password
    return NextResponse.json({ success: true, user: safeUser })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
