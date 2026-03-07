import { NextResponse } from 'next/server'

const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN

// Closed stages to exclude
const CLOSED_STAGES = new Set([
  'closedwon',
  'closedlost',
  '16170377',        // Geen offerte uitgebracht
  '3982505167',      // Naar Warm
  '3982505168',      // Gesloten / verloren
  '3982505179',      // Geen contact
  'deal_registration_closed_won',
  'deal_registration_closed_lost',
])

// Only sync these pipelines (Warm - Sales + Koud - Sales)
const ACTIVE_PIPELINES = new Set(['default', '2902876349'])

interface HubSpotDeal {
  id: string
  properties: {
    dealname?: string
    amount?: string
    dealstage?: string
    pipeline?: string
    hs_next_step?: string
    createdate?: string
    closedate?: string
    hs_deal_stage_probability?: string
  }
}

// Closed-won stages for YTD tracking
const CLOSED_WON = new Set(['closedwon', 'deal_registration_closed_won'])
const CLOSED_LOST = new Set(['closedlost', '3982505168', 'deal_registration_closed_lost'])

// GET: Fetch all deals from HubSpot (open + closed this year for stats)
export async function GET() {
  try {
    const dealsMap = new Map<string, { id: string; name: string; value: number | null; stageId: string; pipelineId: string; nextStep: string; createdAt?: string; closedAt?: string; slagingskans?: number }>()
    
    let after: string | undefined = undefined
    let hasMore = true
    const currentYear = new Date().getFullYear()
    
    while (hasMore) {
      const params = new URLSearchParams({
        limit: '100',
        properties: 'dealname,amount,dealstage,pipeline,hs_next_step,createdate,closedate,hs_deal_stage_probability',
      })
      if (after) params.set('after', after)
      
      const url = `https://api.hubapi.com/crm/v3/objects/deals?${params}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` },
        cache: 'no-store',
      })
      
      if (!res.ok) {
        const text = await res.text()
        return NextResponse.json({ error: `HubSpot API error: ${res.status}`, details: text }, { status: 500 })
      }
      
      const data = await res.json()
      
      for (const deal of (data.results || []) as HubSpotDeal[]) {
        const dp = deal.properties
        const stageId = dp.dealstage || ''
        const pipelineId = dp.pipeline || 'default'
        
        // Skip irrelevant pipelines
        if (!ACTIVE_PIPELINES.has(pipelineId)) continue
        
        // Include open deals + closed-won/lost this year (for YTD stats)
        const isClosed = CLOSED_STAGES.has(stageId)
        const isClosedThisYear = isClosed && dp.closedate && new Date(dp.closedate).getFullYear() === currentYear
        
        if (isClosed && !isClosedThisYear) continue
        
        dealsMap.set(deal.id, {
          id: deal.id,
          name: dp.dealname || 'Unnamed',
          value: dp.amount ? parseFloat(dp.amount) : null,
          stageId,
          pipelineId,
          nextStep: dp.hs_next_step || '',
          createdAt: dp.createdate || undefined,
          closedAt: dp.closedate || undefined,
          slagingskans: dp.hs_deal_stage_probability ? Math.round(parseFloat(dp.hs_deal_stage_probability) * 100) : undefined,
        })
      }
      
      if (data.paging?.next?.after) {
        after = data.paging.next.after
      } else {
        hasMore = false
      }
    }
    
    const deals = Array.from(dealsMap.values())
    
    return NextResponse.json({ 
      deals,
      syncedAt: new Date().toISOString(),
      count: deals.length,
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// PATCH: Update deal properties in HubSpot
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { dealId, nextStep, amount, dealstage } = body as { 
      dealId?: string
      nextStep?: string
      amount?: number | null
      dealstage?: string
    }

    if (!dealId) {
      return NextResponse.json({ error: 'dealId is required' }, { status: 400 })
    }

    // Build properties object — only include fields that were provided
    const properties: Record<string, string> = {}
    if (nextStep !== undefined) properties.hs_next_step = nextStep || ''
    if (amount !== undefined) properties.amount = amount !== null ? String(amount) : ''
    if (dealstage !== undefined) properties.dealstage = dealstage

    if (Object.keys(properties).length === 0) {
      return NextResponse.json({ error: 'No properties to update' }, { status: 400 })
    }

    const res = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${dealId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `HubSpot PATCH error: ${res.status}`, details: text }, { status: 500 })
    }

    const updated = await res.json()
    return NextResponse.json({ 
      success: true, 
      dealId,
      properties: {
        nextStep: updated.properties?.hs_next_step || '',
        amount: updated.properties?.amount || '',
        dealstage: updated.properties?.dealstage || '',
      },
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
