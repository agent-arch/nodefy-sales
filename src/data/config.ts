import type { TabId, UserRole, User, ClientPerformance, Pipeline } from '../types'

// CSS animations for command palette and panels
export const CMD_PALETTE_STYLES = `
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
@keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
`

export const DEFAULT_USERS: User[] = [
  {
    id: 'u1',
    name: 'Ruben',
    email: 'ruben@nodefy.nl',
    password: 'nodefy123',
    role: 'superadmin',
    permissions: { overview: true, klanten: true, reports: true, pipeline: true, prospects: true, masterplan: true, cases: true, agencyos: true, content: true, strategy: true, forecast: true, retainers: true, nightshift: true, meetings: true, tasks: true, team: true, 'client-tools': true, settings: true, admin: true },
    lastLogin: null,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'u2',
    name: 'Matthijs',
    email: 'matthijs@nodefy.nl',
    password: 'nodefy123',
    role: 'superadmin',
    permissions: { overview: true, klanten: true, reports: true, pipeline: true, prospects: true, masterplan: true, cases: true, agencyos: true, content: true, strategy: true, forecast: true, retainers: true, nightshift: true, meetings: true, tasks: true, team: true, 'client-tools': true, settings: true, admin: true },
    lastLogin: null,
    createdAt: '2024-01-01T00:00:00Z'
  }
]

// All possible tab IDs for permissions
export const ALL_TAB_IDS: TabId[] = ['overview', 'klanten', 'reports', 'pipeline', 'prospects', 'masterplan', 'cases', 'agencyos', 'content', 'strategy', 'forecast', 'retainers', 'nightshift', 'meetings', 'tasks', 'team', 'client-tools', 'settings', 'admin']
export const VISIBLE_TAB_IDS: TabId[] = ['overview', 'klanten', 'reports', 'pipeline', 'prospects', 'masterplan', 'cases', 'agencyos', 'content', 'meetings', 'tasks', 'client-tools'] // tabs that can be assigned permissions (retainers + strategy = superadmin only, never assignable)

// Storage keys
export const USERS_STORAGE_KEY = 'nodefy-users'
export const CURRENT_USER_STORAGE_KEY = 'nodefy-current-user'

export const CLIENT_PERFORMANCE: ClientPerformance[] = [
  // Clients WITH performance data (from Agile Analytics, last 7 days)
  { name: 'Digital Notary', fbSpend: '€241', fbConversions: 9, googleSpend: '€399', googleCpa: '€44', health: 'good' },
  { name: 'Displine', fbSpend: '€720', fbRoas: '7.12', fbPurchases: 10, googleSpend: '€596', googleRoas: '2.44', health: 'good' },
  { name: 'Eginstill', fbReach: '97K', fbConversions: 15, googleClicks: 198, health: 'good' },
  { name: 'Floryn', fbReach: '414K', fbConversions: 96, googleClicks: 2398, health: 'good' },
  { name: 'Franky Amsterdam', fbSpend: '€5,964', fbPurchases: 491, fbRoas: '7.81', googleSpend: '€1,669', googleConversions: 78, health: 'good' },
  { name: 'Johan Cruyff', fbSpend: '€435', fbReach: '75K', fbClicks: 2177, health: 'good' },
  { name: 'Lake Cycling', fbSpend: '€3,455', fbPurchases: 132, fbRoas: '8.64', googleConversions: 129, googleRoas: '11.29', health: 'good' },
  { name: 'Niata', otherMetrics: 'Shopify €840 sales', health: 'warning' },
  { name: 'Spirit Hospitality', googleSpend: '€335', googleConversions: 16, googleClicks: 487, health: 'good' },
  { name: 'Stories', fbSpend: '$443', googleSpend: '€545', health: 'warning' },
  { name: 'TalentCare', googleSpend: '€3,664', googleConversions: 61, health: 'good' },
  { name: 'Tours & Tickets', fbSpend: '€571', fbClicks: 1206, fbRoas: '9.62', health: 'good' },
  { name: 'Unity Units', otherMetrics: 'GA4: 5,297 sessions, 4,554 users', health: 'good' },
  // Clients WITHOUT performance data yet
  { name: 'Kisch', health: 'unknown' },
  { name: 'SB+WAA+Fun', health: 'unknown' },
  { name: 'Caron', health: 'unknown' },
  { name: 'The Branding Club NL', health: 'unknown' },
  { name: 'Restaurants Shaul', health: 'unknown' },
  { name: 'Padelpoints', health: 'unknown' },
  { name: 'The Core', health: 'unknown' },
  { name: 'Ripple Surf Therapy', health: 'unknown' },
  { name: 'FlorisDaken/Mankracht', health: 'unknown' },
  { name: 'Rust Zacht', health: 'unknown' },
  { name: 'Rotterdam Chemicals', health: 'unknown' },
  { name: 'Student Experience', health: 'unknown' },
  { name: 'BunBun/Little Bonfire', health: 'unknown' },
  { name: 'Momentum', health: 'unknown' },
  { name: 'Distillery', health: 'unknown' },
  { name: 'Bikeshoe4u/Grutto', health: 'unknown' },
  { name: 'Synvest', health: 'unknown' },
  { name: 'Kremer Collectie', health: 'unknown' },
  { name: 'Renaissance/CIMA', health: 'unknown' },
  { name: 'Carelli', health: 'unknown' },
  { name: 'Mr Fris', health: 'unknown' },
]


