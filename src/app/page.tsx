'use client'

import { useState, useEffect, useCallback } from 'react'

// ============================================
// NODEFY SALES DASHBOARD v6.0
// Major content update with editing capabilities
// ============================================

// Types
type TabId = 'overview' | 'klanten' | 'reports' | 'pipeline' | 'masterplan' | 'cases' | 'agencyos' | 'content' | 'strategy' | 'retainers' | 'settings' | 'admin'

type UserRole = 'superadmin' | 'admin' | 'viewer' | 'custom'

interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  permissions: Record<TabId, boolean>
  lastLogin: string | null
  createdAt: string
}

// Default users (hardcoded as defaults)
const DEFAULT_USERS: User[] = [
  {
    id: 'u1',
    name: 'Ruben',
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

// All possible tab IDs for permissions
const ALL_TAB_IDS: TabId[] = ['overview', 'klanten', 'reports', 'pipeline', 'masterplan', 'cases', 'agencyos', 'content', 'strategy', 'retainers', 'settings', 'admin']
const VISIBLE_TAB_IDS: TabId[] = ['overview', 'klanten', 'reports', 'pipeline', 'masterplan', 'cases', 'agencyos', 'content'] // tabs that can be assigned permissions (retainers + strategy = superadmin only, never assignable)

// Storage keys
const USERS_STORAGE_KEY = 'nodefy-users'
const CURRENT_USER_STORAGE_KEY = 'nodefy-current-user'

interface EditableData {
  todayTasks: TodayTask[]
  completedTasks: string[]
  linkedinPosts: LinkedInPost[]
  personas: Persona[]
  painPoints: PainPoint[]
  outreachTemplates: OutreachTemplate[]
  clientCases: WebsiteCase[]
  agencyOsApps: AgencyApp[]
  websiteTasks: WebsiteTasks
  frankyRecommendations: Recommendation[]
  florynRecommendations: Recommendation[]
  masterplan: Masterplan
  kantoor: Kantoor
  clients: Client[]
  pipelineDeals: PipelineDeal[]
  pipelineLastUpdated: string
  // Strategy cockpit data
  revenueGoals: RevenueGoals
  kpiScoreboard: KPICard[]
  quarterlyGoals: QuarterlyGoal[]
  masterTasks: MasterTask[]
  monthlyForecast: { month: number; nieuwDeals: number; target: number }[]
}

// Strategy cockpit types
interface RevenueGoals {
  annualTarget: number
  quarters: { q: string; target: number; realized: number }[]
}

interface KPICard {
  id: string
  name: string
  current: number
  target: number
  unit: string
}

interface QuarterlyGoal {
  id: string
  quarter: string
  text: string
  status: 'green' | 'yellow' | 'red'
}

interface MasterTask {
  id: string
  title: string
  done: boolean
  deadline: string
  category: 'Content' | 'Agency OS' | 'Masterplan' | 'Strategy' | 'Reports' | 'Klanten' | 'Pipeline'
  priority: 'high' | 'medium' | 'low'
}

interface Persona {
  id: number
  name: string
  age: number
  role: string
  company: string
  goals: string[]
  pains: string[]
  triggers: string[]
  objections: string[]
  channels: string[]
}

interface PainPoint {
  rank: number
  title: string
  impact: string
  solution: string
}

interface LinkedInPost {
  id: number
  title: string
  category: string
  hook: string
  status: 'ready' | 'draft' | 'idea'
  concept: string
}

interface OutreachTemplate {
  id: number
  name: string
  type: string
  template: string
}

interface TodayTask {
  id: string
  category: string
  task: string
  time: string
  priority: 'high' | 'medium' | 'building'
  assignee?: string
}

// Website case format matching Nodefy website structure
interface WebsiteCase {
  id: string
  name: string
  heroImage: string
  introduction: string
  year: string // Type of work: "Leadgeneration", "E-commerce"
  industry: string
  scopeOfWork: string
  timeline: string
  challenges: { headline: string; description: string }
  solution: { headline: string; description: string }
  results: { summary: string; kpis: { value: string; label: string }[] }
  featured: boolean
}

interface AgencyApp {
  id: string
  name: string
  emoji: string
  description: string
  features: string[]
  integrations: string[]
  notifications: string[]
  effort: string
  impact: string
  status: string
}

interface Recommendation {
  id: number
  priority: 'high' | 'medium' | 'low'
  action: string
  impact: string
}

interface WebsiteTask {
  id: number
  task: string
  desc: string
  status: string
}

interface WebsiteTasks {
  critical: WebsiteTask[]
  improvements: WebsiteTask[]
  suggestions: WebsiteTask[]
}

interface Masterplan {
  pillars: { id: number; title: string; emoji: string; description: string; items: string[] }[]
  aiAgents: {
    current: string[]
    planned: { name: string; timeline: string; impact: string }[]
  }
  ninetyDayRoadmap: { week: string; focus: string; tasks: string[]; responsible: string; kpi: string }[]
  kpis: { metric: string; current: string; target: string; status: string }[]
  quickWins: { id: number; task: string; time: string; done: boolean }[]
}

interface Kantoor {
  address: string
  city: string
  postalCode: string
  features: string[]
  contentIdeas: string[]
  history: { built: string; style: string; notable: string; neighborhood: string }
  movingTasks: { id: number; task: string; status: string }[]
}

interface Client {
  id: string
  naam: string
  jaar: number
  lead: string
  dashboard: boolean
  status: string
  vertical: string
  services: string[]
}

interface ClientPerformance {
  name: string
  fbSpend?: string
  fbRoas?: string
  fbPurchases?: number
  fbClicks?: number
  fbReach?: string
  fbConversions?: number
  googleSpend?: string
  googleRoas?: string
  googleConversions?: number
  googleClicks?: number
  googleCpa?: string
  otherMetrics?: string
  health: 'good' | 'warning' | 'critical' | 'unknown'
}

interface PipelineDeal {
  id: string
  name: string
  value: number | null
  stageId: string
  pipelineId: string
}

interface PipelineStage {
  id: string
  name: string
  order: number
  closed: boolean
}

interface Pipeline {
  id: string
  name: string
  stages: PipelineStage[]
}

// ============================================
// DEFAULT DATA
// ============================================

const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 1,
    name: 'Scale-up Sander',
    age: 35,
    role: 'Eigenaar',
    company: 'Pet products webshop, €600K omzet',
    goals: ['€1M omzet bereiken', 'Google Ads erbij', 'Internationaal uitbreiden'],
    pains: ['Vorig bureau te duur (€1.800/mnd)', 'Excel rapporten snapte hij niet', 'Google Ads verbrandt budget'],
    triggers: ['Bureau contract loopt af', 'Leest over AI in marketing', 'Collega tipt'],
    objections: ['"Vorige bureau was ook enthousiast in begin"', '"Ik wil echte transparantie"', '"Werkt AI echt?"'],
    channels: ['Sprout', 'Emerce', 'LinkedIn', 'Podcasts'],
  },
  {
    id: 2,
    name: 'Pragmatische Priya',
    age: 42,
    role: 'Eigenaar + Creatief directeur',
    company: 'Fashion webshop, €350K omzet',
    goals: ['Stabiele groei 20-30%/jaar', 'Winstgevend blijven', 'Niet ten koste van alles schalen'],
    pains: ['Bureaus beloven gouden bergen', 'Freelancers ghosten na 2 mnd', 'Wil gewoon iemand die het DOET'],
    triggers: ['Freelancer gestopt', 'Seizoenscollectie komt eraan', 'Vriendin raadt bureau aan'],
    objections: ['"Al eerder teleurgesteld"', '"Waarom AI beter dan mens?"', '"Wil resultaat binnen 2 mnd"'],
    channels: ['Fashionunited', 'Instagram', 'WhatsApp groepen'],
  },
  {
    id: 3,
    name: 'Techie Thomas',
    age: 31,
    role: 'Eigenaar + Tech lead',
    company: 'Niche webshop (board games), €200K omzet',
    goals: ['Marketing automatiseren', 'Data-driven groeien', 'Focus op product'],
    pains: ['Marketing = andere taal', 'Bureaus snappen tech-stack niet', 'Wil API toegang, geen PDF'],
    triggers: ['Blogpost over AI marketing', 'LinkedIn post over tech-stack', '"AI-native" positioning'],
    objections: ['"Welke AI precies?"', '"Kan ik data exporteren?"', '"Geen vendor lock-in"'],
    channels: ['Reddit', 'Hacker News', 'Product Hunt', 'Tech podcasts'],
  },
]

const DEFAULT_PAIN_POINTS: PainPoint[] = [
  { rank: 1, title: 'Ik verspil ad spend maar weet niet waarom', impact: '€12K/jaar verloren bij €1K/mnd waste', solution: 'AI-optimalisatie + transparante ROAS reporting' },
  { rank: 2, title: 'Ik heb geen tijd voor marketing', impact: 'Omzet schommelt wild, geen voorspelbare groei', solution: 'Full-service management, wij doen alles' },
  { rank: 3, title: 'Bureaus zijn te duur of leveren niet', impact: 'Wantrouwen hele industry', solution: 'Vaste prijs, geen BS, maandelijks opzegbaar' },
  { rank: 4, title: 'Ik weet niet of mijn ads werken', impact: 'Beslissingen op onderbuikgevoel', solution: 'Wekelijkse rapportage die je snapt' },
  { rank: 5, title: 'Ik kan niet schalen zonder kosten explosie', impact: 'Plafond op groei', solution: 'AI schaalt mee, fixed fee blijft' },
]

const DEFAULT_LINKEDIN_POSTS: LinkedInPost[] = [
  {
    id: 1,
    title: 'We vervingen 3 uur handwerk door 1 n8n workflow',
    category: 'AI & Automation',
    hook: 'Concrete case, geen hype',
    status: 'ready',
    concept: `We vervingen 3 uur handwerk door 1 n8n workflow.

Elke week dezelfde klus:
→ Data uit 3 systemen halen
→ In Excel plakken
→ Rapport maken
→ Mailen naar klant

Niemand had er zin in. Maar het moest.

Tot we het automatiseerden:
1. n8n haalt data uit alle bronnen
2. Formatteert automatisch
3. Mailt elke maandag om 9:00

Tijd bespaard: 3 uur per week
Fouten: van "regelmatig" naar 0
Team happiness: 📈

De tools zijn er. De vraag is: waar besteed jij nog tijd aan dat een machine kan doen?

#automation #n8n #marketing #efficiency`,
  },
  {
    id: 2,
    title: 'AI agents zijn overhyped. Behalve als je dit doet...',
    category: 'AI & Automation',
    hook: 'Contrarian take',
    status: 'ready',
    concept: `AI agents zijn overhyped.

Iedereen heeft het erover.
Niemand gebruikt ze echt.

Waarom? Omdat de meeste implementaties mislukken.

3 redenen:
1. Te ambitieus beginnen ("laat AI alles doen")
2. Geen duidelijke scope ("doe maar wat")
3. Geen feedback loop ("set and forget")

Wat wél werkt:
→ Eén specifieke taak
→ Duidelijke input/output
→ Mens in de loop

Onze AI agent doet precies 1 ding:
Dagelijks campaign performance checken en alerts sturen.

Dat is het. Saai? Ja.
Werkt het? Elke dag.

Begin klein. Schaal later.

#ai #agents #marketing #automation`,
  },
  {
    id: 3,
    title: '90% van de bedrijven meet hun ads verkeerd',
    category: 'Data & Tracking',
    hook: 'Observatie + fix',
    status: 'ready',
    concept: `90% van de bedrijven meet hun ads verkeerd.

Niet een beetje verkeerd.
Compleet verkeerd.

Wat we zien bij nieuwe klanten:
❌ Dubbele conversies (Facebook + Google tellen dezelfde sale)
❌ Geen server-side tracking (30-40% data loss door iOS)
❌ Verkeerde attributie window
❌ Geen consent mode v2

Het resultaat?
→ ROAS cijfers die er goed uitzien
→ Beslissingen op basis van slechte data
→ Budget naar verkeerde kanalen

De fix is niet sexy:
1. Audit je huidige setup
2. Implementeer server-side tracking
3. Deduplicate conversies
4. Check consent compliance

Kost een middag. Bespaart duizenden.

Wanneer heb jij voor het laatst je tracking geaudit?

#tracking #googleads #metaads #data`,
  },
  {
    id: 4,
    title: 'Van 2 naar 9 man in 4 jaar. 3 dingen die ik anders zou doen.',
    category: 'Ondernemerschap',
    hook: 'Reflectie',
    status: 'ready',
    concept: `Van 2 naar 9 man in 4 jaar.

Klinkt als een succesverhaal.
Maar ik zou 3 dingen anders doen:

1. Eerder specialiseren
We wilden eerst alles doen. SEO, ads, social, websites.
Resultaat: middelmatig in alles, excellent in niets.
Nu: AI + Data + Performance. Dat is het.

2. Eerder nee zeggen
Elke klant aanpakken voelde als groei.
Maar slechte fits kosten meer dan ze opleveren.
Nu: 50% van de leads wijzen we af.

3. Eerder systemen bouwen
"We doen het later wel"
Later kwam nooit.
Nu: als iets 3x voorkomt, documenteren we het.

Groei is niet alleen omzet.
Het is ook leren wat je niet moet doen.

Wat zou jij anders doen?

#ondernemen #agency #groei #lessons`,
  },
  {
    id: 5,
    title: 'LinkedIn ads voor B2B: onze echte resultaten na €50K spend',
    category: 'Marketing',
    hook: 'Transparant',
    status: 'ready',
    concept: `LinkedIn ads voor B2B: onze echte resultaten na €50K spend.

Geen case study met cherry-picked data.
Gewoon de waarheid.

Setup:
→ B2B SaaS klant
→ €50K budget over 6 maanden
→ Doel: qualified leads

Resultaten:
✅ 847 leads
✅ €59 cost per lead
✅ 23% conversion naar demo
✅ 4 closed deals

De wiskunde:
€50K spend → 4 deals × €15K ACV = €60K ARR
Payback: 10 maanden

Was het waard? Ja.
Is het voor iedereen? Nee.

LinkedIn werkt als:
→ Je ACV hoog genoeg is (>€5K)
→ Je targeting specifiek is
→ Je content niet schreeuwerig is

#linkedinads #b2b #saas #marketing`,
  },
]

const DEFAULT_OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    id: 1,
    name: 'Connectie verzoek',
    type: 'linkedin',
    template: `Hey [naam],

Zag dat je [bedrijf] runt - mooie webshop!

Ik help e-commerce bedrijven met AI-gedreven marketing. Altijd interessant om te connecten met ondernemers in dezelfde space.

Groet,
Ruben`,
  },
  {
    id: 2,
    name: 'Follow-up na connectie',
    type: 'linkedin',
    template: `Hey [naam],

Thanks voor de connectie!

Even kort: bij Nodefy combineren we AI met performance marketing voor webshops. Geen fluf, gewoon resultaat.

Ben benieuwd - waar loop jij nu tegenaan qua marketing/growth?

Geen sales pitch, gewoon interesse.

Ruben`,
  },
  {
    id: 3,
    name: 'Case study share',
    type: 'linkedin',
    template: `Hey [naam],

Zag dat je met [platform] werkt - wij hielpen laatst een vergelijkbare webshop van €X naar €Y ROAS.

Dacht: misschien interessant voor je?

Happy om te delen hoe we dat aanpakten - geen strings attached.

Ruben`,
  },
]

const DEFAULT_TODAY_TASKS: TodayTask[] = [
  { id: 't1', category: 'Website', task: 'Footer fixen: "fabrica®" → "Nodefy B.V."', time: '5 min', priority: 'high' },
  { id: 't2', category: 'Website', task: 'Telefoon updaten: echte nummer invullen', time: '2 min', priority: 'high' },
  { id: 't3', category: 'Website', task: 'Email checken: info@nodefy.nl of .ai?', time: '2 min', priority: 'high' },
  { id: 't4', category: 'LinkedIn', task: 'Post plaatsen: "We vervingen 3 uur handwerk..."', time: '15 min', priority: 'medium' },
  { id: 't5', category: 'Content', task: 'Case study uitwerken (Franky of Stories)', time: '60 min', priority: 'medium' },
  { id: 't6', category: 'Tools', task: 'Tracking Health Checker afmaken', time: '90 min', priority: 'building', assignee: 'AI' },
]

// Website format cases matching Nodefy website structure
const DEFAULT_CLIENT_CASES: WebsiteCase[] = [
  {
    id: 'unity-units',
    name: 'Unity Units',
    heroImage: '/cases/unity-units-hero.jpg',
    introduction: 'Unity Units is een snelgroeiende aanbieder van flexibele opslagunits in Nederland. Ze zochten een partner die hun digitale aanwezigheid naar het volgende niveau kon tillen met data-driven marketing.',
    year: 'E-commerce',
    industry: 'Storage & Logistics',
    scopeOfWork: 'GA4 implementatie, Server-side tracking, Custom dashboard development, Performance optimization',
    timeline: '3 months',
    challenges: {
      headline: 'Geen inzicht in customer journey',
      description: 'Unity Units had geen betrouwbare data over waar hun klanten vandaan kwamen. De bestaande tracking was incompleet, wat resulteerde in slechte besluitvorming en verspilde ad spend. Ze misten de inzichten om hun marketing effectief te optimaliseren.'
    },
    solution: {
      headline: 'Complete data infrastructure rebuild',
      description: 'We implementeerden een volledige GA4 setup met enhanced e-commerce tracking, server-side measurement voor nauwkeurige attributie ondanks privacy-restricties, en een custom dashboard dat real-time inzichten geeft in alle kritieke metrics.'
    },
    results: {
      summary: 'Binnen 3 maanden had Unity Units complete visibility over hun funnel en kon datagedreven beslissingen nemen.',
      kpis: [
        { value: '5,297', label: 'Sessions tracked' },
        { value: '4,554', label: 'Unique users' },
        { value: '+35%', label: 'Engagement rate' }
      ]
    },
    featured: true
  },
  {
    id: 'franky',
    name: 'Franky Amsterdam',
    heroImage: '/cases/franky-hero.jpg',
    introduction: 'Franky Amsterdam is een premium sieraden merk dat handgemaakte pieces verkoopt aan een internationale doelgroep. Ze zochten een partner om hun digitale groei te versnellen en nieuwe markten aan te boren.',
    year: 'E-commerce',
    industry: 'Fashion & Jewelry',
    scopeOfWork: 'Meta Ads management, Google Ads, TikTok Ads, Server-side tracking, International expansion (DE)',
    timeline: '13+ months',
    challenges: {
      headline: 'Dubbele ROAS meting en tracking gaps',
      description: 'Franky\'s bestaande tracking setup telde conversies dubbel tussen Meta en Google, waardoor ROAS cijfers onbetrouwbaar waren. Daarnaast ontbrak server-side tracking, wat resulteerde in 30-40% data loss door iOS privacy updates. De Google Shopping feed was niet geoptimaliseerd voor hun premium positioning.'
    },
    solution: {
      headline: 'Full-funnel tracking fix + international scaling',
      description: 'We herbouwden de complete tracking infrastructure met server-side measurement, dedupliceerden conversies correct, en optimaliseerden de Google Shopping feed. Vervolgens lanceerden we de Duitsland expansie met dedicated campaigns en zetten TikTok Ads op voor een jongere doelgroep.'
    },
    results: {
      summary: 'Franky behaalt nu consistent 8-10x ROAS met betrouwbare data en is succesvol geëxpandeerd naar de Duitse markt.',
      kpis: [
        { value: '9.41x', label: 'Blended ROAS' },
        { value: '+40%', label: 'Conversion accuracy' },
        { value: 'DE live', label: 'New market launched' }
      ]
    },
    featured: true
  },
  {
    id: 'stories',
    name: 'Stories',
    heroImage: '/cases/stories-hero.jpg',
    introduction: 'Stories is een B2B content agency dat merkverhalen vertelt voor enterprise klanten. Ze hadden een inconsistente lead pipeline en zochten een partner om hun B2B leadgen te professionaliseren.',
    year: 'Leadgeneration',
    industry: 'B2B Services / Content',
    scopeOfWork: 'LinkedIn Ads strategy, HubSpot integration, Lead scoring, Conversion optimization',
    timeline: '6 months',
    challenges: {
      headline: 'Inconsistente lead flow met hoge CPL',
      description: 'Stories\' lead generation was onvoorspelbaar - sommige maanden veel leads, andere maanden bijna geen. De cost per lead was te hoog voor hun marges, en er was geen inzicht in welke leads daadwerkelijk converteren naar klanten. De funnel lekte op meerdere plekken.'
    },
    solution: {
      headline: 'LinkedIn Ads herstructurering + lead scoring',
      description: 'We herstructureerden de volledige LinkedIn Ads strategie met betere targeting, optimaliseerden de conversion tracking, en implementeerden lead scoring in HubSpot. Dit gaf Stories inzicht in lead kwaliteit en stelde ze in staat om te focussen op high-value prospects.'
    },
    results: {
      summary: 'Stories heeft nu een voorspelbare lead pipeline met significant lagere kosten en hogere kwaliteit leads.',
      kpis: [
        { value: '-45%', label: 'Cost per lead' },
        { value: '+120%', label: 'Lead volume' },
        { value: '34%', label: 'SQL ratio (was 18%)' }
      ]
    },
    featured: true
  },
  {
    id: 'floryn',
    name: 'Floryn',
    heroImage: '/cases/floryn-hero.jpg',
    introduction: 'Floryn is een fintech scale-up die zakelijke financiering aanbiedt aan MKB ondernemers. Ze zochten een partner om hun B2B lead generation te optimaliseren en kosten per lead te verlagen terwijl volume omhoog ging.',
    year: 'Leadgeneration',
    industry: 'Financing / Fintech',
    scopeOfWork: 'LinkedIn Ads, Meta Ads, HubSpot CRM integration, Audience segmentation, Landing page optimization',
    timeline: 'Ongoing (12+ months)',
    challenges: {
      headline: 'Hoge CPL met inconsistente leadkwaliteit',
      description: 'Floryn kampte met hoge acquisition costs in de competitieve fintech markt. De cost per lead was te hoog om winstgevend te schalen, en de kwaliteit van leads varieerde sterk. Er was onvoldoende segmentatie in de targeting, waardoor budget niet efficiënt werd ingezet.'
    },
    solution: {
      headline: 'Multi-channel B2B lead gen met smart segmentation',
      description: 'We implementeerden een geïntegreerde LinkedIn + Meta strategie met audience segmentatie op basis van bedrijfsgrootte en sector. HubSpot CRM integratie gaf closed-loop reporting, zodat we konden optimaliseren op SQL\'s in plaats van alleen leads. Landing pages werden A/B getest voor maximale conversie.'
    },
    results: {
      summary: 'Floryn genereert nu consistent 188 leads per maand met een LP conversie rate van 16.5% en een CPL van €72.',
      kpis: [
        { value: '16.5%', label: 'LP conversion rate' },
        { value: '188', label: 'Leads per month' },
        { value: '€72', label: 'Cost per lead' }
      ]
    },
    featured: true
  },
]

