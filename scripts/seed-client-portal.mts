// Seed script for client portal data
// Run via: npx tsx scripts/seed-client-portal.ts

const DASHBOARD_URL = process.env.DASHBOARD_URL || 'https://nodefy-sales-dashboard.vercel.app'

const portals = [
  {
    clientName: 'Franky Amsterdam',
    slug: 'franky-amsterdam',
    brandColor: '#E85D26',
    logoUrl: null,
    welcomeMessage: 'Welkom bij je Nodefy Dashboard! Hier vind je al je performance rapporten, komende meetings en directe links naar je campagnes.',
    accountManager: 'Ruben Strootman',
    accountManagerEmail: 'ruben@nodefy.nl',
    accountManagerPhoto: null,
    sections: { reports: true, budgetPacing: true, alerts: true, meetings: true, recommendations: true },
    reports: [
      { slug: 'franky-amsterdam-apr-2026', title: 'Performance Rapport April 2026', period: '1-31 maart 2026', createdAt: '2026-04-01T10:00:00Z' },
      { slug: 'franky-amsterdam-mar-2026', title: 'Performance Rapport Maart 2026', period: '1-28 feb 2026', createdAt: '2026-03-01T10:00:00Z' },
    ],
    quickLinks: [
      { label: 'Meta Ads Manager', url: 'https://business.facebook.com/adsmanager', icon: '📘' },
      { label: 'Google Ads', url: 'https://ads.google.com', icon: '🔍' },
      { label: 'Google Analytics', url: 'https://analytics.google.com', icon: '📊' },
      { label: 'Booking Engine', url: 'https://frankyamsterdam.com/boeken', icon: '🏨' },
    ],
    nextMeeting: {
      date: '2026-04-21T14:00:00+02:00',
      title: 'Maandelijkse Performance Review',
      link: 'https://meet.google.com/abc-defg-hij',
    },
    active: true,
  },
  {
    clientName: 'Corendon Hotels',
    slug: 'corendon-hotels',
    brandColor: '#FF6B00',
    logoUrl: null,
    welcomeMessage: 'Welkom bij het Corendon Hotels × Nodefy portaal. Bekijk hier je campagne resultaten en plan je volgende optimalisatiesessie.',
    accountManager: 'Koen',
    accountManagerEmail: 'koen@nodefy.nl',
    accountManagerPhoto: null,
    sections: { reports: true, budgetPacing: true, alerts: true, meetings: true, recommendations: true },
    reports: [
      { slug: 'corendon-hotels-apr-2026', title: 'Performance Rapport April 2026', period: '1-31 maart 2026', createdAt: '2026-04-02T10:00:00Z' },
    ],
    quickLinks: [
      { label: 'Meta Ads', url: 'https://business.facebook.com/adsmanager', icon: '📘' },
      { label: 'Google Ads', url: 'https://ads.google.com', icon: '🔍' },
      { label: 'GA4', url: 'https://analytics.google.com', icon: '📊' },
    ],
    nextMeeting: {
      date: '2026-04-16T10:00:00+02:00',
      title: 'Q2 Strategy Session',
      link: null,
    },
    active: true,
  },
  {
    clientName: 'Refurbished.nl',
    slug: 'refurbished-nl',
    brandColor: '#00B67A',
    logoUrl: null,
    welcomeMessage: 'Welkom! Bekijk hier je shopping campagne resultaten, POAS tracking en aankomende meetings.',
    accountManager: 'Koen',
    accountManagerEmail: 'koen@nodefy.nl',
    accountManagerPhoto: null,
    sections: { reports: true, budgetPacing: true, alerts: false, meetings: true, recommendations: true },
    reports: [
      { slug: 'refurbished-nl-apr-2026', title: 'Shopping Performance Rapport', period: '1-31 maart 2026', createdAt: '2026-04-01T10:00:00Z' },
    ],
    quickLinks: [
      { label: 'Google Merchant', url: 'https://merchants.google.com', icon: '🛒' },
      { label: 'Google Ads', url: 'https://ads.google.com', icon: '🔍' },
      { label: 'GA4', url: 'https://analytics.google.com', icon: '📊' },
      { label: 'Website', url: 'https://refurbished.nl', icon: '🌐' },
    ],
    nextMeeting: {
      date: '2026-04-17T13:00:00+02:00',
      title: 'Maandelijkse Review + POAS Check',
      link: 'https://meet.google.com/xyz-abcd-efg',
    },
    active: true,
  },
]

async function seed() {
  console.log(`Seeding ${portals.length} portals to ${DASHBOARD_URL}/api/client-portal...`)
  
  const res = await fetch(`${DASHBOARD_URL}/api/client-portal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portals }),
  })
  
  const data = await res.json()
  console.log('Result:', data)
}

seed().catch(console.error)