export const PIPELINES: Pipeline[] = [
  {
    id: 'default',
    name: 'Warm - Sales',
    stages: [
      { id: '5509912', name: 'Afspraak ingepland', order: 1, closed: false },
      { id: 'appointmentscheduled', name: 'Eerste gesprek gehad', order: 2, closed: false },
      { id: 'qualifiedtobuy', name: 'Open voor een offerte', order: 3, closed: false },
      { id: 'decisionmakerboughtin', name: 'Offerte verstuurd', order: 4, closed: false },
      { id: 'closedwon', name: 'Sluiting gewonnen', order: 5, closed: true },
      { id: 'closedlost', name: 'Sluiting verloren', order: 6, closed: true },
      { id: '16170377', name: 'Geen offerte uitgebracht', order: 7, closed: true },
    ]
  },
  {
    id: '2902876349',
    name: 'Koud - Sales',
    stages: [
      { id: '3982684388', name: 'Prospect', order: 1, closed: false },
      { id: '3982505176', name: 'Bel afspraak', order: 2, closed: false },
      { id: '3982505177', name: 'Informatie gestuurd', order: 3, closed: false },
      { id: '3982505178', name: 'Later contact', order: 4, closed: false },
      { id: '3982505167', name: 'Naar Warm', order: 5, closed: true },
      { id: '3982505168', name: 'Gesloten / verloren', order: 6, closed: true },
      { id: '3982505179', name: 'Geen contact', order: 7, closed: true },
    ]
  }
]

// Pipeline deals from HubSpot

export const CLOSED_STAGE_IDS = new Set(['closedwon', 'closedlost', '16170377', '3982505167', '3982505168', '3982505179'])