const DEFAULT_AGENCY_OS_APPS: AgencyApp[] = [
  {
    id: 'alertpilot',
    name: 'AlertPilot',
    emoji: '🚨',
    description: 'Campagne Monitoring & Alerts',
    features: ['ROAS daalt onder target', 'Budget bijna op', 'Conversies stoppen'],
    integrations: ['Google Ads', 'Meta Ads'],
    notifications: ['Slack', 'Telegram'],
    effort: 'Medium',
    impact: 'Hoog',
    status: 'idea'
  },
  {
    id: 'clientpulse',
    name: 'ClientPulse',
    emoji: '📊',
    description: 'Klant Health Dashboard',
    features: ['Status: 🟢🟡🔴', 'Laatste contact', 'Performance trend'],
    integrations: ['HubSpot', 'Google Ads'],
    notifications: [],
    effort: 'Medium',
    impact: 'Hoog',
    status: 'idea'
  },
  {
    id: 'reportgen',
    name: 'ReportGen',
    emoji: '📈',
    description: 'Automatische rapportage',
    features: ['Wekelijkse reports', 'Maandelijkse overzichten', 'Custom KPIs'],
    integrations: ['Google Ads', 'Meta Ads', 'GA4'],
    notifications: ['Email', 'Slack'],
    effort: 'Hoog',
    impact: 'Hoog',
    status: 'idea'
  },
  {
    id: 'surfscaling',
    name: 'SurfScaling Tool',
    emoji: '🏄',
    description: 'AI-powered surf forecast + marketing automation',
    features: ['Surf condition triggers', 'Auto-pause/scale campaigns', 'Weather-based bidding'],
    integrations: ['Meta Ads', 'Surfline API'],
    notifications: ['Slack'],
    effort: 'Medium',
    impact: 'Medium',
    status: 'idea'
  },
  {
    id: 'metaanalyzer',
    name: 'Meta Ads Analyzer',
    emoji: '🔍',
    description: 'Automated account audits via API',
    features: ['Account health score', 'Opportunity detection', 'Waste identification'],
    integrations: ['Meta Ads API'],
    notifications: ['Email', 'Dashboard'],
    effort: 'Hoog',
    impact: 'Hoog',
    status: 'idea'
  },
  {
    id: 'hubspotmonitor',
    name: 'HubSpot Pipeline Monitor',
    emoji: '📡',
    description: 'Real-time deal tracking',
    features: ['Deal stage alerts', 'Stale deal detection', 'Revenue forecasting'],
    integrations: ['HubSpot CRM'],
    notifications: ['Slack', 'Email'],
    effort: 'Medium',
    impact: 'Hoog',
    status: 'idea'
  },
  {
    id: 'clientreportgen',
    name: 'Client Report Generator',
    emoji: '📋',
    description: 'Automated weekly/monthly reports',
    features: ['Template-based generation', 'Multi-client batching', 'PDF + email delivery'],
    integrations: ['Google Ads', 'Meta Ads', 'GA4', 'HubSpot'],
    notifications: ['Email'],
    effort: 'Hoog',
    impact: 'Hoog',
    status: 'idea'
  },
]

const DEFAULT_WEBSITE_TASKS: WebsiteTasks = {
  critical: [
    { id: 1, task: 'Fix stats counters', desc: 'Tonen nu "0"', status: 'todo' },
    { id: 2, task: 'Footer: "fabrica®" → Nodefy', desc: 'Template placeholder', status: 'todo' },
  ],
  improvements: [
    { id: 3, task: 'FAQs herschrijven', desc: 'Nu website-gericht', status: 'todo' },
    { id: 4, task: 'Meer AI messaging', desc: 'AI komt te weinig terug', status: 'todo' },
  ],
  suggestions: [
    { id: 5, task: 'Concrete resultaten', desc: 'ROAS cijfers, % groei', status: 'idea' },
    { id: 6, task: 'Team/About page', desc: 'Ruben & team zichtbaar', status: 'idea' },
  ],
}

const DEFAULT_FRANKY_RECOMMENDATIONS: Recommendation[] = [
  { id: 1, priority: 'high', action: 'Budget shift van DE → NL', impact: '+€1-2K omzet/maand' },
  { id: 2, priority: 'medium', action: 'Schaal retargeting catalog op', impact: '+10-20% retargeting omzet' },
  { id: 3, priority: 'low', action: 'Consolideer See campagnes', impact: 'Betere optimalisatie' },
]

const DEFAULT_FLORYN_RECOMMENDATIONS: Recommendation[] = [
  { id: 1, priority: 'high', action: 'Nieuwe creatives voor Carrousel BOFU', impact: 'CPL -25-30%' },
  { id: 2, priority: 'high', action: 'Schaal ABM Lead campagne op', impact: '+40-60 leads/maand' },
  { id: 3, priority: 'medium', action: 'Voeg retargeting campagne toe', impact: 'Extra lead kanaal' },
]

const DEFAULT_MASTERPLAN: Masterplan = {
  pillars: [
    { id: 1, title: 'Zichtbaarheid', emoji: '👁️', description: 'LinkedIn, content, thought leadership', items: ['3x per week posten', 'Engagement op ICP posts', 'Case studies publiceren'] },
    { id: 2, title: 'Efficiëntie', emoji: '⚡', description: 'AI agents, automation, systemen', items: ['AlertPilot bouwen', 'Reporting automatiseren', 'SOPs documenteren'] },
    { id: 3, title: 'Propositie', emoji: '💎', description: 'Pricing, packaging, positioning', items: ['Value-based pricing test', 'Tiered packages', 'AI-native messaging'] },
  ],
  aiAgents: {
    current: ['Campaign monitoring & alerts', 'Daily performance reports'],
    planned: [
      { name: 'Lead Scoring Agent', timeline: 'Q1', impact: 'Hoog' },
      { name: 'Creative Analysis Agent', timeline: 'Q1', impact: 'Hoog' },
      { name: 'Budget Pacing Agent', timeline: 'Q2', impact: 'Medium' },
    ]
  },
  ninetyDayRoadmap: [
    { week: '1-2', focus: 'Foundation', tasks: ['LinkedIn cadence starten', 'Website fixen'], responsible: 'Ruben', kpi: 'Website live, 3 posts' },
    { week: '3-4', focus: 'Content', tasks: ['12 posts klaarzetten', 'Outreach templates'], responsible: 'Team + AI', kpi: '12 posts ready, 5 templates' },
    { week: '5-8', focus: 'Outbound', tasks: ['50 connecties/week', 'DM sequence'], responsible: 'Ruben', kpi: '200 connecties, 10 conversations' },
    { week: '9-12', focus: 'Scale', tasks: ['5 meetings/week', 'Pipeline 3x'], responsible: 'Team', kpi: '€150K pipeline, 2 closed deals' },
  ],
  kpis: [
    { metric: 'LinkedIn followers', current: '~500', target: '2.000', status: 'yellow' },
    { metric: 'Deals/maand', current: '2-3', target: '4-5', status: 'yellow' },
    { metric: 'Avg retainer', current: '€3-5K', target: '€6-8K', status: 'yellow' },
  ],
  quickWins: [
    { id: 1, task: 'Footer fixen op website', time: '5 min', done: false },
    { id: 2, task: 'LinkedIn banner updaten', time: '15 min', done: false },
    { id: 3, task: 'Eerste post plaatsen', time: '10 min', done: false },
  ]
}

const DEFAULT_KANTOOR: Kantoor = {
  address: 'Weteringschans 94',
  city: 'Amsterdam',
  postalCode: '1017 XS',
  features: ['Monumentaal pand', 'Centrum locatie', 'Grachten view'],
  contentIdeas: ['Behind the scenes kantoor tour', 'Team working shots', 'Amsterdam vibes content'],
  history: {
    built: '~1890',
    style: 'Amsterdamse School',
    notable: 'Gelegen aan de Weteringschans',
    neighborhood: 'Grachtengordel-Zuid, UNESCO'
  },
  movingTasks: [
    { id: 1, task: 'Internet regelen', status: 'todo' },
    { id: 2, task: 'Sleutels ophalen', status: 'todo' },
    { id: 3, task: 'KvK adres wijzigen', status: 'todo' },
  ]
}

// All clients data
const DEFAULT_CLIENTS: Client[] = [
  // 2022
  { id: 'c1', naam: 'Tours & Tickets', jaar: 2022, lead: 'Matthijs', dashboard: true, status: 'Actief', vertical: 'E-commerce', services: ['Meta Ads', 'Google Ads'] },
  { id: 'c2', naam: 'Kisch', jaar: 2022, lead: 'RQS', dashboard: false, status: 'Actief', vertical: '', services: ['Google Ads'] },
  { id: 'c3', naam: 'Spirit Hospitality', jaar: 2022, lead: 'RQS', dashboard: true, status: 'Actief', vertical: 'Hospitality', services: ['Google Ads'] },
  { id: 'c4', naam: 'SB+WAA+Fun', jaar: 2022, lead: 'RQS', dashboard: false, status: 'Actief', vertical: '', services: ['Google Ads'] },
  // 2023
  { id: 'c5', naam: 'Caron', jaar: 2023, lead: 'Merijn', dashboard: false, status: 'Actief', vertical: '', services: ['Google Ads', 'Meta Ads', 'Local SEO'] },
  { id: 'c6', naam: 'The Branding Club NL', jaar: 2023, lead: 'RQS', dashboard: false, status: 'Actief', vertical: '', services: ['Google Ads', 'HubSpot'] },
  { id: 'c7', naam: 'TalentCare', jaar: 2023, lead: 'Jaron', dashboard: true, status: 'Actief', vertical: 'Leadgen', services: ['Google Ads'] },
  // 2024
  { id: 'c8', naam: 'Restaurants Shaul', jaar: 2024, lead: 'RQS', dashboard: false, status: 'Actief', vertical: 'Hospitality', services: ['Google Ads', 'Local SEO'] },
  { id: 'c9', naam: 'Digital Notary', jaar: 2024, lead: 'Carbon', dashboard: true, status: 'Actief', vertical: 'Leadgen', services: ['Meta Ads', 'Google Ads'] },
  { id: 'c10', naam: 'Padelpoints', jaar: 2024, lead: 'Max', dashboard: false, status: 'Actief', vertical: 'Leadgen', services: ['Google Ads', 'Meta Ads'] },
  { id: 'c11', naam: 'Franky Amsterdam', jaar: 2024, lead: 'RQS', dashboard: true, status: 'Actief', vertical: 'E-commerce', services: ['Meta Ads', 'Google Ads', 'TikTok Ads', 'Snapchat Ads', 'Pinterest Ads'] },
  { id: 'c12', naam: 'The Core', jaar: 2024, lead: 'RQS', dashboard: false, status: 'Actief', vertical: '', services: ['Meta Ads', 'Google Ads'] },
  // 2025
  { id: 'c13', naam: 'Ripple Surf Therapy', jaar: 2025, lead: 'Loes', dashboard: false, status: 'Actief', vertical: 'Leadgen', services: ['Meta Ads'] },
  { id: 'c14', naam: 'FlorisDaken/Mankracht', jaar: 2025, lead: 'David', dashboard: false, status: 'Actief', vertical: 'Leadgen', services: ['Google Ads'] },
  { id: 'c15', naam: 'Rust Zacht', jaar: 2025, lead: 'Jaron', dashboard: false, status: 'Actief', vertical: 'Leadgen', services: ['Google Ads'] },
  { id: 'c16', naam: 'Rotterdam Chemicals', jaar: 2025, lead: 'RQS', dashboard: false, status: 'Actief', vertical: 'Leadgen', services: ['HubSpot'] },
  { id: 'c17', naam: 'Eginstill', jaar: 2025, lead: 'Charlotte', dashboard: true, status: 'Actief', vertical: 'E-commerce', services: ['Meta Ads', 'Google Ads'] },
  { id: 'c18', naam: 'Floryn', jaar: 2025, lead: 'Roy', dashboard: true, status: 'Actief', vertical: 'Leadgen', services: ['Meta Ads', 'Google Ads', 'LinkedIn Ads'] },
  { id: 'c19', naam: 'Student Experience', jaar: 2025, lead: 'Cold', dashboard: false, status: 'Actief', vertical: 'Leadgen', services: ['Dashboarding'] },
  { id: 'c20', naam: 'App4Sales', jaar: 2025, lead: 'Erik', dashboard: false, status: 'Churned', vertical: 'Leadgen', services: [] },
  { id: 'c21', naam: 'BunBun/Little Bonfire', jaar: 2025, lead: 'RQS', dashboard: false, status: 'Actief', vertical: 'E-commerce', services: ['Meta Ads', 'Google Ads', 'Local SEO'] },
  { id: 'c22', naam: 'Momentum', jaar: 2025, lead: 'Lidewij', dashboard: false, status: 'Actief', vertical: '', services: ['Meta Ads', 'LinkedIn Ads', 'Google Ads'] },
  { id: 'c23', naam: 'Stories', jaar: 2025, lead: 'Roy', dashboard: true, status: 'Actief', vertical: 'Leadgen', services: ['Meta Ads', 'Google Ads', 'LinkedIn Ads'] },
  { id: 'c24', naam: 'Unity Units', jaar: 2025, lead: 'Benjamin Tug', dashboard: true, status: 'Actief', vertical: 'Leadgen', services: ['Meta Ads', 'Google Ads'] },
  { id: 'c25', naam: 'Displine', jaar: 2025, lead: 'Jaron', dashboard: true, status: 'Actief', vertical: 'E-commerce', services: ['Meta Ads', 'Google Ads'] },
  { id: 'c26', naam: 'Distillery', jaar: 2025, lead: 'RQS', dashboard: false, status: 'Actief', vertical: '', services: ['Meta Ads', 'Google Ads'] },
  { id: 'c27', naam: 'Lake Cycling', jaar: 2025, lead: 'Jaron', dashboard: true, status: 'Actief', vertical: 'E-commerce', services: ['Meta Ads', 'Google Ads'] },
  { id: 'c28', naam: 'Johan Cruyff', jaar: 2025, lead: 'RQS', dashboard: true, status: 'Actief', vertical: '', services: ['Meta Ads'] },
  { id: 'c29', naam: 'Niata', jaar: 2025, lead: 'RQS', dashboard: true, status: 'Actief', vertical: 'E-commerce', services: ['Google Ads', 'Meta Ads', 'TikTok Ads'] },
  // 2026
  { id: 'c30', naam: 'Bikeshoe4u/Grutto', jaar: 2026, lead: 'Jaron', dashboard: false, status: 'Actief', vertical: 'E-commerce', services: ['Meta Ads', 'Google Ads'] },
  { id: 'c31', naam: 'Synvest', jaar: 2026, lead: 'Jasper', dashboard: false, status: 'Actief', vertical: 'Leadgen', services: ['HubSpot'] },
  { id: 'c32', naam: 'Kremer Collectie', jaar: 2026, lead: 'RQS', dashboard: false, status: 'Actief', vertical: '', services: ['SEO'] },
  { id: 'c33', naam: 'Renaissance/CIMA', jaar: 2026, lead: 'Matthijs', dashboard: false, status: 'Actief', vertical: 'Hospitality', services: ['Google Ads', 'Meta Ads', 'Local SEO', 'Geo'] },
  { id: 'c34', naam: 'Carelli', jaar: 2026, lead: 'RQS', dashboard: false, status: 'Actief', vertical: 'E-commerce', services: ['Meta Ads', 'Google Ads'] },
  { id: 'c35', naam: 'Mr Fris', jaar: 2026, lead: 'RQS', dashboard: false, status: 'Actief', vertical: 'E-commerce', services: ['Meta Ads', 'Google Ads', 'TikTok Ads'] },
]

// Live performance data (Last 7 Days from Agile Analytics)
const CLIENT_PERFORMANCE: ClientPerformance[] = [
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

// Pipeline configuration
const PIPELINES: Pipeline[] = [
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
const DEFAULT_PIPELINE_DEALS: PipelineDeal[] = [
  // Warm - Sales pipeline
  { id: '425049493735', name: 'Abloom', value: null, stageId: 'appointmentscheduled', pipelineId: 'default' },
  { id: '43524560388', name: 'Eenmalig SEO traject Imperial Feet', value: 4000, stageId: 'decisionmakerboughtin', pipelineId: 'default' },
  { id: '443409694961', name: 'Funeral Products B.V.', value: null, stageId: 'appointmentscheduled', pipelineId: 'default' },
  { id: '424239459549', name: 'Synvest - Digital marketing', value: 33600, stageId: 'decisionmakerboughtin', pipelineId: 'default' },
  { id: '425573535988', name: 'App4Sales', value: 20000, stageId: 'decisionmakerboughtin', pipelineId: 'default' },
  { id: '443409694960', name: 'ESTG', value: null, stageId: 'appointmentscheduled', pipelineId: 'default' },
  { id: '425532553423', name: 'Oaasis - Digital marketing', value: null, stageId: 'qualifiedtobuy', pipelineId: 'default' },
  { id: '425523286218', name: 'Momentum', value: null, stageId: 'appointmentscheduled', pipelineId: 'default' },
  { id: '424340842742', name: 'Labareau - Digital marketing', value: 40000, stageId: 'qualifiedtobuy', pipelineId: 'default' },
  { id: '425049493733', name: 'Travelteq', value: null, stageId: 'qualifiedtobuy', pipelineId: 'default' },
  { id: '436378931403', name: 'Solid Nature', value: 42000, stageId: 'qualifiedtobuy', pipelineId: 'default' },
  { id: '443301468392', name: 'Rust Zacht - Digital Marketing', value: 24000, stageId: 'qualifiedtobuy', pipelineId: 'default' },
  { id: '18654471502', name: 'The Branding Club - Service Hub', value: 2500, stageId: 'qualifiedtobuy', pipelineId: 'default' },
  { id: '443409694962', name: 'Balmain Hair', value: null, stageId: 'appointmentscheduled', pipelineId: 'default' },
  { id: '424886117589', name: 'Lofi - Unlike', value: null, stageId: 'appointmentscheduled', pipelineId: 'default' },
  { id: '424458296567', name: 'POLSPOTTEN - Digital marketing', value: 48000, stageId: 'decisionmakerboughtin', pipelineId: 'default' },
  { id: '424239242443', name: 'FFWD - Digital marketing', value: 38400, stageId: 'appointmentscheduled', pipelineId: 'default' },
  { id: '425571754227', name: 'WoodUpp', value: 20000, stageId: 'appointmentscheduled', pipelineId: 'default' },
  { id: '425525090550', name: "Let's dog - Digital Marketing", value: 9000, stageId: 'decisionmakerboughtin', pipelineId: 'default' },
  { id: '425049493736', name: 'Redwing Amsterdam', value: null, stageId: 'appointmentscheduled', pipelineId: 'default' },
  // Koud - Sales pipeline
  { id: '425517359325', name: 'Artis - Unlike', value: null, stageId: '3982684388', pipelineId: '2902876349' },
  { id: '425523306739', name: 'Dr. Jetske Ultee Skincare', value: null, stageId: '3982684388', pipelineId: '2902876349' },
  { id: '390652085486', name: 'Lofi - Unlike', value: null, stageId: '3982684388', pipelineId: '2902876349' },
  { id: '435978568952', name: 'Mim Amsterdam', value: null, stageId: '3982684388', pipelineId: '2902876349' },
  { id: '426163667177', name: 'Amsterdam Museum - Unlike', value: null, stageId: '3982684388', pipelineId: '2902876349' },
]

// Closed stages — always filter these out of display
const CLOSED_STAGE_IDS = new Set(['closedwon', 'closedlost', '16170377', '3982505167', '3982505168', '3982505179'])

// Retainer client data (shared between strategy & retainers tabs)
const RETAINER_CLIENTS = [
  { klant: 'Tours & Tickets', recurring: true, lead: 'Matthijs', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 72000, jan: 6000, startJaar: 2022 },
  { klant: 'Kisch', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 12000, jan: 1000, startJaar: 2022 },
  { klant: 'Spirit', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 51000, jan: 4250, startJaar: 2022 },
  { klant: 'SB+WAA+Fun', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 16800, jan: 1400, startJaar: 2022 },
  { klant: 'Caron', recurring: true, lead: 'Merijn', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 7650, jan: 2325, startJaar: 2023 },
  { klant: 'The Branding Club NL', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'HubSpot / Digital marketing', bedrag: 30000, jan: 2500, startJaar: 2023 },
  { klant: 'Talent Care', recurring: true, lead: 'Jaron', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 31200, jan: 2600, startJaar: 2023 },
  { klant: 'Restaurants Shaul', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'SEA', bedrag: 12000, jan: 1000, startJaar: 2024 },
  { klant: 'Digital Notary', recurring: true, lead: 'Carbon', status: 'Actief', onderdeel: 'SEA', bedrag: 43200, jan: 3600, startJaar: 2024 },
  { klant: 'Padelpoints', recurring: true, lead: 'Max', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 21600, jan: 1800, startJaar: 2024 },
  { klant: 'Franky Amsterdam', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 36000, jan: 3000, startJaar: 2024 },
  { klant: 'The Core', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 18000, jan: 1500, startJaar: 2024 },
  { klant: 'Ripple Surf Therapy', recurring: true, lead: 'Loes', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 12000, jan: 1000, startJaar: 2025 },
  { klant: 'FlorisDaken / Mankracht', recurring: true, lead: 'David', status: 'Actief', onderdeel: 'SEA', bedrag: 9600, jan: 800, startJaar: 2025 },
  { klant: 'Rust Zacht', recurring: true, lead: 'Jaron', status: 'Actief', onderdeel: 'SEA', bedrag: 24000, jan: 2000, startJaar: 2025 },
  { klant: 'Rotterdam Chemicals', recurring: false, lead: 'RQS', status: 'Start nnb', onderdeel: 'HubSpot', bedrag: 0, jan: 0, startJaar: 2025 },
  { klant: 'Eginstill', recurring: true, lead: 'Charlotte', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 14400, jan: 1200, startJaar: 2025 },
  { klant: 'Floryn', recurring: true, lead: 'Roy', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 38640, jan: 3220, startJaar: 2025 },
  { klant: 'Student Experience', recurring: true, lead: 'Cold', status: 'Actief', onderdeel: 'Dashboarding', bedrag: 10800, jan: 900, startJaar: 2025 },
  { klant: 'App4Sales', recurring: true, lead: 'Erik', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 1900, jan: 950, startJaar: 2025 },
  { klant: 'BunBun/Little Bonfire', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 18000, jan: 1500, startJaar: 2025 },
  { klant: 'Momentum', recurring: true, lead: 'Lidewij', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 33600, jan: 2800, startJaar: 2025 },
  { klant: 'Stories', recurring: true, lead: 'Roy', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 31200, jan: 2600, startJaar: 2025 },
  { klant: 'Stories (HubSpot)', recurring: true, lead: 'Roy', status: 'Actief', onderdeel: 'HubSpot', bedrag: 9000, jan: 750, startJaar: 2025 },
  { klant: 'Unity Units', recurring: true, lead: 'Benjamin Tug', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 86400, jan: 8000, startJaar: 2025 },
  { klant: 'Displine', recurring: true, lead: 'Jaron', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 40800, jan: 3400, startJaar: 2025 },
  { klant: 'Distillery', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 38400, jan: 3200, startJaar: 2025 },
  { klant: 'Lake Cycling', recurring: true, lead: 'Jaron', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 74400, jan: 6200, startJaar: 2025 },
  { klant: 'Johan Cruyff', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 5000, jan: 2000, startJaar: 2025 },
  { klant: 'Bikeshoe4u / Grutto', recurring: true, lead: 'Jaron', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 59400, jan: 6600, feb: 4800, startJaar: 2026, startMonth: 1 },
  { klant: 'Synvest', recurring: true, lead: 'Jasper', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 30300, jan: 6150, feb: 6150, startJaar: 2026, startMonth: 1 },
  { klant: 'Kremer Collectie', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'SEO', bedrag: 4600, jan: 2300, feb: 2300, startJaar: 2026, startMonth: 1 },
  { klant: 'Renaissance / CIMA', recurring: true, lead: 'Matthijs', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 37800, jan: 0, feb: 4800, startJaar: 2026, startMonth: 2 },
  { klant: 'Carelli', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 29000, jan: 0, feb: 5000, startJaar: 2026, startMonth: 2 },
  { klant: 'Mr Fris', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 31800, jan: 0, feb: 3800, startJaar: 2026, startMonth: 2 },
] as const

// Computed retainer KPIs
const ACTIVE_RETAINER_CLIENTS = RETAINER_CLIENTS.filter(c => c.status === 'Actief')
const RETAINER_ARR = ACTIVE_RETAINER_CLIENTS.reduce((sum, c) => sum + c.bedrag, 0)
const RETAINER_MRR = Math.round(RETAINER_ARR / 12)
const RETAINER_AVG_MRR = Math.round(RETAINER_MRR / ACTIVE_RETAINER_CLIENTS.length)
const RETAINER_NEW_2026 = RETAINER_CLIENTS.filter(c => c.startJaar === 2026).length

const DEFAULT_MONTHLY_FORECAST = Array.from({ length: 12 }, (_, i) => ({
  month: i + 1,
  nieuwDeals: 0,
  target: Math.round(1000000 / 12),
}))

// Default Strategy cockpit data
const DEFAULT_REVENUE_GOALS: RevenueGoals = {
  annualTarget: 1000000,
  quarters: [
    { q: 'Q1', target: 200000, realized: 0 },
    { q: 'Q2', target: 250000, realized: 0 },
    { q: 'Q3', target: 275000, realized: 0 },
    { q: 'Q4', target: 275000, realized: 0 },
  ]
}

const DEFAULT_KPI_SCOREBOARD: KPICard[] = [
  { id: 'k1', name: 'Actieve klanten', current: ACTIVE_RETAINER_CLIENTS.length, target: 45, unit: '' },
  { id: 'k2', name: 'MRR (huidig)', current: RETAINER_MRR, target: 95000, unit: '€' },
  { id: 'k3', name: 'ARR', current: RETAINER_ARR, target: 1000000, unit: '€' },
  { id: 'k4', name: 'Gem. retainer', current: RETAINER_AVG_MRR, target: 4000, unit: '€' },
  { id: 'k5', name: 'Nieuwe deals 2026', current: RETAINER_NEW_2026, target: 15, unit: '' },
]

const DEFAULT_QUARTERLY_GOALS: QuarterlyGoal[] = [
  { id: 'qg1', quarter: 'Q1', text: 'LinkedIn 3x/week posting opzetten', status: 'green' },
  { id: 'qg2', quarter: 'Q1', text: '3 nieuwe case studies publiceren', status: 'yellow' },
  { id: 'qg3', quarter: 'Q1', text: 'AlertPilot MVP lanceren', status: 'red' },
  { id: 'qg4', quarter: 'Q2', text: 'Pipeline naar €150K', status: 'yellow' },
  { id: 'qg5', quarter: 'Q2', text: '5 nieuwe klanten binnenhalen', status: 'yellow' },
]

const DEFAULT_MASTER_TASKS: MasterTask[] = [
  { id: 'mt1', title: 'LinkedIn post schrijven over AI automation', done: false, deadline: '2026-02-17', category: 'Content', priority: 'high' },
  { id: 'mt2', title: 'Franky case study afmaken', done: false, deadline: '2026-02-20', category: 'Content', priority: 'medium' },
  { id: 'mt3', title: 'AlertPilot specs uitwerken', done: false, deadline: '2026-02-22', category: 'Agency OS', priority: 'high' },
  { id: 'mt4', title: '90-day roadmap reviewen', done: true, deadline: '2026-02-10', category: 'Masterplan', priority: 'medium' },
  { id: 'mt5', title: 'Pipeline deals follow-up', done: false, deadline: '2026-02-18', category: 'Pipeline', priority: 'high' },
  { id: 'mt6', title: 'KPI targets Q2 bepalen', done: false, deadline: '2026-02-25', category: 'Strategy', priority: 'medium' },
]

const STORAGE_KEY = 'nodefy-dashboard-v11'

// ============================================
// SIDEBAR NAV SECTIONS (Linear-style)
// ============================================

interface NavSection {
  title: string
  items: { id: TabId; label: string; count?: number }[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'GENERAL',
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'klanten', label: 'Klanten' },
      { id: 'reports', label: 'Reports' },
    ]
  },
  {
    title: 'STRATEGY',
    items: [
      { id: 'masterplan', label: 'Masterplan' },
      { id: 'cases', label: 'Cases' },
      { id: 'agencyos', label: 'Agency OS' },
    ]
  },
  {
    title: 'SALES',
    items: [
      { id: 'pipeline', label: 'Pipeline' },
      { id: 'content', label: 'Content' },
      { id: 'strategy', label: 'Strategy' },
      { id: 'retainers', label: 'Retainers' },
    ]
  },
]

