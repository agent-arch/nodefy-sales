import { NextResponse } from 'next/server'

// Google Calendar integration voor meetings
export async function GET() {
  try {
    // Mock data - replace with actual Google Calendar API
    const mockCalendarMeetings = [
      {
        id: 'cal-1',
        title: 'Standup Team Meeting',
        start: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        end: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // 1.5 hours from now
        attendees: ['ruben@nodefy.nl', 'loes@nodefy.nl', 'dane@nodefy.nl'],
        location: 'Nodefy Office',
        hangoutLink: 'https://meet.google.com/abc-def-ghi'
      },
      {
        id: 'cal-2', 
        title: 'Client Presentation - Stories',
        start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        attendees: ['ruben@nodefy.nl', 'client@stories.nl'],
        location: 'Google Meet',
        hangoutLink: 'https://meet.google.com/xyz-abc-def'
      },
      {
        id: 'cal-3',
        title: 'Demo Call - Prospect TechCorp', 
        start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
        end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
        attendees: ['ruben@nodefy.nl', 'contact@techcorp.nl'],
        location: 'Zoom',
        description: 'Product demo and Q&A session'
      }
    ]

    return NextResponse.json({ 
      ok: true, 
      meetings: mockCalendarMeetings,
      source: 'google_calendar' 
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ 
      ok: false, 
      error: message 
    }, { status: 500 })
  }
}