export const RETAINER_CLIENTS = [
  // Start 2022
  { klant: 'Tours & Tickets', recurring: true, lead: 'Matthijs', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 72000, months: [6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000, 6000], startJaar: 2022 },
  { klant: 'Kisch', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 3000, months: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1000, 1000, 1000], startJaar: 2022 },
  { klant: 'Spirit', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 51000, months: [4250, 4250, 4250, 4250, 4250, 4250, 4250, 4250, 4250, 4250, 4250, 4250], startJaar: 2022 },
  { klant: 'SB+WAA+Fun', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 16800, months: [1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400, 1400], startJaar: 2022 },
  // Start 2023
  { klant: 'Caron', recurring: true, lead: 'Merijn', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 7650, months: [2325, 2325, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300], startJaar: 2023 },
  { klant: 'The Branding Club NL', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'HubSpot / Digital marketing', bedrag: 30000, months: [2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500], startJaar: 2023 },
  { klant: 'Verstegen', recurring: true, lead: 'Roy', status: 'Gepauzeerd', onderdeel: 'Digital marketing', bedrag: 0, months: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], startJaar: 2023 },
  { klant: 'Talent Care', recurring: true, lead: 'Jaron', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 31200, months: [2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600], startJaar: 2023 },
  // Start 2024
  { klant: 'Restaurants Shaul', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'SEA', bedrag: 12000, months: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000], startJaar: 2024 },
  { klant: 'Digital Notary', recurring: true, lead: 'Carbon', status: 'Actief', onderdeel: 'SEA', bedrag: 43200, months: [3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600], startJaar: 2024 },
  { klant: 'Padelpoints', recurring: true, lead: 'Max', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 21600, months: [1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800], startJaar: 2024 },
  { klant: 'Franky Amsterdam', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 36000, months: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000], startJaar: 2024 },
  { klant: 'Van der Kooij Advocaten', recurring: true, lead: 'RQS', status: 'Gestopt', onderdeel: 'Digital marketing', bedrag: 2200, months: [2200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], startJaar: 2024 },
  { klant: 'The Core', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 6000, months: [1500, 1500, 1500, 1500, 0, 0, 0, 0, 0, 0, 0, 0], startJaar: 2024 },
  // Start 2025
  { klant: 'Ripple Surf Therapy', recurring: true, lead: 'Loes', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 12000, months: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000], startJaar: 2025 },
  { klant: 'FlorisDaken / Mankracht', recurring: true, lead: 'David', status: 'Actief', onderdeel: 'SEA', bedrag: 9600, months: [800, 800, 800, 800, 800, 800, 800, 800, 800, 800, 800, 800], startJaar: 2025 },
  { klant: 'Rust Zacht', recurring: true, lead: 'Jaron', status: 'Actief', onderdeel: 'SEA', bedrag: 24000, months: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000], startJaar: 2025 },
  { klant: 'Rotterdam Chemicals', recurring: false, lead: 'RQS', status: 'Actief', onderdeel: 'HubSpot', bedrag: 0, months: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], startJaar: 2025 },
  { klant: 'Eginstill', recurring: true, lead: 'Charlotte', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 14400, months: [1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200], startJaar: 2025 },
  { klant: 'Floryn', recurring: true, lead: 'Roy', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 38640, months: [3220, 3220, 3220, 3220, 3220, 3220, 3220, 3220, 3220, 3220, 3220, 3220], startJaar: 2025 },
  { klant: 'Student Experience', recurring: true, lead: 'Cold', status: 'Actief', onderdeel: 'Dashboarding', bedrag: 10800, months: [900, 900, 900, 900, 900, 900, 900, 900, 900, 900, 900, 900], startJaar: 2025 },
  { klant: 'App4Sales', recurring: true, lead: 'Erik', status: 'Gestopt', onderdeel: 'Digital marketing', bedrag: 1900, months: [950, 950, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], startJaar: 2025 },
  { klant: 'BunBun/Little Bonfire', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 18000, months: [1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500], startJaar: 2025 },
  { klant: 'Momentum', recurring: true, lead: 'Lidewij', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 33600, months: [2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800], startJaar: 2025 },
  { klant: 'Stories', recurring: true, lead: 'Roy', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 31200, months: [2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600], startJaar: 2025 },
  { klant: 'Unity Units', recurring: true, lead: 'Benjamin Tug', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 86400, months: [8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 5600, 5600, 5600, 5600], startJaar: 2025 },
  { klant: 'Displine', recurring: true, lead: 'Jaron', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 40800, months: [3400, 3400, 3400, 3400, 3400, 3400, 3400, 3400, 3400, 3400, 3400, 3400], startJaar: 2025 },
  { klant: 'Distillery / Phima', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 38400, months: [3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200, 3200], startJaar: 2025 },
  { klant: 'Lake Cycling', recurring: true, lead: 'Jaron', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 74400, months: [6200, 6200, 6200, 6200, 6200, 6200, 6200, 6200, 6200, 6200, 6200, 6200], startJaar: 2025 },
  { klant: 'Johan Cruyff', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 5000, months: [2000, 3000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], startJaar: 2025 },
  // Start 2026
  { klant: 'Bikeshoe4u / Grutto', recurring: true, lead: 'Jaron', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 59400, months: [6600, 4800, 4800, 4800, 4800, 4800, 4800, 4800, 4800, 4800, 4800, 4800], startJaar: 2026 },
  { klant: 'Synvest', recurring: true, lead: 'Jasper', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 30300, months: [6150, 6150, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800], startJaar: 2026 },
  { klant: 'Kremer Collectie', recurring: false, lead: 'RQS', status: 'Actief', onderdeel: 'SEO', bedrag: 4600, months: [2300, 2300, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], startJaar: 2026 },
  { klant: 'Renaissance / CIMA', recurring: true, lead: 'Matthijs', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 59800, months: [0, 4800, 5500, 5500, 5500, 5500, 5500, 5500, 5500, 5500, 5500, 5500], startJaar: 2026 },
  { klant: 'Carelli', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 34000, months: [0, 5000, 2900, 2900, 2900, 2900, 2900, 2900, 2900, 2900, 2900, 2900], startJaar: 2026 },
  { klant: 'Mr Fris', recurring: true, lead: 'Benjamin Lyppens', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 30200, months: [0, 2200, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800, 2800], startJaar: 2026 },
  { klant: 'Insetto', recurring: true, lead: '', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 8400, months: [0, 0, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 0, 0, 0], startJaar: 2026 },
  { klant: 'Code Zero', recurring: true, lead: '', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 36700, months: [0, 0, 2500, 3800, 3800, 3800, 3800, 3800, 3800, 3800, 3800, 3800], startJaar: 2026 },
  { klant: 'Travelteq', recurring: true, lead: '', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 34200, months: [0, 0, 0, 3800, 3800, 3800, 3800, 3800, 3800, 3800, 3800, 3800], startJaar: 2026 },
  { klant: 'ESTG', recurring: true, lead: '', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 32900, months: [0, 0, 0, 2500, 3800, 3800, 3800, 3800, 3800, 3800, 3800, 3800], startJaar: 2026 },
  { klant: 'Mellow', recurring: true, lead: '', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 18000, months: [0, 0, 0, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000], startJaar: 2026 },
] as const