// System section (only for superadmins)
const SYSTEM_NAV: NavSection = {
  title: 'SYSTEM',
  items: [
    { id: 'admin', label: 'Admin' },
  ]
}

// Role badge colors
const ROLE_COLORS: Record<UserRole, string> = {
  superadmin: 'bg-red-500/20 text-red-400 border-red-500/30',
  admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  viewer: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  custom: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SalesDashboard() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [authError, setAuthError] = useState('')
  
  // User management state
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState<{ name: string; email: string; password: string; role: UserRole; permissions: Partial<Record<TabId, boolean>> }>({ name: '', email: '', password: '', role: 'viewer', permissions: {} })
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  // UI state
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [editMode, setEditMode] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // Retainers state
  const [retainerFilter, setRetainerFilter] = useState<{ jaar: string; status: string; onderdeel: string }>({ jaar: 'alle', status: 'alle', onderdeel: 'alle' })
  const [retainerSort, setRetainerSort] = useState<{ col: string; asc: boolean }>({ col: 'klant', asc: true })
  const [retainerView, setRetainerView] = useState<'overzicht' | 'detail'>('overzicht')

  // Reports state
  const [selectedReportClient, setSelectedReportClient] = useState<string | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)

  // Klanten editing state
  const [klantenEditMode, setKlantenEditMode] = useState(false)
  const [editingClientId, setEditingClientId] = useState<string | null>(null)

  // Selection state
  const [selectedPost, setSelectedPost] = useState<LinkedInPost | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<OutreachTemplate | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [filter, setFilter] = useState('all')
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [klantenSearch, setKlantenSearch] = useState('')
  const [klantenJaar, setKlantenJaar] = useState<string>('all')
  const [klantenSort, setKlantenSort] = useState<{ key: string; asc: boolean }>({ key: 'jaar', asc: false })
  const [klantenShowChurned, setKlantenShowChurned] = useState(false)
  const [klantenVerticalFilter, setKlantenVerticalFilter] = useState<string>('all')
  const [klantenStatusFilter, setKlantenStatusFilter] = useState<string>('active')

  // Pipeline editing state
  const [editingDealId, setEditingDealId] = useState<string | null>(null)
  const [activePipelineId, setActivePipelineId] = useState<string>('default')
  const [pipelineSearch, setPipelineSearch] = useState('')
  const [nextSteps, setNextSteps] = useState<Record<string, string>>({})

  // Strategy tab state
  const [taskFilter, setTaskFilter] = useState<string>('all')
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('all')
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingKpiId, setEditingKpiId] = useState<string | null>(null)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', deadline: '', category: 'Strategy' as MasterTask['category'], priority: 'medium' as MasterTask['priority'] })

  // Editable data state
  const [data, setData] = useState<EditableData>({
    todayTasks: DEFAULT_TODAY_TASKS,
    completedTasks: [],
    linkedinPosts: DEFAULT_LINKEDIN_POSTS,
    personas: DEFAULT_PERSONAS,
    painPoints: DEFAULT_PAIN_POINTS,
    outreachTemplates: DEFAULT_OUTREACH_TEMPLATES,
    clientCases: DEFAULT_CLIENT_CASES,
    agencyOsApps: DEFAULT_AGENCY_OS_APPS,
    websiteTasks: DEFAULT_WEBSITE_TASKS,
    frankyRecommendations: DEFAULT_FRANKY_RECOMMENDATIONS,
    florynRecommendations: DEFAULT_FLORYN_RECOMMENDATIONS,
    masterplan: DEFAULT_MASTERPLAN,
    kantoor: DEFAULT_KANTOOR,
    clients: DEFAULT_CLIENTS,
    pipelineDeals: DEFAULT_PIPELINE_DEALS,
    pipelineLastUpdated: new Date().toISOString(),
    revenueGoals: DEFAULT_REVENUE_GOALS,
    kpiScoreboard: DEFAULT_KPI_SCOREBOARD,
    quarterlyGoals: DEFAULT_QUARTERLY_GOALS,
    masterTasks: DEFAULT_MASTER_TASKS,
    monthlyForecast: DEFAULT_MONTHLY_FORECAST,
  })

  // Load from localStorage on mount
  useEffect(() => {
    // Load users from localStorage (or use defaults)
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY)
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers)
        setUsers(parsed)
      } catch (e) {
        console.error('Failed to parse saved users:', e)
        setUsers(DEFAULT_USERS)
      }
    } else {
      setUsers(DEFAULT_USERS)
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS))
    }

    // Load current user session
    const savedCurrentUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY)
    if (savedCurrentUser) {
      try {
        const parsed = JSON.parse(savedCurrentUser)
        setCurrentUser(parsed)
        setIsAuthenticated(true)
      } catch (e) {
        console.error('Failed to parse current user:', e)
      }
    }

    const savedTheme = localStorage.getItem('nodefy-theme') as 'dark' | 'light' | null
    if (savedTheme) {
      setTheme(savedTheme)
    }

    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Merge with defaults so new fields (like pipelineDeals) always have values
        setData(prev => {
          const merged = { ...prev }
          for (const key of Object.keys(parsed) as (keyof EditableData)[]) {
            if (parsed[key] !== undefined) {
              (merged as Record<string, unknown>)[key] = parsed[key]
            }
          }
          return merged
        })
      } catch (e) {
        console.error('Failed to parse saved data:', e)
      }
    }
    
    // Load next steps from localStorage
    const savedNextSteps = localStorage.getItem('nodefy-pipeline-nextsteps')
    if (savedNextSteps) {
      try {
        setNextSteps(JSON.parse(savedNextSteps))
      } catch (e) {
        console.error('Failed to parse next steps:', e)
      }
    }
    
    setIsLoaded(true)
  }, [])

  // Save users to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    }
  }, [users, isLoaded])

  // Save to localStorage when data changes
  const saveData = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    if (isLoaded) {
      saveData()
    }
  }, [isLoaded, saveData])

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('nodefy-theme', theme)
  }, [theme])

  // Update helper
  const updateData = <K extends keyof EditableData>(key: K, value: EditableData[K]) => {
    setData(prev => ({ ...prev, [key]: value }))
  }

  // Reset to defaults
  const resetToDefaults = () => {
    if (confirm('Weet je zeker dat je alle wijzigingen wilt resetten?')) {
      const defaultData: EditableData = {
        todayTasks: DEFAULT_TODAY_TASKS,
        completedTasks: [],
        linkedinPosts: DEFAULT_LINKEDIN_POSTS,
        personas: DEFAULT_PERSONAS,
        painPoints: DEFAULT_PAIN_POINTS,
        outreachTemplates: DEFAULT_OUTREACH_TEMPLATES,
        clientCases: DEFAULT_CLIENT_CASES,
        agencyOsApps: DEFAULT_AGENCY_OS_APPS,
        websiteTasks: DEFAULT_WEBSITE_TASKS,
        frankyRecommendations: DEFAULT_FRANKY_RECOMMENDATIONS,
        florynRecommendations: DEFAULT_FLORYN_RECOMMENDATIONS,
        masterplan: DEFAULT_MASTERPLAN,
        kantoor: DEFAULT_KANTOOR,
        clients: DEFAULT_CLIENTS,
        pipelineDeals: DEFAULT_PIPELINE_DEALS,
        pipelineLastUpdated: new Date().toISOString(),
        revenueGoals: DEFAULT_REVENUE_GOALS,
        kpiScoreboard: DEFAULT_KPI_SCOREBOARD,
        quarterlyGoals: DEFAULT_QUARTERLY_GOALS,
        masterTasks: DEFAULT_MASTER_TASKS,
        monthlyForecast: DEFAULT_MONTHLY_FORECAST,
      }
      setData(defaultData)
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // Auth handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const user = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase())
    if (!user) {
      setAuthError('User not found')
      return
    }
    if (user.password !== loginPassword) {
      setAuthError('Incorrect password')
      return
    }
    // Update last login
    const updatedUser = { ...user, lastLogin: new Date().toISOString() }
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u))
    setCurrentUser(updatedUser)
    setIsAuthenticated(true)
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updatedUser))
    setAuthError('')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
  }

  // Permission helpers
  const canEdit = currentUser && (currentUser.role === 'superadmin' || currentUser.role === 'admin' || currentUser.role === 'custom')
  const canManageUsers = currentUser?.role === 'superadmin'
  // Tabs that contain sensitive financial data - superadmin only
  const SUPERADMIN_ONLY_TABS: TabId[] = ['retainers', 'strategy']
  
  const canAccessTab = (tabId: TabId): boolean => {
    if (!currentUser) return false
    // Retainers & Strategy contain live retainer/revenue data - superadmin ONLY
    if (SUPERADMIN_ONLY_TABS.includes(tabId) && currentUser.role !== 'superadmin') return false
    if (currentUser.role === 'superadmin') {
      // Ruben can hide tabs for himself via Advanced settings
      if (currentUser.email === 'ruben@nodefy.nl' && tabId !== 'settings' && tabId !== 'admin' && currentUser.permissions[tabId] === false) return false
      return true
    }
    if (currentUser.role === 'admin') return tabId !== 'admin'
    if (tabId === 'admin') return false
    if (tabId === 'settings') return true // Everyone can access settings
    return currentUser.permissions[tabId] === true
  }

  // Get first available tab for user
  const getFirstAvailableTab = (): TabId => {
    if (!currentUser) return 'overview'
    for (const section of NAV_SECTIONS) {
      for (const item of section.items) {
        if (canAccessTab(item.id)) return item.id
      }
    }
    return 'settings'
  }

  // User management handlers
  const saveUser = (user: User) => {
    setUsers(prev => prev.map(u => u.id === user.id ? user : u))
    setEditingUserId(null)
  }

  const createUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) return
    
    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === newUser.email!.toLowerCase())) {
      alert('A user with this email already exists')
      return
    }
    
    // Build permissions based on role
    let permissions: Record<TabId, boolean> = {} as Record<TabId, boolean>
    if (newUser.role === 'superadmin' || newUser.role === 'admin') {
      ALL_TAB_IDS.forEach(id => { permissions[id] = true })
    } else {
      ALL_TAB_IDS.forEach(id => { permissions[id] = newUser.permissions?.[id] || false })
      permissions.settings = true // Everyone gets settings
    }
    
    const user: User = {
      id: `u${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role || 'viewer',
      permissions,
      lastLogin: null,
      createdAt: new Date().toISOString()
    }
    setUsers(prev => [...prev, user])
    setNewUser({ name: '', email: '', password: '', role: 'viewer', permissions: {} })
    setShowAddUser(false)
  }

  const deleteUser = (id: string) => {
    if (currentUser?.id === id) {
      alert('You cannot delete yourself')
      return
    }
    setUsers(prev => prev.filter(u => u.id !== id))
    setDeleteConfirm(null)
  }

  // Redirect to first available tab if current tab is not accessible
  useEffect(() => {
    if (isAuthenticated && currentUser && !canAccessTab(activeTab)) {
      setActiveTab(getFirstAvailableTab())
    }
  }, [isAuthenticated, currentUser, activeTab])

  // Copy handler
  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Client CRUD handlers
  const addClient = () => {
    const newClient: Client = {
      id: `c${Date.now()}`,
      naam: 'Nieuwe Klant',
      jaar: new Date().getFullYear(),
      lead: 'RQS',
      dashboard: false,
      status: 'Actief',
      vertical: '',
      services: []
    }
    updateData('clients', [...data.clients, newClient])
    setEditingClientId(newClient.id)
  }

  const deleteClient = (id: string) => {
    if (confirm('Weet je zeker dat je deze klant wilt verwijderen?')) {
      updateData('clients', data.clients.filter(c => c.id !== id))
    }
  }

  const updateClient = (id: string, field: keyof Client, value: string | number | boolean | string[]) => {
    updateData('clients', data.clients.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ))
  }

  // LinkedIn post handlers
  const addLinkedInPost = () => {
    const newPost: LinkedInPost = {
      id: Date.now(),
      title: 'Nieuwe post',
      category: 'AI & Automation',
      hook: 'Hook hier',
      status: 'idea',
      concept: 'Schrijf hier je post concept...'
    }
    updateData('linkedinPosts', [...data.linkedinPosts, newPost])
    setSelectedPost(newPost)
  }

  const updateLinkedInPost = (id: number, field: keyof LinkedInPost, value: string) => {
    const newPosts = data.linkedinPosts.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    )
    updateData('linkedinPosts', newPosts)
    if (selectedPost?.id === id) {
      setSelectedPost({ ...selectedPost, [field]: value })
    }
  }

  // Outreach template handlers
  const addOutreachTemplate = () => {
    const newTemplate: OutreachTemplate = {
      id: Date.now(),
      name: 'Nieuwe template',
      type: 'linkedin',
      template: 'Hey [naam],\n\nSchrijf hier je template...\n\nRuben'
    }
    updateData('outreachTemplates', [...data.outreachTemplates, newTemplate])
    setSelectedTemplate(newTemplate)
  }

  const updateOutreachTemplate = (id: number, field: keyof OutreachTemplate, value: string) => {
    const newTemplates = data.outreachTemplates.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    )
    updateData('outreachTemplates', newTemplates)
    if (selectedTemplate?.id === id) {
      setSelectedTemplate({ ...selectedTemplate, [field]: value })
    }
  }

  // Pipeline handlers
  const updateDeal = (id: string, field: keyof PipelineDeal, value: string | number | null) => {
    updateData('pipelineDeals', data.pipelineDeals.map(d =>
      d.id === id ? { ...d, [field]: value } : d
    ))
  }

  const [pipelineSyncing, setPipelineSyncing] = useState(false)
  const refreshPipeline = async () => {
    setPipelineSyncing(true)
    try {
      const res = await fetch('/api/hubspot-sync')
      if (res.ok) {
        const result = await res.json()
        if (result.deals) {
          updateData('pipelineDeals', result.deals)
        }
        updateData('pipelineLastUpdated', new Date().toISOString())
      }
    } catch (e) {
      // Fallback: just update timestamp
      updateData('pipelineLastUpdated', new Date().toISOString())
    } finally {
      setPipelineSyncing(false)
    }
  }

  // Update next step for a deal
  const updateNextStep = (dealId: string, value: string) => {
    const updated = { ...nextSteps, [dealId]: value }
    setNextSteps(updated)
    localStorage.setItem('nodefy-pipeline-nextsteps', JSON.stringify(updated))
  }

  // ============================================
  // LINEAR-STYLE THEME CLASSES
  // ============================================
  const isDark = theme === 'dark'
  
  // Linear color palette
  const colors = {
    // Backgrounds
    bgMain: isDark ? 'bg-[#18181B]' : 'bg-[#F9F9FB]',
    bgSidebar: isDark ? 'bg-[#1C1C1F]' : 'bg-[#F3F3F5]',
    bgCard: isDark ? 'bg-[#222225]' : 'bg-white',
    bgCardHover: isDark ? 'hover:bg-[#2A2A2E]' : 'hover:bg-gray-50',
    bgInput: isDark ? 'bg-[#18181B]' : 'bg-[#F9F9FB]',
    bgActive: isDark ? 'bg-[#2A2A2E]' : 'bg-gray-100',
    
    // Borders
    border: isDark ? 'border-[#2E2E32]' : 'border-[#E4E4E8]',
    
    // Text
    textPrimary: isDark ? 'text-[#E8E8ED]' : 'text-gray-900',
    textSecondary: isDark ? 'text-[#8B8B93]' : 'text-gray-500',
    textTertiary: isDark ? 'text-[#5C5C63]' : 'text-gray-400',
    
    // Accent (Nodefy blue - used sparingly)
    accent: 'text-[#0047FF]',
    accentBg: 'bg-[#0047FF]',
    accentHover: 'hover:bg-[#0040E6]',
  }

  // Computed values
  const filteredPosts = filter === 'all' ? data.linkedinPosts : data.linkedinPosts.filter(p => p.status === filter)
  const readyCount = data.linkedinPosts.filter(p => p.status === 'ready').length

  // Calculate overview metrics (using 7d period label)
  const totalWeeklySpend = CLIENT_PERFORMANCE.reduce((acc, c) => {
    let spend = 0
    if (c.fbSpend) spend += parseFloat(c.fbSpend.replace(/[€$,]/g, '')) || 0
    if (c.googleSpend) spend += parseFloat(c.googleSpend.replace(/[€$,]/g, '')) || 0
    return acc + spend
  }, 0)

  const pipelineValue = data.pipelineDeals
    .filter(d => !CLOSED_STAGE_IDS.has(d.stageId))
    .reduce((acc, d) => acc + (d.value || 0), 0)

  const alertClients = CLIENT_PERFORMANCE.filter(c => c.health === 'warning' || c.health === 'critical')

  // Get item counts for nav
  const getNavCount = (id: TabId): number | undefined => {
    switch(id) {
      case 'klanten': return data.clients.filter(c => c.status === 'Actief').length
      case 'pipeline': return data.pipelineDeals.filter(d => !CLOSED_STAGE_IDS.has(d.stageId)).length
      case 'content': return readyCount
      default: return undefined
    }
  }

  // Format date for display
  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString('nl-NL', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get report data for a client
  const getClientReportData = (clientName: string) => {
    const perf = CLIENT_PERFORMANCE.find(c => c.name === clientName)
    if (!perf) return null
    return perf
  }

  // ============================================
  // LOGIN SCREEN - Linear minimal style
  // ============================================
  if (!isAuthenticated) {
    return (
      <main className={`min-h-screen ${colors.bgMain} flex items-center justify-center p-4`}>
        <div className={`${colors.bgCard} ${colors.border} border rounded-md p-8 w-full max-w-[340px]`}>
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="/nodefy-logo-white.svg" 
              alt="Nodefy" 
              className={`h-5 ${isDark ? '' : 'invert'}`}
            />
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Email"
                className={`w-full px-3 py-2 rounded-md text-sm border ${
                  authError 
                    ? 'border-red-500/50 bg-red-500/5' 
                    : `${colors.border} ${colors.bgInput}`
                } ${colors.textPrimary} placeholder:${colors.textTertiary} focus:outline-none focus:ring-1 focus:ring-[#0047FF] transition-all`}
                autoFocus
              />
            </div>
            <div>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
                className={`w-full px-3 py-2 rounded-md text-sm border ${
                  authError 
                    ? 'border-red-500/50 bg-red-500/5' 
                    : `${colors.border} ${colors.bgInput}`
                } ${colors.textPrimary} placeholder:${colors.textTertiary} focus:outline-none focus:ring-1 focus:ring-[#0047FF] transition-all`}
              />
              {authError && <p className="text-red-500 text-xs mt-2">{authError}</p>}
            </div>
            <button 
              type="submit" 
              className={`w-full py-2 ${colors.accentBg} text-white rounded-md text-sm font-medium ${colors.accentHover} transition-colors`}
            >
              Sign in
            </button>
          </form>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`text-xs ${colors.textTertiary} hover:${colors.textSecondary} transition-colors`}
            >
              {isDark ? 'Light mode' : 'Dark mode'}
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ============================================
  // MAIN DASHBOARD
  // ============================================
  return (
    <main className={`min-h-screen ${colors.bgMain} ${colors.textPrimary} flex transition-colors duration-150`}>
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-3 left-3 z-50 lg:hidden p-1.5 rounded-md ${colors.bgCard} border ${colors.border}`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ============================================ */}
      {/* SIDEBAR - Linear style */}
      {/* ============================================ */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-[220px] ${colors.bgSidebar} border-r ${colors.border} flex flex-col z-40 transition-transform duration-150 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className={`px-4 py-3 border-b ${colors.border}`}>
          <img 
            src="/nodefy-logo-white.svg" 
            alt="Nodefy" 
            className={`h-5 ${isDark ? '' : 'invert'}`}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter(item => canAccessTab(item.id))
            if (visibleItems.length === 0) return null
            return (
              <div key={section.title} className="mb-2">
                <div className={`px-4 py-1.5 text-[10px] font-medium tracking-wider ${colors.textTertiary}`}>
                  {section.title}
                </div>
                {visibleItems.map((item) => {
                  const count = getNavCount(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                      className={`w-full flex items-center justify-between px-4 py-1.5 text-[13px] transition-colors ${
                        activeTab === item.id
                          ? `${colors.bgActive} ${colors.textPrimary}`
                          : `${colors.textSecondary} ${colors.bgCardHover}`
                      }`}
                    >
                      <span>{item.label}</span>
                      {count !== undefined && (
                        <span className={`text-[11px] ${colors.textTertiary} font-mono`}>{count}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
          
          {/* SYSTEM section - only for superadmins */}
          {canManageUsers && (
            <div className="mb-2">
              <div className={`px-4 py-1.5 text-[10px] font-medium tracking-wider ${colors.textTertiary}`}>
                {SYSTEM_NAV.title}
              </div>
              {SYSTEM_NAV.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                  className={`w-full flex items-center justify-between px-4 py-1.5 text-[13px] transition-colors ${
                    activeTab === item.id
                      ? `${colors.bgActive} ${colors.textPrimary}`
                      : `${colors.textSecondary} ${colors.bgCardHover}`
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className={`p-2 border-t ${colors.border}`}>
          {/* User info */}
          {currentUser && (
            <div className={`px-3 py-2 mb-1 rounded-md ${colors.bgInput}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[13px] font-medium ${colors.textPrimary}`}>{currentUser.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${ROLE_COLORS[currentUser.role]}`}>
                  {currentUser.role}
                </span>
              </div>
              <span className={`text-[11px] ${colors.textTertiary}`}>{currentUser.email}</span>
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] ${colors.textSecondary} ${colors.bgCardHover} transition-colors`}
          >
            <span className="w-4 text-center">{isDark ? '◐' : '◑'}</span>
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>
          
          {/* Edit mode - only show for users who can edit */}
          {canEdit && (
            <>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                  editMode
                    ? 'bg-amber-500/10 text-amber-500'
                    : `${colors.textSecondary} ${colors.bgCardHover}`
                }`}
              >
                <span className="w-4 text-center">{editMode ? '✎' : '○'}</span>
                <span>{editMode ? 'Editing' : 'Locked'}</span>
              </button>

              {editMode && (
                <button
                  onClick={resetToDefaults}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <span className="w-4 text-center">↺</span>
                  <span>Reset</span>
                </button>
              )}
            </>
          )}

          {/* Settings */}
          <button
            onClick={() => { setActiveTab('settings'); setSidebarOpen(false) }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors ${
              activeTab === 'settings'
                ? `${colors.bgActive} ${colors.textPrimary}`
                : `${colors.textSecondary} ${colors.bgCardHover}`
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <span>Settings</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] ${colors.textTertiary} ${colors.bgCardHover} transition-colors`}
          >
            <span className="w-4 text-center">→</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <div className="flex-1 min-h-screen lg:ml-0">
        <div className="max-w-5xl mx-auto px-3 py-4 sm:px-4 lg:px-6 lg:py-5">
          
          {/* ============================================ */}
          {/* OVERVIEW TAB */}
          {/* ============================================ */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2 text-[13px] mb-4">
                <span className={colors.textTertiary}>Dashboard</span>
                <span className={colors.textTertiary}>/</span>
                <span className={colors.textPrimary}>Overview</span>
              </div>

              {/* KPI Cards - Removed Weekly Spend, added period labels */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <div className={`${colors.bgCard} rounded-md p-3 border ${colors.border}`}>
                  <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wide mb-0.5`}>Active Clients</p>
                  <p className={`text-lg font-semibold font-mono ${colors.textPrimary}`}>{data.clients.filter(c => c.status === 'Actief').length}</p>
                  <p className={`text-[11px] ${colors.textTertiary} mt-0.5`}>{data.clients.filter(c => c.dashboard).length} with dashboard</p>
                </div>
                <div className={`${colors.bgCard} rounded-md p-3 border ${colors.border}`}>
                  <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wide mb-0.5`}>Performance Data</p>
                  <p className={`text-lg font-semibold font-mono ${colors.textPrimary}`}>{CLIENT_PERFORMANCE.filter(c => c.health !== 'unknown').length}</p>
                  <p className={`text-[11px] ${colors.textTertiary} mt-0.5`}>{CLIENT_PERFORMANCE.filter(c => c.health === 'unknown').length} zonder data</p>
                </div>
                <div className={`${colors.bgCard} rounded-md p-3 border ${colors.border}`}>
                  <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wide mb-0.5`}>Attention</p>
                  <p className={`text-lg font-semibold font-mono ${alertClients.length > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                    {alertClients.length}
                  </p>
                  <p className={`text-[11px] ${colors.textTertiary} mt-0.5`}>{alertClients.length === 0 ? 'All healthy' : 'flagged'}</p>
                </div>
              </div>

              {/* Channel breakdown - with period labels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-[13px] font-medium ${colors.textPrimary}`}>Meta Ads Performance</h3>
                    <span className={`text-[10px] ${colors.textTertiary} px-1.5 py-0.5 rounded ${colors.bgInput}`}>Last 7 Days</span>
                  </div>
                  <div className="space-y-1">
                    {CLIENT_PERFORMANCE.filter(c => c.fbSpend || c.fbRoas).slice(0, 5).map((client, i) => (
                      <div key={i} className={`flex items-center justify-between py-1.5 border-b ${colors.border} last:border-0`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${client.health === 'good' ? 'bg-green-500' : client.health === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <span className={`text-[13px] ${colors.textPrimary}`}>{client.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {client.fbSpend && <span className={`text-[12px] font-mono ${colors.textSecondary}`}>{client.fbSpend} <span className={colors.textTertiary}>(7d)</span></span>}
                          {client.fbRoas && <span className="text-[12px] font-mono text-green-500">{client.fbRoas}x</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-[13px] font-medium ${colors.textPrimary}`}>Google Ads Performance</h3>
                    <span className={`text-[10px] ${colors.textTertiary} px-1.5 py-0.5 rounded ${colors.bgInput}`}>Last 7 Days</span>
                  </div>
                  <div className="space-y-1">
                    {CLIENT_PERFORMANCE.filter(c => c.googleSpend || c.googleRoas).slice(0, 5).map((client, i) => (
                      <div key={i} className={`flex items-center justify-between py-1.5 border-b ${colors.border} last:border-0`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${client.health === 'good' ? 'bg-green-500' : client.health === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <span className={`text-[13px] ${colors.textPrimary}`}>{client.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {client.googleSpend && <span className={`text-[12px] font-mono ${colors.textSecondary}`}>{client.googleSpend} <span className={colors.textTertiary}>(7d)</span></span>}
                          {client.googleRoas && <span className="text-[12px] font-mono text-green-500">{client.googleRoas}x</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {alertClients.length > 0 && (
                <div className={`${colors.bgCard} rounded-md p-4 border border-amber-500/30`}>
                  <h3 className={`text-[13px] font-medium text-amber-500 mb-2 flex items-center gap-2`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Needs Attention
                  </h3>
                  <div className="space-y-1">
                    {alertClients.map((client, i) => (
                      <div key={i} className={`flex items-center justify-between py-1`}>
                        <span className={`text-[13px] ${colors.textPrimary}`}>{client.name}</span>
                        <span className={`text-[11px] ${colors.textTertiary}`}>Review metrics</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top performers with period */}
              <div className={`${colors.bgCard} rounded-md border ${colors.border} overflow-hidden`}>
                <div className={`px-4 py-2 border-b ${colors.border} flex items-center justify-between`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary}`}>Top Performers</h3>
                  <span className={`text-[10px] ${colors.textTertiary} px-1.5 py-0.5 rounded ${colors.bgInput}`}>Last 7 Days</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className={`border-b ${colors.border} ${colors.bgInput}`}>
                        <th className={`text-left py-2 px-4 font-medium ${colors.textSecondary}`}>Client</th>
                        <th className={`text-right py-2 px-4 font-medium ${colors.textSecondary}`}>FB Spend (7d)</th>
                        <th className={`text-right py-2 px-4 font-medium ${colors.textSecondary}`}>ROAS</th>
                        <th className={`text-right py-2 px-4 font-medium ${colors.textSecondary}`}>Purchases</th>
                        <th className={`text-center py-2 px-4 font-medium ${colors.textSecondary}`}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CLIENT_PERFORMANCE.filter(c => c.fbRoas).sort((a, b) => parseFloat(b.fbRoas || '0') - parseFloat(a.fbRoas || '0')).slice(0, 5).map((client, i) => (
                        <tr key={i} className={`border-b ${colors.border} last:border-0 ${colors.bgCardHover}`}>
                          <td className={`py-2 px-4 ${colors.textPrimary}`}>{client.name}</td>
                          <td className={`py-2 px-4 text-right font-mono ${colors.textSecondary}`}>{client.fbSpend || '—'}</td>
                          <td className="py-2 px-4 text-right font-mono text-green-500">{client.fbRoas}x</td>
                          <td className={`py-2 px-4 text-right font-mono ${colors.textSecondary}`}>{client.fbPurchases || '—'}</td>
                          <td className="py-2 px-4 text-center">
                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${client.health === 'good' ? 'bg-green-500' : 'bg-amber-500'}`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Client Health Grid */}
              <div className={`${colors.bgCard} rounded-md border ${colors.border} p-4`}>
                <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Client Health Grid</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {[...CLIENT_PERFORMANCE].sort((a, b) => {
                    const order: Record<string, number> = { critical: 0, warning: 1, good: 2, unknown: 3 }
                    return (order[a.health] ?? 4) - (order[b.health] ?? 4)
                  }).map((client, i) => (
                    <div 
                      key={i} 
                      className={`p-2 rounded-md ${colors.bgInput} border ${colors.border} text-center cursor-pointer hover:border-[#0047FF]/50 transition-colors`}
                      title={`${client.name}: ${client.health === 'good' ? 'Healthy' : client.health === 'warning' ? 'Needs attention' : client.health === 'critical' ? 'Critical' : 'Geen data'}`}
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <span className={`w-2 h-2 rounded-full ${
                          client.health === 'good' ? 'bg-green-500' : 
                          client.health === 'warning' ? 'bg-amber-500' : 
                          client.health === 'critical' ? 'bg-red-500' :
                          `border ${isDark ? 'border-zinc-600' : 'border-zinc-400'}`
                        }`} />
                      </div>
                      <p className={`text-[10px] ${client.health === 'unknown' ? colors.textTertiary : colors.textPrimary} truncate font-medium`}>{client.name}</p>
                      {client.fbRoas && (
                        <p className={`text-[9px] font-mono ${parseFloat(client.fbRoas) >= 5 ? 'text-green-500' : colors.textTertiary}`}>{client.fbRoas}x</p>
                      )}
                      {!client.fbRoas && client.googleRoas && (
                        <p className={`text-[9px] font-mono ${parseFloat(client.googleRoas) >= 5 ? 'text-green-500' : colors.textTertiary}`}>{client.googleRoas}x</p>
                      )}
                      {!client.fbRoas && !client.googleRoas && (
                        <p className={`text-[9px] ${colors.textTertiary}`}>—</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-dashed" style={{ borderColor: isDark ? '#2E2E32' : '#E4E4E8' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className={`text-[10px] ${colors.textTertiary}`}>Good ({CLIENT_PERFORMANCE.filter(c => c.health === 'good').length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className={`text-[10px] ${colors.textTertiary}`}>Warning ({CLIENT_PERFORMANCE.filter(c => c.health === 'warning').length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className={`text-[10px] ${colors.textTertiary}`}>Critical ({CLIENT_PERFORMANCE.filter(c => c.health === 'critical').length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full border ${isDark ? 'border-zinc-600' : 'border-zinc-400'}`} />
                    <span className={`text-[10px] ${colors.textTertiary}`}>Geen data ({CLIENT_PERFORMANCE.filter(c => c.health === 'unknown').length})</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* KLANTEN TAB - With editing */}
          {/* ============================================ */}
          {activeTab === 'klanten' && (() => {
            const jaren = [...new Set(data.clients.map(c => c.jaar))].sort()
            const filtered = data.clients
              .filter(c => {
                if (klantenStatusFilter === 'active') return c.status !== 'Churned'
                if (klantenStatusFilter === 'churned') return c.status === 'Churned'
                return true // 'all'
              })
              .filter(c => klantenJaar === 'all' || c.jaar === Number(klantenJaar))
              .filter(c => klantenVerticalFilter === 'all' || c.vertical === klantenVerticalFilter)
              .filter(c => !klantenSearch || c.naam.toLowerCase().includes(klantenSearch.toLowerCase()) || c.lead.toLowerCase().includes(klantenSearch.toLowerCase()))
            
            const sorted = [...filtered].sort((a, b) => {
              const key = klantenSort.key
              let cmp = 0
              if (key === 'naam') cmp = a.naam.localeCompare(b.naam)
              else if (key === 'jaar') cmp = a.jaar - b.jaar
              else if (key === 'lead') cmp = a.lead.localeCompare(b.lead)
              else if (key === 'vertical') cmp = (a.vertical || '').localeCompare(b.vertical || '')
              else if (key === 'dashboard') cmp = (a.dashboard ? 1 : 0) - (b.dashboard ? 1 : 0)
              return klantenSort.asc ? cmp : -cmp
            })

            const toggleSort = (key: string) => {
              setKlantenSort(prev => prev.key === key ? { key, asc: !prev.asc } : { key, asc: true })
            }

            const sortIcon = (key: string) => klantenSort.key === key ? (klantenSort.asc ? ' ↑' : ' ↓') : ''

            return (
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className={colors.textTertiary}>Dashboard</span>
                    <span className={colors.textTertiary}>/</span>
                    <span className={colors.textPrimary}>Klanten</span>
                    <span className={`${colors.textTertiary} font-mono ml-1`}>{data.clients.length}</span>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => {
                        if (klantenEditMode) {
                          setEditingClientId(null)
                        }
                        setKlantenEditMode(!klantenEditMode)
                      }}
                      className={`px-3 py-1.5 rounded text-[12px] font-medium transition-all ${
                        klantenEditMode 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' 
                          : `${colors.bgCard} ${colors.textSecondary} border ${colors.border}`
                      }`}
                    >
                      {klantenEditMode ? '✓ Opslaan' : '✎ Edit'}
                    </button>
                  )}
                </div>

                {/* Filters row */}
                <div className="flex flex-wrap gap-3 items-start">
                  {/* Status filter */}
                  <div className="flex gap-1">
                    {[
                      { id: 'active', label: 'Actief' },
                      { id: 'all', label: 'Alles' },
                      { id: 'churned', label: 'Churned' },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setKlantenStatusFilter(f.id)}
                        className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
                          klantenStatusFilter === f.id
                            ? f.id === 'churned' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : `${colors.accentBg} text-white`
                            : `${colors.bgCard} ${colors.textSecondary} border ${colors.border}`
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Vertical filter */}
                  <div className="flex gap-1">
                    {['all', 'E-commerce', 'Leadgen', 'Hospitality'].map(v => (
                      <button
                        key={v}
                        onClick={() => setKlantenVerticalFilter(v)}
                        className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
                          klantenVerticalFilter === v ? `${colors.accentBg} text-white` : `${colors.bgCard} ${colors.textSecondary} border ${colors.border}`
                        }`}
                      >
                        {v === 'all' ? 'Alle verticals' : v}
                      </button>
                    ))}
                  </div>

                  {/* Year filter */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => setKlantenJaar('all')}
                      className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
                        klantenJaar === 'all' ? `${colors.accentBg} text-white` : `${colors.bgCard} ${colors.textSecondary} border ${colors.border}`
                      }`}
                    >
                      Alle jaren
                    </button>
                    {jaren.map(jaar => (
                      <button
                        key={jaar}
                        onClick={() => setKlantenJaar(klantenJaar === String(jaar) ? 'all' : String(jaar))}
                        className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
                          klantenJaar === String(jaar) ? `${colors.accentBg} text-white` : `${colors.bgCard} ${colors.textSecondary} border ${colors.border}`
                        }`}
                      >
                        {jaar}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div className={`${colors.bgCard} rounded-md border ${colors.border}`}>
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={klantenSearch}
                    onChange={(e) => setKlantenSearch(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md ${colors.bgCard} ${colors.textPrimary} placeholder:${colors.textTertiary} focus:outline-none text-[13px]`}
                  />
                </div>

                {/* Table */}
                <div className={`${colors.bgCard} rounded-md border ${colors.border} overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className={`border-b ${colors.border} ${colors.bgInput}`}>
                          <th onClick={() => toggleSort('naam')} className={`text-left p-3 font-medium ${colors.textSecondary} cursor-pointer select-none`}>Name{sortIcon('naam')}</th>
                          <th onClick={() => toggleSort('jaar')} className={`text-left p-3 font-medium ${colors.textSecondary} cursor-pointer select-none`}>Year{sortIcon('jaar')}</th>
                          <th onClick={() => toggleSort('lead')} className={`text-left p-3 font-medium ${colors.textSecondary} cursor-pointer select-none`}>Lead{sortIcon('lead')}</th>
                          <th onClick={() => toggleSort('vertical')} className={`text-left p-3 font-medium ${colors.textSecondary} cursor-pointer select-none`}>Vertical{sortIcon('vertical')}</th>
                          <th className={`text-left p-3 font-medium ${colors.textSecondary}`}>Services</th>
                          <th className={`text-left p-3 font-medium ${colors.textSecondary}`}>Status</th>
                          <th onClick={() => toggleSort('dashboard')} className={`text-center p-3 font-medium ${colors.textSecondary} cursor-pointer select-none`}>DB{sortIcon('dashboard')}</th>
                          {klantenEditMode && <th className={`text-center p-3 font-medium ${colors.textSecondary}`}>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {sorted.map((client) => (
                          <tr key={client.id} className={`border-b ${colors.border} last:border-0 ${colors.bgCardHover} transition-colors`}>
                            <td className={`p-3 font-medium ${colors.textPrimary}`}>
                              {klantenEditMode && editingClientId === client.id ? (
                                <input
                                  type="text"
                                  value={client.naam}
                                  onChange={(e) => updateClient(client.id, 'naam', e.target.value)}
                                  className={`w-full px-2 py-1 rounded ${colors.bgInput} ${colors.textPrimary} border ${colors.border} focus:outline-none focus:ring-1 focus:ring-[#0047FF]`}
                                  autoFocus
                                />
                              ) : (
                                <span onClick={() => klantenEditMode && setEditingClientId(client.id)} className={klantenEditMode ? 'cursor-pointer hover:underline' : ''}>
                                  {client.naam}
                                </span>
                              )}
                            </td>
                            <td className={`p-3 font-mono ${colors.textSecondary}`}>
                              {klantenEditMode && editingClientId === client.id ? (
                                <input
                                  type="number"
                                  value={client.jaar}
                                  onChange={(e) => updateClient(client.id, 'jaar', parseInt(e.target.value))}
                                  className={`w-20 px-2 py-1 rounded ${colors.bgInput} ${colors.textPrimary} border ${colors.border} focus:outline-none focus:ring-1 focus:ring-[#0047FF]`}
                                />
                              ) : (
                                client.jaar
                              )}
                            </td>
                            <td className="p-3">
                              {klantenEditMode && editingClientId === client.id ? (
                                <input
                                  type="text"
                                  value={client.lead}
                                  onChange={(e) => updateClient(client.id, 'lead', e.target.value)}
                                  className={`w-24 px-2 py-1 rounded ${colors.bgInput} ${colors.textPrimary} border ${colors.border} focus:outline-none focus:ring-1 focus:ring-[#0047FF]`}
                                />
                              ) : (
                                <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                                  client.lead === 'RQS' ? 'bg-blue-500/20 text-blue-400' :
                                  client.lead === 'Jaron' ? 'bg-purple-500/20 text-purple-400' :
                                  client.lead === 'Roy' ? 'bg-green-500/20 text-green-400' :
                                  `${colors.bgActive} ${colors.textSecondary}`
                                }`}>{client.lead}</span>
                              )}
                            </td>
                            <td className="p-3">
                              {klantenEditMode && editingClientId === client.id ? (
                                <select
                                  value={client.vertical}
                                  onChange={(e) => updateClient(client.id, 'vertical', e.target.value)}
                                  className={`px-2 py-1 rounded ${colors.bgInput} ${colors.textPrimary} border ${colors.border} focus:outline-none focus:ring-1 focus:ring-[#0047FF] text-[12px]`}
                                >
                                  <option value="">—</option>
                                  <option value="E-commerce">E-commerce</option>
                                  <option value="Leadgen">Leadgen</option>
                                  <option value="Hospitality">Hospitality</option>
                                  <option value="Other">Other</option>
                                </select>
                              ) : (
                                client.vertical ? (
                                  <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                                    client.vertical === 'E-commerce' ? 'bg-emerald-500/20 text-emerald-400' :
                                    client.vertical === 'Leadgen' ? 'bg-sky-500/20 text-sky-400' :
                                    client.vertical === 'Hospitality' ? 'bg-orange-500/20 text-orange-400' :
                                    `${colors.bgActive} ${colors.textSecondary}`
                                  }`}>{client.vertical}</span>
                                ) : (
                                  <span className={colors.textTertiary}>—</span>
                                )
                              )}
                            </td>
                            <td className="p-3">
                              {klantenEditMode && editingClientId === client.id ? (
                                <input
                                  type="text"
                                  value={(client.services || []).join(', ')}
                                  onChange={(e) => updateClient(client.id, 'services', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                                  placeholder="Meta Ads, Google Ads..."
                                  className={`w-40 px-2 py-1 rounded ${colors.bgInput} ${colors.textPrimary} border ${colors.border} focus:outline-none focus:ring-1 focus:ring-[#0047FF] text-[12px]`}
                                />
                              ) : (
                                (client.services || []).length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {(client.services || []).map((s: string, i: number) => (
                                      <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bgActive} ${colors.textSecondary}`}>{s}</span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className={colors.textTertiary}>—</span>
                                )
                              )}
                            </td>
                            <td className="p-3">
                              {klantenEditMode && editingClientId === client.id ? (
                                <select
                                  value={client.status}
                                  onChange={(e) => updateClient(client.id, 'status', e.target.value)}
                                  className={`px-2 py-1 rounded ${colors.bgInput} ${colors.textPrimary} border ${colors.border} focus:outline-none focus:ring-1 focus:ring-[#0047FF]`}
                                >
                                  <option value="Actief">Actief</option>
                                  <option value="Upcoming">Upcoming</option>
                                  <option value="Paused">Paused</option>
                                  <option value="Churned">Churned</option>
                                </select>
                              ) : (
                                <span className={`inline-flex items-center gap-1 text-[12px] ${
                                  client.status === 'Actief' ? 'text-green-500' : client.status === 'Churned' ? 'text-red-500' : 'text-amber-500'
                                }`}>
                                  <span className={`w-1 h-1 rounded-full ${client.status === 'Actief' ? 'bg-green-500' : client.status === 'Churned' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                  {client.status}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {client.dashboard ? (
                                <span className="text-green-500 text-[11px]">●</span>
                              ) : (
                                <span className={`${colors.textTertiary} text-[11px]`}>○</span>
                              )}
                            </td>
                            {klantenEditMode && (
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => deleteClient(client.id)}
                                  className="text-red-500 hover:text-red-400 text-[14px] px-1"
                                  title="Delete"
                                >
                                  ✕
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className={`px-3 py-2 border-t ${colors.border} flex justify-between items-center`}>
                    <div className={`text-[11px] ${colors.textTertiary}`}>
                      <span>{sorted.length} clients</span>
                      <span className="mx-2">•</span>
                      <span>{sorted.filter(c => c.dashboard).length} with dashboard</span>
                    </div>
                    {klantenEditMode && (
                      <button
                        onClick={addClient}
                        className={`px-2 py-1 rounded text-[12px] font-medium ${colors.accentBg} text-white ${colors.accentHover}`}
                      >
                        + Add Client
                      </button>
                    )}
                  </div>
                </div>

                {klantenEditMode && (
                  <div className={`text-[11px] ${colors.textTertiary} text-center`}>
                    Click on a client name to edit • Changes are saved automatically
                  </div>
                )}
              </div>
            )
          })()}

          {/* ============================================ */}
          {/* REPORTS TAB - With Generate Report modal */}
          {/* ============================================ */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2 text-[13px] mb-3">
                <span className={colors.textTertiary}>Dashboard</span>
                <span className={colors.textTertiary}>/</span>
                <span className={colors.textPrimary}>Reports</span>
              </div>

              {/* Performance overview with Generate Report buttons */}
              <div className={`${colors.bgCard} rounded-md border ${colors.border} overflow-hidden`}>
                <div className={`px-4 py-2 border-b ${colors.border} flex items-center justify-between`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary}`}>Live Performance</h3>
                  <span className={`text-[10px] ${colors.textTertiary} px-1.5 py-0.5 rounded ${colors.bgInput}`}>Last 7 Days</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className={`border-b ${colors.border} ${colors.bgInput}`}>
                        <th className={`text-left py-2 px-4 font-medium ${colors.textSecondary}`}>Client</th>
                        <th className={`text-right py-2 px-4 font-medium ${colors.textSecondary}`}>Meta (7d)</th>
                        <th className={`text-right py-2 px-4 font-medium ${colors.textSecondary}`}>Google (7d)</th>
                        <th className={`text-center py-2 px-4 font-medium ${colors.textSecondary}`}>Health</th>
                        <th className={`text-center py-2 px-4 font-medium ${colors.textSecondary}`}>Report</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CLIENT_PERFORMANCE.map((client, i) => (
                        <tr key={i} className={`border-b ${colors.border} last:border-0`}>
                          <td className={`py-2 px-4 ${colors.textPrimary}`}>{client.name}</td>
                          <td className={`py-2 px-4 text-right font-mono text-[12px] ${colors.textSecondary}`}>
                            {client.fbSpend && `${client.fbSpend}`}
                            {client.fbRoas && <span className="text-green-500 ml-1.5">{client.fbRoas}x</span>}
                            {client.fbPurchases && <span className={`${colors.textTertiary} ml-1.5`}>{client.fbPurchases}p</span>}
                          </td>
                          <td className={`py-2 px-4 text-right font-mono text-[12px] ${colors.textSecondary}`}>
                            {client.googleSpend && `${client.googleSpend}`}
                            {client.googleRoas && <span className="text-green-500 ml-1.5">{client.googleRoas}x</span>}
                            {client.googleConversions && <span className={`${colors.textTertiary} ml-1.5`}>{client.googleConversions}c</span>}
                          </td>
                          <td className="py-2 px-4 text-center">
                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                              client.health === 'good' ? 'bg-green-500' : 
                              client.health === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                          </td>
                          <td className="py-2 px-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedReportClient(client.name)
                                setShowReportModal(true)
                              }}
                              className={`px-2 py-1 rounded text-[11px] font-medium ${colors.accentBg} text-white ${colors.accentHover}`}
                            >
                              Generate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Report Modal */}
              {showReportModal && selectedReportClient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className={`${colors.bgCard} rounded-lg border ${colors.border} w-full max-w-2xl max-h-[80vh] overflow-y-auto`}>
                    <div className={`px-6 py-4 border-b ${colors.border} flex items-center justify-between sticky top-0 ${colors.bgCard}`}>
                      <h2 className={`text-[16px] font-semibold ${colors.textPrimary}`}>
                        Performance Report: {selectedReportClient}
                      </h2>
                      <button
                        onClick={() => setShowReportModal(false)}
                        className={`text-[18px] ${colors.textTertiary} hover:${colors.textPrimary}`}
                      >
                        ✕
                      </button>
                    </div>
                    
                    {(() => {
                      const reportData = getClientReportData(selectedReportClient)
                      if (!reportData) {
                        return (
                          <div className="p-6 text-center">
                            <p className={colors.textTertiary}>No data available for this client.</p>
                          </div>
                        )
                      }
                      
                      return (
                        <div className="p-6 space-y-6">
                          {/* Overview Section */}
                          <section>
                            <h3 className={`text-[14px] font-semibold ${colors.textPrimary} mb-3 flex items-center gap-2`}>
                              <span className="text-blue-500">📊</span> Overview
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {reportData.fbSpend && (
                                <div className={`p-3 rounded-md ${colors.bgInput}`}>
                                  <p className={`text-[10px] ${colors.textTertiary}`}>Meta Spend (7d)</p>
                                  <p className={`text-[16px] font-bold font-mono ${colors.textPrimary}`}>{reportData.fbSpend}</p>
                                </div>
                              )}
                              {reportData.googleSpend && (
                                <div className={`p-3 rounded-md ${colors.bgInput}`}>
                                  <p className={`text-[10px] ${colors.textTertiary}`}>Google Spend (7d)</p>
                                  <p className={`text-[16px] font-bold font-mono ${colors.textPrimary}`}>{reportData.googleSpend}</p>
                                </div>
                              )}
                              <div className={`p-3 rounded-md ${reportData.health === 'good' ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
                                <p className={`text-[10px] ${colors.textTertiary}`}>Account Health</p>
                                <p className={`text-[16px] font-bold ${reportData.health === 'good' ? 'text-green-500' : 'text-amber-500'}`}>
                                  {reportData.health === 'good' ? 'Healthy' : 'Needs Attention'}
                                </p>
                              </div>
                            </div>
                          </section>

                          {/* Performance Section */}
                          <section>
                            <h3 className={`text-[14px] font-semibold ${colors.textPrimary} mb-3 flex items-center gap-2`}>
                              <span className="text-green-500">📈</span> Performance
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                              {reportData.fbRoas && (
                                <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
                                  <p className="text-[10px] text-green-500">Meta ROAS</p>
                                  <p className="text-[20px] font-bold font-mono text-green-500">{reportData.fbRoas}x</p>
                                </div>
                              )}
                              {reportData.googleRoas && (
                                <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
                                  <p className="text-[10px] text-green-500">Google ROAS</p>
                                  <p className="text-[20px] font-bold font-mono text-green-500">{reportData.googleRoas}x</p>
                                </div>
                              )}
                              {reportData.fbPurchases && (
                                <div className={`p-3 rounded-md ${colors.bgInput}`}>
                                  <p className={`text-[10px] ${colors.textTertiary}`}>Meta Purchases</p>
                                  <p className={`text-[16px] font-bold font-mono ${colors.textPrimary}`}>{reportData.fbPurchases}</p>
                                </div>
                              )}
                              {reportData.googleConversions && (
                                <div className={`p-3 rounded-md ${colors.bgInput}`}>
                                  <p className={`text-[10px] ${colors.textTertiary}`}>Google Conversions</p>
                                  <p className={`text-[16px] font-bold font-mono ${colors.textPrimary}`}>{reportData.googleConversions}</p>
                                </div>
                              )}
                            </div>
                          </section>

                          {/* Wat gaat goed / Wat kan beter */}
                          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-4 rounded-md bg-green-500/10 border border-green-500/20`}>
                              <h3 className="text-[13px] font-semibold text-green-500 mb-3">Wat gaat goed</h3>
                              <ul className="space-y-2">
                                {reportData.health === 'good' && (
                                  <li className="flex items-start gap-2 text-[12px] text-green-400">
                                    <span>✓</span>
                                    <span>Account gezondheid is goed</span>
                                  </li>
                                )}
                                {reportData.fbRoas && parseFloat(reportData.fbRoas) >= 5 && (
                                  <li className="flex items-start gap-2 text-[12px] text-green-400">
                                    <span>✓</span>
                                    <span>Meta ROAS boven 5x ({reportData.fbRoas}x)</span>
                                  </li>
                                )}
                                {reportData.googleRoas && parseFloat(reportData.googleRoas) >= 5 && (
                                  <li className="flex items-start gap-2 text-[12px] text-green-400">
                                    <span>✓</span>
                                    <span>Google ROAS boven 5x ({reportData.googleRoas}x)</span>
                                  </li>
                                )}
                                {reportData.fbPurchases && reportData.fbPurchases > 50 && (
                                  <li className="flex items-start gap-2 text-[12px] text-green-400">
                                    <span>✓</span>
                                    <span>Sterk aantal purchases ({reportData.fbPurchases})</span>
                                  </li>
                                )}
                                {reportData.googleConversions && reportData.googleConversions > 30 && (
                                  <li className="flex items-start gap-2 text-[12px] text-green-400">
                                    <span>✓</span>
                                    <span>Goede Google conversies ({reportData.googleConversions})</span>
                                  </li>
                                )}
                                {!reportData.fbRoas && !reportData.googleRoas && reportData.health === 'good' && (
                                  <li className="flex items-start gap-2 text-[12px] text-green-400">
                                    <span>✓</span>
                                    <span>Campagnes draaien stabiel</span>
                                  </li>
                                )}
                              </ul>
                            </div>
                            <div className={`p-4 rounded-md bg-amber-500/10 border border-amber-500/20`}>
                              <h3 className="text-[13px] font-semibold text-amber-500 mb-3">Wat kan beter</h3>
                              <ul className="space-y-2">
                                {reportData.health !== 'good' && (
                                  <li className="flex items-start gap-2 text-[12px] text-amber-400">
                                    <span>!</span>
                                    <span>Account heeft aandacht nodig</span>
                                  </li>
                                )}
                                {reportData.fbRoas && parseFloat(reportData.fbRoas) < 5 && (
                                  <li className="flex items-start gap-2 text-[12px] text-amber-400">
                                    <span>!</span>
                                    <span>Meta ROAS kan hoger (nu {reportData.fbRoas}x)</span>
                                  </li>
                                )}
                                {reportData.googleRoas && parseFloat(reportData.googleRoas) < 5 && (
                                  <li className="flex items-start gap-2 text-[12px] text-amber-400">
                                    <span>!</span>
                                    <span>Google ROAS kan hoger (nu {reportData.googleRoas}x)</span>
                                  </li>
                                )}
                                {!reportData.fbSpend && !reportData.googleSpend && (
                                  <li className="flex items-start gap-2 text-[12px] text-amber-400">
                                    <span>!</span>
                                    <span>Beperkte spend data beschikbaar</span>
                                  </li>
                                )}
                                <li className="flex items-start gap-2 text-[12px] text-amber-400">
                                  <span>→</span>
                                  <span>Creatives regelmatig refreshen</span>
                                </li>
                                <li className="flex items-start gap-2 text-[12px] text-amber-400">
                                  <span>→</span>
                                  <span>Audience segmentatie reviewen</span>
                                </li>
                              </ul>
                            </div>
                          </section>

                          {/* Agile Analytics Link */}
                          <section className="pt-2">
                            <a
                              href="https://dashboard.nodefy.nl"
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-md ${colors.accentBg} text-white font-medium text-[14px] ${colors.accentHover} transition-colors`}
                            >
                              Open in Agile Analytics
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </section>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================ */}
          {/* PIPELINE TAB - Multi-pipeline with HubSpot links */}
          {/* ============================================ */}
          {activeTab === 'pipeline' && (() => {
            const activePipeline = PIPELINES.find(p => p.id === activePipelineId) || PIPELINES[0]
            const openStages = activePipeline.stages.filter(s => !s.closed)
            
            // Filter deals: active pipeline, exclude closed stages, deduplicate by ID
            const seen = new Set<string>()
            const pipelineDeals = data.pipelineDeals.filter(d => {
              if (d.pipelineId !== activePipelineId) return false
              if (CLOSED_STAGE_IDS.has(d.stageId)) return false
              if (seen.has(d.id)) return false
              seen.add(d.id)
              return true
            })
            
            // Apply search filter
            const filteredDeals = pipelineSearch
              ? pipelineDeals.filter(d => d.name.toLowerCase().includes(pipelineSearch.toLowerCase()))
              : pipelineDeals
            
            // Calculate pipeline total value
            const activePipelineValue = pipelineDeals.reduce((acc, d) => acc + (d.value || 0), 0)
            
            // Group deals by stage
            const groupedDeals = openStages.map(stage => ({
              stage,
              deals: filteredDeals.filter(d => d.stageId === stage.id)
            }))

            // Format value for display
            const formatValue = (value: number | null) => {
              if (value === null || value === 0) return '-'
              return `€${value.toLocaleString('nl-NL')}`
            }

            return (
              <div className="space-y-4">
                {/* Header with pipeline tabs */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className={colors.textTertiary}>Dashboard</span>
                    <span className={colors.textTertiary}>/</span>
                    <span className={colors.textPrimary}>Pipeline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] ${colors.textTertiary}`}>
                      {formatDate(data.pipelineLastUpdated)}
                    </span>
                    <button
                      onClick={refreshPipeline}
                      disabled={pipelineSyncing}
                      className={`px-3 py-1 rounded text-[12px] font-medium ${colors.bgCard} ${colors.textSecondary} border ${colors.border} hover:${colors.textPrimary} disabled:opacity-50 transition-all flex items-center gap-1.5`}
                    >
                      <span className={pipelineSyncing ? 'animate-spin' : ''}>↻</span>
                      {pipelineSyncing ? 'Syncing...' : 'Sync HubSpot'}
                    </button>
                  </div>
                </div>

                {/* Pipeline Tabs */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    {PIPELINES.map((pipeline) => {
                      const pDeals = data.pipelineDeals.filter(d => d.pipelineId === pipeline.id)
                      const pValue = pDeals.reduce((acc, d) => acc + (d.value || 0), 0)
                      return (
                        <button
                          key={pipeline.id}
                          onClick={() => setActivePipelineId(pipeline.id)}
                          className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                            activePipelineId === pipeline.id
                              ? `${colors.accentBg} text-white`
                              : `${colors.bgCard} ${colors.textSecondary} border ${colors.border} ${colors.bgCardHover}`
                          }`}
                        >
                          {pipeline.name}
                          <span className={`ml-1.5 font-mono ${activePipelineId === pipeline.id ? 'text-white/70' : colors.textTertiary}`}>
                            {pDeals.length}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <div className={`text-[14px] font-bold font-mono ${colors.accent}`}>
                    €{activePipelineValue.toLocaleString('nl-NL')}
                  </div>
                </div>

                {/* Search */}
                <div className={`${colors.bgCard} rounded-md border ${colors.border}`}>
                  <input
                    type="text"
                    placeholder="Zoek deals..."
                    value={pipelineSearch}
                    onChange={(e) => setPipelineSearch(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md ${colors.bgCard} ${colors.textPrimary} placeholder:${colors.textTertiary} focus:outline-none text-[13px]`}
                  />
                </div>

                {/* Kanban columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {groupedDeals.map((group) => (
                    <div key={group.stage.id} className={`${colors.bgCard} rounded-md border ${colors.border}`}>
                      {/* Stage header */}
                      <div className={`px-3 py-2 border-b ${colors.border} flex items-center justify-between`}>
                        <h3 className={`text-[11px] font-medium ${colors.textPrimary} uppercase tracking-wide`}>{group.stage.name}</h3>
                        <span className={`text-[11px] ${colors.textTertiary} font-mono`}>{group.deals.length}</span>
                      </div>
                      
                      {/* Deals */}
                      <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
                        {group.deals.map((deal) => (
                          <div 
                            key={deal.id} 
                            className={`p-2.5 rounded-md ${colors.bgInput} border ${colors.border} group`}
                          >
                            {editingDealId === deal.id ? (
                              <div className="space-y-1.5">
                                <input
                                  type="text"
                                  value={deal.name}
                                  onChange={(e) => updateDeal(deal.id, 'name', e.target.value)}
                                  className={`w-full px-2 py-1 rounded text-[13px] ${colors.bgCard} ${colors.textPrimary} border ${colors.border} focus:outline-none focus:ring-1 focus:ring-[#0047FF]`}
                                />
                                <input
                                  type="number"
                                  value={deal.value || ''}
                                  onChange={(e) => updateDeal(deal.id, 'value', e.target.value ? parseInt(e.target.value) : null)}
                                  placeholder="Bedrag"
                                  className={`w-full px-2 py-1 rounded text-[12px] font-mono ${colors.bgCard} ${colors.textPrimary} border ${colors.border} focus:outline-none focus:ring-1 focus:ring-[#0047FF]`}
                                />
                                <input
                                  type="text"
                                  value={nextSteps[deal.id] || ''}
                                  onChange={(e) => updateNextStep(deal.id, e.target.value)}
                                  placeholder="Volgende stap..."
                                  className={`w-full px-2 py-1 rounded text-[12px] ${colors.bgCard} ${colors.textSecondary} border ${colors.border} focus:outline-none focus:ring-1 focus:ring-[#0047FF]`}
                                />
                                <button
                                  onClick={() => setEditingDealId(null)}
                                  className="w-full py-1 rounded text-[11px] bg-green-500/20 text-green-500 font-medium"
                                >
                                  ✓ Klaar
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between gap-2">
                                  <div 
                                    className={`flex-1 ${editMode ? 'cursor-pointer' : ''}`}
                                    onClick={() => editMode && setEditingDealId(deal.id)}
                                  >
                                    <p className={`text-[13px] font-medium ${colors.textPrimary} leading-tight`}>{deal.name}</p>
                                    <p className={`text-[12px] font-mono mt-0.5 ${deal.value ? colors.accent : colors.textTertiary}`}>
                                      {formatValue(deal.value)}
                                    </p>
                                  </div>
                                  <a
                                    href={`https://app-eu1.hubspot.com/contacts/8271281/record/0-3/${deal.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-1 rounded ${colors.bgCardHover} ${colors.textTertiary} hover:${colors.textPrimary} opacity-0 group-hover:opacity-100 transition-opacity`}
                                    title="Open in HubSpot"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                </div>
                                {nextSteps[deal.id] && (
                                  <p className={`text-[11px] ${colors.textTertiary} mt-1.5 pt-1.5 border-t ${colors.border}`}>
                                    → {nextSteps[deal.id]}
                                  </p>
                                )}
                                {!nextSteps[deal.id] && editMode && (
                                  <button
                                    onClick={() => setEditingDealId(deal.id)}
                                    className={`text-[10px] ${colors.textTertiary} mt-1.5 hover:${colors.textSecondary}`}
                                  >
                                    + Volgende stap
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                        {group.deals.length === 0 && (
                          <p className={`text-[11px] ${colors.textTertiary} text-center py-4`}>Geen deals</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {editMode && (
                  <div className={`text-[11px] ${colors.textTertiary} text-center`}>
                    Klik op een deal om te bewerken • Wijzigingen worden automatisch opgeslagen
                  </div>
                )}

                {/* List view for all deals in pipeline */}
                <div className={`${colors.bgCard} rounded-md border ${colors.border} overflow-hidden`}>
                  <div className={`px-4 py-2 border-b ${colors.border} flex items-center justify-between`}>
                    <h3 className={`text-[13px] font-medium ${colors.textPrimary}`}>Alle deals — {activePipeline.name}</h3>
                    <span className={`text-[11px] ${colors.textTertiary}`}>{filteredDeals.length} deals</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead className={colors.bgInput}>
                        <tr>
                          <th className={`text-left p-3 font-medium ${colors.textSecondary}`}>Deal</th>
                          <th className={`text-left p-3 font-medium ${colors.textSecondary}`}>Stage</th>
                          <th className={`text-right p-3 font-medium ${colors.textSecondary}`}>Bedrag</th>
                          <th className={`text-left p-3 font-medium ${colors.textSecondary}`}>Volgende stap</th>
                          <th className={`text-center p-3 font-medium ${colors.textSecondary} w-10`}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDeals
                          .sort((a, b) => {
                            const stageA = openStages.find(s => s.id === a.stageId)?.order || 0
                            const stageB = openStages.find(s => s.id === b.stageId)?.order || 0
                            return stageB - stageA
                          })
                          .map((deal) => {
                            const stage = activePipeline.stages.find(s => s.id === deal.stageId)
                            const stageOrder = stage?.order || 0
                            return (
                              <tr key={deal.id} className={`border-t ${colors.border} ${colors.bgCardHover}`}>
                                <td className={`p-3 font-medium ${colors.textPrimary}`}>{deal.name}</td>
                                <td className="p-3">
                                  <span className={`text-[11px] px-1.5 py-0.5 rounded ${
                                    stageOrder >= 4 ? 'bg-green-500/20 text-green-500' :
                                    stageOrder === 3 ? 'bg-blue-500/20 text-blue-400' :
                                    stageOrder === 2 ? 'bg-purple-500/20 text-purple-400' :
                                    `${colors.bgActive} ${colors.textSecondary}`
                                  }`}>{stage?.name || '-'}</span>
                                </td>
                                <td className={`p-3 text-right font-mono ${deal.value ? colors.accent : colors.textTertiary}`}>
                                  {formatValue(deal.value)}
                                </td>
                                <td className={`p-3 text-[12px] ${colors.textSecondary}`}>
                                  {nextSteps[deal.id] || '-'}
                                </td>
                                <td className="p-3 text-center">
                                  <a
                                    href={`https://app-eu1.hubspot.com/contacts/8271281/record/0-3/${deal.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex p-1 rounded ${colors.bgCardHover} ${colors.textTertiary} hover:${colors.textPrimary}`}
                                    title="Open in HubSpot"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* ============================================ */}
          {/* MASTERPLAN TAB */}
          {/* ============================================ */}
          {activeTab === 'masterplan' && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2 text-[13px] mb-3">
                <span className={colors.textTertiary}>Strategy</span>
                <span className={colors.textTertiary}>/</span>
                <span className={colors.textPrimary}>Masterplan</span>
              </div>

              {/* Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {data.masterplan.pillars.map((pillar) => (
                  <div key={pillar.id} className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{pillar.emoji}</span>
                      <h3 className={`text-[14px] font-semibold ${colors.textPrimary}`}>{pillar.title}</h3>
                    </div>
                    <p className={`text-[11px] ${colors.textTertiary} mb-2`}>{pillar.description}</p>
                    <ul className="space-y-1">
                      {pillar.items.map((item, i) => (
                        <li key={i} className={`text-[12px] ${colors.textSecondary} flex items-center gap-2`}>
                          <span className={`w-1 h-1 ${colors.accentBg} rounded-full`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* AI Agents */}
              <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>AI Agent Roadmap</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <h4 className={`text-[12px] font-medium ${colors.textSecondary} mb-2`}>Current</h4>
                    <ul className="space-y-1">
                      {data.masterplan.aiAgents.current.map((agent, i) => (
                        <li key={i} className={`text-[13px] ${colors.textPrimary} flex items-center gap-2`}>
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {agent}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className={`text-[12px] font-medium ${colors.textSecondary} mb-2`}>Planned</h4>
                    <ul className="space-y-1.5">
                      {data.masterplan.aiAgents.planned.map((agent, i) => (
                        <li key={i} className={`text-[13px] ${colors.textPrimary} flex items-center justify-between`}>
                          <span className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.bgActive}`} />
                            {agent.name}
                          </span>
                          <span className={`text-[11px] ${colors.textTertiary} font-mono`}>{agent.timeline}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>KPI Dashboard</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {data.masterplan.kpis.map((kpi, i) => (
                    <div key={i} className={`p-3 rounded-md ${colors.bgInput}`}>
                      <p className={`text-[11px] ${colors.textTertiary}`}>{kpi.metric}</p>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className={`text-[14px] font-bold font-mono ${colors.textPrimary}`}>{kpi.current}</span>
                        <span className={`text-[12px] ${colors.accent} font-mono`}>→ {kpi.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 90-Day Roadmap with responsible + KPIs */}
              <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>90-Day Roadmap</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {data.masterplan.ninetyDayRoadmap.map((phase, i) => (
                    <div key={i} className={`p-3 rounded-md ${colors.bgInput}`}>
                      <span className={`text-[10px] ${colors.textTertiary} font-mono`}>Week {phase.week}</span>
                      <h4 className={`text-[13px] font-medium ${colors.textPrimary} my-0.5`}>{phase.focus}</h4>
                      <ul className="space-y-0.5 mb-2">
                        {phase.tasks.map((task, j) => (
                          <li key={j} className={`text-[11px] ${colors.textSecondary}`}>• {task}</li>
                        ))}
                      </ul>
                      <div className={`pt-2 border-t ${colors.border}`}>
                        <p className={`text-[10px] ${colors.textTertiary}`}>
                          <span className="text-blue-400">Owner:</span> {phase.responsible}
                        </p>
                        <p className={`text-[10px] ${colors.textTertiary}`}>
                          <span className="text-green-400">KPI:</span> {phase.kpi}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* CASES TAB - Website format */}
          {/* ============================================ */}
          {activeTab === 'cases' && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2 text-[13px] mb-3">
                <span className={colors.textTertiary}>Strategy</span>
                <span className={colors.textTertiary}>/</span>
                <span className={colors.textPrimary}>Cases</span>
              </div>

              <div className="space-y-6">
                {data.clientCases.filter(c => c.featured).map((caseItem) => (
                  <div key={caseItem.id} className={`${colors.bgCard} rounded-md border ${colors.border} overflow-hidden`}>
                    {/* Header */}
                    <div className={`p-4 border-b ${colors.border}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                              caseItem.year === 'Leadgeneration' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>{caseItem.year}</span>
                            <span className={`text-[10px] ${colors.textTertiary}`}>{caseItem.industry}</span>
                          </div>
                          <h3 className={`text-[18px] font-bold ${colors.textPrimary}`}>{caseItem.name}</h3>
                        </div>
                        <span className={`text-[11px] ${colors.textTertiary}`}>{caseItem.timeline}</span>
                      </div>
                    </div>

                    {/* Introduction */}
                    <div className={`p-4 border-b ${colors.border}`}>
                      <p className={`text-[13px] ${colors.textSecondary} leading-relaxed`}>{caseItem.introduction}</p>
                      <p className={`text-[11px] ${colors.textTertiary} mt-2`}>
                        <span className="font-medium">Scope:</span> {caseItem.scopeOfWork}
                      </p>
                    </div>

                    {/* Challenge */}
                    <div className="p-4 bg-red-500/5 border-b border-red-500/10">
                      <h4 className="text-[11px] font-semibold text-red-500 uppercase mb-1">Challenge: {caseItem.challenges.headline}</h4>
                      <p className={`text-[12px] ${colors.textSecondary}`}>{caseItem.challenges.description}</p>
                    </div>

                    {/* Solution */}
                    <div className={`p-4 border-b ${colors.border}`}>
                      <h4 className={`text-[11px] font-semibold ${colors.accent} uppercase mb-1`}>Solution: {caseItem.solution.headline}</h4>
                      <p className={`text-[12px] ${colors.textSecondary}`}>{caseItem.solution.description}</p>
                    </div>

                    {/* Results */}
                    <div className="p-4 bg-green-500/5">
                      <h4 className="text-[11px] font-semibold text-green-500 uppercase mb-2">Results</h4>
                      <p className={`text-[12px] ${colors.textSecondary} mb-3`}>{caseItem.results.summary}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {caseItem.results.kpis.map((kpi, i) => (
                          <div key={i} className={`${colors.bgCard} rounded-md p-3 border ${colors.border} text-center`}>
                            <p className="text-[16px] font-bold text-green-500 font-mono">{kpi.value}</p>
                            <p className={`text-[10px] ${colors.textTertiary}`}>{kpi.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* AGENCY OS TAB - With new tools */}
          {/* ============================================ */}
          {activeTab === 'agencyos' && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2 text-[13px] mb-3">
                <span className={colors.textTertiary}>Strategy</span>
                <span className={colors.textTertiary}>/</span>
                <span className={colors.textPrimary}>Agency OS</span>
              </div>

              <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Priority Apps</h3>
                <div className="space-y-2">
                  {data.agencyOsApps.map((app, index) => (
                    <div key={app.id} className={`p-3 rounded-md ${colors.bgInput} border ${colors.border}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-md ${colors.bgCard} border ${colors.border} flex items-center justify-center text-base`}>{app.emoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[10px] ${colors.textTertiary} font-mono`}>0{index + 1}</span>
                            <h4 className={`text-[13px] font-semibold ${colors.textPrimary}`}>{app.name}</h4>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              app.impact === 'Hoog' ? 'bg-green-500/20 text-green-500' : `${colors.bgActive} ${colors.textSecondary}`
                            }`}>
                              {app.impact}
                            </span>
                          </div>
                          <p className={`text-[12px] ${colors.textSecondary} mb-1.5`}>{app.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {app.features.map((f, i) => (
                              <span key={i} className={`text-[10px] ${colors.bgCard} border ${colors.border} px-1.5 py-0.5 rounded`}>{f}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* CONTENT TAB - Editable posts and templates */}
          {/* ============================================ */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2 text-[13px] mb-3">
                <span className={colors.textTertiary}>Sales</span>
                <span className={colors.textTertiary}>/</span>
                <span className={colors.textPrimary}>Content</span>
              </div>

              {/* LinkedIn Posts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary}`}>LinkedIn Posts</h3>
                  {canEdit && editMode && (
                    <button
                      onClick={addLinkedInPost}
                      className={`px-2 py-1 rounded text-[11px] font-medium ${colors.accentBg} text-white ${colors.accentHover}`}
                    >
                      + Add Post
                    </button>
                  )}
                </div>
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="lg:w-2/5">
                    <div className={`${colors.bgCard} rounded-md border ${colors.border} overflow-hidden`}>
                      <div className={`p-2 border-b ${colors.border} flex gap-1.5`}>
                        {['all', 'ready', 'draft', 'idea'].map((f) => (
                          <button 
                            key={f} 
                            onClick={() => setFilter(f)} 
                            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                              filter === f ? `${colors.accentBg} text-white` : `${colors.bgInput} ${colors.textSecondary}`
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                      <div className="max-h-[350px] overflow-y-auto">
                        {filteredPosts.map((post) => (
                          <button 
                            key={post.id} 
                            onClick={() => setSelectedPost(post)} 
                            className={`w-full text-left p-3 border-b ${colors.border} last:border-0 transition-colors ${
                              selectedPost?.id === post.id 
                                ? `${colors.bgActive} border-l-2 border-l-[#0047FF]` 
                                : colors.bgCardHover
                            }`}
                          >
                            <h3 className={`text-[13px] font-medium ${colors.textPrimary} line-clamp-2`}>{post.title}</h3>
                            <div className="flex gap-1.5 mt-1">
                              <span className={`text-[10px] ${colors.bgInput} ${colors.textSecondary} px-1.5 py-0.5 rounded`}>{post.category}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                post.status === 'ready' ? 'bg-green-500/20 text-green-500' : 
                                post.status === 'draft' ? 'bg-amber-500/20 text-amber-500' : 
                                `${colors.bgActive} ${colors.textTertiary}`
                              }`}>{post.status}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="lg:w-3/5">
                    <div className={`${colors.bgCard} rounded-md border ${colors.border} overflow-hidden min-h-[250px]`}>
                      {selectedPost ? (
                        <>
                          <div className={`p-3 border-b ${colors.border}`}>
                            {canEdit && editMode ? (
                              <input
                                type="text"
                                value={selectedPost.title}
                                onChange={(e) => updateLinkedInPost(selectedPost.id, 'title', e.target.value)}
                                className={`w-full text-[13px] font-semibold ${colors.bgInput} ${colors.textPrimary} px-2 py-1 rounded border ${colors.border} focus:outline-none focus:ring-1 focus:ring-[#0047FF]`}
                              />
                            ) : (
                              <h2 className={`text-[13px] font-semibold ${colors.textPrimary}`}>{selectedPost.title}</h2>
                            )}
                            <div className="flex justify-between items-center mt-2">
                              {canEdit && editMode ? (
                                <select
                                  value={selectedPost.status}
                                  onChange={(e) => updateLinkedInPost(selectedPost.id, 'status', e.target.value)}
                                  className={`text-[11px] px-2 py-1 rounded ${colors.bgInput} ${colors.textSecondary} border ${colors.border}`}
                                >
                                  <option value="idea">idea</option>
                                  <option value="draft">draft</option>
                                  <option value="ready">ready</option>
                                </select>
                              ) : (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  selectedPost.status === 'ready' ? 'bg-green-500/20 text-green-500' : 
                                  selectedPost.status === 'draft' ? 'bg-amber-500/20 text-amber-500' : 
                                  `${colors.bgActive} ${colors.textTertiary}`
                                }`}>{selectedPost.status}</span>
                              )}
                              <button 
                                onClick={() => copyToClipboard(selectedPost.concept, selectedPost.id)} 
                                className={`px-2.5 py-1 rounded text-[12px] font-medium transition-colors ${
                                  copiedId === selectedPost.id ? 'bg-green-500 text-white' : `${colors.accentBg} text-white ${colors.accentHover}`
                                }`}
                              >
                                {copiedId === selectedPost.id ? '✓' : 'Copy'}
                              </button>
                            </div>
                          </div>
                          <div className="p-3">
                            {canEdit && editMode ? (
                              <textarea
                                value={selectedPost.concept}
                                onChange={(e) => updateLinkedInPost(selectedPost.id, 'concept', e.target.value)}
                                className={`w-full h-56 rounded-md p-3 text-[13px] font-sans border resize-none ${colors.bgInput} ${colors.border} ${colors.textPrimary} focus:outline-none focus:ring-1 focus:ring-[#0047FF]`}
                              />
                            ) : (
                              <pre className={`rounded-md p-3 text-[13px] whitespace-pre-wrap max-h-[250px] overflow-y-auto font-sans ${colors.bgInput} ${colors.textSecondary}`}>{selectedPost.concept}</pre>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className={`flex items-center justify-center h-full ${colors.textTertiary} py-12`}>
                          <p className="text-[13px]">Select a post</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Outreach Templates */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary}`}>Outreach Templates</h3>
                  {canEdit && editMode && (
                    <button
                      onClick={addOutreachTemplate}
                      className={`px-2 py-1 rounded text-[11px] font-medium ${colors.accentBg} text-white ${colors.accentHover}`}
                    >
                      + Add Template
                    </button>
                  )}
                </div>
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="lg:w-1/3">
                    <div className={`${colors.bgCard} rounded-md border ${colors.border}`}>
                      {data.outreachTemplates.map((t) => (
                        <button 
                          key={t.id} 
                          onClick={() => setSelectedTemplate(t)} 
                          className={`w-full text-left p-3 border-b ${colors.border} last:border-0 transition-colors ${
                            selectedTemplate?.id === t.id 
                              ? `${colors.bgActive} border-l-2 border-l-[#0047FF]` 
                              : colors.bgCardHover
                          }`}
                        >
                          <h3 className={`text-[13px] font-medium ${colors.textPrimary}`}>{t.name}</h3>
                          <span className={`text-[11px] ${colors.textTertiary}`}>{t.type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="lg:w-2/3">
                    <div className={`${colors.bgCard} rounded-md border ${colors.border} p-4 min-h-[180px]`}>
                      {selectedTemplate ? (
                        <>
                          <div className="flex justify-between items-center mb-3">
                            {canEdit && editMode ? (
                              <input
                                type="text"
                                value={selectedTemplate.name}
                                onChange={(e) => updateOutreachTemplate(selectedTemplate.id, 'name', e.target.value)}
                                className={`text-[13px] font-semibold ${colors.bgInput} ${colors.textPrimary} px-2 py-1 rounded border ${colors.border} focus:outline-none focus:ring-1 focus:ring-[#0047FF]`}
                              />
                            ) : (
                              <h2 className={`text-[13px] font-semibold ${colors.textPrimary}`}>{selectedTemplate.name}</h2>
                            )}
                            <button 
                              onClick={() => copyToClipboard(selectedTemplate.template, selectedTemplate.id)} 
                              className={`px-2.5 py-1 rounded text-[12px] font-medium transition-colors ${
                                copiedId === selectedTemplate.id ? 'bg-green-500 text-white' : `${colors.accentBg} text-white ${colors.accentHover}`
                              }`}
                            >
                              {copiedId === selectedTemplate.id ? '✓' : 'Copy'}
                            </button>
                          </div>
                          {canEdit && editMode ? (
                            <textarea
                              value={selectedTemplate.template}
                              onChange={(e) => updateOutreachTemplate(selectedTemplate.id, 'template', e.target.value)}
                              className={`w-full h-40 rounded-md p-3 text-[13px] font-sans border resize-none ${colors.bgInput} ${colors.border} ${colors.textPrimary} focus:outline-none focus:ring-1 focus:ring-[#0047FF]`}
                            />
                          ) : (
                            <pre className={`rounded-md p-3 text-[13px] whitespace-pre-wrap font-sans ${colors.bgInput} ${colors.textSecondary}`}>{selectedTemplate.template}</pre>
                          )}
                        </>
                      ) : (
                        <div className={`flex items-center justify-center h-full ${colors.textTertiary} py-10`}>
                          <p className="text-[13px]">Select a template</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* STRATEGY TAB - Operational Cockpit */}
          {/* ============================================ */}
          {activeTab === 'strategy' && (() => {
            // ---- Computed values from retainer data ----
            const activeClients = RETAINER_CLIENTS.filter(c => c.status === 'Actief')
            const currentARR = activeClients.reduce((sum, c) => sum + c.bedrag, 0)
            const currentMRR = Math.round(currentARR / 12)
            const avgMRR = Math.round(currentMRR / (activeClients.length || 1))
            const new2026 = RETAINER_CLIENTS.filter(c => c.startJaar === 2026).length
            const annualTarget = data.revenueGoals.annualTarget
            const gap = annualTarget - currentARR
            const currentMonth = new Date().getMonth() + 1 // 1-indexed
            const monthsRemaining = Math.max(12 - currentMonth, 1)
            const neededPerMonth = Math.round(gap / monthsRemaining)

            // Monthly MRR from retainers — uses actual jan/feb data + startMonth for accurate per-month revenue
            const MONTH_NAMES = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
            const getMonthlyMRR = (monthIdx: number) => {
              return activeClients.reduce((sum, c) => {
                const sm = (c as any).startMonth as number | undefined
                const startIdx = sm ? sm - 1 : 0
                if (monthIdx < startIdx) return sum // client hasn't started yet
                const feb = (c as any).feb as number | undefined
                if (monthIdx === 0) return sum + c.jan
                if (monthIdx === 1 && feb) return sum + feb
                // For other months, use feb value (stabilized retainer) or bedrag/12
                return sum + (feb || c.jan || c.bedrag / 12)
              }, 0)
            }

            // Q1 recurring from actual monthly data
            const q1Recurring = Math.round(getMonthlyMRR(0) + getMonthlyMRR(1) + getMonthlyMRR(2))

            // Ensure monthlyForecast exists
            const forecast = data.monthlyForecast && data.monthlyForecast.length === 12
              ? data.monthlyForecast
              : DEFAULT_MONTHLY_FORECAST

            const updateForecast = (month: number, field: 'nieuwDeals' | 'target', value: number) => {
              const updated = forecast.map(f => f.month === month ? { ...f, [field]: value } : f)
              updateData('monthlyForecast', updated)
            }

            // Filter tasks
            const filteredTasks = data.masterTasks.filter(t => {
              if (taskFilter !== 'all' && t.category !== taskFilter) return false
              if (taskPriorityFilter !== 'all' && t.priority !== taskPriorityFilter) return false
              if (taskStatusFilter === 'open' && t.done) return false
              if (taskStatusFilter === 'done' && !t.done) return false
              return true
            })

            // KPI status helper
            const getKpiStatus = (kpi: KPICard) => {
              if (kpi.name === 'Churn %') {
                const ratio = kpi.target / kpi.current
                if (ratio >= 0.9) return 'green'
                if (ratio >= 0.7) return 'yellow'
                return 'red'
              }
              const ratio = kpi.current / kpi.target
              if (ratio >= 0.9) return 'green'
              if (ratio >= 0.7) return 'yellow'
              return 'red'
            }

            // Task helpers
            const updateTask = (id: string, updates: Partial<MasterTask>) => {
              updateData('masterTasks', data.masterTasks.map(t => t.id === id ? { ...t, ...updates } : t))
            }
            const toggleTaskDone = (id: string) => {
              updateData('masterTasks', data.masterTasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
            }
            const deleteTask = (id: string) => {
              updateData('masterTasks', data.masterTasks.filter(t => t.id !== id))
            }
            const addTask = () => {
              if (!newTask.title.trim()) return
              const task: MasterTask = {
                id: `mt${Date.now()}`,
                title: newTask.title,
                done: false,
                deadline: newTask.deadline || new Date().toISOString().split('T')[0],
                category: newTask.category,
                priority: newTask.priority,
              }
              updateData('masterTasks', [...data.masterTasks, task])
              setNewTask({ title: '', deadline: '', category: 'Strategy', priority: 'medium' })
              setShowAddTask(false)
            }
            const updateKpi = (id: string, field: 'current' | 'target', value: number) => {
              updateData('kpiScoreboard', data.kpiScoreboard.map(k => k.id === id ? { ...k, [field]: value } : k))
            }
            const updateQuarterlyGoal = (id: string, updates: Partial<QuarterlyGoal>) => {
              updateData('quarterlyGoals', data.quarterlyGoals.map(g => g.id === id ? { ...g, ...updates } : g))
            }
            const addQuarterlyGoal = (quarter: string) => {
              const goal: QuarterlyGoal = { id: `qg${Date.now()}`, quarter, text: 'Nieuw doel...', status: 'yellow' }
              updateData('quarterlyGoals', [...data.quarterlyGoals, goal])
            }
            const deleteQuarterlyGoal = (id: string) => {
              updateData('quarterlyGoals', data.quarterlyGoals.filter(g => g.id !== id))
            }
            const updateRevenueGoal = (field: 'annualTarget', value: number) => {
              updateData('revenueGoals', { ...data.revenueGoals, [field]: value })
            }
            const updateQuarterRevenueGoal = (q: string, field: 'target' | 'realized', value: number) => {
              updateData('revenueGoals', {
                ...data.revenueGoals,
                quarters: data.revenueGoals.quarters.map(qtr => qtr.q === q ? { ...qtr, [field]: value } : qtr)
              })
            }

            const totalRealized = data.revenueGoals.quarters.reduce((acc, q) => acc + q.realized, 0)
            const annualProgress = (currentARR / annualTarget) * 100

            const fmtEur = (n: number) => `€${Math.round(n).toLocaleString('nl-NL')}`

            return (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2 text-[13px] mb-3">
                  <span className={colors.textTertiary}>Sales</span>
                  <span className={colors.textTertiary}>/</span>
                  <span className={colors.textPrimary}>Strategy Cockpit</span>
                </div>

                {/* Revenue Goals Section */}
                <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Revenue Goals</h3>
                  
                  {/* Annual Target */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[12px] ${colors.textSecondary}`}>Jaardoel {new Date().getFullYear()}</span>
                      {editMode ? (
                        <input
                          type="number"
                          value={annualTarget}
                          onChange={(e) => updateRevenueGoal('annualTarget', parseInt(e.target.value) || 0)}
                          className={`w-32 px-2 py-1 rounded text-right text-[14px] font-mono ${colors.bgInput} ${colors.textPrimary} border ${colors.border} focus:outline-none focus:ring-1 focus:ring-[#0047FF]`}
                        />
                      ) : (
                        <span className={`text-[16px] font-bold font-mono ${colors.accent}`}>{fmtEur(annualTarget)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex-1 h-3 rounded-full ${colors.bgInput} overflow-hidden`}>
                        <div 
                          className={`h-full rounded-full ${annualProgress >= 90 ? 'bg-green-500' : annualProgress >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(annualProgress, 100)}%` }}
                        />
                      </div>
                      <span className={`text-[12px] font-mono ${colors.textSecondary}`}>{annualProgress.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className={`text-[11px] ${colors.textTertiary}`}>Bestaande ARR: {fmtEur(currentARR)}</span>
                      <span className={`text-[11px] ${colors.textTertiary}`}>Gap: {fmtEur(Math.max(gap, 0))}</span>
                    </div>
                  </div>

                  {/* Quarterly Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {data.revenueGoals.quarters.map((q, qi) => {
                      // Q1: auto-calculate recurring from retainer jan × 3
                      const recurring = qi === 0 ? q1Recurring : Math.round(currentMRR * 3)
                      const realized = q.realized || 0
                      const displayRealized = realized > 0 ? realized : recurring
                      const progress = q.target > 0 ? (displayRealized / q.target) * 100 : 0
                      const statusIcon = progress >= 90 ? '🟢' : progress >= 70 ? '🟡' : '🔴'
                      return (
                        <div key={q.q} className={`p-3 rounded-md ${colors.bgInput}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[12px] font-medium ${colors.textPrimary}`}>{q.q} {statusIcon}</span>
                            <span className={`text-[10px] font-mono ${progress >= 90 ? 'text-green-500' : progress >= 70 ? 'text-amber-500' : 'text-red-500'}`}>
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                          {editMode ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <span className={`text-[9px] ${colors.textTertiary} w-12`}>Target</span>
                                <input type="number" value={q.target}
                                  onChange={(e) => updateQuarterRevenueGoal(q.q, 'target', parseInt(e.target.value) || 0)}
                                  className={`w-full px-2 py-1 rounded text-[11px] font-mono ${colors.bgCard} ${colors.textPrimary} border ${colors.border}`}
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={`text-[9px] ${colors.textTertiary} w-12`}>Realized</span>
                                <input type="number" value={q.realized}
                                  onChange={(e) => updateQuarterRevenueGoal(q.q, 'realized', parseInt(e.target.value) || 0)}
                                  className={`w-full px-2 py-1 rounded text-[11px] font-mono ${colors.bgCard} ${colors.textPrimary} border ${colors.border}`}
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className={`h-2 rounded-full ${colors.bgCard} overflow-hidden mb-1`}>
                                <div 
                                  className={`h-full rounded-full ${progress >= 90 ? 'bg-green-500' : progress >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                              <div className="flex justify-between">
                                <span className={`text-[10px] font-mono ${colors.textTertiary}`}>Recurring: {fmtEur(recurring)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={`text-[10px] font-mono ${colors.textTertiary}`}>{realized > 0 ? `Actual: ${fmtEur(realized)}` : ''}</span>
                                <span className={`text-[10px] font-mono ${colors.textSecondary}`}>{fmtEur(q.target)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Revenue Gap Calculator */}
                <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Revenue Gap Analyse</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    {/* Main gap card */}
                    <div className={`p-4 rounded-md ${colors.bgInput} md:col-span-2`}>
                      <div className={`text-[13px] ${colors.textPrimary} mb-2`}>
                        {gap > 0 ? (
                          <>Je hebt nog <span className="font-bold font-mono text-amber-400">{fmtEur(gap)}</span> nodig om je jaardoel te halen</>
                        ) : (
                          <>🎉 <span className="font-bold text-green-400">Jaardoel bereikt!</span> Je zit <span className="font-mono text-green-400">{fmtEur(Math.abs(gap))}</span> boven target</>
                        )}
                      </div>
                      {gap > 0 && (
                        <div className={`text-[12px] ${colors.textSecondary}`}>
                          Dat is <span className="font-bold font-mono text-amber-300">{fmtEur(neededPerMonth)}/maand</span> aan nieuwe deals in de komende <span className="font-bold">{monthsRemaining} maanden</span>
                        </div>
                      )}
                      
                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className={`h-4 rounded-full ${colors.bgCard} overflow-hidden flex`}>
                          <div className="h-full bg-green-600 rounded-l-full" style={{ width: `${Math.min((currentARR / annualTarget) * 100, 100)}%` }} />
                          {gap > 0 && <div className="h-full bg-amber-600/40" style={{ width: `${Math.min((gap / annualTarget) * 100, 100 - (currentARR / annualTarget) * 100)}%` }} />}
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className={`text-[10px] font-mono text-green-400`}>Bestaand: {fmtEur(currentARR)}</span>
                          <span className={`text-[10px] font-mono ${gap > 0 ? 'text-amber-400' : 'text-green-400'}`}>Target: {fmtEur(annualTarget)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="space-y-2">
                      <div className={`p-3 rounded-md ${colors.bgInput}`}>
                        <div className={`text-[10px] ${colors.textTertiary}`}>Huidige MRR</div>
                        <div className={`text-[16px] font-bold font-mono ${colors.textPrimary}`}>{fmtEur(currentMRR)}</div>
                      </div>
                      <div className={`p-3 rounded-md ${colors.bgInput}`}>
                        <div className={`text-[10px] ${colors.textTertiary}`}>Gem. retainer/mnd</div>
                        <div className={`text-[16px] font-bold font-mono ${colors.textPrimary}`}>{fmtEur(avgMRR)}</div>
                      </div>
                      <div className={`p-3 rounded-md ${colors.bgInput}`}>
                        <div className={`text-[10px] ${colors.textTertiary}`}>Deals nodig (à gem.)</div>
                        <div className={`text-[16px] font-bold font-mono ${gap > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                          {gap > 0 ? Math.ceil(gap / (avgMRR * 12 || 1)) : '✓'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Waterfall breakdown */}
                  <div className="flex items-end gap-1 h-24">
                    {/* Bestaande ARR bar */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-green-600 rounded-t" style={{ height: `${Math.min((currentARR / annualTarget) * 100, 100)}%` }} />
                      <span className={`text-[9px] font-mono ${colors.textTertiary} mt-1`}>Bestaand</span>
                    </div>
                    {/* Per quarter needed */}
                    {data.revenueGoals.quarters.map((q, i) => {
                      const qGap = Math.max(q.target - (i === 0 ? q1Recurring : Math.round(currentMRR * 3)), 0)
                      return (
                        <div key={q.q} className="flex-1 flex flex-col items-center">
                          <div className={`w-full rounded-t ${qGap > 0 ? 'bg-amber-600/60' : 'bg-green-600/40'}`} style={{ height: `${Math.min((q.target / annualTarget) * 100 * 4, 100)}%` }} />
                          <span className={`text-[9px] font-mono ${colors.textTertiary} mt-1`}>{q.q}</span>
                        </div>
                      )
                    })}
                    {/* Target line */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-blue-500/40 rounded-t border-t-2 border-blue-400" style={{ height: '100%' }} />
                      <span className={`text-[9px] font-mono ${colors.textTertiary} mt-1`}>Target</span>
                    </div>
                  </div>
                </div>

                {/* KPI Scoreboard (targets editable, current auto-computed) */}
                <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>KPI Scoreboard <span className={`text-[10px] ${colors.textTertiary}`}>(live data)</span></h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {[
                      { id: 'k1', name: 'Actieve klanten', current: activeClients.length, target: data.kpiScoreboard.find(k => k.id === 'k1')?.target ?? 45, unit: '' },
                      { id: 'k2', name: 'MRR (huidig)', current: currentMRR, target: data.kpiScoreboard.find(k => k.id === 'k2')?.target ?? 95000, unit: '€' },
                      { id: 'k3', name: 'ARR', current: currentARR, target: data.kpiScoreboard.find(k => k.id === 'k3')?.target ?? 1000000, unit: '€' },
                      { id: 'k4', name: 'Gem. retainer', current: avgMRR, target: data.kpiScoreboard.find(k => k.id === 'k4')?.target ?? 4000, unit: '€' },
                      { id: 'k5', name: 'Nieuwe deals 2026', current: new2026, target: data.kpiScoreboard.find(k => k.id === 'k5')?.target ?? 15, unit: '' },
                    ].map((kpi) => {
                      const status = getKpiStatus(kpi)
                      return (
                        <div key={kpi.id} className={`p-3 rounded-md ${colors.bgInput} border-l-2 ${
                          status === 'green' ? 'border-l-green-500' : status === 'yellow' ? 'border-l-amber-500' : 'border-l-red-500'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[11px] ${colors.textSecondary}`}>{kpi.name}</span>
                            <span className={`w-2 h-2 rounded-full ${
                              status === 'green' ? 'bg-green-500' : status === 'yellow' ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                          </div>
                          {editMode && editingKpiId === kpi.id ? (
                            <div className="space-y-1">
                              <div className={`text-[10px] ${colors.textTertiary}`}>Current (auto): {kpi.unit === '€' ? fmtEur(kpi.current) : kpi.current}</div>
                              <div className="flex items-center gap-1">
                                <span className={`text-[9px] ${colors.textTertiary}`}>Target:</span>
                                <input type="number" value={kpi.target}
                                  onChange={(e) => updateKpi(kpi.id, 'target', parseFloat(e.target.value) || 0)}
                                  className={`w-full px-2 py-1 rounded text-[12px] font-mono ${colors.bgCard} ${colors.textPrimary} border ${colors.border}`}
                                />
                              </div>
                              <button onClick={() => setEditingKpiId(null)} className="text-[10px] text-green-500">Done</button>
                            </div>
                          ) : (
                            <div onClick={() => editMode && setEditingKpiId(kpi.id)} className={editMode ? 'cursor-pointer' : ''}>
                              <span className={`text-[16px] font-bold font-mono ${colors.textPrimary}`}>
                                {kpi.unit === '€' ? fmtEur(kpi.current) : kpi.current}
                              </span>
                              <div className={`text-[10px] ${colors.textTertiary}`}>
                                Target: {kpi.unit === '€' ? fmtEur(kpi.target) : kpi.target}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Monthly Revenue Forecast */}
                <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Maandelijkse Forecast</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className={colors.textTertiary}>
                          <th className="text-left py-1 px-2 font-medium">Maand</th>
                          <th className="text-right py-1 px-2 font-medium">Bestaande MRR</th>
                          <th className="text-right py-1 px-2 font-medium">Nieuwe deals</th>
                          <th className="text-right py-1 px-2 font-medium">Totaal</th>
                          <th className="text-right py-1 px-2 font-medium">Target</th>
                          <th className="text-right py-1 px-2 font-medium">Gap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {forecast.map((f, i) => {
                          const bestaandMRR = getMonthlyMRR(i)
                          const totaal = bestaandMRR + f.nieuwDeals
                          const target = f.target
                          const monthGap = totaal - target
                          const isPast = i < currentMonth - 1
                          return (
                            <tr key={f.month} className={`border-t ${colors.border} ${isPast ? 'opacity-60' : ''}`}>
                              <td className={`py-1.5 px-2 font-medium ${i === currentMonth - 1 ? 'text-blue-400' : colors.textSecondary}`}>
                                {MONTH_NAMES[i]} {i === currentMonth - 1 ? '◀' : ''}
                              </td>
                              <td className={`py-1.5 px-2 text-right font-mono ${colors.textSecondary}`}>{fmtEur(bestaandMRR)}</td>
                              <td className="py-1.5 px-2 text-right font-mono">
                                {editMode ? (
                                  <input type="number" value={f.nieuwDeals}
                                    onChange={(e) => updateForecast(f.month, 'nieuwDeals', parseInt(e.target.value) || 0)}
                                    className={`w-20 px-1 py-0.5 rounded text-right text-[11px] font-mono ${colors.bgInput} ${colors.textPrimary} border ${colors.border}`}
                                  />
                                ) : (
                                  <span className={f.nieuwDeals > 0 ? 'text-green-400' : colors.textTertiary}>{fmtEur(f.nieuwDeals)}</span>
                                )}
                              </td>
                              <td className={`py-1.5 px-2 text-right font-mono font-medium ${colors.textPrimary}`}>{fmtEur(totaal)}</td>
                              <td className="py-1.5 px-2 text-right font-mono">
                                {editMode ? (
                                  <input type="number" value={target}
                                    onChange={(e) => updateForecast(f.month, 'target', parseInt(e.target.value) || 0)}
                                    className={`w-20 px-1 py-0.5 rounded text-right text-[11px] font-mono ${colors.bgInput} ${colors.textPrimary} border ${colors.border}`}
                                  />
                                ) : (
                                  <span className={colors.textSecondary}>{fmtEur(target)}</span>
                                )}
                              </td>
                              <td className={`py-1.5 px-2 text-right font-mono font-medium ${monthGap >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {monthGap >= 0 ? '+' : ''}{fmtEur(monthGap)}
                              </td>
                            </tr>
                          )
                        })}
                        {/* Totals row */}
                        <tr className={`border-t-2 ${colors.border} font-medium`}>
                          <td className={`py-2 px-2 ${colors.textPrimary}`}>Totaal</td>
                          <td className={`py-2 px-2 text-right font-mono ${colors.textPrimary}`}>{fmtEur(forecast.reduce((s, _, i) => s + getMonthlyMRR(i), 0))}</td>
                          <td className={`py-2 px-2 text-right font-mono text-green-400`}>{fmtEur(forecast.reduce((s, f) => s + f.nieuwDeals, 0))}</td>
                          <td className={`py-2 px-2 text-right font-mono ${colors.textPrimary}`}>{fmtEur(forecast.reduce((s, f, i) => s + getMonthlyMRR(i) + f.nieuwDeals, 0))}</td>
                          <td className={`py-2 px-2 text-right font-mono ${colors.textSecondary}`}>{fmtEur(forecast.reduce((s, f) => s + f.target, 0))}</td>
                          <td className={`py-2 px-2 text-right font-mono ${
                            forecast.reduce((s, f, i) => s + getMonthlyMRR(i) + f.nieuwDeals, 0) - forecast.reduce((s, f) => s + f.target, 0) >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {(() => { const t = forecast.reduce((s, f, i) => s + getMonthlyMRR(i) + f.nieuwDeals, 0) - forecast.reduce((s, f) => s + f.target, 0); return `${t >= 0 ? '+' : ''}${fmtEur(t)}` })()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quarterly Goals */}
                <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Quarterly Goals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => {
                      const goals = data.quarterlyGoals.filter(g => g.quarter === quarter)
                      return (
                        <div key={quarter} className={`p-3 rounded-md ${colors.bgInput}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[12px] font-medium ${colors.textPrimary}`}>{quarter}</span>
                            {editMode && (
                              <button onClick={() => addQuarterlyGoal(quarter)} className="text-[10px] text-blue-400 hover:text-blue-300">+ Add</button>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            {goals.map((goal) => (
                              <div key={goal.id} className="flex items-start gap-2 group">
                                {editMode ? (
                                  <select value={goal.status}
                                    onChange={(e) => updateQuarterlyGoal(goal.id, { status: e.target.value as 'green' | 'yellow' | 'red' })}
                                    className={`w-6 h-5 text-[10px] rounded ${colors.bgCard} border ${colors.border}`}
                                  >
                                    <option value="green">🟢</option>
                                    <option value="yellow">🟡</option>
                                    <option value="red">🔴</option>
                                  </select>
                                ) : (
                                  <span className="text-[12px]">{goal.status === 'green' ? '🟢' : goal.status === 'yellow' ? '🟡' : '🔴'}</span>
                                )}
                                {editMode && editingGoalId === goal.id ? (
                                  <input type="text" value={goal.text}
                                    onChange={(e) => updateQuarterlyGoal(goal.id, { text: e.target.value })}
                                    onBlur={() => setEditingGoalId(null)}
                                    onKeyDown={(e) => e.key === 'Enter' && setEditingGoalId(null)}
                                    autoFocus
                                    className={`flex-1 px-1 py-0.5 rounded text-[11px] ${colors.bgCard} ${colors.textSecondary} border ${colors.border}`}
                                  />
                                ) : (
                                  <span onClick={() => editMode && setEditingGoalId(goal.id)}
                                    className={`flex-1 text-[11px] ${colors.textSecondary} ${editMode ? 'cursor-pointer hover:underline' : ''}`}
                                  >{goal.text}</span>
                                )}
                                {editMode && (
                                  <button onClick={() => deleteQuarterlyGoal(goal.id)} className="text-red-500 text-[10px] opacity-0 group-hover:opacity-100">×</button>
                                )}
                              </div>
                            ))}
                            {goals.length === 0 && <span className={`text-[11px] ${colors.textTertiary} italic`}>No goals</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Master Task List */}
                <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-[13px] font-medium ${colors.textPrimary}`}>Master Task List</h3>
                    <button onClick={() => setShowAddTask(!showAddTask)}
                      className={`px-2 py-1 rounded text-[11px] font-medium ${colors.accentBg} text-white ${colors.accentHover}`}
                    >+ Add Task</button>
                  </div>

                  {showAddTask && (
                    <div className={`p-3 rounded-md ${colors.bgInput} mb-3 space-y-2`}>
                      <input type="text" placeholder="Task title..." value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        className={`w-full px-3 py-2 rounded text-[13px] ${colors.bgCard} ${colors.textPrimary} border ${colors.border}`}
                      />
                      <div className="flex gap-2">
                        <input type="date" value={newTask.deadline}
                          onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                          className={`flex-1 px-2 py-1 rounded text-[12px] ${colors.bgCard} ${colors.textPrimary} border ${colors.border}`}
                        />
                        <select value={newTask.category}
                          onChange={(e) => setNewTask({ ...newTask, category: e.target.value as MasterTask['category'] })}
                          className={`px-2 py-1 rounded text-[12px] ${colors.bgCard} ${colors.textPrimary} border ${colors.border}`}
                        >
                          <option value="Content">Content</option>
                          <option value="Agency OS">Agency OS</option>
                          <option value="Masterplan">Masterplan</option>
                          <option value="Strategy">Strategy</option>
                          <option value="Reports">Reports</option>
                          <option value="Klanten">Klanten</option>
                          <option value="Pipeline">Pipeline</option>
                        </select>
                        <select value={newTask.priority}
                          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as MasterTask['priority'] })}
                          className={`px-2 py-1 rounded text-[12px] ${colors.bgCard} ${colors.textPrimary} border ${colors.border}`}
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                        <button onClick={addTask} className={`px-3 py-1 rounded text-[12px] font-medium ${colors.accentBg} text-white`}>Add</button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    <select value={taskFilter} onChange={(e) => setTaskFilter(e.target.value)}
                      className={`px-2 py-1 rounded text-[11px] ${colors.bgInput} ${colors.textSecondary} border ${colors.border}`}
                    >
                      <option value="all">All Categories</option>
                      <option value="Content">Content</option>
                      <option value="Agency OS">Agency OS</option>
                      <option value="Masterplan">Masterplan</option>
                      <option value="Strategy">Strategy</option>
                      <option value="Pipeline">Pipeline</option>
                    </select>
                    <select value={taskPriorityFilter} onChange={(e) => setTaskPriorityFilter(e.target.value)}
                      className={`px-2 py-1 rounded text-[11px] ${colors.bgInput} ${colors.textSecondary} border ${colors.border}`}
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <select value={taskStatusFilter} onChange={(e) => setTaskStatusFilter(e.target.value)}
                      className={`px-2 py-1 rounded text-[11px] ${colors.bgInput} ${colors.textSecondary} border ${colors.border}`}
                    >
                      <option value="all">All Status</option>
                      <option value="open">Open</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    {filteredTasks.sort((a, b) => {
                      if (a.done !== b.done) return a.done ? 1 : -1
                      const priorityOrder = { high: 0, medium: 1, low: 2 }
                      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) return priorityOrder[a.priority] - priorityOrder[b.priority]
                      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
                    }).map((task) => (
                      <div key={task.id} className={`flex items-center gap-3 p-2 rounded-md ${colors.bgInput} ${task.done ? 'opacity-50' : ''} group`}>
                        <button onClick={() => toggleTaskDone(task.id)}
                          className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                            task.done ? 'bg-green-500 border-green-500 text-white' : `${colors.border} hover:border-green-500`
                          }`}
                        >{task.done && '✓'}</button>
                        <div className="flex-1 min-w-0">
                          {editingTaskId === task.id ? (
                            <input type="text" value={task.title}
                              onChange={(e) => updateTask(task.id, { title: e.target.value })}
                              onBlur={() => setEditingTaskId(null)}
                              onKeyDown={(e) => e.key === 'Enter' && setEditingTaskId(null)}
                              autoFocus
                              className={`w-full px-2 py-1 rounded text-[13px] ${colors.bgCard} ${colors.textPrimary} border ${colors.border}`}
                            />
                          ) : (
                            <span onClick={() => setEditingTaskId(task.id)}
                              className={`text-[13px] cursor-pointer ${task.done ? 'line-through' : ''} ${colors.textPrimary}`}
                            >{task.title}</span>
                          )}
                        </div>
                        <span className={`text-[10px] font-mono ${colors.textTertiary} flex-shrink-0`}>{task.deadline}</span>
                        <button onClick={() => setActiveTab(task.category.toLowerCase().replace(' ', '') as TabId)}
                          className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                            task.category === 'Content' ? 'bg-blue-500/20 text-blue-400' :
                            task.category === 'Agency OS' ? 'bg-purple-500/20 text-purple-400' :
                            task.category === 'Masterplan' ? 'bg-green-500/20 text-green-400' :
                            task.category === 'Pipeline' ? 'bg-amber-500/20 text-amber-400' :
                            `${colors.bgActive} ${colors.textSecondary}`
                          } hover:opacity-80`}
                        >{task.category}</button>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                          task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>{task.priority}</span>
                        <button onClick={() => deleteTask(task.id)} className="text-red-500 text-[12px] opacity-0 group-hover:opacity-100 flex-shrink-0">×</button>
                      </div>
                    ))}
                    {filteredTasks.length === 0 && (
                      <p className={`text-[12px] ${colors.textTertiary} text-center py-4`}>No tasks match your filters</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* ============================================ */}
          {/* RETAINERS TAB */}
          {/* ============================================ */}
          {activeTab === 'retainers' && (() => {
            // Retainer data from top-level RETAINER_CLIENTS constant

            const MONTHS = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
            const MONTH_TARGET = 994690 / 12

            const realClients = RETAINER_CLIENTS.filter(c => c.status === 'Actief' || c.status === 'Start nnb')

            // Get unique values for filters
            const jaren = [...new Set(realClients.map(c => String(c.startJaar)))].sort()
            const statussen = [...new Set(realClients.map(c => c.status))]
            const onderdelen = [...new Set(realClients.map(c => c.onderdeel))]

            // Apply filters
            const filtered = realClients.filter(c => {
              if (retainerFilter.jaar !== 'alle' && String(c.startJaar) !== retainerFilter.jaar) return false
              if (retainerFilter.status !== 'alle' && c.status !== retainerFilter.status) return false
              if (retainerFilter.onderdeel !== 'alle' && c.onderdeel !== retainerFilter.onderdeel) return false
              return true
            })

            // Sort
            const sorted = [...filtered].sort((a, b) => {
              const dir = retainerSort.asc ? 1 : -1
              switch (retainerSort.col) {
                case 'klant': return dir * a.klant.localeCompare(b.klant)
                case 'lead': return dir * (a.lead || '').localeCompare(b.lead || '')
                case 'status': return dir * a.status.localeCompare(b.status)
                case 'onderdeel': return dir * a.onderdeel.localeCompare(b.onderdeel)
                case 'bedrag': return dir * (a.bedrag - b.bedrag)
                case 'startJaar': return dir * (a.startJaar - b.startJaar)
                default: return 0
              }
            })

            const toggleSort = (col: string) => {
              setRetainerSort(prev => prev.col === col ? { col, asc: !prev.asc } : { col, asc: true })
            }

            const SortIcon = ({ col }: { col: string }) => (
              <span className={`ml-1 text-[9px] ${retainerSort.col === col ? 'text-blue-400' : colors.textTertiary}`}>
                {retainerSort.col === col ? (retainerSort.asc ? '↑' : '↓') : '↕'}
              </span>
            )

            const fmtEur = (n: number) => n === 0 ? '€0' : `€${n.toLocaleString('nl-NL')}`
            const fmtEurK = (n: number) => n >= 1000 ? `€${(n / 1000).toFixed(1)}K` : fmtEur(n)

            // Monthly calculations: use actual jan/feb data, estimate rest from bedrag / active months
            const getClientMonthly = (c: (typeof RETAINER_CLIENTS)[number]) => {
              if (c.bedrag === 0) return Array(12).fill(0)
              const sm = (c as any).startMonth as number | undefined // 1=jan, 2=feb, etc.
              const startIdx = sm ? sm - 1 : 0 // 0-indexed month where client starts
              const feb = (c as any).feb as number | undefined
              
              // For clients not yet started (startMonth in future), show 0 before start
              const result = Array(12).fill(0)
              
              if (startIdx === 0) {
                // Started in jan: use jan actual, feb actual if available, rest estimate
                const monthlyEstimate = feb || (c.bedrag / 12)
                result[0] = c.jan
                for (let i = 1; i < 12; i++) {
                  result[i] = i === 1 && feb ? feb : monthlyEstimate
                }
              } else {
                // Started later (e.g. feb): 0 before start, then actual/estimated
                const monthlyEstimate = feb || (c.bedrag / (12 - startIdx))
                for (let i = startIdx; i < 12; i++) {
                  result[i] = i === startIdx && feb ? feb : monthlyEstimate
                }
              }
              return result
            }

            const monthlyTotals = MONTHS.map((_, mi) => {
              return realClients.reduce((sum, c) => sum + getClientMonthly(c)[mi], 0)
            })

            // Count new clients per month based on startMonth
            const newClientsPerMonth = MONTHS.map((_, mi) => {
              return realClients.filter(c => {
                const sm = (c as any).startMonth as number | undefined
                if (c.startJaar !== 2026) return false
                if (sm) return sm - 1 === mi
                return mi === 0 && c.jan > 0
              }).length
            })

            const statusColor = (s: string) => {
              if (s === 'Actief') return 'text-green-400'
              if (s === 'Start nnb') return 'text-yellow-400'
              return colors.textTertiary
            }

            const statusBg = (s: string) => {
              if (s === 'Actief') return 'bg-green-500/10 border-green-500/20'
              if (s === 'Start nnb') return 'bg-yellow-500/10 border-yellow-500/20'
              return `${colors.bgCard} ${colors.border}`
            }

            const activeCount = realClients.filter(c => c.status === 'Actief').length
            const new2026Actief = realClients.filter(c => c.startJaar === 2026 && c.status === 'Actief').length
            const new2026Nnb = realClients.filter(c => c.startJaar === 2026 && (c.status as string) === 'Start nnb').length

            return (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className={colors.textTertiary}>Sales</span>
                    <span className={colors.textTertiary}>/</span>
                    <span className={colors.textPrimary}>Retainers</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setRetainerView('overzicht')} className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${retainerView === 'overzicht' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : `${colors.bgCard} ${colors.textTertiary} border ${colors.border}`}`}>
                      Overzicht
                    </button>
                    <button onClick={() => setRetainerView('detail')} className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${retainerView === 'detail' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : `${colors.bgCard} ${colors.textTertiary} border ${colors.border}`}`}>
                      Detail
                    </button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Totaal ARR', value: '€994.690', sub: 'Annual Recurring Revenue' },
                    { label: 'Gem. MRR', value: '€82.891', sub: 'Monthly Recurring Revenue' },
                    { label: 'Actieve Klanten', value: String(activeCount), sub: `van ${realClients.length} totaal` },
                    { label: 'Nieuwe 2026', value: `${new2026Actief + new2026Nnb}`, sub: `${new2026Actief} actief · ${new2026Nnb} start nnb` },
                  ].map((card, i) => (
                    <div key={i} className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                      <p className={`text-[11px] ${colors.textTertiary} mb-1`}>{card.label}</p>
                      <p className={`text-[20px] font-semibold ${colors.textPrimary} font-mono`}>{card.value}</p>
                      <p className={`text-[10px] ${colors.textTertiary} mt-1`}>{card.sub}</p>
                    </div>
                  ))}
                </div>

                {retainerView === 'overzicht' ? (
                  <>
                    {/* Monthly Overview Table */}
                    <div className={`${colors.bgCard} rounded-md border ${colors.border} overflow-hidden`}>
                      <div className={`px-4 py-2.5 border-b ${colors.border}`}>
                        <h3 className={`text-[13px] font-medium ${colors.textPrimary}`}>Maandelijks Overzicht 2026</h3>
                      </div>
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className={`border-b ${colors.border}`}>
                            <th className={`text-left px-4 py-2 ${colors.textTertiary} font-medium`}>Maand</th>
                            <th className={`text-right px-4 py-2 ${colors.textTertiary} font-medium`}>Recurring Revenue</th>
                            <th className={`text-right px-4 py-2 ${colors.textTertiary} font-medium`}>Nieuwe Klanten</th>
                            <th className={`text-right px-4 py-2 ${colors.textTertiary} font-medium`}>Totaal</th>
                            <th className={`px-4 py-2 ${colors.textTertiary} font-medium w-[200px]`}>vs Target</th>
                          </tr>
                        </thead>
                        <tbody>
                          {MONTHS.map((m, mi) => {
                            const total = monthlyTotals[mi]
                            const pct = Math.min((total / MONTH_TARGET) * 100, 100)
                            return (
                              <tr key={m} className={`border-b ${colors.border} hover:${colors.bgInput}`}>
                                <td className={`px-4 py-2 ${colors.textPrimary}`}>{m}</td>
                                <td className={`px-4 py-2 text-right font-mono ${colors.textPrimary}`}>{fmtEur(Math.round(total))}</td>
                                <td className={`px-4 py-2 text-right font-mono ${colors.textTertiary}`}>{newClientsPerMonth[mi] || '—'}</td>
                                <td className={`px-4 py-2 text-right font-mono font-medium ${colors.textPrimary}`}>{fmtEur(Math.round(total))}</td>
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <div className={`flex-1 h-1.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                                      <div className={`h-full rounded-full ${pct >= 100 ? 'bg-green-500' : pct >= 80 ? 'bg-blue-500' : 'bg-yellow-500'}`} style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className={`text-[10px] font-mono ${colors.textTertiary} w-[35px] text-right`}>{pct.toFixed(0)}%</span>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 flex-wrap">
                      <select value={retainerFilter.jaar} onChange={e => setRetainerFilter(f => ({ ...f, jaar: e.target.value }))} className={`${colors.bgCard} ${colors.textPrimary} border ${colors.border} rounded px-2 py-1 text-[11px]`}>
                        <option value="alle">Alle jaren</option>
                        {jaren.map(j => <option key={j} value={j}>Start {j}</option>)}
                      </select>
                      <select value={retainerFilter.status} onChange={e => setRetainerFilter(f => ({ ...f, status: e.target.value }))} className={`${colors.bgCard} ${colors.textPrimary} border ${colors.border} rounded px-2 py-1 text-[11px]`}>
                        <option value="alle">Alle statussen</option>
                        {statussen.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select value={retainerFilter.onderdeel} onChange={e => setRetainerFilter(f => ({ ...f, onderdeel: e.target.value }))} className={`${colors.bgCard} ${colors.textPrimary} border ${colors.border} rounded px-2 py-1 text-[11px]`}>
                        <option value="alle">Alle onderdelen</option>
                        {onderdelen.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                    {/* Client Retainer Table */}
                    <div className={`${colors.bgCard} rounded-md border ${colors.border} overflow-hidden`}>
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className={`border-b ${colors.border}`}>
                            {[
                              { id: 'klant', label: 'Klant' },
                              { id: 'lead', label: 'Lead' },
                              { id: 'status', label: 'Status' },
                              { id: 'onderdeel', label: 'Onderdeel' },
                              { id: 'bedrag', label: 'Bedrag/jaar' },
                              { id: 'bedragMnd', label: 'Bedrag/mnd' },
                              { id: 'startJaar', label: 'Start jaar' },
                            ].map(col => (
                              <th key={col.id} onClick={() => col.id !== 'bedragMnd' && toggleSort(col.id)} className={`text-left px-4 py-2 ${colors.textTertiary} font-medium cursor-pointer hover:${colors.textSecondary} select-none`}>
                                {col.label}{col.id !== 'bedragMnd' && <SortIcon col={col.id} />}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sorted.map((c, i) => (
                            <tr key={i} className={`border-b ${colors.border} hover:${colors.bgInput}`}>
                              <td className={`px-4 py-2 ${colors.textPrimary} font-medium`}>
                                {c.recurring && <span className="text-blue-400 mr-1" title="Recurring">↻</span>}
                                {c.klant}
                              </td>
                              <td className={`px-4 py-2 ${colors.textSecondary}`}>{c.lead || '—'}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${statusBg(c.status)} ${statusColor(c.status)}`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className={`px-4 py-2 ${colors.textSecondary}`}>{c.onderdeel}</td>
                              <td className={`px-4 py-2 font-mono ${colors.textPrimary}`}>{fmtEur(c.bedrag)}</td>
                              <td className={`px-4 py-2 font-mono ${colors.textTertiary}`}>{fmtEur(Math.round(c.bedrag / 12))}</td>
                              <td className={`px-4 py-2 font-mono ${colors.textTertiary}`}>{c.startJaar}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className={`px-4 py-2 border-t ${colors.border} flex justify-between`}>
                        <span className={`text-[11px] ${colors.textTertiary}`}>{sorted.length} klanten</span>
                        <span className={`text-[11px] font-mono ${colors.textPrimary}`}>Totaal: {fmtEur(sorted.reduce((s, c) => s + c.bedrag, 0))}/jaar</span>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Detail View: Per-client per-month grid */
                  <div className={`${colors.bgCard} rounded-md border ${colors.border} overflow-x-auto`}>
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className={`border-b ${colors.border}`}>
                          <th className={`text-left px-3 py-2 ${colors.textTertiary} font-medium sticky left-0 ${colors.bgCard} z-10 min-w-[180px]`}>Klant</th>
                          {MONTHS.map(m => (
                            <th key={m} className={`text-right px-2 py-2 ${colors.textTertiary} font-medium min-w-[75px]`}>{m}</th>
                          ))}
                          <th className={`text-right px-3 py-2 ${colors.textTertiary} font-medium min-w-[85px]`}>Totaal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {realClients.filter(c => c.bedrag > 0).map((c, i) => {
                          const monthly = getClientMonthly(c)
                          const isNew2026 = c.startJaar === 2026
                          return (
                            <tr key={i} className={`border-b ${colors.border} hover:${colors.bgInput}`}>
                              <td className={`px-3 py-1.5 ${colors.textPrimary} font-medium sticky left-0 ${colors.bgCard} z-10`}>
                                <div className="flex items-center gap-1">
                                  {c.recurring && <span className="text-blue-400 text-[9px]">↻</span>}
                                  <span className="truncate">{c.klant}</span>
                                  {isNew2026 && <span className="text-[8px] px-1 py-0 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 ml-1">NEW</span>}
                                </div>
                              </td>
                              {monthly.map((v, mi) => {
                                const isStart = mi === 0 && isNew2026 && v > 0
                                return (
                                  <td key={mi} className={`px-2 py-1.5 text-right font-mono ${v === 0 ? colors.textTertiary : colors.textPrimary} ${isStart ? 'bg-blue-500/10' : ''}`}>
                                    {v === 0 ? '—' : fmtEurK(Math.round(v))}
                                  </td>
                                )
                              })}
                              <td className={`px-3 py-1.5 text-right font-mono font-medium ${colors.textPrimary}`}>{fmtEurK(c.bedrag)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot>
                        <tr className={`border-t-2 ${colors.border}`}>
                          <td className={`px-3 py-2 font-medium ${colors.textPrimary} sticky left-0 ${colors.bgCard} z-10`}>Totaal</td>
                          {monthlyTotals.map((t, mi) => (
                            <td key={mi} className={`px-2 py-2 text-right font-mono font-semibold ${colors.textPrimary}`}>{fmtEurK(Math.round(t))}</td>
                          ))}
                          <td className={`px-3 py-2 text-right font-mono font-semibold ${colors.textPrimary}`}>{fmtEurK(994690)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )
          })()}

          {/* ============================================ */}
          {/* ADMIN TAB - User Management (superadmin only) */}
          {/* ============================================ */}
          {activeTab === 'admin' && canManageUsers && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[13px]">
                  <span className={colors.textTertiary}>System</span>
                  <span className={colors.textTertiary}>/</span>
                  <span className={colors.textPrimary}>Admin</span>
                </div>
                <button
                  onClick={() => setShowAddUser(!showAddUser)}
                  className={`px-3 py-1.5 rounded text-[12px] font-medium ${colors.accentBg} text-white ${colors.accentHover}`}
                >
                  + Nieuwe gebruiker
                </button>
              </div>

              {/* Add User Form */}
              {showAddUser && (
                <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Nieuwe gebruiker</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={`text-[11px] ${colors.textTertiary} block mb-1`}>Naam</label>
                      <input
                        type="text"
                        value={newUser.name || ''}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="Voornaam"
                        className={`w-full px-3 py-2 rounded-md text-[13px] ${colors.bgInput} ${colors.textPrimary} border ${colors.border} focus:outline-none focus:ring-1 focus:ring-[#0047FF]`}
                      />
                    </div>
                    <div>
                      <label className={`text-[11px] ${colors.textTertiary} block mb-1`}>Email</label>
                      <input
                        type="email"
                        value={newUser.email || ''}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="email@nodefy.nl"
                        className={`w-full px-3 py-2 rounded-md text-[13px] ${colors.bgInput} ${colors.textPrimary} border ${colors.border} focus:outline-none focus:ring-1 focus:ring-[#0047FF]`}
                      />
                    </div>
                    <div>
                      <label className={`text-[11px] ${colors.textTertiary} block mb-1`}>Wachtwoord</label>
                      <input
                        type="text"
                        value={newUser.password || ''}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Wachtwoord"
                        className={`w-full px-3 py-2 rounded-md text-[13px] ${colors.bgInput} ${colors.textPrimary} border ${colors.border} focus:outline-none focus:ring-1 focus:ring-[#0047FF]`}
                      />
                    </div>
                    <div>
                      <label className={`text-[11px] ${colors.textTertiary} block mb-1`}>Rol</label>
                      <select
                        value={newUser.role || 'viewer'}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                        className={`w-full px-3 py-2 rounded-md text-[13px] ${colors.bgInput} ${colors.textPrimary} border ${colors.border} focus:outline-none focus:ring-1 focus:ring-[#0047FF]`}
                      >
                        <option value="superadmin">Superadmin</option>
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Tab permissions for viewer/custom */}
                  {(newUser.role === 'viewer' || newUser.role === 'custom') && (
                    <div className="mt-4">
                      <label className={`text-[11px] ${colors.textTertiary} block mb-2`}>Permissies per sectie</label>
                      <div className="space-y-2">
                        {NAV_SECTIONS.map((section) => {
                          const sectionTabIds = section.items.map(i => i.id)
                          const allOn = sectionTabIds.every(id => newUser.permissions?.[id as TabId])
                          return (
                            <div key={section.title} className={`rounded-md border ${colors.border} overflow-hidden`}>
                              <div 
                                className={`flex items-center justify-between px-3 py-2 ${colors.bgInput} cursor-pointer`}
                                onClick={() => {
                                  const newPerms = { ...newUser.permissions }
                                  const targetVal = !allOn
                                  sectionTabIds.forEach(id => { (newPerms as Record<string, boolean>)[id] = targetVal })
                                  setNewUser({ ...newUser, permissions: newPerms })
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`w-3 h-3 rounded border flex items-center justify-center text-[9px] ${
                                    allOn ? 'bg-[#0047FF] border-[#0047FF] text-white' : `${colors.border}`
                                  }`}>{allOn ? '✓' : ''}</span>
                                  <span className={`text-[12px] font-medium uppercase tracking-wide ${colors.textSecondary}`}>{section.title}</span>
                                </div>
                              </div>
                              <div className="px-3 py-2 flex flex-wrap gap-2">
                                {section.items.map((item) => (
                                  <label key={item.id} className={`flex items-center gap-1.5 px-2 py-1 rounded ${colors.bgCard} border ${colors.border} cursor-pointer text-[12px]`}>
                                    <input
                                      type="checkbox"
                                      checked={newUser.permissions?.[item.id as TabId] || false}
                                      onChange={(e) => setNewUser({ 
                                        ...newUser, 
                                        permissions: { ...newUser.permissions, [item.id]: e.target.checked } 
                                      })}
                                      className="w-3 h-3"
                                    />
                                    <span className={colors.textSecondary}>{item.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={createUser}
                      className={`px-4 py-2 rounded-md text-[13px] font-medium ${colors.accentBg} text-white ${colors.accentHover}`}
                    >
                      Aanmaken
                    </button>
                    <button
                      onClick={() => { setShowAddUser(false); setNewUser({ name: '', email: '', password: '', role: 'viewer', permissions: {} }) }}
                      className={`px-4 py-2 rounded-md text-[13px] ${colors.bgInput} ${colors.textSecondary} border ${colors.border}`}
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              )}

              {/* Users Table */}
              <div className={`${colors.bgCard} rounded-md border ${colors.border} overflow-hidden`}>
                <div className={`px-4 py-2 border-b ${colors.border}`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary}`}>Gebruikers ({users.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className={`border-b ${colors.border} ${colors.bgInput}`}>
                        <th className={`text-left p-3 font-medium ${colors.textSecondary}`}>Naam</th>
                        <th className={`text-left p-3 font-medium ${colors.textSecondary}`}>Email</th>
                        <th className={`text-left p-3 font-medium ${colors.textSecondary}`}>Rol</th>
                        <th className={`text-center p-3 font-medium ${colors.textSecondary}`}>Tabs</th>
                        <th className={`text-left p-3 font-medium ${colors.textSecondary}`}>Laatste login</th>
                        <th className={`text-center p-3 font-medium ${colors.textSecondary}`}>Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        const visibleTabCount = Object.values(user.permissions).filter(Boolean).length
                        const isEditing = editingUserId === user.id
                        
                        return (
                          <tr key={user.id} className={`border-b ${colors.border} last:border-0 ${colors.bgCardHover}`}>
                            <td className={`p-3 ${colors.textPrimary}`}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={user.name}
                                  onChange={(e) => setUsers(prev => prev.map(u => u.id === user.id ? { ...u, name: e.target.value } : u))}
                                  className={`w-full px-2 py-1 rounded ${colors.bgInput} ${colors.textPrimary} border ${colors.border}`}
                                />
                              ) : (
                                <span className="font-medium">{user.name}</span>
                              )}
                            </td>
                            <td className={`p-3 ${colors.textSecondary}`}>
                              {isEditing ? (
                                <input
                                  type="email"
                                  value={user.email}
                                  onChange={(e) => setUsers(prev => prev.map(u => u.id === user.id ? { ...u, email: e.target.value } : u))}
                                  className={`w-full px-2 py-1 rounded ${colors.bgInput} ${colors.textPrimary} border ${colors.border}`}
                                />
                              ) : (
                                user.email
                              )}
                            </td>
                            <td className="p-3">
                              {isEditing ? (
                                <select
                                  value={user.role}
                                  onChange={(e) => setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: e.target.value as UserRole } : u))}
                                  className={`px-2 py-1 rounded ${colors.bgInput} ${colors.textPrimary} border ${colors.border}`}
                                >
                                  <option value="superadmin">Superadmin</option>
                                  <option value="admin">Admin</option>
                                  <option value="viewer">Viewer</option>
                                  <option value="custom">Custom</option>
                                </select>
                              ) : (
                                <span className={`text-[11px] px-1.5 py-0.5 rounded border ${ROLE_COLORS[user.role]}`}>
                                  {user.role}
                                </span>
                              )}
                            </td>
                            <td className={`p-3 text-center font-mono ${colors.textSecondary}`}>
                              {user.role === 'superadmin' || user.role === 'admin' ? 'All' : visibleTabCount}
                            </td>
                            <td className={`p-3 ${colors.textTertiary} text-[12px]`}>
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Nooit'}
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => saveUser(user)}
                                      className="text-green-500 hover:text-green-400 text-[12px]"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingUserId(null)}
                                      className={`${colors.textTertiary} hover:${colors.textSecondary} text-[12px]`}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => setEditingUserId(user.id)}
                                      className={`${colors.textSecondary} hover:${colors.textPrimary} text-[12px]`}
                                    >
                                      Edit
                                    </button>
                                    {deleteConfirm === user.id ? (
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => deleteUser(user.id)}
                                          className="text-red-500 hover:text-red-400 text-[12px]"
                                        >
                                          Confirm
                                        </button>
                                        <button
                                          onClick={() => setDeleteConfirm(null)}
                                          className={`${colors.textTertiary} text-[12px]`}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => currentUser?.id === user.id ? alert('You cannot delete yourself') : setDeleteConfirm(user.id)}
                                        className={`${currentUser?.id === user.id ? colors.textTertiary : 'text-red-500 hover:text-red-400'} text-[12px]`}
                                        disabled={currentUser?.id === user.id}
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Edit User Permissions (inline below table when editing viewer/custom) */}
              {editingUserId && (() => {
                const editUser = users.find(u => u.id === editingUserId)
                if (!editUser || (editUser.role !== 'viewer' && editUser.role !== 'custom')) return null
                
                return (
                  <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                    <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Permissies voor {editUser.name}</h3>
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => {
                          const allPerms = { ...editUser.permissions }
                          VISIBLE_TAB_IDS.forEach(id => { allPerms[id] = true })
                          setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, permissions: allPerms } : u))
                        }}
                        className={`px-2 py-1 rounded text-[11px] ${colors.bgInput} ${colors.textSecondary} border ${colors.border} hover:${colors.textPrimary}`}
                      >
                        Alles aan
                      </button>
                      <button
                        onClick={() => {
                          const noPerms = { ...editUser.permissions }
                          VISIBLE_TAB_IDS.forEach(id => { noPerms[id] = false })
                          noPerms.settings = true
                          setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, permissions: noPerms } : u))
                        }}
                        className={`px-2 py-1 rounded text-[11px] ${colors.bgInput} ${colors.textSecondary} border ${colors.border} hover:${colors.textPrimary}`}
                      >
                        Alles uit
                      </button>
                    </div>
                    <div className="space-y-3">
                      {NAV_SECTIONS.map((section) => {
                        const sectionTabIds = section.items.map(i => i.id)
                        const allOn = sectionTabIds.every(id => editUser.permissions[id])
                        const someOn = sectionTabIds.some(id => editUser.permissions[id])
                        return (
                          <div key={section.title} className={`rounded-md border ${colors.border} overflow-hidden`}>
                            <div 
                              className={`flex items-center justify-between px-3 py-2 ${colors.bgInput} cursor-pointer`}
                              onClick={() => {
                                const newPerms = { ...editUser.permissions }
                                const targetVal = !allOn
                                sectionTabIds.forEach(id => { newPerms[id as TabId] = targetVal })
                                setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, permissions: newPerms } : u))
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded border flex items-center justify-center text-[9px] ${
                                  allOn ? 'bg-[#0047FF] border-[#0047FF] text-white' : someOn ? 'border-[#0047FF] text-[#0047FF]' : `${colors.border}`
                                }`}>{allOn ? '✓' : someOn ? '—' : ''}</span>
                                <span className={`text-[12px] font-medium uppercase tracking-wide ${colors.textSecondary}`}>{section.title}</span>
                              </div>
                              <span className={`text-[10px] ${colors.textTertiary}`}>{sectionTabIds.filter(id => editUser.permissions[id]).length}/{sectionTabIds.length}</span>
                            </div>
                            <div className="px-3 py-2 flex flex-wrap gap-2">
                              {section.items.map((item) => (
                                <label key={item.id} className={`flex items-center gap-1.5 px-2 py-1 rounded ${colors.bgCard} border ${colors.border} cursor-pointer text-[12px]`}>
                                  <input
                                    type="checkbox"
                                    checked={editUser.permissions[item.id] || false}
                                    onChange={(e) => {
                                      const newPerms = { ...editUser.permissions, [item.id]: e.target.checked }
                                      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, permissions: newPerms } : u))
                                    }}
                                    className="w-3 h-3"
                                  />
                                  <span className={colors.textSecondary}>{item.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* Password Management */}
              {editingUserId && (() => {
                const editUser = users.find(u => u.id === editingUserId)
                if (!editUser) return null
                
                return (
                  <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                    <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Wachtwoord voor {editUser.name}</h3>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 max-w-xs">
                        <input
                          type={showPassword[editUser.id] ? 'text' : 'password'}
                          value={editUser.password}
                          onChange={(e) => setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, password: e.target.value } : u))}
                          className={`w-full px-3 py-2 rounded-md text-[13px] ${colors.bgInput} ${colors.textPrimary} border ${colors.border} focus:outline-none focus:ring-1 focus:ring-[#0047FF]`}
                        />
                        <button
                          onClick={() => setShowPassword(prev => ({ ...prev, [editUser.id]: !prev[editUser.id] }))}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 text-[11px] ${colors.textTertiary} hover:${colors.textSecondary}`}
                        >
                          {showPassword[editUser.id] ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* ============================================ */}
          {/* SETTINGS TAB */}
          {/* ============================================ */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2 text-[13px] mb-3">
                <span className={colors.textTertiary}>Dashboard</span>
                <span className={colors.textTertiary}>/</span>
                <span className={colors.textPrimary}>Settings</span>
              </div>

              {/* Theme */}
              <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Theme</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-4 py-2 rounded-md text-[13px] font-medium transition-colors ${
                      isDark ? `${colors.accentBg} text-white` : `${colors.bgInput} ${colors.textSecondary} border ${colors.border}`
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-4 py-2 rounded-md text-[13px] font-medium transition-colors ${
                      !isDark ? `${colors.accentBg} text-white` : `${colors.bgInput} ${colors.textSecondary} border ${colors.border}`
                    }`}
                  >
                    Light
                  </button>
                </div>
              </div>

              {/* Account Info */}
              <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Account</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[12px] ${colors.textSecondary}`}>Naam</span>
                    <span className={`text-[13px] ${colors.textPrimary}`}>{currentUser?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[12px] ${colors.textSecondary}`}>Email</span>
                    <span className={`text-[13px] ${colors.textPrimary}`}>{currentUser?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[12px] ${colors.textSecondary}`}>Rol</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded border ${ROLE_COLORS[currentUser?.role || 'viewer']}`}>
                      {currentUser?.role}
                    </span>
                  </div>
                </div>
              </div>

                {/* Data Sources - superadmin only */}
                {canManageUsers && (
                  <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                    <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Data Sources</h3>
                    <div className="space-y-2">
                      {[
                        { name: 'Meta Ads API', connected: true, detail: 'Token active' },
                        { name: 'HubSpot CRM', connected: true, detail: 'API key configured' },
                        { name: 'Google Ads', connected: false, detail: 'Not connected' },
                        { name: 'Agile Analytics', connected: true, detail: 'Connected via browser' },
                      ].map((source, i) => (
                        <div key={i} className={`flex items-center justify-between p-3 rounded-md ${colors.bgInput} border ${colors.border}`}>
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${source.connected ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className={`text-[13px] ${colors.textPrimary}`}>{source.name}</span>
                          </div>
                          <span className={`text-[12px] ${source.connected ? 'text-green-500' : 'text-red-500'}`}>
                            {source.connected ? '✓ Connected' : '✕ Not connected'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sync Schedule - superadmin only */}
                {canManageUsers && (
                  <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                    <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Sync Schedule</h3>
                    <div className={`flex items-center justify-between p-3 rounded-md ${colors.bgInput} border ${colors.border}`}>
                      <div>
                        <p className={`text-[13px] ${colors.textPrimary}`}>HubSpot Pipeline Sync</p>
                        <p className={`text-[11px] ${colors.textTertiary}`}>Syncs all deal stages and values</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[13px] font-mono ${colors.accent}`}>Daily @ 07:00</p>
                        <p className={`text-[11px] ${colors.textTertiary}`}>Europe/Amsterdam</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* About */}
                <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>About</h3>
                  <p className={`text-[13px] ${colors.textSecondary}`}>Nodefy Cockpit v1.0 — Built by Nodefy AI Agent</p>
                </div>

                {/* Danger Zone - superadmin only */}
                {canManageUsers && (
                  <div className={`${colors.bgCard} rounded-md p-4 border border-red-500/30`}>
                    <h3 className="text-[13px] font-medium text-red-500 mb-3">Danger Zone</h3>
                    <div className={`flex items-center justify-between p-3 rounded-md ${colors.bgInput} border border-red-500/20`}>
                      <div>
                        <p className={`text-[13px] ${colors.textPrimary}`}>Reset all data</p>
                        <p className={`text-[11px] ${colors.textTertiary}`}>Clear all localStorage data and return to defaults</p>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure? This will clear all saved data and log you out.')) {
                            localStorage.clear()
                            window.location.reload()
                          }
                        }}
                        className="px-3 py-2 rounded-md text-[13px] font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/30"
                      >
                        Reset Everything
                      </button>
                    </div>
                  </div>
                )}

                {/* Advanced - only for ruben@nodefy.nl */}
                {currentUser?.email === 'ruben@nodefy.nl' && (
                  <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                    <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-1`}>Advanced</h3>
                    <p className={`text-[11px] ${colors.textTertiary} mb-4`}>Alleen zichtbaar voor jou. Bepaal welke tabs je wilt zien.</p>
                    
                    <div className="space-y-2">
                      {VISIBLE_TAB_IDS.map(tabId => {
                        const tabLabels: Record<string, string> = {
                          overview: 'Overview', klanten: 'Klanten', reports: 'Reports', pipeline: 'Pipeline',
                          masterplan: 'Masterplan', cases: 'Cases', agencyos: 'Agency OS', content: 'Content', strategy: 'Strategy', retainers: 'Retainers'
                        }
                        const isHidden = currentUser.permissions[tabId] === false
                        return (
                          <div key={tabId} className={`flex items-center justify-between p-2.5 rounded-md ${colors.bgInput} border ${colors.border}`}>
                            <span className={`text-[13px] ${isHidden ? colors.textTertiary : colors.textPrimary}`}>{tabLabels[tabId] || tabId}</span>
                            <button
                              onClick={() => {
                                const updatedUsers = users.map(u => {
                                  if (u.id === currentUser.id) {
                                    const newPerms = { ...u.permissions, [tabId]: !u.permissions[tabId] }
                                    return { ...u, permissions: newPerms }
                                  }
                                  return u
                                })
                                setUsers(updatedUsers)
                                localStorage.setItem('nodefy-users', JSON.stringify(updatedUsers))
                                const updatedCurrent = updatedUsers.find(u => u.id === currentUser.id)
                                if (updatedCurrent) {
                                  setCurrentUser(updatedCurrent)
                                  localStorage.setItem('nodefy-current-user', JSON.stringify(updatedCurrent))
                                }
                              }}
                              className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
                                !isHidden
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : `${colors.bgCard} ${colors.textTertiary} border ${colors.border}`
                              }`}
                            >
                              {!isHidden ? 'Zichtbaar' : 'Verborgen'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

        </div>
      </div>
    </main>
  )
}