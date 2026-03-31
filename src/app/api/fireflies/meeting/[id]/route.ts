import { NextResponse } from 'next/server'

const FIREFLIES_API = 'https://api.fireflies.ai/graphql'
const FIREFLIES_KEY = process.env.FIREFLIES_API_KEY!

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const query = `
      query($id: String!) {
        transcript(id: $id) {
          id
          title
          date
          duration
          participants
          transcript_url
          audio_url
          speakers { id name }
          meeting_attendees { displayName email }
          summary {
            action_items
            overview
            short_summary
            keywords
            meeting_type
            outline
            bullet_gist
          }
          sentences {
            index
            speaker_name
            text
            start_time
            end_time
            ai_filters { task question }
          }
        }
      }
    `

    const res = await fetch(FIREFLIES_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${FIREFLIES_KEY}`,
      },
      body: JSON.stringify({ query, variables: { id } }),
    })

    if (!res.ok) throw new Error(`Fireflies API error: ${res.status}`)
    const data = await res.json()

    return NextResponse.json({ ok: true, meeting: data?.data?.transcript })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