// Computed retainer KPIs
export const ACTIVE_RETAINER_CLIENTS = RETAINER_CLIENTS.filter(c => c.status === 'Actief')
export const RETAINER_ARR = ACTIVE_RETAINER_CLIENTS.reduce((sum, c) => sum + c.bedrag, 0)
export const CURRENT_MONTH_IDX = new Date().getMonth() // 0=jan, 1=feb, etc.
export const RETAINER_MRR = ACTIVE_RETAINER_CLIENTS.reduce((sum, c) => sum + c.months[CURRENT_MONTH_IDX], 0)
export const RETAINER_AVG_MRR = Math.round(RETAINER_MRR / ACTIVE_RETAINER_CLIENTS.filter(c => c.months[CURRENT_MONTH_IDX] > 0).length || 1)
export const RETAINER_NEW_2026 = RETAINER_CLIENTS.filter(c => c.startJaar === 2026).length

export const MONTHLY_COSTS = {
  overhead: { kantoor: 5000, auto: 700, bedrijfsuitjes: 1250, tools: 2000, diversen: 5000, total: 13950 },
  personnel: { ruben: 10000, loes: 5500, sales: 4500, koen: 4940, thijs: 4680, benjamin: 3770, jasper: 4940, dane: 1200, noah: 1200, megan: 1400, matthijs: 1500, total: 43630 },
  kickbacks: { jaron: { jan: 4160, monthly: 3800 }, roy: 582 },
  totalMonthly: 57580,
  totalAnnual: 677810,
}

