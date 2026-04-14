import { NextResponse } from 'next/server'

// HubSpot meetings integration
export async function GET() {
  try {
    // Mock HubSpot meeting data - replace with actual HubSpot API
    const mockHubSpotMeetings = [
      {
        id: 'hs-1',
        title: 'Sales Call - Kremer Collectie',
        date: new Date('2026-04-10T14:00:00Z').getTime(),
        duration: 60,
        participants: ['ruben@nodefy.nl'],
        hubspotUrl: 'https://app.hubspot.com/meetings/123456',
        dealId: 'deal-123',
        contactId: 'contact-456',
        outcome: 'qualified',
        notes: 'Good fit for our services, discussing proposal next week',
        type: 'sales_call'
      },
      {
        id: 'hs-2', 
        title: 'Discovery Call - Synvest',
        date: new Date('2026-04-09T10:30:00Z').getTime(),
        duration: 45,
        participants: ['ruben@nodefy.nl', 'jasper@nodefy.nl'],
        hubspotUrl: 'https://app.hubspot.com/meetings/123457',
        dealId: 'deal-124',
        contactId: 'contact-457',
        outcome: 'interested',
        notes: 'Need to prepare custom proposal for fintech vertical',
        type: 'discovery'
      },
      {
        id: 'hs-3',
        title: 'Follow-up - Corendon Hotels',
        date: new Date('2026-04-11T09:00:00Z').getTime(),
        duration: 30,
        participants: ['ruben@nodefy.nl', 'loes@nodefy.nl'],
        hubspotUrl: 'https://app.hubspot.com/meetings/123458',
        dealId: 'deal-125',
        contactId: 'contact-458',
        outcome: 'closed_won',
        notes: 'Signed contract for multi-location campaign',
        type: 'follow_up'
      }
    ]

    return NextResponse.json({ 
      ok: true, 
      meetings: mockHubSpotMeetings,
      source: 'hubspot'
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ 
      ok: false, 
      error: message 
    }, { status: 500 })
  }
}