export const HISTORICAL_REVENUE: {month: string; revenue: number}[] = [
  // 2022
  {month: '2022-01', revenue: 4664}, {month: '2022-02', revenue: 3689}, {month: '2022-03', revenue: 4891},
  {month: '2022-04', revenue: 11344}, {month: '2022-05', revenue: 11418}, {month: '2022-06', revenue: 16450},
  {month: '2022-07', revenue: 17840}, {month: '2022-08', revenue: 20685}, {month: '2022-09', revenue: 30717},
  {month: '2022-10', revenue: 30628}, {month: '2022-11', revenue: 34388}, {month: '2022-12', revenue: 32250},
  // 2023
  {month: '2023-01', revenue: 29605}, {month: '2023-02', revenue: 35715}, {month: '2023-03', revenue: 30338},
  {month: '2023-04', revenue: 29883}, {month: '2023-05', revenue: 26220}, {month: '2023-06', revenue: 37725},
  {month: '2023-07', revenue: 37535}, {month: '2023-08', revenue: 27480}, {month: '2023-09', revenue: 29050},
  {month: '2023-10', revenue: 32730}, {month: '2023-11', revenue: 40107}, {month: '2023-12', revenue: 35110},
  // 2024
  {month: '2024-01', revenue: 40771}, {month: '2024-02', revenue: 42633}, {month: '2024-03', revenue: 43481},
  {month: '2024-04', revenue: 48873}, {month: '2024-05', revenue: 41611}, {month: '2024-06', revenue: 42118},
  {month: '2024-07', revenue: 38498}, {month: '2024-08', revenue: 41998}, {month: '2024-09', revenue: 54635},
  {month: '2024-10', revenue: 63935}, {month: '2024-11', revenue: 70935}, {month: '2024-12', revenue: 60860},
  // 2025
  {month: '2025-01', revenue: 68170}, {month: '2025-02', revenue: 61576}, {month: '2025-03', revenue: 67520},
  {month: '2025-04', revenue: 61145}, {month: '2025-05', revenue: 70470}, {month: '2025-06', revenue: 64370},
  {month: '2025-07', revenue: 70224}, {month: '2025-08', revenue: 72787}, {month: '2025-09', revenue: 72387},
  {month: '2025-10', revenue: 83587}, {month: '2025-11', revenue: 83987}, {month: '2025-12', revenue: 81987},
  // 2026
  {month: '2026-01', revenue: 86995}, {month: '2026-02', revenue: 95995}, {month: '2026-03', revenue: 86270},
];

export const STORAGE_KEY = 'nodefy-dashboard-v12'

export interface NavSection {
  title: string
  items: { id: TabId; label: string; count?: number }[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'GENERAL',
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'tasks', label: 'Tasks' },
      { id: 'meetings', label: 'Meetings' },
      { id: 'klanten', label: 'Klanten' },
      { id: 'reports', label: 'Reports' },
      { id: 'client-tools', label: 'Client Tools' },
      { id: 'team', label: 'Team' },
    ]
  },
  {
    title: 'STRATEGY',
    items: [
      { id: 'masterplan', label: 'Masterplan' },
      { id: 'cases', label: 'Cases' },
      { id: 'agencyos', label: 'Agency OS' },
      { id: 'nightshift', label: 'Nachtshift' },
    ]
  },
  {
    title: 'SALES',
    items: [
      { id: 'pipeline', label: 'Pipeline' },
      { id: 'prospects', label: 'Prospects' },
      { id: 'content', label: 'Content' },
      { id: 'strategy', label: 'Strategy' },
      { id: 'forecast', label: 'Forecast' },
      { id: 'retainers', label: 'Retainers' },
    ]
  },
]

// System section (only for superadmins)
export const SYSTEM_NAV: NavSection = {
  title: 'SYSTEM',
  items: [
    { id: 'admin', label: 'Admin' },
  ]
}

// Role badge colors
export const ROLE_COLORS: Record<UserRole, string> = {
  superadmin: 'bg-red-500/20 text-red-400 border-red-500/30',
  admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  viewer: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  custom: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

