'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

// ============================================
// NODEFY SALES DASHBOARD v6.0
// Major content update with editing capabilities
// ============================================

// Types
type TabId = 'overview' | 'klanten' | 'reports' | 'pipeline' | 'prospects' | 'masterplan' | 'cases' | 'agencyos' | 'content' | 'strategy' | 'forecast' | 'retainers' | 'settings' | 'admin'

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
    permissions: { overview: true, klanten: true, reports: true, pipeline: true, prospects: true, masterplan: true, cases: true, agencyos: true, content: true, strategy: true, forecast: true, retainers: true, settings: true, admin: true },
    lastLogin: null,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'u2',
    name: 'Matthijs',
    email: 'matthijs@nodefy.nl',
    password: 'nodefy123',
    role: 'superadmin',
    permissions: { overview: true, klanten: true, reports: true, pipeline: true, prospects: true, masterplan: true, cases: true, agencyos: true, content: true, strategy: true, forecast: true, retainers: true, settings: true, admin: true },
    lastLogin: null,
    createdAt: '2024-01-01T00:00:00Z'
  }
]

// All possible tab IDs for permissions
const ALL_TAB_IDS: TabId[] = ['overview', 'klanten', 'reports', 'pipeline', 'prospects', 'masterplan', 'cases', 'agencyos', 'content', 'strategy', 'forecast', 'retainers', 'settings', 'admin']
const VISIBLE_TAB_IDS: TabId[] = ['overview', 'klanten', 'reports', 'pipeline', 'prospects', 'masterplan', 'cases', 'agencyos', 'content'] // tabs that can be assigned permissions (retainers + strategy = superadmin only, never assignable)

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
  details?: string
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

interface MegaProspect {
  id: number; name: string; website: string; description: string;
  category: string; location: string; size: string; why_interesting: string;
  services: string[]; retainer_potential: number; match_score: number;
  priority: 'hot' | 'warm' | 'cold';
  source_agency?: string;
  status?: 'new' | 'interesting' | 'archived' | 'contacted';
  notes?: string;
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
    id: 'metacampaignbuilder',
    name: 'Meta Campaign Builder',
    emoji: '🏗️',
    description: 'AI-powered campaign creation & structure',
    details: 'Generates complete Meta campaign structures from brief input. Uses AI to suggest audiences, creatives, and budget allocation based on historical performance data.',
    features: ['Campaign structure generator', 'Audience suggestion engine', 'Budget optimizer', 'Creative brief to ad copy'],
    integrations: ['Meta Ads API', 'OpenAI'],
    notifications: ['Slack'],
    effort: 'Hoog',
    impact: 'Hoog',
    status: 'building'
  },
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
  { klant: 'Caron', recurring: true, lead: 'Merijn', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 7650, jan: 2325, feb: 2325, mrt: 300, startJaar: 2023 },
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
  { klant: 'App4Sales', recurring: false, lead: 'Erik', status: 'Churned', onderdeel: 'Digital marketing', bedrag: 0, jan: 950, feb: 950, startJaar: 2025 },
  { klant: 'BunBun/Little Bonfire', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 18000, jan: 1500, startJaar: 2025 },
  { klant: 'Momentum', recurring: true, lead: 'Lidewij', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 33600, jan: 2800, startJaar: 2025 },
  { klant: 'Stories', recurring: true, lead: 'Roy', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 31200, jan: 2600, startJaar: 2025 },
  { klant: 'Stories (HubSpot)', recurring: true, lead: 'Roy', status: 'Actief', onderdeel: 'HubSpot', bedrag: 9000, jan: 750, startJaar: 2025 },
  { klant: 'Unity Units', recurring: true, lead: 'Benjamin Tug', status: 'Actief', onderdeel: 'Digital marketing', bedrag: 86400, jan: 8000, startJaar: 2025 },
  { klant: 'Displine', recurring: true, lead: 'Jaron', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 40800, jan: 3400, startJaar: 2025 },
  { klant: 'Distillery', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 38400, jan: 3200, startJaar: 2025 },
  { klant: 'Lake Cycling', recurring: true, lead: 'Jaron', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 74400, jan: 6200, startJaar: 2025 },
  { klant: 'Johan Cruyff', recurring: false, lead: 'RQS', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 5000, jan: 2000, feb: 3000, startJaar: 2025 },
  { klant: 'Bikeshoe4u / Grutto', recurring: true, lead: 'Jaron', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 59400, jan: 6600, feb: 4800, startJaar: 2026, startMonth: 1 },
  { klant: 'Synvest', recurring: true, lead: 'Jasper', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 30500, jan: 6150, feb: 1800, startJaar: 2026, startMonth: 1 },
  { klant: 'Kremer Collectie', recurring: false, lead: 'RQS', status: 'Actief', onderdeel: 'SEO', bedrag: 4600, jan: 2300, feb: 2300, startJaar: 2026, startMonth: 1 },
  { klant: 'Renaissance / CIMA', recurring: true, lead: 'Matthijs', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 59800, jan: 0, feb: 4800, mrt: 5500, startJaar: 2026, startMonth: 2 },
  { klant: 'Carelli', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 29000, jan: 0, feb: 5000, startJaar: 2026, startMonth: 2 },
  { klant: 'Mr Fris', recurring: true, lead: 'RQS', status: 'Actief', onderdeel: 'Digital Marketing', bedrag: 31800, jan: 0, feb: 5800, mrt: 2800, startJaar: 2026, startMonth: 2 },
] as const

// Computed retainer KPIs
const ACTIVE_RETAINER_CLIENTS = RETAINER_CLIENTS.filter(c => c.status === 'Actief')
const RETAINER_ARR = ACTIVE_RETAINER_CLIENTS.reduce((sum, c) => sum + c.bedrag, 0)
// MRR = current month's actual revenue (feb = month index 1)
const CURRENT_MONTH_IDX = new Date().getMonth() // 0=jan, 1=feb, etc.
const RETAINER_MRR = ACTIVE_RETAINER_CLIENTS.reduce((sum, c) => {
  const sm = (c as any).startMonth as number | undefined
  const startIdx = sm !== undefined ? sm - 1 : 0
  if (CURRENT_MONTH_IDX < startIdx) return sum
  const feb = (c as any).feb as number | undefined
  const mrt = (c as any).mrt as number | undefined
  // Non-recurring: only count in explicitly defined months
  if (!c.recurring) {
    if (CURRENT_MONTH_IDX === 0 && startIdx === 0) return sum + c.jan
    if (CURRENT_MONTH_IDX === 1 && feb !== undefined) return sum + feb
    if (CURRENT_MONTH_IDX === 1 && startIdx === 0 && feb === undefined) return sum + c.jan
    if (CURRENT_MONTH_IDX === 2 && mrt !== undefined) return sum + mrt
    return sum
  }
  const stableMonthly = mrt !== undefined ? mrt : (feb !== undefined ? feb : (c.jan || Math.round(c.bedrag / 12)))
  if (CURRENT_MONTH_IDX === 0) return sum + c.jan
  if (CURRENT_MONTH_IDX === 1) return sum + (feb !== undefined ? feb : stableMonthly)
  return sum + stableMonthly
}, 0)
const RETAINER_AVG_MRR = Math.round(RETAINER_MRR / ACTIVE_RETAINER_CLIENTS.filter(c => {
  const sm = (c as any).startMonth as number | undefined
  const startIdx = sm !== undefined ? sm - 1 : 0
  return CURRENT_MONTH_IDX >= startIdx
}).length)
const RETAINER_NEW_2026 = RETAINER_CLIENTS.filter(c => c.startJaar === 2026).length

const HISTORICAL_REVENUE: {month: string; revenue: number}[] = [
  {month: '2022-01', revenue: 15420}, {month: '2022-02', revenue: 18350}, {month: '2022-03', revenue: 22100},
  {month: '2022-04', revenue: 19800}, {month: '2022-05', revenue: 24500}, {month: '2022-06', revenue: 28900},
  {month: '2022-07', revenue: 21200}, {month: '2022-08', revenue: 18900}, {month: '2022-09', revenue: 31500},
  {month: '2022-10', revenue: 35200}, {month: '2022-11', revenue: 38100}, {month: '2022-12', revenue: 29800},
  {month: '2023-01', revenue: 32100}, {month: '2023-02', revenue: 35800}, {month: '2023-03', revenue: 41200},
  {month: '2023-04', revenue: 38500}, {month: '2023-05', revenue: 44100}, {month: '2023-06', revenue: 48200},
  {month: '2023-07', revenue: 39800}, {month: '2023-08', revenue: 36500}, {month: '2023-09', revenue: 52100},
  {month: '2023-10', revenue: 55800}, {month: '2023-11', revenue: 58200}, {month: '2023-12', revenue: 49500},
  {month: '2024-01', revenue: 51200}, {month: '2024-02', revenue: 54800}, {month: '2024-03', revenue: 59100},
  {month: '2024-04', revenue: 56200}, {month: '2024-05', revenue: 62500}, {month: '2024-06', revenue: 67800},
  {month: '2024-07', revenue: 58200}, {month: '2024-08', revenue: 54100}, {month: '2024-09', revenue: 71200},
  {month: '2024-10', revenue: 74500}, {month: '2024-11', revenue: 78100}, {month: '2024-12', revenue: 68200},
  {month: '2025-01', revenue: 65800}, {month: '2025-02', revenue: 68200}, {month: '2025-03', revenue: 72100},
  {month: '2025-04', revenue: 69500}, {month: '2025-05', revenue: 74200}, {month: '2025-06', revenue: 78900},
  {month: '2025-07', revenue: 71200}, {month: '2025-08', revenue: 67800}, {month: '2025-09', revenue: 82100},
  {month: '2025-10', revenue: 85200}, {month: '2025-11', revenue: 79500}, {month: '2025-12', revenue: 68400},
];

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

const STORAGE_KEY = 'nodefy-dashboard-v12'

// ============================================
// MEGA PROSPECTS DATA (281 prospects)
// ============================================
const MEGA_PROSPECTS: MegaProspect[] = [
  { id: 1, name: 'Ace & Tate', website: 'https://www.aceandtate.com', description: 'DTC brillenmerk met eigen winkels en sterke online aanwezigheid.', category: 'E-commerce', location: 'Amsterdam', size: '200-500 werknemers', why_interesting: 'Sterk DTC merk dat zwaar investeert in performance marketing. Kunnen profiteren van betere tracking en AI-optimalisatie.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking"], retainer_potential: 5000, match_score: 8, priority: 'hot' },
  { id: 2, name: 'Veloretti', website: 'https://www.veloretti.com', description: 'Premium Nederlandse fietsenmaker met DTC model en stijlvolle stadsfietsen.', category: 'E-commerce', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Vergelijkbaar met Lake Cycling (bestaande klant). Sterke DTC brand die kan groeien met betere performance marketing en tracking.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking", "Automation"], retainer_potential: 4000, match_score: 9, priority: 'hot' },
  { id: 3, name: 'Filling Pieces', website: 'https://www.fillingpieces.com', description: 'Premium sneakermerk uit Amsterdam met wereldwijde DTC verkoop.', category: 'E-commerce', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'High-end fashion DTC merk dat sterk leunt op social advertising. Nodefy\'s ervaring met Franky Amsterdam is direct relevant.', services: ["Meta Ads", "Google Ads", "TikTok Ads", "SEO", "Tracking"], retainer_potential: 5000, match_score: 9, priority: 'hot' },
  { id: 4, name: 'Daily Paper', website: 'https://www.dailypaperclothing.com', description: 'Streetwear modenmerk geïnspireerd door Afrikaanse cultuur.', category: 'E-commerce', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Snelgroeiend fashionmerk met sterke social media presence. TikTok en Meta Ads optimalisatie kan enorme impact hebben.', services: ["Meta Ads", "TikTok Ads", "Google Ads", "SEO", "Tracking"], retainer_potential: 5000, match_score: 8, priority: 'hot' },
  { id: 5, name: 'Scotch & Soda', website: 'https://www.scotch-soda.com', description: 'Nederlands fashionmerk met internationale retail en sterke e-commerce.', category: 'E-commerce', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Na recente herstructurering zoeken ze efficiëntere marketing. Groot budget, behoefte aan data-driven aanpak.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking", "Automation"], retainer_potential: 8000, match_score: 7, priority: 'warm' },
  { id: 6, name: 'Suitsupply', website: 'https://suitsupply.com', description: 'Premium herenkleding met 150+ winkels wereldwijd en sterke e-commerce.', category: 'E-commerce', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Groot internationaal merk met flinke ad spend. Server-side tracking en AI-optimalisatie kunnen grote ROI verbetering opleveren.', services: ["Google Ads", "Meta Ads", "Tracking", "SEO", "Automation"], retainer_potential: 8000, match_score: 7, priority: 'warm' },
  { id: 7, name: 'BALR.', website: 'https://www.balr.com', description: 'Lifestyle en fashionmerk opgericht door voetballers, premium segment.', category: 'E-commerce', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Sterk merk met grote social following maar kan profiteren van betere ad performance en tracking setup.', services: ["Meta Ads", "Google Ads", "TikTok Ads", "Tracking", "SEO"], retainer_potential: 5000, match_score: 8, priority: 'hot' },
  { id: 8, name: 'Marie-Stella-Maris', website: 'https://www.marie-stella-maris.com', description: 'Premium lifestyle merk voor verzorgingsproducten en geurkaarsen met sociale missie.', category: 'E-commerce', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Premium DTC brand met social impact verhaal. Perfect voor Meta Ads storytelling en SEO growth.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking"], retainer_potential: 3500, match_score: 8, priority: 'hot' },
  { id: 9, name: 'The Sting', website: 'https://www.thesting.com', description: 'Nederlandse modeketen met 80+ winkels en groeiende webshop.', category: 'E-commerce', location: 'Utrecht', size: '500+ werknemers', why_interesting: 'Grote retailer die digitale transformatie doormaakt. Behoefte aan server-side tracking en omnichannel marketing.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking", "Automation"], retainer_potential: 6000, match_score: 7, priority: 'warm' },
  { id: 10, name: 'Flax & Kale', website: 'https://www.flaxandkale.com', description: 'Flexitarisch voedingsmerk met webshop voor gezonde producten.', category: 'E-commerce', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Groeiende food DTC brand in trending health/wellness segment. Perfect voor social ads.', services: ["Meta Ads", "Google Ads", "SEO", "TikTok Ads"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 11, name: 'SNOCKS', website: 'https://snocks.com/nl-nl', description: 'DTC sokken en ondergoed merk met sterke online presence in NL.', category: 'E-commerce', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'Zeer succesvol DTC merk dat actief expandeert in Nederland. Groot ad budget, kan profiteren van lokale optimalisatie.', services: ["Meta Ads", "Google Ads", "TikTok Ads", "SEO", "Tracking"], retainer_potential: 5000, match_score: 7, priority: 'warm' },
  { id: 12, name: 'Suitcase', website: 'https://www.sfrbrands.nl', description: 'Nederlands merk voor premium koffers en reisaccessoires.', category: 'E-commerce', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Niche DTC brand met seizoensgebonden piekverkoop. Performance marketing en tracking essentieel.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 13, name: 'Naïf', website: 'https://www.naifcare.com', description: 'Natuurlijke baby- en huidverzorgingsproducten, sterk DTC merk.', category: 'E-commerce', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Populair Nederlands verzorgingsmerk met sterke DTC focus. Meta Ads en influencer marketing zijn key drivers.', services: ["Meta Ads", "Google Ads", "SEO", "TikTok Ads", "Tracking"], retainer_potential: 4000, match_score: 9, priority: 'hot' },
  { id: 14, name: 'Oilily', website: 'https://www.oilily.com', description: 'Iconisch Nederlands kleurrijk mode- en lifestylemerk.', category: 'E-commerce', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Herkenbaar merk met loyale fanbase. Kan groeien met betere performance marketing en retargeting.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking", "Automation"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 15, name: 'Hunkemöller', website: 'https://www.hunkemoller.nl', description: 'Grote lingerie retailer met sterke e-commerce en 900+ winkels.', category: 'E-commerce', location: 'Hilversum', size: '500+ werknemers', why_interesting: 'Groot merk met enorm ad budget. Server-side tracking en AI-optimalisatie kunnen significante ROI verbetering opleveren.', services: ["Meta Ads", "Google Ads", "Tracking", "SEO", "Automation", "AI"], retainer_potential: 10000, match_score: 7, priority: 'warm' },
  { id: 16, name: 'Gall & Gall', website: 'https://www.gall.nl', description: 'Grootste slijterijketen van Nederland met sterke webshop.', category: 'E-commerce', location: 'Zaandam', size: '500+ werknemers', why_interesting: 'Grote retailer met groeiende e-commerce. Seizoenscampagnes en lokale targeting bieden kansen.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 6000, match_score: 6, priority: 'cold' },
  { id: 17, name: 'Omoda', website: 'https://www.omoda.nl', description: 'Grote Nederlandse online schoenenretailer.', category: 'E-commerce', location: 'Zierikzee', size: '200-500 werknemers', why_interesting: 'Marktleider in online schoenenverkoop. Tracking optimalisatie en AI-driven bidding kunnen performance flink verbeteren.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking", "Automation"], retainer_potential: 6000, match_score: 7, priority: 'warm' },
  { id: 18, name: 'Vivian', website: 'https://www.vivian.nl', description: 'Online lingerie en badmode retailer.', category: 'E-commerce', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Niche e-commerce speler met hoge marges. Performance marketing optimalisatie direct impact op revenue.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 19, name: 'Loavies', website: 'https://www.loavies.com', description: 'Fast fashion DTC merk met sterke social media aanwezigheid.', category: 'E-commerce', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Social-first fashionmerk dat zwaar investeert in Meta en TikTok ads. Nodefy\'s tracking en optimalisatie expertise is zeer relevant.', services: ["Meta Ads", "TikTok Ads", "Google Ads", "Tracking", "SEO"], retainer_potential: 5000, match_score: 9, priority: 'hot' },
  { id: 20, name: 'My Jewellery', website: 'https://www.my-jewellery.com', description: 'Sieraden en fashion DTC merk met sterke online en fysieke aanwezigheid.', category: 'E-commerce', location: 'Den Bosch', size: '100-200 werknemers', why_interesting: 'Zeer succesvol DTC merk dat al flink adverteert. Tracking en AI-optimalisatie kunnen performance naar next level tillen.', services: ["Meta Ads", "Google Ads", "TikTok Ads", "SEO", "Tracking", "Automation"], retainer_potential: 5000, match_score: 8, priority: 'hot' },
  { id: 21, name: 'Fleurop', website: 'https://www.fleurop.nl', description: 'Marktleider in online bloemen bezorging in Nederland.', category: 'E-commerce', location: 'Leiden', size: '50-100 werknemers', why_interesting: 'Seizoensgebonden piekverkopen (Valentijn, Moederdag) vereisen optimale ad spend. Google Ads en tracking cruciaal.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 22, name: 'Greetz', website: 'https://www.greetz.nl', description: 'Online kaarten en cadeau platform, marktleider in persoonlijke cadeaus.', category: 'E-commerce', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'Groot e-commerce platform met seizoenspieken. Performance marketing en tracking optimalisatie direct revenue impact.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking", "Automation"], retainer_potential: 6000, match_score: 7, priority: 'warm' },
  { id: 23, name: 'Otrium', website: 'https://www.otrium.nl', description: 'Online outlet platform voor premium fashion merken.', category: 'E-commerce', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'Snelgroeiend platform met grote ad budgetten. Data-driven marketing en AI-optimalisatie zijn core needs.', services: ["Meta Ads", "Google Ads", "Tracking", "SEO", "AI", "Automation"], retainer_potential: 6000, match_score: 8, priority: 'hot' },
  { id: 24, name: 'Vitaminesperpost', website: 'https://www.vitaminesperpost.nl', description: 'Online retailer voor vitamines en supplementen.', category: 'E-commerce', location: 'Utrecht', size: '20-50 werknemers', why_interesting: 'Recurring revenue model met hoge CLV. SEO en Google Ads optimalisatie zijn key growth levers.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking", "Automation"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 25, name: 'Ekster', website: 'https://www.ekster.com', description: 'Smart wallets en accessoires merk, succesvol via crowdfunding.', category: 'E-commerce', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Innovatief DTC merk met internationale ambitie. Performance marketing en tracking essentieel voor schaling.', services: ["Meta Ads", "Google Ads", "TikTok Ads", "SEO", "Tracking"], retainer_potential: 4000, match_score: 8, priority: 'hot' },
  { id: 26, name: 'Concrete Jungle', website: 'https://www.concretejungle.nl', description: 'Urban plant shop met sterke online presence en DTC model.', category: 'E-commerce', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Trendy niche e-commerce in groeiend segment. Social ads en SEO kunnen sterke groei realiseren.', services: ["Meta Ads", "Google Ads", "SEO", "TikTok Ads"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 27, name: 'Flinders', website: 'https://www.flfrrs.com', description: 'Premium design meubelen webshop met hoge orderwaarde.', category: 'E-commerce', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Hoge gemiddelde orderwaarde maakt elke conversie-optimalisatie zeer waardevol. Tracking en Google Ads cruciaal.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 4000, match_score: 8, priority: 'hot' },
  { id: 28, name: 'Sacha Shoes', website: 'https://www.sachashoes.nl', description: 'Nederlandse schoenenketen met sterke online verkoop.', category: 'E-commerce', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'Traditionele retailer met groeiende online focus. Behoefte aan moderne tracking en performance marketing.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 29, name: 'Sissy-Boy', website: 'https://www.sissy-boy.com', description: 'Lifestyle merk met kleding, wonen en accessoires.', category: 'E-commerce', location: 'Amsterdam', size: '200-500 werknemers', why_interesting: 'Breed lifestyle merk met multi-category webshop. Cross-selling en performance optimalisatie bieden grote kansen.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking", "Automation"], retainer_potential: 5000, match_score: 7, priority: 'warm' },
  { id: 30, name: 'WOOOD', website: 'https://www.woood.nl', description: 'Nederlands meubelenmerk met betaalbaar design voor online verkoop.', category: 'E-commerce', location: 'Zaandam', size: '50-100 werknemers', why_interesting: 'Groeiend furniture DTC merk. Hoge orderwaarde maakt performance marketing optimalisatie zeer rendabel.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 31, name: 'NOOSA Amsterdam', website: 'https://www.noosa-amsterdam.com', description: 'Sieraden en accessoires merk met verwisselbare chunks.', category: 'E-commerce', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Uniek product concept met loyale klantbasis. Meta Ads en retargeting optimalisatie hoog potentieel.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 32, name: 'Shabbies Amsterdam', website: 'https://www.shfrfresamsterdam.com', description: 'Premium leren laarzen en accessoires merk.', category: 'E-commerce', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Premium Nederlands merk met seizoensgebonden verkoop. Performance marketing voor seizoenspieken is key.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 33, name: 'Fred de la Bretoniere', website: 'https://www.freddelabretoniere.com', description: 'Premium Nederlandse schoenen- en tassenmaker.', category: 'E-commerce', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Sterk Nederlands merk met groeiende e-commerce. Combinatie van brand en performance marketing kansrijk.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 34, name: 'Bever', website: 'https://www.bfrfr.nl', description: 'Outdoor en reiswinkelketen met sterke webshop.', category: 'E-commerce', location: 'Utrecht', size: '500+ werknemers', why_interesting: 'Grote retailer met seizoensgebonden campagnes. Tracking en omnichannel marketing optimalisatie waardevol.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 6000, match_score: 6, priority: 'cold' },
  { id: 35, name: 'YourSurprise', website: 'https://www.yoursurprise.nl', description: 'Gepersonaliseerde cadeaus platform, marktleider in personalisatie.', category: 'E-commerce', location: 'Zierikzee', size: '200-500 werknemers', why_interesting: 'Groot e-commerce platform met seizoenspieken. Data-driven marketing en AI-optimalisatie zijn perfect passend.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking", "AI", "Automation"], retainer_potential: 6000, match_score: 7, priority: 'warm' },
  { id: 36, name: 'Rituals', website: 'https://www.rituals.com', description: 'Premium home & body cosmetics merk met wereldwijde aanwezigheid.', category: 'E-commerce', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Groot internationaal merk met enorme ad spend. Zelfs kleine optimalisatie in tracking/AI levert grote absolute ROI.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking", "AI"], retainer_potential: 10000, match_score: 6, priority: 'warm' },
  { id: 37, name: 'Hema', website: 'https://www.hema.nl', description: 'Iconische Nederlandse retailer met groeiende e-commerce.', category: 'E-commerce', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Groot merk in digitale transformatie. Server-side tracking en marketing automation kunnen grote impact hebben.', services: ["Google Ads", "Meta Ads", "Tracking", "SEO", "Automation"], retainer_potential: 10000, match_score: 6, priority: 'cold' },
  { id: 38, name: 'Travelbags', website: 'https://www.travelbags.nl', description: 'Specialist in koffers, tassen en reisaccessoires online.', category: 'E-commerce', location: 'Tilburg', size: '50-100 werknemers', why_interesting: 'Niche retailer met sterke seizoenscyclus. Google Ads en SEO zijn primaire acquisitiekanalen.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 39, name: 'Xenos', website: 'https://www.xenos.nl', description: 'Woon- en cadeauwinkelketen met groeiende webshop.', category: 'E-commerce', location: 'Waalwijk', size: '500+ werknemers', why_interesting: 'Grote retailer die steeds meer op e-commerce leunt. Tracking en performance marketing optimalisatie kansrijk.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 5000, match_score: 6, priority: 'cold' },
  { id: 40, name: 'Dr. Hauschka NL', website: 'https://www.drhauschka.nl', description: 'Natuurlijke cosmetica merk met sterke Nederlandse marktpositie.', category: 'E-commerce', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Premium beauty merk met groeiende DTC. Content marketing, SEO en Meta Ads zijn key channels.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 41, name: 'Brabantia', website: 'https://www.brabantia.com', description: 'Nederlands huishoudmerk (prullenbakken, droogmolens) met sterke DTC.', category: 'E-commerce', location: 'Valkenswaard', size: '200-500 werknemers', why_interesting: 'Sterk merk dat DTC groei nastreeft. Google Ads, SEO en tracking optimalisatie direct waardevol.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 5000, match_score: 7, priority: 'warm' },
  { id: 42, name: 'Pip Studio', website: 'https://www.pipstudio.com', description: 'Kleurrijk lifestyle merk voor beddengoed, servies en kleding.', category: 'E-commerce', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Uniek Nederlands merk met loyale fanbase. DTC groei via performance marketing en retargeting.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 43, name: 'Kings of Indigo', website: 'https://www.kfrfrgsofrfrfrdfrgfr.com', description: 'Duurzaam denim merk met sterke online verkoop.', category: 'E-commerce', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Duurzame mode is trending. Meta Ads storytelling en SEO voor duurzaamheidszoekwoorden zeer kansrijk.', services: ["Meta Ads", "Google Ads", "SEO", "TikTok Ads"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 44, name: 'Dopper', website: 'https://www.dopper.com', description: 'Duurzame waterflessen merk met B Corp certificering.', category: 'E-commerce', location: 'Haarlem', size: '50-100 werknemers', why_interesting: 'Sterk purpose-driven merk. DTC groei met Meta Ads en B2B via LinkedIn Ads.', services: ["Meta Ads", "Google Ads", "LinkedIn Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 45, name: 'Flightgift / Experiencegift', website: 'https://www.flightgift.com', description: 'Gift card platform voor vluchten en ervaringen, internationaal actief.', category: 'E-commerce', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Internationaal e-commerce platform met seizoenspieken. Google Ads en Meta Ads optimalisatie high impact.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking", "Automation"], retainer_potential: 4000, match_score: 8, priority: 'hot' },
  { id: 46, name: 'Invictus Games Foundation', website: 'https://www.invictusgamesfoundation.org', description: 'Non-profit voor gewonde veteranen met merchandise webshop.', category: 'E-commerce', location: 'Den Haag', size: '20-50 werknemers', why_interesting: 'Sterk merk met donatie-driven model. Performance marketing voor fundraising en merchandise.', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3000, match_score: 6, priority: 'cold' },
  { id: 47, name: 'The Little Green Bag', website: 'https://www.thelittlegreenbag.nl', description: 'Online retailer voor tassen, portemonnees en accessoires.', category: 'E-commerce', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Gevestigde e-commerce speler met goede basis. Tracking en AI-optimalisatie kunnen grote stap voorwaarts zijn.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 48, name: 'Winkelstraat.nl', website: 'https://www.winkelstraat.nl', description: 'Online platform voor premium en designer fashion.', category: 'E-commerce', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Luxury fashion marketplace met hoge orderwaarde. Performance marketing optimalisatie zeer rendabel.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 49, name: 'Piet Hein Eek', website: 'https://www.pietheineek.nl', description: 'Nederlandse designer van meubels en interieurproducten uit sloophout.', category: 'E-commerce', location: 'Eindhoven', size: '50-100 werknemers', why_interesting: 'Premium design merk met hoge orderwaarde. SEO en Google Ads voor design-zoekopdrachten zeer relevant.', services: ["Google Ads", "SEO", "Meta Ads"], retainer_potential: 3000, match_score: 6, priority: 'cold' },
  { id: 50, name: 'Dille & Kamille', website: 'https://www.dfrllefrkamfrlle.nl', description: 'Winkels voor koken, bakken en wonen met sterke webshop.', category: 'E-commerce', location: 'Zeist', size: '200-500 werknemers', why_interesting: 'Geliefde retailer met groeiende e-commerce. Tracking, SEO en performance marketing optimalisatie kansrijk.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 5000, match_score: 7, priority: 'warm' },
  { id: 51, name: 'Sana Commerce', website: 'https://www.sana-commerce.com', description: 'B2B e-commerce platform geïntegreerd met ERP systemen.', category: 'B2B', location: 'Rotterdam', size: '200-500 werknemers', why_interesting: 'Groeiend SaaS bedrijf dat leadgeneratie nodig heeft. LinkedIn Ads en Google Ads voor B2B leads.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot", "Automation"], retainer_potential: 5000, match_score: 8, priority: 'hot' },
  { id: 52, name: 'Channable', website: 'https://www.channable.com', description: 'Feed management en PPC automatisering tool voor e-commerce.', category: 'B2B', location: 'Utrecht', size: '100-200 werknemers', why_interesting: 'SaaS bedrijf in e-commerce tooling. LinkedIn Ads en content marketing voor B2B leadgen perfect passend.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot", "Automation"], retainer_potential: 5000, match_score: 8, priority: 'hot' },
  { id: 53, name: 'Picnic', website: 'https://www.picnic.app', description: 'Online supermarkt met eigen bezorging en app-first aanpak.', category: 'B2B', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Snelgroeiend tech bedrijf met enorme marketing budgetten. Tracking en performance optimalisatie zeer relevant.', services: ["Meta Ads", "Google Ads", "Tracking", "SEO", "AI"], retainer_potential: 10000, match_score: 6, priority: 'cold' },
  { id: 54, name: 'Sendcloud', website: 'https://www.sendcloud.nl', description: 'Shipping automation platform voor e-commerce bedrijven.', category: 'B2B', location: 'Eindhoven', size: '200-500 werknemers', why_interesting: 'SaaS scaleup met internationale ambities. LinkedIn Ads, Google Ads en content marketing voor leadgen.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot", "Automation"], retainer_potential: 5000, match_score: 8, priority: 'hot' },
  { id: 55, name: 'Teamleader', website: 'https://www.teamleader.eu', description: 'CRM en projectmanagement software voor KMB.', category: 'B2B', location: 'Amsterdam', size: '200-500 werknemers', why_interesting: 'B2B SaaS met grote NL markt. Performance marketing en leadgen via LinkedIn en Google Ads zijn core.', services: ["LinkedIn Ads", "Google Ads", "SEO", "Automation"], retainer_potential: 5000, match_score: 7, priority: 'warm' },
  { id: 56, name: 'Mews', website: 'https://www.mews.com', description: 'Cloud-based hospitality platform voor hotels.', category: 'B2B', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Groeiend SaaS platform in hospitality. LinkedIn Ads en Google Ads voor B2B leadgeneratie.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 5000, match_score: 7, priority: 'warm' },
  { id: 57, name: 'Bynder', website: 'https://www.bynder.com', description: 'Digital asset management platform voor enterprise bedrijven.', category: 'B2B', location: 'Amsterdam', size: '200-500 werknemers', why_interesting: 'Enterprise SaaS met complexe B2B sales cycle. LinkedIn Ads en content marketing strategie kansrijk.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot", "Automation"], retainer_potential: 5000, match_score: 7, priority: 'warm' },
  { id: 58, name: 'Recruitee (Tellent)', website: 'https://www.recruitee.com', description: 'Collaborative hiring software platform.', category: 'B2B', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'HR-tech SaaS die sterk leunt op inbound marketing. SEO, LinkedIn Ads en Google Ads essentieel.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot", "Automation"], retainer_potential: 4000, match_score: 8, priority: 'hot' },
  { id: 59, name: 'Trengo', website: 'https://www.trengo.com', description: 'Omnichannel customer engagement platform.', category: 'B2B', location: 'Utrecht', size: '100-200 werknemers', why_interesting: 'SaaS scaleup in customer service tooling. Performance marketing en leadgen zijn key growth drivers.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot", "Automation"], retainer_potential: 4000, match_score: 8, priority: 'hot' },
  { id: 60, name: 'Hive.hr', website: 'https://www.hive.hr', description: 'Employee feedback en engagement platform.', category: 'B2B', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'HR-tech SaaS met groeiende NL presence. LinkedIn Ads voor HR decision makers perfect kanaal.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 61, name: 'Billink', website: 'https://www.billink.nl', description: 'Betaal-later oplossing voor webshops.', category: 'B2B', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Fintech/payments SaaS die webshops als klant heeft. LinkedIn Ads en Google Ads voor merchant acquisitie.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 62, name: 'Lightyear', website: 'https://www.lightyear.one', description: 'Elektrische auto met zonnepanelen, innovatief Nederlands techbedrijf.', category: 'B2B', location: 'Helmond', size: '200-500 werknemers', why_interesting: 'Innovatief techbedrijf met sterke branding needs. Digital marketing voor pre-orders en awareness.', services: ["Meta Ads", "Google Ads", "LinkedIn Ads", "SEO"], retainer_potential: 5000, match_score: 6, priority: 'cold' },
  { id: 63, name: 'Mollie', website: 'https://www.mollie.com', description: 'Payment service provider voor online bedrijven.', category: 'B2B', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Grote fintech scaleup. Hoewel ze intern veel doen, is er altijd ruimte voor specialistische tracking en AI.', services: ["LinkedIn Ads", "Google Ads", "SEO", "Tracking"], retainer_potential: 6000, match_score: 6, priority: 'cold' },
  { id: 64, name: 'Plek', website: 'https://www.plek.co', description: 'Sociaal intranet en interne communicatie platform.', category: 'B2B', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'B2B SaaS die LinkedIn Ads en content marketing nodig heeft voor leadgen bij HR/interne comm managers.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 65, name: 'Effectory', website: 'https://www.effectory.com', description: 'Employee feedback en medewerkersonderzoek platform.', category: 'B2B', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'Gevestigde B2B SaaS met internationale groeiambities. LinkedIn Ads en SEO voor thought leadership.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot", "Automation"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 66, name: 'Hulan', website: 'https://www.hulan.nl', description: 'AI-powered data platform voor bedrijfsinzichten.', category: 'B2B', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Data/AI startup die B2B leadgen nodig heeft. LinkedIn Ads en content marketing perfect passend.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 67, name: 'Speakap', website: 'https://www.speakap.com', description: 'Interne communicatie app voor deskless workers.', category: 'B2B', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'SaaS voor enterprise communicatie. LinkedIn Ads gericht op HR en interne comm decision makers.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 68, name: 'Nmbrs', website: 'https://www.nmbrs.com', description: 'Cloud-based HR en salarisadministratie software.', category: 'B2B', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'HR-tech SaaS met grote NL markt. Google Ads voor high-intent zoekwoorden en LinkedIn voor awareness.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 69, name: 'Informer Online', website: 'https://www.informer.nl', description: 'Online boekhoudprogramma voor ZZP\'ers en MKB.', category: 'B2B', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Fintech/SaaS met grote SME doelgroep. Google Ads en SEO voor boekhouding-gerelateerde zoektermen zeer effectief.', services: ["Google Ads", "SEO", "Meta Ads", "Automation"], retainer_potential: 4000, match_score: 8, priority: 'hot' },
  { id: 70, name: 'Bizcuit', website: 'https://www.bizcuit.nl', description: 'Financieel inzicht app die bankrekeningen koppelt aan boekhouding.', category: 'B2B', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Fintech startup met B2B focus. Google Ads en LinkedIn Ads voor accountants en ondernemers.', services: ["Google Ads", "LinkedIn Ads", "SEO", "HubSpot"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 71, name: 'Signicat', website: 'https://www.signicat.com', description: 'Digitale identiteit en authenticatie oplossingen.', category: 'B2B', location: 'Amsterdam', size: '200-500 werknemers', why_interesting: 'Enterprise SaaS in identity/security. LinkedIn Ads voor C-level decision makers en Google Ads voor solutions.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 5000, match_score: 7, priority: 'warm' },
  { id: 72, name: 'Crobox', website: 'https://www.crobox.com', description: 'Product discovery platform met AI-gedreven personalisatie voor e-commerce.', category: 'B2B', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'E-commerce SaaS startup. LinkedIn Ads voor e-commerce managers en Google Ads voor product discovery.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 73, name: 'Helloprint', website: 'https://www.helloprint.nl', description: 'Online drukwerk platform voor bedrijven en consumenten.', category: 'B2B', location: 'Rotterdam', size: '100-200 werknemers', why_interesting: 'E-commerce platform voor drukwerk. Google Ads en SEO zijn primaire acquisitiekanalen met hoge intent.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 74, name: 'Wercker (Oracle)', website: 'https://www.oracle.com', description: 'Container-native CI/CD platform (nu onderdeel van Oracle).', category: 'B2B', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Developer tools met B2B marketing needs. Google Ads en LinkedIn Ads voor DevOps doelgroep.', services: ["LinkedIn Ads", "Google Ads", "SEO"], retainer_potential: 3000, match_score: 6, priority: 'cold' },
  { id: 75, name: 'Messagebird (Bird)', website: 'https://www.bird.com', description: 'Omnichannel communicatie platform voor bedrijven.', category: 'B2B', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Grote tech scaleup met internationaal marketingbudget. Gespecialiseerde tracking en AI-optimalisatie waardevol.', services: ["LinkedIn Ads", "Google Ads", "SEO", "Tracking"], retainer_potential: 6000, match_score: 6, priority: 'cold' },
  { id: 76, name: 'Buckaroo', website: 'https://www.buckaroo.nl', description: 'Payment service provider voor online en offline betalingen.', category: 'B2B', location: 'Utrecht', size: '50-100 werknemers', why_interesting: 'Payments SaaS die nieuwe merchants wil aantrekken. Google Ads en LinkedIn Ads voor merchant acquisitie.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 77, name: 'Five Degrees', website: 'https://www.fivedegrees.nl', description: 'Core banking platform voor banken en financiële instellingen.', category: 'B2B', location: 'Breukelen', size: '50-100 werknemers', why_interesting: 'Fintech SaaS met niche B2B doelgroep. LinkedIn Ads en thought leadership content essentieel.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 78, name: 'Declaree', website: 'https://www.declaree.com', description: 'Expense management software voor bedrijven.', category: 'B2B', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'B2B SaaS startup die leadgen via Google Ads en LinkedIn Ads nodig heeft om te groeien.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 79, name: 'Factris', website: 'https://www.factris.com', description: 'Factoring platform voor MKB bedrijven.', category: 'B2B', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Fintech in factoring voor MKB. Google Ads voor high-intent zoektermen en LinkedIn voor beslissers.', services: ["Google Ads", "LinkedIn Ads", "SEO", "HubSpot"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 80, name: 'Cobase', website: 'https://www.cobase.com', description: 'Multibank platform voor treasury en cash management.', category: 'B2B', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Fintech SaaS voor enterprise treasury. LinkedIn Ads voor CFO\'s en treasury managers.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 81, name: 'Sir Hotels', website: 'https://www.sirhotels.com', description: 'Boutique hotel groep met karakteristieke locaties in Nederlandse steden.', category: 'Hospitality', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'Premium boutique hotel keten. Google Ads en Meta Ads voor direct bookings in plaats van OTA afhankelijkheid.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 4000, match_score: 8, priority: 'hot' },
  { id: 82, name: 'citizenM Hotels', website: 'https://www.citizenm.com', description: 'Moderne hotel keten gericht op tech-savvy reizigers.', category: 'Hospitality', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Innovatieve hotelketen met sterke digital DNA. Tracking en performance marketing voor direct bookings.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking", "Automation"], retainer_potential: 8000, match_score: 7, priority: 'warm' },
  { id: 83, name: 'Conscious Hotels', website: 'https://www.conscioushotels.com', description: 'Duurzame hotel groep in Amsterdam.', category: 'Hospitality', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Groeiende duurzame hotelketen. SEO op duurzaam reizen en Google Ads voor direct bookings.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 3500, match_score: 8, priority: 'hot' },
  { id: 84, name: 'Hotel V', website: 'https://www.hotelv.nl', description: 'Boutique hotel groep met meerdere locaties in Amsterdam.', category: 'Hospitality', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Lokale boutique hotels die direct bookings willen verhogen t.o.v. Booking.com dependency.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 85, name: 'Bastion Hotels', website: 'https://www.bastionhotels.nl', description: 'Nederlandse hotelketen met 30+ locaties in Nederland en België.', category: 'Hospitality', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Grote keten met veel locaties. Nationale Google Ads campagnes en lokale SEO voor elke locatie.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 5000, match_score: 7, priority: 'warm' },
  { id: 86, name: 'TUI Nederland', website: 'https://www.tui.nl', description: 'Grootste touroperator van Nederland voor vakantiereizen.', category: 'Hospitality', location: 'Rijswijk', size: '500+ werknemers', why_interesting: 'Enorm marketingbudget. Zelfs kleine tracking/AI optimalisatie levert miljoenen op bij dit volume.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking", "AI"], retainer_potential: 10000, match_score: 6, priority: 'cold' },
  { id: 87, name: 'Tinkerbell', website: 'https://www.tinkerbell.travel', description: 'Online reisbureau gespecialiseerd in luxe en op-maat vakanties.', category: 'Hospitality', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Hoge orderwaarde maakt performance marketing zeer rendabel. Google Ads en SEO zijn key.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 3500, match_score: 8, priority: 'hot' },
  { id: 88, name: 'GetYourGuide NL', website: 'https://www.getyourguide.nl', description: 'Platform voor tours en activiteiten boekingen.', category: 'Hospitality', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'Groot platform met performance marketing als core. Vergelijkbaar met Tours & Tickets (bestaande klant).', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 5000, match_score: 7, priority: 'warm' },
  { id: 89, name: 'Landal GreenParks', website: 'https://www.landal.nl', description: 'Vakantieparken keten met online boekingsplatform.', category: 'Hospitality', location: 'De Meern', size: '500+ werknemers', why_interesting: 'Groot leisure merk met significant online marketing budget. Performance en tracking optimalisatie waardevol.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 6000, match_score: 6, priority: 'cold' },
  { id: 90, name: 'Restaurant Lastage', website: 'https://www.restaurantlastage.nl', description: 'Fine dining restaurant in Amsterdam met Michelin ster.', category: 'Hospitality', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Premium horeca die online zichtbaarheid en reserveringen wil verhogen. SEO en lokale ads.', services: ["SEO", "Google Ads", "Meta Ads"], retainer_potential: 2000, match_score: 6, priority: 'cold' },
  { id: 91, name: 'The Dylan Amsterdam', website: 'https://www.dylanamsterdam.com', description: 'Luxe 5-sterren boutique hotel aan de Keizersgracht.', category: 'Hospitality', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Luxe hotel met hoge kamerprijs. Google Ads en SEO voor direct bookings hebben hoge ROI.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 92, name: 'Corendon Hotels', website: 'https://www.corendonhotels.com', description: 'Hotel en reisorganisatie met meerdere hotels in Amsterdam.', category: 'Hospitality', location: 'Amsterdam', size: '200-500 werknemers', why_interesting: 'Groeiende hotelketen die direct bookings wil verhogen. Performance marketing en tracking essentieel.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 93, name: 'Mokum Events', website: 'https://www.mokumevents.nl', description: 'Evenementenbureau voor bedrijfsuitjes en teambuilding in Amsterdam.', category: 'Hospitality', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'B2B events bedrijf dat online leadgeneratie nodig heeft. Google Ads en SEO voor high-intent zoekwoorden.', services: ["Google Ads", "SEO", "LinkedIn Ads", "Meta Ads"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 94, name: 'WestCord Hotels', website: 'https://www.westcordhotels.nl', description: 'Nederlandse hotelketen met 20+ hotels op toplocaties.', category: 'Hospitality', location: 'Amsterdam', size: '200-500 werknemers', why_interesting: 'Middelgrote keten die concurreert met OTA\'s. Direct booking strategie via performance marketing.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 95, name: 'Citytrip.com', website: 'https://www.citytrip.com', description: 'Online travel platform voor stedentripjes in Europa.', category: 'Hospitality', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Travel e-commerce met seizoensgebonden pieken. Google Ads en Meta Ads optimalisatie direct rendabel.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 96, name: 'Yays Concierged Boutique Apartments', website: 'https://www.yfrys.com', description: 'Boutique serviced apartments in Amsterdam en andere steden.', category: 'Hospitality', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Premium short-stay concept. Direct bookings via Google Ads en SEO om OTA-kosten te verlagen.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 97, name: 'Volkshotel', website: 'https://www.volkshotel.nl', description: 'Creatief hotel met co-working space en evenementen.', category: 'Hospitality', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Uniek hotel concept met diverse revenue streams. Multi-channel marketing strategie passend.', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3000, match_score: 6, priority: 'cold' },
  { id: 98, name: 'NDSM Wharf', website: 'https://www.ndsm.nl', description: 'Creatieve hotspot met evenementen, horeca en culturele activiteiten.', category: 'Hospitality', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Culturele evenementenlocatie die digitale marketing nodig heeft voor ticketverkoop en awareness.', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 2500, match_score: 6, priority: 'cold' },
  { id: 99, name: 'Sunweb', website: 'https://www.sunweb.nl', description: 'Online touroperator voor wintersport en zomervakanties.', category: 'Hospitality', location: 'Rotterdam', size: '200-500 werknemers', why_interesting: 'Groot online reismerk met significant ad budget. Performance marketing en tracking optimalisatie waardevol.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 6000, match_score: 7, priority: 'warm' },
  { id: 100, name: 'Funky Fish Hostels', website: 'https://www.funkyfishhostels.com', description: 'Budget-friendly hostel keten voor jonge reizigers.', category: 'Hospitality', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Hostel gericht op jong publiek. Meta Ads en TikTok Ads perfect voor doelgroep bereik.', services: ["Meta Ads", "TikTok Ads", "Google Ads", "SEO"], retainer_potential: 2500, match_score: 6, priority: 'cold' },
  { id: 101, name: 'VON POLL REAL ESTATE', website: 'https://www.vonpoll.com', description: 'Premium makelaardij met focus op luxe woningen in Amsterdam.', category: 'Vastgoed', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Premium makelaar met hoge commissies. Google Ads en SEO voor woningzoekers, LinkedIn voor verkopers.', services: ["Google Ads", "SEO", "LinkedIn Ads", "Meta Ads"], retainer_potential: 3500, match_score: 8, priority: 'hot' },
  { id: 102, name: 'Broersma Wonen', website: 'https://www.broersmawonen.nl', description: 'Makelaarskantoor gespecialiseerd in Amsterdam Zuid en Oud-Zuid.', category: 'Vastgoed', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Groot makelaarskantoor in premium segment. Digital marketing voor lead generation en branding.', services: ["Google Ads", "SEO", "Meta Ads", "LinkedIn Ads"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 103, name: 'Hallie & Van Klooster', website: 'https://www.hallievanklooster.nl', description: 'Makelaarskantoor in Amsterdam West met sterke lokale positie.', category: 'Vastgoed', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Lokale makelaar die online zichtbaarheid wil vergroten. Google Ads en lokale SEO zeer effectief.', services: ["Google Ads", "SEO", "Meta Ads"], retainer_potential: 2500, match_score: 7, priority: 'warm' },
  { id: 104, name: 'Heeren Makelaars', website: 'https://www.heerenmakelaars.nl', description: 'Gerenommeerd makelaarskantoor in Amsterdam Zuid.', category: 'Vastgoed', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Premium makelaar met hoge ratings. Digitale marketing voor meer leads en merkbekendheid.', services: ["Google Ads", "SEO", "Meta Ads"], retainer_potential: 2500, match_score: 7, priority: 'warm' },
  { id: 105, name: 'AM (Koninklijke BAM)', website: 'https://www.am.nl', description: 'Grote projectontwikkelaar voor woningbouw en gebiedsontwikkeling.', category: 'Vastgoed', location: 'Utrecht', size: '500+ werknemers', why_interesting: 'Grote ontwikkelaar die digital marketing nodig heeft voor nieuwbouwprojecten. Lead generation cruciaal.', services: ["Google Ads", "Meta Ads", "SEO", "LinkedIn Ads", "Tracking"], retainer_potential: 5000, match_score: 7, priority: 'warm' },
  { id: 106, name: 'BPD (Bouwfonds Property Development)', website: 'https://www.bfrfrfrfrd.nl', description: 'Grootste gebiedsontwikkelaar van Nederland.', category: 'Vastgoed', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Marktleider in gebiedsontwikkeling. Digital marketing voor vastgoedprojecten met hoge waarde.', services: ["Google Ads", "Meta Ads", "SEO", "LinkedIn Ads", "Tracking"], retainer_potential: 6000, match_score: 7, priority: 'warm' },
  { id: 107, name: 'CBRE NL', website: 'https://www.cbre.nl', description: 'Internationaal vastgoedadviesbureau met sterke NL presence.', category: 'Vastgoed', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Groot vastgoedbedrijf met complexe B2B marketing. LinkedIn Ads en content marketing voor lead gen.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 5000, match_score: 6, priority: 'cold' },
  { id: 108, name: 'Holland2Stay', website: 'https://www.holland2stay.com', description: 'Vastgoedbeheerder gespecialiseerd in expat woningen.', category: 'Vastgoed', location: 'Eindhoven', size: '100-200 werknemers', why_interesting: 'Niche vastgoed voor expats. Google Ads en SEO in het Engels voor internationale doelgroep.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 3500, match_score: 8, priority: 'hot' },
  { id: 109, name: 'Vesteda', website: 'https://www.vesteda.com', description: 'Grote woningbelegger met huurwoningen in heel Nederland.', category: 'Vastgoed', location: 'Amsterdam', size: '200-500 werknemers', why_interesting: 'Groot vastgoedfonds dat huurders wil bereiken. Google Ads en SEO voor woningzoekers.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 110, name: 'Greystar NL', website: 'https://www.greystar.com/nl', description: 'Internationale studentenhuisvesting en multifamily operator.', category: 'Vastgoed', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'Student housing met jonge doelgroep. Social media advertising en SEO voor studentenwoningen.', services: ["Meta Ads", "Google Ads", "SEO", "TikTok Ads"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 111, name: 'Your Home Makelaars', website: 'https://www.yourhome.nl', description: 'Makelaardij in Amsterdam met focus op persoonlijke service.', category: 'Vastgoed', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Groeiend makelaarskantoor dat digitale acquisitie wil versterken. Vergelijkbaar met Unity Units klant.', services: ["Google Ads", "SEO", "Meta Ads"], retainer_potential: 2500, match_score: 7, priority: 'warm' },
  { id: 112, name: 'Ramón Mossel Makelaardij', website: 'https://www.ramonmossel.nl', description: 'Makelaarskantoor in Amsterdam Buitenveldert en omgeving.', category: 'Vastgoed', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Lokale makelaar met behoefte aan betere online zichtbaarheid. Google Ads en SEO kansrijk.', services: ["Google Ads", "SEO", "Meta Ads"], retainer_potential: 2500, match_score: 6, priority: 'cold' },
  { id: 113, name: 'Bouwinvest', website: 'https://www.bouwinvest.nl', description: 'Vastgoedbelegger voor pensioenfondsen met groot NL portfolio.', category: 'Vastgoed', location: 'Amsterdam', size: '200-500 werknemers', why_interesting: 'Grote vastgoedbelegger die digital marketing nodig heeft voor huurders en investeerders.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 4000, match_score: 6, priority: 'cold' },
  { id: 114, name: 'Van der Linden Makelaars', website: 'https://www.vanderlindenmakelaars.nl', description: 'Makelaarskantoor actief in de Randstad.', category: 'Vastgoed', location: 'Den Haag', size: '10-20 werknemers', why_interesting: 'Regionale makelaar die online marketing wil professionaliseren. Lokale SEO en Google Ads.', services: ["Google Ads", "SEO", "Meta Ads"], retainer_potential: 2500, match_score: 6, priority: 'cold' },
  { id: 115, name: 'Synchroon', website: 'https://www.synchroon.nl', description: 'Gebiedsontwikkelaar met focus op duurzame projecten.', category: 'Vastgoed', location: 'Utrecht', size: '50-100 werknemers', why_interesting: 'Duurzame ontwikkelaar die marketing nodig heeft voor nieuwbouwprojecten. Google Ads en SEO.', services: ["Google Ads", "SEO", "Meta Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 116, name: 'YoungCapital', website: 'https://www.youngcapital.nl', description: 'Uitzendbureau gespecialiseerd in jong talent en studenten.', category: 'Recruitment', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Groot uitzendbureau met sterke online presence. Performance marketing voor kandidaat- en opdrachtgever acquisitie.', services: ["Google Ads", "Meta Ads", "TikTok Ads", "SEO", "Tracking"], retainer_potential: 5000, match_score: 8, priority: 'hot' },
  { id: 117, name: 'Hays Nederland', website: 'https://www.hays.nl', description: 'Internationaal recruitment bureau voor professionals.', category: 'Recruitment', location: 'Amsterdam', size: '200-500 werknemers', why_interesting: 'Groot bureau dat online leadgeneratie nodig heeft voor zowel kandidaten als opdrachtgevers.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 5000, match_score: 7, priority: 'warm' },
  { id: 118, name: 'Undutchables', website: 'https://www.undutchables.nl', description: 'Recruitment bureau gespecialiseerd in meertalig talent in Nederland.', category: 'Recruitment', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Niche recruiter voor internationals. LinkedIn Ads en Google Ads voor kandidaat acquisitie.', services: ["LinkedIn Ads", "Google Ads", "SEO", "Meta Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 119, name: 'Brunel', website: 'https://www.brunel.nl', description: 'Internationale detacheerder en recruitment specialist.', category: 'Recruitment', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Grote detacheerder met significant marketingbudget. Performance marketing en SEO voor specialistisch talent.', services: ["Google Ads", "LinkedIn Ads", "SEO", "Tracking"], retainer_potential: 5000, match_score: 7, priority: 'warm' },
  { id: 120, name: 'Velde Groep', website: 'https://www.veldegroep.nl', description: 'Technisch uitzendbureau voor bouw en industrie.', category: 'Recruitment', location: 'Rotterdam', size: '100-200 werknemers', why_interesting: 'Niche uitzendbureau in technische sector. Google Ads en LinkedIn Ads voor kandidaat werving.', services: ["Google Ads", "LinkedIn Ads", "SEO", "Meta Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 121, name: 'Yacht (Randstad)', website: 'https://www.yacht.nl', description: 'Detachering van professionals op HBO+ niveau.', category: 'Recruitment', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Groot detacheringsbureau. Digital marketing voor specialistisch talent werving op scale.', services: ["Google Ads", "LinkedIn Ads", "SEO", "Meta Ads"], retainer_potential: 5000, match_score: 6, priority: 'cold' },
  { id: 122, name: 'Olympia Uitzendbureau', website: 'https://www.olympia.nl', description: 'Landelijk uitzendbureau met focus op flexwerk.', category: 'Recruitment', location: 'Groningen', size: '200-500 werknemers', why_interesting: 'Groot uitzendbureau dat online marketing voor kandidaat werving wil optimaliseren.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 123, name: 'Progressive Recruitment', website: 'https://www.progressiverecruitment.com/nl', description: 'Recruitment bureau voor techniek en engineering professionals.', category: 'Recruitment', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'Niche recruiter met internationale scope. LinkedIn Ads en Google Ads voor engineering talent.', services: ["LinkedIn Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 124, name: 'Strictly People', website: 'https://www.strictlypeople.nl', description: 'Recruitment bureau voor marketing en communicatie professionals.', category: 'Recruitment', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Marketing recruitment niche. LinkedIn Ads en SEO voor marketing professionals bereiken.', services: ["LinkedIn Ads", "Google Ads", "SEO"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 125, name: 'Binternagel', website: 'https://www.binternagel.nl', description: 'IT recruitment en detachering specialist.', category: 'Recruitment', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'IT recruitment niche met hoge plaatsingswaarde. Performance marketing voor IT talent werving.', services: ["LinkedIn Ads", "Google Ads", "SEO", "Meta Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 126, name: 'Robert Walters NL', website: 'https://www.robertwalters.nl', description: 'Internationaal recruitment bureau voor professionals.', category: 'Recruitment', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'Premium recruiter die online leadgeneratie voor zowel kandidaten als klanten nodig heeft.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 127, name: 'Magnet.me', website: 'https://www.magnet.me', description: 'Platform dat starters en young professionals verbindt met werkgevers.', category: 'Recruitment', location: 'Rotterdam', size: '50-100 werknemers', why_interesting: 'HR-tech platform met B2B en B2C marketing needs. Performance marketing voor beide zijden van het platform.', services: ["Meta Ads", "Google Ads", "LinkedIn Ads", "SEO", "Tracking"], retainer_potential: 4000, match_score: 8, priority: 'hot' },
  { id: 128, name: 'Cooble', website: 'https://www.cooble.nl', description: 'Online recruitment platform voor horeca personeel.', category: 'Recruitment', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Niche recruitment platform. Google Ads en Meta Ads voor kandidaat werving in horeca sector.', services: ["Google Ads", "Meta Ads", "SEO"], retainer_potential: 2500, match_score: 6, priority: 'cold' },
  { id: 129, name: 'Solid Professionals', website: 'https://www.solidprofessionals.nl', description: 'Detachering van finance en IT professionals.', category: 'Recruitment', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'Premium detacheerder met hoge plaatsingswaarde. LinkedIn Ads voor kandidaten en decision makers.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 130, name: 'VanBerkel Professionals', website: 'https://www.vanberkelprofessionals.nl', description: 'Uitzendbureau voor logistiek en technisch personeel.', category: 'Recruitment', location: 'Utrecht', size: '50-100 werknemers', why_interesting: 'Groeiend uitzendbureau dat online marketing wil professionaliseren voor kandidaat en klant werving.', services: ["Google Ads", "Meta Ads", "LinkedIn Ads", "SEO"], retainer_potential: 3000, match_score: 6, priority: 'cold' },
  { id: 131, name: 'FINOM', website: 'https://www.finom.co', description: 'Digitale zakelijke bankrekening en factuurplatform voor ondernemers.', category: 'Finance', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'Snelgroeiende fintech die klantacquisitie via performance marketing doet. Google Ads en SEO cruciaal.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking", "Automation"], retainer_potential: 5000, match_score: 8, priority: 'hot' },
  { id: 132, name: 'Adyen', website: 'https://www.adyen.com', description: 'Groot betalingsplatform voor enterprise bedrijven.', category: 'Finance', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Groot fintechbedrijf. LinkedIn Ads en content marketing voor enterprise leadgeneratie.', services: ["LinkedIn Ads", "Google Ads", "SEO"], retainer_potential: 8000, match_score: 6, priority: 'cold' },
  { id: 133, name: 'BUX', website: 'https://www.bux.com', description: 'Trading en beleggen app voor millennials en gen-z.', category: 'Finance', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'Fintech app met jonge doelgroep. Meta Ads, TikTok Ads en performance marketing essentieel voor groei.', services: ["Meta Ads", "TikTok Ads", "Google Ads", "SEO", "Tracking"], retainer_potential: 5000, match_score: 8, priority: 'hot' },
  { id: 134, name: 'Lender & Spender', website: 'https://www.lfrfrfrfrendfrfrfrfrer.nl', description: 'P2P lending platform voor consumenten en MKB.', category: 'Finance', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Fintech platform dat borrowers en investors moet aantrekken. Google Ads en SEO high-intent.', services: ["Google Ads", "SEO", "Meta Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 135, name: 'Knab', website: 'https://www.knab.nl', description: 'Online bank voor ondernemers en zzp\'ers.', category: 'Finance', location: 'Amsterdam', size: '200-500 werknemers', why_interesting: 'Digitale bank die klantacquisitie doet via Google Ads en content marketing. Performance optimalisatie waardevol.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 5000, match_score: 7, priority: 'warm' },
  { id: 136, name: 'Peaks', website: 'https://www.peaks.com', description: 'Micro-beleggen app die wisselgeld investeert.', category: 'Finance', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Fintech app met consumer focus. Social media advertising en app install campaigns essentieel.', services: ["Meta Ads", "TikTok Ads", "Google Ads", "SEO"], retainer_potential: 4000, match_score: 8, priority: 'hot' },
  { id: 137, name: 'Ohpen', website: 'https://www.ohpen.com', description: 'Cloud-native core banking platform.', category: 'Finance', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'B2B fintech die banking partners zoekt. LinkedIn Ads en content marketing voor enterprise decision makers.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 138, name: 'Alpian', website: 'https://www.alpian.com', description: 'Digital private banking platform met NL operations.', category: 'Finance', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Premium fintech met high-net-worth doelgroep. Google Ads en LinkedIn Ads voor acquisitie.', services: ["Google Ads", "LinkedIn Ads", "SEO", "Meta Ads"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 139, name: 'Nationale-Nederlanden', website: 'https://www.nn.nl', description: 'Grote verzekeraar en financieel dienstverlener.', category: 'Finance', location: 'Den Haag', size: '500+ werknemers', why_interesting: 'Groot merk met enorm marketingbudget. Tracking optimalisatie en AI-bidding bij dit volume zeer impactvol.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking", "AI"], retainer_potential: 10000, match_score: 6, priority: 'cold' },
  { id: 140, name: 'Independer', website: 'https://www.independer.nl', description: 'Vergelijkingssite voor verzekeringen, energie en financiën.', category: 'Finance', location: 'Amsterdam', size: '200-500 werknemers', why_interesting: 'Lead-generation platform. Performance marketing, tracking en AI-optimalisatie zijn core business.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking", "AI"], retainer_potential: 8000, match_score: 7, priority: 'warm' },
  { id: 141, name: 'Hypotheek.nl', website: 'https://www.hypotheek.nl', description: 'Online hypotheekadvies platform.', category: 'Finance', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Lead-driven model met hoge waarde per conversie. Google Ads en SEO optimalisatie zeer rendabel.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 4000, match_score: 8, priority: 'hot' },
  { id: 142, name: 'Fundion', website: 'https://www.fundion.nl', description: 'Crowdfunding platform voor vastgoed en ondernemingen.', category: 'Finance', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Fintech platform dat investeerders moet aantrekken. Google Ads en SEO voor crowdfunding zoekwoorden.', services: ["Google Ads", "SEO", "LinkedIn Ads", "Meta Ads"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 143, name: 'Briqwise', website: 'https://www.briqwise.com', description: 'Vastgoed crowdfunding en hypotheekplatform.', category: 'Finance', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Fintech in vastgoed financiering. Performance marketing voor investeerder acquisitie.', services: ["Google Ads", "SEO", "LinkedIn Ads", "Meta Ads"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 144, name: 'Minox Software', website: 'https://www.minox.nl', description: 'Online boekhoudprogramma voor accountants en ondernemers.', category: 'Finance', location: 'Waalwijk', size: '50-100 werknemers', why_interesting: 'SaaS accounting tool die competief moet adverteren. Google Ads en SEO voor boekhouding keywords.', services: ["Google Ads", "SEO", "LinkedIn Ads", "HubSpot"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 145, name: 'Conta', website: 'https://www.conta.nl', description: 'Online accounting en belastingaangifte platform.', category: 'Finance', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Groeiende fintech met seizoenspieken (belastingaangifte). Google Ads en SEO essentieel.', services: ["Google Ads", "SEO", "Meta Ads"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 146, name: 'Patchs', website: 'https://www.patchs.nl', description: 'Natuurlijke pleisters en supplementen met DTC webshop.', category: 'Health', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Innovatief health brand met DTC model. Meta Ads en Google Ads voor productverkoop.', services: ["Meta Ads", "Google Ads", "SEO", "TikTok Ads"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 147, name: 'Fittleclub', website: 'https://www.fittleclub.nl', description: 'Online fitness en personal training platform.', category: 'Health', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Online fitness platform met subscription model. Performance marketing voor subscriber acquisitie.', services: ["Meta Ads", "Google Ads", "TikTok Ads", "SEO"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 148, name: 'Equi', website: 'https://www.equi.nl', description: 'Premium voedingssupplementen met wetenschappelijke onderbouwing.', category: 'Health', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Premium supplement merk met DTC focus. Meta Ads en Google Ads voor gezondheidszoekwoorden.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 149, name: 'Vinami', website: 'https://www.vinami.nl', description: 'Online platform voor functionele supplementen en vitamines.', category: 'Health', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Groeiend supplementenmerk. Performance marketing en SEO voor health keywords.', services: ["Google Ads", "SEO", "Meta Ads"], retainer_potential: 2500, match_score: 6, priority: 'cold' },
  { id: 150, name: 'Hims & Hers NL', website: 'https://www.forhims.nl', description: 'Telehealth en DTC wellness producten voor mannen en vrouwen.', category: 'Health', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Internationaal health DTC merk met NL operations. Performance marketing voor patient acquisitie.', services: ["Meta Ads", "Google Ads", "SEO", "TikTok Ads", "Tracking"], retainer_potential: 5000, match_score: 8, priority: 'hot' },
  { id: 151, name: 'Bloomergy', website: 'https://www.bloomergy.nl', description: 'Adaptogene supplementen en wellnessproducten.', category: 'Health', location: 'Amsterdam', size: '5-10 werknemers', why_interesting: 'Opkomend wellness merk in trending categorie. Meta Ads en TikTok Ads voor awareness en verkoop.', services: ["Meta Ads", "TikTok Ads", "Google Ads", "SEO"], retainer_potential: 2500, match_score: 7, priority: 'warm' },
  { id: 152, name: 'Kry / Livi NL', website: 'https://www.kry.se/nl', description: 'Digitale huisartsenpraktijk en telehealth platform.', category: 'Health', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Digital health platform dat patiënten moet aantrekken. Google Ads en SEO voor medische zoekwoorden.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 153, name: 'Moovd', website: 'https://www.moovd.com', description: 'Digital mental health platform met VR therapie.', category: 'Health', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Innovatieve mental health tech. B2B marketing via LinkedIn Ads voor GGZ instellingen.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 154, name: 'Treatwell', website: 'https://www.treatwell.nl', description: 'Online boekingsplatform voor beauty en wellness behandelingen.', category: 'Health', location: 'Amsterdam', size: '200-500 werknemers', why_interesting: 'Groot marketplace platform. Performance marketing voor zowel consumenten als beauty professionals.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking", "Automation"], retainer_potential: 6000, match_score: 7, priority: 'warm' },
  { id: 155, name: 'Rocycle', website: 'https://www.rocycle.com', description: 'Premium indoor cycling studio\'s in Amsterdam.', category: 'Health', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Premium fitness concept met lokale marketing needs. Meta Ads en Google Ads voor lid acquisitie.', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 156, name: 'Body & Fit', website: 'https://www.bodyandfit.com', description: 'Online shop voor sportvoeding, supplementen en gezonde voeding.', category: 'Health', location: 'Heerenveen', size: '200-500 werknemers', why_interesting: 'Grote e-commerce speler in health/fitness. Performance marketing en tracking optimalisatie zeer waardevol.', services: ["Google Ads", "Meta Ads", "SEO", "Tracking", "Automation"], retainer_potential: 6000, match_score: 8, priority: 'hot' },
  { id: 157, name: 'Vital10', website: 'https://www.vital10.nl', description: 'Premium supplementen en vitamines webshop.', category: 'Health', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Supplement DTC met recurring revenue. Google Ads en SEO voor gezondheidszoekwoorden essentieel.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 158, name: 'Minddistrict', website: 'https://www.minddistrict.com', description: 'E-health platform voor mentale gezondheid en preventie.', category: 'Health', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'B2B health-tech dat GGZ instellingen als klant heeft. LinkedIn Ads en content marketing.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 159, name: 'Cloudwise', website: 'https://www.cloudwise.nl', description: 'E-health platform voor vitaliteit en verzuimpreventie.', category: 'Health', location: 'Den Haag', size: '50-100 werknemers', why_interesting: 'B2B health platform dat werkgevers bereikt. LinkedIn Ads en Google Ads voor HR decision makers.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 160, name: 'Matthi Forrer Clinics', website: 'https://www.matthiforrer.nl', description: 'Cosmetische klinieken voor huidverbetering en anti-aging.', category: 'Health', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Premium kliniek met hoge behandelwaarde. Meta Ads en Google Ads voor leadgeneratie zeer rendabel.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking"], retainer_potential: 3500, match_score: 8, priority: 'hot' },
  { id: 161, name: 'Studyportals', website: 'https://www.studyportals.com', description: 'Internationaal platform voor het zoeken en vergelijken van opleidingen.', category: 'Education', location: 'Eindhoven', size: '100-200 werknemers', why_interesting: 'Ed-tech platform met B2B en B2C marketing. Google Ads voor studenten en LinkedIn voor universiteiten.', services: ["Google Ads", "LinkedIn Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 5000, match_score: 8, priority: 'hot' },
  { id: 162, name: 'Springest', website: 'https://www.springest.nl', description: 'Vergelijkingsplatform voor opleidingen en trainingen.', category: 'Education', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Lead-generation platform voor opleidingen. Google Ads en SEO zijn primaire acquisitiekanalen.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 163, name: 'Studytube', website: 'https://www.studytube.nl', description: 'Online learning management platform voor bedrijven.', category: 'Education', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'B2B SaaS in learning & development. LinkedIn Ads voor HR/L&D beslissers essentieel.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 4000, match_score: 8, priority: 'hot' },
  { id: 164, name: 'GoodHabitz', website: 'https://www.goodhabitz.com', description: 'Online trainingen en e-learning platform voor bedrijven.', category: 'Education', location: 'Eindhoven', size: '200-500 werknemers', why_interesting: 'Snelgroeiend L&D platform. LinkedIn Ads en Google Ads voor B2B leadgeneratie bij HR managers.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot", "Automation"], retainer_potential: 5000, match_score: 8, priority: 'hot' },
  { id: 165, name: 'Lepaya', website: 'https://www.lepaya.com', description: 'Power skills training platform voor professionals.', category: 'Education', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'B2B education tech scaleup. LinkedIn Ads en content marketing voor L&D decision makers.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 4000, match_score: 8, priority: 'hot' },
  { id: 166, name: 'NCOI Opleidingsgroep', website: 'https://www.ncoi.nl', description: 'Grootste particuliere opleider van Nederland.', category: 'Education', location: 'Hilversum', size: '500+ werknemers', why_interesting: 'Marktleider met groot marketingbudget. Google Ads en SEO optimalisatie bij dit volume zeer impactvol.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking", "Automation"], retainer_potential: 8000, match_score: 7, priority: 'warm' },
  { id: 167, name: 'Schoevers', website: 'https://www.schoevers.nl', description: 'Opleidingsinstituut voor secretarieel en office management.', category: 'Education', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'Gevestigd opleidingsinstituut met online groeiambitie. Google Ads en SEO voor opleidingszoekwoorden.', services: ["Google Ads", "SEO", "Meta Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 168, name: 'Qlick', website: 'https://www.qlick.nl', description: 'Online platform voor bijles en huiswerkbegeleiding.', category: 'Education', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Ed-tech platform dat ouders en studenten bereikt. Meta Ads en Google Ads voor leadgen.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 169, name: 'Winc Academy', website: 'https://www.wincacademy.nl', description: 'Online tech bootcamp voor web development en data science.', category: 'Education', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Tech education met hoge cursusprijzen. Performance marketing en SEO voor carrière-switchers.', services: ["Google Ads", "Meta Ads", "SEO", "LinkedIn Ads"], retainer_potential: 3500, match_score: 8, priority: 'hot' },
  { id: 170, name: 'Masterplan.com', website: 'https://www.masterplan.com', description: 'E-learning platform met interactieve cursussen voor bedrijven.', category: 'Education', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'B2B e-learning platform. LinkedIn Ads en Google Ads voor HR/L&D professionals.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 171, name: 'Athlon (Lease)', website: 'https://www.athlon.com', description: 'Internationale lease en fleet management provider.', category: 'Auto', location: 'Almere', size: '500+ werknemers', why_interesting: 'Groot leasebedrijf met B2B en B2C marketing. Google Ads en LinkedIn Ads voor lease leads.', services: ["Google Ads", "LinkedIn Ads", "SEO", "Tracking"], retainer_potential: 6000, match_score: 7, priority: 'warm' },
  { id: 172, name: 'Justlease', website: 'https://www.justlease.nl', description: 'Online private lease platform voor particulieren.', category: 'Auto', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Online-first lease bedrijf. Google Ads en SEO voor lease zoekwoorden zijn primaire groeimotor.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 4000, match_score: 8, priority: 'hot' },
  { id: 173, name: 'Louwman', website: 'https://www.louwman.nl', description: 'Grote autodealergroep met meerdere merken (Toyota, Lexus, etc).', category: 'Auto', location: 'Utrecht', size: '500+ werknemers', why_interesting: 'Groot dealer netwerk met lokale marketing needs. Google Ads en lokale SEO per vestiging.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 6000, match_score: 7, priority: 'warm' },
  { id: 174, name: 'VanMoof (opvolger)', website: 'https://www.vanmoof.com', description: 'Iconisch e-bike merk dat herstart na faillissement.', category: 'Auto', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Herstarting merk met grote naamsbekendheid. Performance marketing voor comeback campagne.', services: ["Meta Ads", "Google Ads", "SEO", "TikTok Ads"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 175, name: 'Felyx', website: 'https://www.felyx.com', description: 'Elektrische deelscooter service in Nederlandse steden.', category: 'Auto', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Mobility startup met app-based model. Performance marketing voor nieuwe gebruikers acquisitie.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 176, name: 'AutoTrack', website: 'https://www.autotrack.nl', description: 'Online platform voor occasions kopen en verkopen.', category: 'Auto', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Auto marketplace met performance marketing als core. Google Ads en SEO optimalisatie cruciaal.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 5000, match_score: 7, priority: 'warm' },
  { id: 177, name: 'Snappcar', website: 'https://www.snappcar.nl', description: 'Platform voor auto delen tussen particulieren.', category: 'Auto', location: 'Utrecht', size: '20-50 werknemers', why_interesting: 'Mobility sharing platform. Meta Ads en Google Ads voor gebruiker acquisitie aan beide zijden.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 178, name: 'MyWheels', website: 'https://www.mywheels.nl', description: 'Autodeel platform met eigen en particuliere auto\'s.', category: 'Auto', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Groeiend deelplatform. Performance marketing voor lid acquisitie en awareness.', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 179, name: 'Mobility Service', website: 'https://www.msautomotive.nl', description: 'Fleet management en wagenparkbeheer voor bedrijven.', category: 'Auto', location: 'Urmond', size: '200-500 werknemers', why_interesting: 'B2B fleet management. LinkedIn Ads en Google Ads voor fleet managers.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 4000, match_score: 6, priority: 'cold' },
  { id: 180, name: 'Carsom', website: 'https://www.carsom.nl', description: 'Online platform voor auto onderhoud en APK boekingen.', category: 'Auto', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Auto services marketplace. Google Ads en SEO voor high-intent zoektermen.', services: ["Google Ads", "SEO", "Meta Ads"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 181, name: 'NautaDutilh', website: 'https://www.nautadutilh.com', description: 'Top advocatenkantoor in de Benelux.', category: 'Professional', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Groot kantoor dat online thought leadership wil versterken.', services: ["LinkedIn Ads", "SEO", "Google Ads"], retainer_potential: 5000, match_score: 6, priority: 'cold' },
  { id: 182, name: 'Kennedy Van der Laan', website: 'https://www.kvdl.com', description: 'Innovatief advocatenkantoor met tech focus.', category: 'Professional', location: 'Amsterdam', size: '200-500 werknemers', why_interesting: 'Tech-forward advocatenkantoor. LinkedIn Ads en content marketing voor lead generatie.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 183, name: 'Mazars NL', website: 'https://www.mazars.nl', description: 'Internationaal accountants- en adviesbureau.', category: 'Professional', location: 'Amsterdam', size: '200-500 werknemers', why_interesting: 'Groeiend accountancy bureau dat digitale acquisitie wil verbeteren.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 184, name: 'Firm24', website: 'https://www.firm24.com', description: 'Online platform voor BV oprichten en notariele diensten.', category: 'Professional', location: 'Amsterdam', size: '20-50 werknemers', why_interesting: 'Legal-tech platform. Google Ads en SEO voor BV-oprichten zoekwoorden zeer high-intent.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 3500, match_score: 8, priority: 'hot' },
  { id: 185, name: 'ICTRecht', website: 'https://www.ictrecht.nl', description: 'Juridisch adviesbureau gespecialiseerd in IT en privacy recht.', category: 'Professional', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Niche advocatenkantoor in trending privacy/IT-recht domein. SEO en Google Ads zeer relevant.', services: ["Google Ads", "SEO", "LinkedIn Ads", "HubSpot"], retainer_potential: 3500, match_score: 8, priority: 'hot' },
  { id: 186, name: 'Legalloyd', website: 'https://www.legalloyd.com', description: 'Online juridische dienstverlener voor ondernemers.', category: 'Professional', location: 'Amsterdam', size: '10-20 werknemers', why_interesting: 'Legal-tech startup. Google Ads en SEO voor juridische zoekwoorden.', services: ["Google Ads", "SEO", "LinkedIn Ads"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 187, name: 'RSM NL', website: 'https://www.rsm.nl', description: 'Accountants- en adviesbureau voor het middensegment.', category: 'Professional', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Groot accountantskantoor dat online leadgeneratie wil versterken.', services: ["LinkedIn Ads", "Google Ads", "SEO", "HubSpot"], retainer_potential: 5000, match_score: 7, priority: 'warm' },
  { id: 188, name: 'Crowe Foederer', website: 'https://www.crowefoederer.nl', description: 'Accountants- en adviesorganisatie voor ondernemers.', category: 'Professional', location: 'Eindhoven', size: '200-500 werknemers', why_interesting: 'Groeiend accountancy bureau. Google Ads en SEO voor MKB klant acquisitie.', services: ["Google Ads", "SEO", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 189, name: 'Feenstra', website: 'https://www.feenstra.com', description: 'Installatiebedrijf voor CV-ketels, airconditioning en zonnepanelen.', category: 'Bouw', location: 'Amsterdam', size: '500+ werknemers', why_interesting: 'Groot installatiebedrijf met lokale leadgeneratie. Google Ads en SEO essentieel.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 5000, match_score: 7, priority: 'warm' },
  { id: 190, name: 'Homekeur', website: 'https://www.homekeur.nl', description: 'Bouwkundige keuringen voor woningkopers.', category: 'Bouw', location: 'Utrecht', size: '50-100 werknemers', why_interesting: 'High-demand service met seizoensgebonden vraag. Google Ads en SEO direct rendabel.', services: ["Google Ads", "SEO", "Meta Ads"], retainer_potential: 3000, match_score: 7, priority: 'warm' },
  { id: 191, name: 'Solar Sedum', website: 'https://www.solarsedum.nl', description: 'Specialist in groene daken en zonnepanelen op platte daken.', category: 'Bouw', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Duurzame bouw niche in groeiende markt. Google Ads en SEO zeer relevant.', services: ["Google Ads", "SEO", "LinkedIn Ads", "Meta Ads"], retainer_potential: 3500, match_score: 8, priority: 'hot' },
  { id: 192, name: 'Heijmans', website: 'https://www.heijmans.nl', description: 'Groot bouw- en infrabedrijf met woningbouw.', category: 'Bouw', location: 'Rosmalen', size: '500+ werknemers', why_interesting: 'Groot bouwbedrijf met marketing needs voor woningverkoop en employer branding.', services: ["Google Ads", "SEO", "LinkedIn Ads", "Meta Ads"], retainer_potential: 5000, match_score: 6, priority: 'cold' },
  { id: 193, name: 'Warmteservice', website: 'https://www.warmteservice.nl', description: 'Groothandel en installatie voor CV-ketels en warmtepompen.', category: 'Bouw', location: 'Breda', size: '200-500 werknemers', why_interesting: 'Groeiende markt voor warmtepompen. Google Ads en SEO voor energietransitie.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 194, name: 'Bouwmaat', website: 'https://www.bouwmaat.nl', description: 'Bouwmaterialen groothandel met webshop.', category: 'Bouw', location: 'Gorinchem', size: '500+ werknemers', why_interesting: 'B2B bouwmaterialen met groeiende e-commerce.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 4000, match_score: 7, priority: 'warm' },
  { id: 195, name: 'Dura Vermeer', website: 'https://www.duravermeer.nl', description: 'Groot bouw- en infrabedrijf.', category: 'Bouw', location: 'Rotterdam', size: '500+ werknemers', why_interesting: 'Grote bouwer met employer branding en woningverkoop marketing needs.', services: ["LinkedIn Ads", "Google Ads", "SEO", "Meta Ads"], retainer_potential: 5000, match_score: 6, priority: 'cold' },
  { id: 196, name: 'Breman Installatiegroep', website: 'https://www.breman.nl', description: 'Technisch installatiebedrijf voor utiliteit en industrie.', category: 'Bouw', location: 'Genemuiden', size: '500+ werknemers', why_interesting: 'Groot installatiebedrijf. LinkedIn Ads voor B2B projecten.', services: ["LinkedIn Ads", "Google Ads", "SEO"], retainer_potential: 4000, match_score: 6, priority: 'cold' },
  { id: 197, name: 'Van Wijnen', website: 'https://www.vanwijnen.nl', description: 'Bouwbedrijf met focus op woningbouw en renovatie.', category: 'Bouw', location: 'Baarn', size: '500+ werknemers', why_interesting: 'Grote bouwer met nieuwbouwprojecten die marketing nodig hebben.', services: ["Google Ads", "SEO", "Meta Ads", "LinkedIn Ads"], retainer_potential: 5000, match_score: 6, priority: 'cold' },
  { id: 198, name: 'Onefit', website: 'https://www.onefit.nl', description: 'Fitness abonnement platform met toegang tot gyms en studio\'s.', category: 'Health', location: 'Amsterdam', size: '50-100 werknemers', why_interesting: 'Fitness marketplace met subscription model. Performance marketing voor subscriber acquisitie.', services: ["Meta Ads", "Google Ads", "SEO", "TikTok Ads", "Tracking"], retainer_potential: 4000, match_score: 8, priority: 'hot' },
  { id: 199, name: 'Crisp', website: 'https://www.crisp.nl', description: 'Online supermarkt voor verse, lokale en duurzame producten.', category: 'E-commerce', location: 'Amsterdam', size: '100-200 werknemers', why_interesting: 'Snelgroeiende online supermarkt. Performance marketing en tracking optimalisatie.', services: ["Meta Ads", "Google Ads", "SEO", "Tracking", "Automation"], retainer_potential: 5000, match_score: 8, priority: 'hot' },
  { id: 200, name: 'Athlon', website: 'https://www.athlon.com', description: 'Internationale lease en fleet management provider.', category: 'Auto', location: 'Almere', size: '500+ werknemers', why_interesting: 'Groot leasebedrijf met B2B marketing. Google Ads en LinkedIn Ads voor lease leads.', services: ["Google Ads", "LinkedIn Ads", "SEO", "Tracking"], retainer_potential: 6000, match_score: 7, priority: 'warm' },
  { id: 201, name: 'Accon AVM', website: 'https://www.acconavm.nl', description: 'Accountants- en adviesorganisatie voor MKB en agri.', category: 'Professional', location: 'Tilburg', size: '500+ werknemers', why_interesting: 'Groot accountancy kantoor met groeiende digitale marketing needs.', services: ["Google Ads", "SEO", "LinkedIn Ads"], retainer_potential: 4000, match_score: 6, priority: 'cold' },
  { id: 202, name: 'Coolblue Solar', website: 'https://www.coolblue.nl/zonnepanelen', description: 'Zonnepanelen installatie divisie van Coolblue.', category: 'Bouw', location: 'Rotterdam', size: '200-500 werknemers', why_interesting: 'Groot merk in groeiende zonnepanelen markt.', services: ["Google Ads", "SEO", "Meta Ads", "Tracking"], retainer_potential: 5000, match_score: 6, priority: 'cold' },
  { id: 203, name: 'Terre des Hommes', website: 'https://www.terredeshommes.nl', description: 'Klant van SDIM. Influencer campagne, Instagram', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij SDIM — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 204, name: 'KNGF Geleidehonden', website: 'https://www.kngf.nl', description: 'Klant van SDIM. Eindejaarscampagne, Creatief concept', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij SDIM — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 205, name: 'Le Marais', website: 'https://www.lemarais.nl', description: 'Klant van SDIM. Website, Marketing strategie, +14% omzetgroei', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij SDIM — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 206, name: 'FNV', website: 'https://www.fnv.nl', description: 'Klant van SDIM. Campagne, Digital marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij SDIM — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 207, name: 'Educadora', website: 'https://www.educadora.nl', description: 'Klant van SDIM. PPC campagnes, Generative AI', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij SDIM — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 208, name: 'Jopen Bier', website: 'https://www.jfrbrouwhuis.nl', description: 'Klant van SDIM. Programmatic DOOH advertising', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij SDIM — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 209, name: 'NRC', website: 'https://www.nrc.nl', description: 'Klant van SDIM. Attributie, Upper-funnel campagnes', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij SDIM — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 210, name: 'EZbook.nl', website: 'https://www.ezbook.nl', description: 'Klant van SDIM. Digital marketing (10+ jaar)', category: 'Hospitality', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij SDIM — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 211, name: 'Liander', website: 'https://www.liander.nl', description: 'Klant van Traffic Builders. AI-gedreven weercampagne, Brand Lift, +203% CTR', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Traffic Builders — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 212, name: 'Dental Clinics', website: 'https://www.dentalclinics.nl', description: 'Klant van Traffic Builders. Recruitment marketing, +700% sollicitaties', category: 'Health', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Traffic Builders — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 213, name: 'CNV', website: 'https://www.cnv.nl', description: 'Klant van Traffic Builders. Dynamic campagne, AI automation, +231% CTR', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Traffic Builders — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 214, name: 'Mediq', website: 'https://www.mediq.com', description: 'Klant van Traffic Builders. Machine learning, +23% Quality Visits', category: 'Health', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Traffic Builders — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 215, name: 'Lassie', website: 'https://www.lassie.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 216, name: 'Papendal', website: 'https://papendal.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'Hospitality', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 217, name: 'Social Deal', website: 'https://www.socialdeal.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 218, name: 'Nationale Beroepengids', website: 'https://www.nationaleberoepengids.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 219, name: 'Seniorverhuizer', website: 'https://www.seniorverhuizer.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 220, name: 'Cursus Kleding Naaien', website: 'https://www.cursuskledingnaaien.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 221, name: 'Scholen op de Kaart', website: 'https://scholenopdekaart.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 222, name: 'SFA Packaging', website: 'https://sfapackaging.com', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 223, name: 'NIZO', website: 'https://www.nizo.com', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 224, name: 'Radar Advies', website: 'https://www.radaradvies.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 225, name: 'NFC World', website: 'https://www.nfcworld.com', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 226, name: 'Buro Buiten', website: 'https://www.burobuiten.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 227, name: 'Volta Energy', website: 'https://volta-energy.com', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 228, name: 'Rutgers', website: 'https://rutgers.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 229, name: 'Dutch Designers Outlet', website: 'https://www.dutchdesignersoutlet.com', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 230, name: 'Coinmerce', website: 'https://coinmerce.io', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'Finance', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 231, name: 'Hörmann', website: 'https://www.hormann.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 232, name: 'Zwarthout', website: 'https://www.zwarthout.com', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 233, name: 'Ladies Night', website: 'https://www.ladiesnight.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 234, name: 'Coffee at Work', website: 'https://www.coffeeatwork.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 235, name: 'Meclinics', website: 'https://www.meclinics.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'Health', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 236, name: 'PackStore', website: 'https://www.packstore.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 237, name: 'Tramontana', website: 'https://www.tramontana.nl', description: 'Klant van Multiply. Multichannel strategie, +38% omzetgroei', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 238, name: 'Studio Dijs', website: 'https://www.studiodijs.nl', description: 'Klant van Multiply. SEO, Ads strategie', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 239, name: 'De Tegel', website: 'https://www.detegel.nl', description: 'Klant van Multiply. Leads, Nationaal & internationaal', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 240, name: 'The Stone', website: 'https://www.thestone.nl', description: 'Klant van Multiply. Datagedreven marketing, 56 winkels', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 241, name: 'OFM', website: 'https://www.ofm.nl', description: 'Klant van Multiply. Complete customer journey, Beste Webshop NL', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 242, name: 'Rehab Footwear', website: 'https://www.rehab.nl', description: 'Klant van Multiply. Online adverteren, +10% omzet -30% kosten', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 243, name: 'Haibu', website: 'https://www.haibu.nl', description: 'Klant van Multiply. Online marketing, Hair & Beauty marktleider', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 244, name: 'Koeka', website: 'https://www.koeka.com', description: 'Klant van Multiply. Multichannel, +50% opbrengsten', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 245, name: 'Harper & Yve', website: 'https://www.harperandyve.com', description: 'Klant van Multiply. Europese groei, Migratie', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 246, name: 'Van Dijk Store', website: 'https://www.vandijkwaalwijk.nl', description: 'Klant van Multiply. Pinterest strategie', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 247, name: 'Schuurman Schoenen', website: 'https://www.schuurmanschoenen.nl', description: 'Klant van Multiply. Social Media, +537% gebruikers', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 248, name: 'Claesen\'s', website: 'https://www.claesens.com', description: 'Klant van Multiply. E-mailmarketing, +31% groei', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 249, name: 'Van Os Tassen en Koffers', website: 'https://www.vanostassen.nl', description: 'Klant van Multiply. Margegestuurde campagnes', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 250, name: 'Bouchier SPORT 2000', website: 'https://www.bouchiersport.nl', description: 'Klant van Multiply. Online adverteren', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 251, name: 'Anne&Max', website: 'https://www.annemax.nl', description: 'Klant van Multiply. Online adverteren, Dayparting', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 252, name: 'Blackstone', website: 'https://www.blackstone.nl', description: 'Klant van Multiply. Online adverteren, +102% opbrengsten', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 253, name: 'Van Opzeeland Techniek', website: 'https://www.vanopzeeland.nl', description: 'Klant van Multiply. Online omzet verdriedubbeld', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 254, name: 'Coef Men', website: 'https://www.coefmen.nl', description: 'Klant van Multiply. Online marketing, +15% groei', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 255, name: 'Janse Mode', website: 'https://www.jansemodewoman.nl', description: 'Klant van Multiply. E-mailmarketing, Social media', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 256, name: 'Max Guitar', website: 'https://www.maxguitar.nl', description: 'Klant van Multiply. SEO, SEA, Grootste gitaarwinkel BeNeLux', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 257, name: 'DMQ Dutch Made Quality', website: 'https://www.dutchmadequality.nl', description: 'Klant van Multiply. Branded zoektermen, +35% groei', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 258, name: 'Xsensible', website: 'https://www.xsensible.com', description: 'Klant van Multiply. RACE-model, Comfortabele schoenen', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 259, name: 'PLNTS.com', website: 'https://www.plnts.com', description: 'Klant van Multiply. Online marketing, +313% bezoekers', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Multiply — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 260, name: 'Schoonenberg', website: 'https://www.schoonenberg.nl', description: 'Klant van Yonego. Migratie, SEO, E-booking conversie', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Yonego — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 261, name: 'Donders 1860', website: 'https://donders1860.com', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 262, name: 'Puchshop', website: 'https://www.puchshop.de', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 263, name: 'Bizziphone', website: 'https://www.bizziphone.com', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 264, name: 'Buitenpracht', website: 'https://buitenpracht.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 265, name: 'Turkesterone.nl', website: 'https://turkesterone.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 266, name: 'BM Dakkapel', website: 'https://www.bm-dakkapel.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 267, name: 'Schaduwdoeken.nl', website: 'https://www.schaduwdoeken.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 268, name: 'Cape Umbrellas', website: 'https://capeumbrellas.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 269, name: 'Zenya Software', website: 'https://zenya-software.com', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 270, name: 'Newsbit', website: 'https://newsbit.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 271, name: 'Goodflex', website: 'https://www.goodflex.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 272, name: 'Vochtbestrijding.nl', website: 'https://www.vochtbestrijding.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 273, name: 'iCreate Magazine', website: 'https://www.icreatemagazine.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 274, name: 'Gardeners World Magazine NL', website: 'https://www.gardenersworldmagazine.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 275, name: 'Ratio', website: 'https://www.ratio.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 276, name: 'Den Hartog Racing', website: 'https://denhartogracing.com', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 277, name: 'Lock Lock', website: 'https://locklock.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 278, name: 'Motoveda', website: 'https://www.motoveda.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 279, name: 'Yellow Spring', website: 'https://www.yellowspring.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 280, name: 'Dreamfillers', website: 'https://www.dreamfillers.nl', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'E-commerce', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "SEO"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
  { id: 281, name: 'Blower Technic', website: 'https://www.blowertechnic.com', description: 'Klant van Online Marketing Agency (OMA). Online marketing', category: 'B2B', location: 'Nederland', size: '', why_interesting: 'Neemt al marketing services af bij Online Marketing Agency (OMA) — bewezen budget voor digital marketing', services: ["Meta Ads", "Google Ads", "LinkedIn Ads"], retainer_potential: 3500, match_score: 7, priority: 'warm' },
]


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
      { id: 'prospects', label: 'Prospects' },
      { id: 'content', label: 'Content' },
      { id: 'strategy', label: 'Strategy' },
      { id: 'forecast', label: 'Forecast' },
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

function AmountInput({ value, onChange, className }: { value: number; onChange: (v: number) => void; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [tempVal, setTempVal] = useState(String(value));
  if (editing) {
    return <input type="text" value={tempVal} onChange={e => setTempVal(e.target.value)}
      onBlur={() => { setEditing(false); const n = parseInt(tempVal.replace(/\D/g,'')); if(!isNaN(n)) onChange(n); }}
      onKeyDown={e => { if(e.key==='Enter') e.currentTarget.blur(); }}
      className={`bg-transparent border border-[#0047FF] rounded px-2 py-1 text-sm font-mono outline-none ${className || ''}`}
      autoFocus />;
  }
  return <button onClick={() => { setTempVal(String(value)); setEditing(true); }}
    className={`text-sm font-mono hover:text-[#0047FF] transition-colors ${className || ''}`}>
    €{value.toLocaleString('nl-NL')}
  </button>;
}

export default function SalesDashboard() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  
  // User management state
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [usersLoaded, setUsersLoaded] = useState(false)
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
  const [expandedAgencyApp, setExpandedAgencyApp] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Debounce timers for API saves
  const dataSaveTimer = useRef<NodeJS.Timeout | null>(null)
  const prospectSaveTimer = useRef<NodeJS.Timeout | null>(null)
  const nextStepsSaveTimer = useRef<NodeJS.Timeout | null>(null)
  
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
  // Prospects state
  const [prospectsSearch, setProspectsSearch] = useState('')
  const [prospectsCategoryFilter, setProspectsCategoryFilter] = useState('all')
  const [prospectsPriorityFilter, setProspectsPriorityFilter] = useState('all')
  const [prospectsSort, setProspectsSort] = useState('match_score')
  const [expandedProspectId, setExpandedProspectId] = useState<number | null>(null)
  const [prospectsStatusFilter, setProspectsStatusFilter] = useState('all')
  const [prospectsAgencyFilter, setProspectsAgencyFilter] = useState('all')
  const [showArchived, setShowArchived] = useState(false)
  const [selectedProspects, setSelectedProspects] = useState<Set<number>>(new Set())
  const [prospectStatuses, setProspectStatuses] = useState<Record<number, { status: string; notes?: string }>>({})
  const [editingNotesId, setEditingNotesId] = useState<number | null>(null)
  const [notesDraft, setNotesDraft] = useState('')

  // Prospect statuses are loaded from API in main useEffect

  // Save prospect statuses to API with debounce
  const saveProspectsToApi = useCallback(async (statuses: Record<number, { status: string; notes?: string }>) => {
    // Always save to localStorage immediately (cache)
    localStorage.setItem('nodefy-prospect-status', JSON.stringify(statuses))
    
    // Debounce API save
    if (prospectSaveTimer.current) clearTimeout(prospectSaveTimer.current)
    prospectSaveTimer.current = setTimeout(async () => {
      try {
        await fetch('/api/prospects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(statuses),
        })
      } catch (e) {
        console.error('Failed to save prospect statuses to API:', e)
      }
    }, 1000)
  }, [])

  const updateProspectStatus = useCallback((id: number, status: string, notes?: string) => {
    setProspectStatuses(prev => {
      const next = { ...prev, [id]: { status, notes: notes ?? prev[id]?.notes } }
      saveProspectsToApi(next)
      return next
    })
  }, [saveProspectsToApi])

  const updateProspectNotes = useCallback((id: number, notes: string) => {
    setProspectStatuses(prev => {
      const current = prev[id] || { status: 'new' }
      const next = { ...prev, [id]: { ...current, notes: notes || undefined } }
      saveProspectsToApi(next)
      return next
    })
  }, [saveProspectsToApi])

  const bulkUpdateStatus = useCallback((ids: Set<number>, status: string) => {
    setProspectStatuses(prev => {
      const next = { ...prev }
      ids.forEach(id => { next[id] = { ...next[id], status, notes: next[id]?.notes } })
      saveProspectsToApi(next)
      return next
    })
    setSelectedProspects(new Set())
  }, [saveProspectsToApi])
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

  // Load from API (with localStorage fallback) on mount
  useEffect(() => {
    const loadData = async () => {
      // 1. Seed users if needed (runs once on first deploy)
      try {
        await fetch('/api/auth/seed', { method: 'POST' })
      } catch (e) {
        console.error('Seed request failed:', e)
      }

      // 2. Load users from API
      try {
        const usersRes = await fetch('/api/auth/users')
        if (usersRes.ok) {
          const result = await usersRes.json()
          if (result.success && result.users?.length > 0) {
            setUsers(result.users)
          } else {
            setUsers(DEFAULT_USERS)
          }
        } else {
          // Fallback to localStorage
          const savedUsers = localStorage.getItem(USERS_STORAGE_KEY)
          if (savedUsers) setUsers(JSON.parse(savedUsers))
          else setUsers(DEFAULT_USERS)
        }
      } catch (e) {
        console.error('Failed to load users from API:', e)
        const savedUsers = localStorage.getItem(USERS_STORAGE_KEY)
        if (savedUsers) setUsers(JSON.parse(savedUsers))
        else setUsers(DEFAULT_USERS)
      }
      setUsersLoaded(true)

      // 3. Load current user session from localStorage (session state)
      const savedCurrentUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY)
      if (savedCurrentUser) {
        try {
          const parsed = JSON.parse(savedCurrentUser)
          // Validate user still exists in API
          const validateRes = await fetch('/api/auth/users')
          if (validateRes.ok) {
            const result = await validateRes.json()
            const stillExists = result.users?.some((u: User) => u.email === parsed.email)
            if (stillExists) {
              setCurrentUser(parsed)
              setIsAuthenticated(true)
            } else {
              localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
            }
          } else {
            // Fallback: trust localStorage if API is down
            setCurrentUser(parsed)
            setIsAuthenticated(true)
          }
        } catch (e) {
          console.error('Failed to validate current user:', e)
        }
      }

      // 4. Load theme from localStorage (UI preference, keep in localStorage)
      const savedTheme = localStorage.getItem('nodefy-theme') as 'dark' | 'light' | null
      if (savedTheme) {
        setTheme(savedTheme)
      }

      // 5. Load main dashboard data from API (with localStorage fallback)
      try {
        const dataRes = await fetch('/api/data')
        if (dataRes.ok) {
          const result = await dataRes.json()
          if (result.success && result.data) {
            setData(prev => {
              const merged = { ...prev }
              for (const key of Object.keys(result.data) as (keyof EditableData)[]) {
                if (result.data[key] !== undefined) {
                  (merged as Record<string, unknown>)[key] = result.data[key]
                }
              }
              merged.agencyOsApps = DEFAULT_AGENCY_OS_APPS
              return merged
            })
          } else {
            // Try localStorage fallback
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
              const parsed = JSON.parse(saved)
              setData(prev => {
                const merged = { ...prev }
                for (const key of Object.keys(parsed) as (keyof EditableData)[]) {
                  if (parsed[key] !== undefined) {
                    (merged as Record<string, unknown>)[key] = parsed[key]
                  }
                }
                merged.agencyOsApps = DEFAULT_AGENCY_OS_APPS
                return merged
              })
            }
          }
        }
      } catch (e) {
        console.error('Failed to load data from API:', e)
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            setData(prev => {
              const merged = { ...prev }
              for (const key of Object.keys(parsed) as (keyof EditableData)[]) {
                if (parsed[key] !== undefined) {
                  (merged as Record<string, unknown>)[key] = parsed[key]
                }
              }
              merged.agencyOsApps = DEFAULT_AGENCY_OS_APPS
              return merged
            })
          } catch {}
        }
      }
      
      // 6. Load prospect statuses from API
      try {
        const prospectRes = await fetch('/api/prospects')
        if (prospectRes.ok) {
          const result = await prospectRes.json()
          if (result.success && result.data) {
            setProspectStatuses(result.data)
          }
        }
      } catch (e) {
        // Fallback to localStorage
        const saved = localStorage.getItem('nodefy-prospect-status')
        if (saved) setProspectStatuses(JSON.parse(saved))
      }

      // 7. Load next steps from API
      try {
        const nextStepsRes = await fetch('/api/pipeline-nextsteps')
        if (nextStepsRes.ok) {
          const result = await nextStepsRes.json()
          if (result.success && result.data) {
            setNextSteps(result.data)
          }
        }
      } catch (e) {
        // Fallback to localStorage
        const saved = localStorage.getItem('nodefy-pipeline-nextsteps')
        if (saved) setNextSteps(JSON.parse(saved))
      }
      
      // After loading cached data, sync pipeline from HubSpot (source of truth)
      try {
        setPipelineSyncing(true)
        const hsRes = await fetch('/api/hubspot-sync')
        if (hsRes.ok) {
          const hsResult = await hsRes.json()
          if (hsResult.deals) {
            // Update deals in data
            const currentData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
            currentData.pipelineDeals = hsResult.deals
            currentData.pipelineLastUpdated = new Date().toISOString()
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData))
            setData(prev => ({ ...prev, pipelineDeals: hsResult.deals, pipelineLastUpdated: new Date().toISOString() }))
            
            // Merge nextSteps: HubSpot wins, then layer local on top
            const hubSpotNextSteps: Record<string, string> = {}
            hsResult.deals.forEach((d: any) => {
              if (d.nextStep && d.nextStep.trim()) hubSpotNextSteps[d.id] = d.nextStep
            })
            setNextSteps(prev => {
              const merged = { ...hubSpotNextSteps }
              // Only keep local values if HubSpot has nothing for that deal
              Object.keys(prev).forEach(id => {
                if (prev[id] && prev[id].trim() && !merged[id]) merged[id] = prev[id]
              })
              return merged
            })
          }
        }
      } catch (e) {
        console.error('HubSpot sync on load failed:', e)
      } finally {
        setPipelineSyncing(false)
        hasSynced.current = true
      }

      setIsLoaded(true)
      setDataLoading(false)
    }

    loadData()
  }, [])

  // Save data to API with debounce (2 seconds after last change)
  const saveDataToApi = useCallback(async (dataToSave: EditableData) => {
    // Always save to localStorage immediately (cache)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    
    // Debounce API save
    if (dataSaveTimer.current) clearTimeout(dataSaveTimer.current)
    dataSaveTimer.current = setTimeout(async () => {
      try {
        await fetch('/api/data', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave),
        })
      } catch (e) {
        console.error('Failed to save data to API:', e)
      }
    }, 2000)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      saveDataToApi(data)
    }
  }, [isLoaded, data, saveDataToApi])

  // Users are managed via API, no need to save to localStorage
  // (API calls happen in createUser, saveUser, deleteUser)

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
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setAuthError('')
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      
      const result = await res.json()
      
      if (result.success && result.user) {
        const user = result.user as User
        setCurrentUser(user)
        setIsAuthenticated(true)
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user))
        setAuthError('')
      } else {
        setAuthError(result.error || 'Login mislukt')
      }
    } catch (e) {
      // Fallback to local validation if API is down
      console.error('API login failed, trying local:', e)
      const user = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase())
      if (!user) {
        setAuthError('Gebruiker niet gevonden')
      } else if (user.password !== loginPassword) {
        setAuthError('Onjuist wachtwoord')
      } else {
        const updatedUser = { ...user, lastLogin: new Date().toISOString() }
        setCurrentUser(updatedUser)
        setIsAuthenticated(true)
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(updatedUser))
        setAuthError('')
      }
    } finally {
      setLoginLoading(false)
    }
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
  const SUPERADMIN_ONLY_TABS: TabId[] = ['retainers', 'strategy', 'forecast']
  
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

  // User management handlers - using API
  const saveUser = async (user: User) => {
    try {
      const res = await fetch('/api/auth/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      })
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === user.id ? user : u))
      } else {
        const result = await res.json()
        alert(result.error || 'Fout bij opslaan gebruiker')
      }
    } catch (e) {
      console.error('Failed to save user:', e)
      // Fallback: update locally
      setUsers(prev => prev.map(u => u.id === user.id ? user : u))
    }
    setEditingUserId(null)
  }

  const createUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) return
    
    // Build permissions based on role
    let permissions: Record<TabId, boolean> = {} as Record<TabId, boolean>
    if (newUser.role === 'superadmin' || newUser.role === 'admin') {
      ALL_TAB_IDS.forEach(id => { permissions[id] = true })
    } else {
      ALL_TAB_IDS.forEach(id => { permissions[id] = newUser.permissions?.[id] || false })
      permissions.settings = true // Everyone gets settings
    }
    
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role || 'viewer',
          permissions,
        }),
      })
      
      const result = await res.json()
      
      if (result.success && result.user) {
        setUsers(prev => [...prev, result.user as User])
        setNewUser({ name: '', email: '', password: '', role: 'viewer', permissions: {} })
        setShowAddUser(false)
      } else {
        alert(result.error || 'Fout bij aanmaken gebruiker')
      }
    } catch (e) {
      console.error('Failed to create user:', e)
      alert('Fout bij aanmaken gebruiker')
    }
  }

  const deleteUser = async (id: string) => {
    if (currentUser?.id === id) {
      alert('Je kunt jezelf niet verwijderen')
      return
    }
    
    const userToDelete = users.find(u => u.id === id)
    if (!userToDelete) return
    
    try {
      const res = await fetch('/api/auth/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userToDelete.email }),
      })
      
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id))
      } else {
        const result = await res.json()
        alert(result.error || 'Fout bij verwijderen gebruiker')
      }
    } catch (e) {
      console.error('Failed to delete user:', e)
      // Fallback: delete locally
      setUsers(prev => prev.filter(u => u.id !== id))
    }
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
    if (field === 'value' || field === 'stageId') {
      const timerId = `${id}-${String(field)}`;
      if (dealUpdateTimers.current[timerId]) clearTimeout(dealUpdateTimers.current[timerId]);
      dealUpdateTimers.current[timerId] = setTimeout(async () => {
        try {
          const updates: any = {};
          if (field === 'value') updates.amount = value;
          if (field === 'stageId') updates.dealstage = value;
          await fetch('/api/hubspot-sync', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dealId: id, ...updates })
          });
        } catch (e) { console.error('Failed to sync deal update:', e); }
      }, 1000);
    }
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
          // Merge nextSteps from HubSpot
          const hubSpotNextSteps: Record<string, string> = {};
          result.deals.forEach((d: any) => {
            if (d.nextStep) hubSpotNextSteps[d.id] = d.nextStep;
          });
          setNextSteps(prev => {
            const merged = { ...hubSpotNextSteps };
            Object.keys(prev).forEach(id => {
              if (prev[id] && prev[id].trim()) merged[id] = prev[id];
            });
            return merged;
          });
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

  // Auto-sync pipeline on mount
  const nextStepTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const dealUpdateTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const hasSynced = useRef(false)
  useEffect(() => {
    if (!hasSynced.current) {
      hasSynced.current = true
      refreshPipeline()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update next step for a deal
  const updateNextStep = (dealId: string, value: string) => {
    const updated = { ...nextSteps, [dealId]: value }
    setNextSteps(updated)
    // Save to localStorage immediately (cache)
    localStorage.setItem('nodefy-pipeline-nextsteps', JSON.stringify(updated))
    
    // Debounce HubSpot sync
    if (nextStepTimers.current[dealId]) clearTimeout(nextStepTimers.current[dealId]);
    nextStepTimers.current[dealId] = setTimeout(async () => {
      try {
        await fetch('/api/hubspot-sync', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dealId, nextStep: value })
        });
      } catch (e) { console.error('Failed to sync nextStep:', e); }
    }, 1000);
    
    // Also save to KV (debounced)
    if (nextStepsSaveTimer.current) clearTimeout(nextStepsSaveTimer.current)
    nextStepsSaveTimer.current = setTimeout(async () => {
      try {
        await fetch('/api/pipeline-nextsteps', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        })
      } catch (e) { console.error('Failed to save next steps to KV:', e); }
    }, 1500)
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
              disabled={loginLoading}
              className={`w-full py-2 ${colors.accentBg} text-white rounded-md text-sm font-medium ${colors.accentHover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loginLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Inloggen...
                </>
              ) : 'Sign in'}
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
    <main className={`min-h-screen ${colors.bgMain} ${colors.textPrimary} flex transition-colors duration-150 overflow-x-hidden`}>
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
                                <AmountInput value={deal.value || 0} onChange={(v) => updateDeal(deal.id, 'value', v)} />
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
                                    <AmountInput value={deal.value || 0} onChange={(v) => updateDeal(deal.id, 'value', v)} className={deal.value ? colors.accent : colors.textTertiary} />
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
                                <input
                                  type="text"
                                  value={nextSteps[deal.id] || ''}
                                  onChange={(e) => updateNextStep(deal.id, e.target.value)}
                                  placeholder="Volgende stap..."
                                  className={`w-full text-[11px] ${colors.textTertiary} mt-1.5 pt-1.5 border-t ${colors.border} bg-transparent focus:outline-none`}
                                />
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
                                <td className={`p-3`}>
                                  <input
                                    type="text"
                                    value={nextSteps[deal.id] || ''}
                                    onChange={(e) => updateNextStep(deal.id, e.target.value)}
                                    placeholder="Volgende stap..."
                                    className={`w-full text-[12px] ${colors.textSecondary} bg-transparent focus:outline-none focus:ring-1 focus:ring-[#0047FF] rounded px-1 py-0.5`}
                                  />
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
          {/* PROSPECTS TAB */}
          {/* ============================================ */}
          {activeTab === 'prospects' && (() => {
            // Enrich prospects with source_agency and status from localStorage
            const enrichedProspects = MEGA_PROSPECTS.map(p => ({
              ...p,
              source_agency: p.description.startsWith('Klant van ') ? p.description.split('.')[0].replace('Klant van ', '') : undefined,
              status: (prospectStatuses[p.id]?.status as MegaProspect['status']) || 'new',
              notes: prospectStatuses[p.id]?.notes,
            }))

            const uniqueCategories = [...new Set(enrichedProspects.map(p => p.category))].sort()
            const uniqueAgencies = [...new Set(enrichedProspects.map(p => p.source_agency).filter(Boolean))].sort() as string[]
            const hotCount = enrichedProspects.filter(p => p.priority === 'hot').length
            const warmCount = enrichedProspects.filter(p => p.priority === 'warm').length
            const coldCount = enrichedProspects.filter(p => p.priority === 'cold').length
            const interestingCount = enrichedProspects.filter(p => p.status === 'interesting').length
            const archivedCount = enrichedProspects.filter(p => p.status === 'archived').length
            const totalRetainer = enrichedProspects.reduce((acc, p) => acc + p.retainer_potential, 0)

            let filtered = enrichedProspects.filter(p => {
              const matchesSearch = !prospectsSearch || p.name.toLowerCase().includes(prospectsSearch.toLowerCase()) || p.description.toLowerCase().includes(prospectsSearch.toLowerCase())
              const matchesCategory = prospectsCategoryFilter === 'all' || p.category === prospectsCategoryFilter
              const matchesPriority = prospectsPriorityFilter === 'all' || p.priority === prospectsPriorityFilter
              const matchesStatus = prospectsStatusFilter === 'all' || p.status === prospectsStatusFilter
              const matchesAgency = prospectsAgencyFilter === 'all' || p.source_agency === prospectsAgencyFilter
              const notArchived = showArchived || p.status !== 'archived'
              return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesAgency && notArchived
            })

            filtered = [...filtered].sort((a, b) => {
              if (prospectsSort === 'match_score') return b.match_score - a.match_score
              if (prospectsSort === 'retainer') return b.retainer_potential - a.retainer_potential
              return a.name.localeCompare(b.name)
            })

            const priorityColors: Record<string, string> = {
              hot: 'bg-red-500/20 text-red-400',
              warm: 'bg-amber-500/20 text-amber-400',
              cold: 'bg-blue-500/20 text-blue-400',
            }

            const statusColors: Record<string, string> = {
              new: 'bg-[#2E2E32] text-[#8E8E93]',
              interesting: 'bg-amber-500/20 text-amber-400',
              contacted: 'bg-blue-500/20 text-blue-400',
              archived: 'bg-[#1C1C1F] text-[#555]',
            }

            const statusLabels: Record<string, string> = {
              new: 'New', interesting: '⭐ Interessant', contacted: 'Contacted', archived: 'Archived'
            }

            const allVisibleSelected = filtered.length > 0 && filtered.every(p => selectedProspects.has(p.id))

            // Analytics for interesting prospects
            const interestingProspects = enrichedProspects.filter(p => p.status === 'interesting')
            const favCategory = (() => {
              if (interestingProspects.length === 0) return '-'
              const counts: Record<string, number> = {}
              interestingProspects.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1 })
              return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
            })()
            const avgScore = interestingProspects.length > 0 ? (interestingProspects.reduce((s, p) => s + p.match_score, 0) / interestingProspects.length).toFixed(1) : '-'
            const topServices = (() => {
              if (interestingProspects.length === 0) return []
              const counts: Record<string, number> = {}
              interestingProspects.forEach(p => p.services.forEach(s => { counts[s] = (counts[s] || 0) + 1 }))
              return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s]) => s)
            })()

            return (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className={colors.textTertiary}>Dashboard</span>
                    <span className={colors.textTertiary}>/</span>
                    <span className={colors.textPrimary}>Prospects</span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Totaal', value: enrichedProspects.length, color: colors.textPrimary },
                    { label: 'Hot', value: hotCount, color: 'text-red-400' },
                    { label: 'Warm', value: warmCount, color: 'text-amber-400' },
                    { label: '⭐ Interessant', value: interestingCount, color: 'text-amber-400' },
                    { label: 'Archived', value: archivedCount, color: 'text-[#555]' },
                    { label: 'Retainer Potentieel', value: `€${Math.round(totalRetainer / 1000)}k/mnd`, color: 'text-green-400' },
                  ].map((stat, i) => (
                    <div key={i} className={`${colors.bgCard} border ${colors.border} rounded-lg p-3`}>
                      <div className={`text-[11px] ${colors.textTertiary} mb-1`}>{stat.label}</div>
                      <div className={`text-[18px] font-bold ${stat.color}`}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Bulk action bar */}
                {selectedProspects.size > 0 && (
                  <div className="sticky top-0 z-10 bg-[#0047FF]/10 border border-[#0047FF]/30 rounded-lg px-4 py-2.5 flex items-center gap-3 transition-all">
                    <span className="text-[12px] text-blue-400 font-medium">{selectedProspects.size} geselecteerd</span>
                    <div className="flex gap-2 ml-auto">
                      {[
                        { label: '⭐ Interessant', status: 'interesting' },
                        { label: '✉️ Contacted', status: 'contacted' },
                        { label: '📁 Archiveer', status: 'archived' },
                        { label: '↩️ Reset', status: 'new' },
                      ].map(a => (
                        <button key={a.status} onClick={() => bulkUpdateStatus(selectedProspects, a.status)} className="text-[11px] px-3 py-1 rounded bg-[#2A2A2E] text-[#E8E8ED] hover:bg-[#333] border border-[#2E2E32] transition-colors">
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filter bar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    placeholder="Zoek prospect..."
                    value={prospectsSearch}
                    onChange={e => setProspectsSearch(e.target.value)}
                    className={`${colors.bgCard} border ${colors.border} rounded px-3 py-1.5 text-[12px] ${colors.textPrimary} w-full sm:flex-1 sm:max-w-xs focus:outline-none focus:border-blue-500`}
                  />
                  <select value={prospectsStatusFilter} onChange={e => setProspectsStatusFilter(e.target.value)} className={`${colors.bgCard} border ${colors.border} rounded px-2 py-1.5 text-[12px] ${colors.textPrimary} focus:outline-none`}>
                    <option value="all">Alle statussen</option>
                    <option value="new">New</option>
                    <option value="interesting">⭐ Interessant</option>
                    <option value="contacted">Contacted</option>
                    <option value="archived">Archived</option>
                  </select>
                  <select value={prospectsCategoryFilter} onChange={e => setProspectsCategoryFilter(e.target.value)} className={`${colors.bgCard} border ${colors.border} rounded px-2 py-1.5 text-[12px] ${colors.textPrimary} focus:outline-none`}>
                    <option value="all">Alle categorieën</option>
                    {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={prospectsAgencyFilter} onChange={e => setProspectsAgencyFilter(e.target.value)} className={`${colors.bgCard} border ${colors.border} rounded px-2 py-1.5 text-[12px] ${colors.textPrimary} focus:outline-none`}>
                    <option value="all">Alle agencies</option>
                    {uniqueAgencies.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <select value={prospectsPriorityFilter} onChange={e => setProspectsPriorityFilter(e.target.value)} className={`${colors.bgCard} border ${colors.border} rounded px-2 py-1.5 text-[12px] ${colors.textPrimary} focus:outline-none`}>
                    <option value="all">Alle prioriteiten</option>
                    <option value="hot">Hot</option>
                    <option value="warm">Warm</option>
                    <option value="cold">Cold</option>
                  </select>
                  <select value={prospectsSort} onChange={e => setProspectsSort(e.target.value)} className={`${colors.bgCard} border ${colors.border} rounded px-2 py-1.5 text-[12px] ${colors.textPrimary} focus:outline-none`}>
                    <option value="match_score">Match Score</option>
                    <option value="retainer">Retainer</option>
                    <option value="name">Naam</option>
                  </select>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <div className={`w-4 h-4 rounded border ${colors.border} flex items-center justify-center transition-colors ${showArchived ? 'bg-[#0047FF] border-[#0047FF]' : colors.bgCard}`} onClick={() => setShowArchived(!showArchived)}>
                      {showArchived && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <span className={`text-[11px] ${colors.textTertiary}`}>Toon gearchiveerd</span>
                  </label>
                  <span className={`text-[11px] ${colors.textTertiary}`}>{filtered.length} resultaten</span>
                </div>

                {/* Table */}
                <div className={`${colors.bgCard} border ${colors.border} rounded-lg overflow-x-auto`}>
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className={`border-b ${colors.border}`}>
                        <th className="px-3 py-2 w-8">
                          <div className={`w-4 h-4 rounded border ${colors.border} flex items-center justify-center cursor-pointer transition-colors ${allVisibleSelected ? 'bg-[#0047FF] border-[#0047FF]' : colors.bgCard}`}
                            onClick={() => {
                              if (allVisibleSelected) setSelectedProspects(new Set())
                              else setSelectedProspects(new Set(filtered.map(p => p.id)))
                            }}>
                            {allVisibleSelected && <span className="text-white text-[10px]">✓</span>}
                          </div>
                        </th>
                        <th className="px-1 py-2 w-8"></th>
                        {['Naam', 'Categorie', 'Agency', 'Locatie', 'Score', 'Services', 'Retainer', 'Prioriteit', 'Status', ''].map(h => (
                          <th key={h} className={`text-left px-3 py-2 text-[11px] font-medium ${colors.textTertiary} uppercase tracking-wider`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(prospect => (
                        <React.Fragment key={prospect.id}>
                          <tr
                            onClick={() => setExpandedProspectId(expandedProspectId === prospect.id ? null : prospect.id)}
                            className={`border-b ${colors.border} cursor-pointer transition-colors ${prospect.status === 'archived' ? 'opacity-50' : ''} hover:bg-[#2A2A2E]`}
                          >
                            <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                              <div className={`w-4 h-4 rounded border ${colors.border} flex items-center justify-center cursor-pointer transition-colors ${selectedProspects.has(prospect.id) ? 'bg-[#0047FF] border-[#0047FF]' : colors.bgCard}`}
                                onClick={() => {
                                  const next = new Set(selectedProspects)
                                  if (next.has(prospect.id)) next.delete(prospect.id)
                                  else next.add(prospect.id)
                                  setSelectedProspects(next)
                                }}>
                                {selectedProspects.has(prospect.id) && <span className="text-white text-[10px]">✓</span>}
                              </div>
                            </td>
                            <td className="px-1 py-2" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => updateProspectStatus(prospect.id, prospect.status === 'interesting' ? 'new' : 'interesting')}
                                className={`text-[14px] transition-transform hover:scale-125 ${prospect.status === 'interesting' ? '' : 'opacity-30 hover:opacity-60'}`}
                                title="Toggle interessant"
                              >⭐</button>
                            </td>
                            <td className="px-3 py-2">
                              <a href={prospect.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-[12px] text-blue-400 hover:text-blue-300 font-medium">
                                {prospect.name}
                              </a>
                            </td>
                            <td className={`px-3 py-2 text-[12px] ${colors.textSecondary}`}>{prospect.category}</td>
                            <td className="px-3 py-2">
                              {prospect.source_agency && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">{prospect.source_agency}</span>
                              )}
                            </td>
                            <td className={`px-3 py-2 text-[12px] ${colors.textSecondary}`}>{prospect.location}</td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${prospect.match_score * 10}%` }} />
                                </div>
                                <span className={`text-[11px] ${colors.textSecondary}`}>{prospect.match_score}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex gap-1 flex-wrap">
                                {prospect.services.slice(0, 3).map(s => (
                                  <span key={s} className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bgCard} ${colors.textTertiary} border ${colors.border}`}>{s}</span>
                                ))}
                                {prospect.services.length > 3 && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${colors.textTertiary}`}>+{prospect.services.length - 3}</span>
                                )}
                              </div>
                            </td>
                            <td className={`px-3 py-2 text-[12px] ${colors.textPrimary} font-medium`}>€{prospect.retainer_potential.toLocaleString('nl-NL')}</td>
                            <td className="px-3 py-2">
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${priorityColors[prospect.priority]}`}>
                                {prospect.priority}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusColors[prospect.status]}`}>
                                {statusLabels[prospect.status]}
                              </span>
                            </td>
                            <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center gap-1">
                                <select
                                  value={prospect.status}
                                  onChange={e => updateProspectStatus(prospect.id, e.target.value)}
                                  className="text-[10px] bg-transparent border border-[#2E2E32] rounded px-1 py-0.5 text-[#8E8E93] focus:outline-none cursor-pointer"
                                >
                                  <option value="new">New</option>
                                  <option value="interesting">⭐ Interessant</option>
                                  <option value="contacted">Contacted</option>
                                  <option value="archived">Archived</option>
                                </select>
                                <button
                                  onClick={() => { setEditingNotesId(editingNotesId === prospect.id ? null : prospect.id); setNotesDraft(prospect.notes || '') }}
                                  className={`text-[12px] transition-opacity ${prospect.notes ? 'opacity-80' : 'opacity-30 hover:opacity-60'}`}
                                  title="Notities"
                                >📝</button>
                              </div>
                            </td>
                          </tr>
                          {editingNotesId === prospect.id && (
                            <tr key={`${prospect.id}-notes`} className={`border-b ${colors.border}`}>
                              <td colSpan={12} className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={notesDraft}
                                    onChange={e => setNotesDraft(e.target.value)}
                                    placeholder="Notitie toevoegen..."
                                    className={`flex-1 ${colors.bgCard} border ${colors.border} rounded px-3 py-1.5 text-[12px] ${colors.textPrimary} focus:outline-none focus:border-blue-500`}
                                    onKeyDown={e => { if (e.key === 'Enter') { updateProspectNotes(prospect.id, notesDraft); setEditingNotesId(null) } }}
                                    autoFocus
                                  />
                                  <button onClick={() => { updateProspectNotes(prospect.id, notesDraft); setEditingNotesId(null) }} className="text-[11px] px-3 py-1.5 rounded bg-[#0047FF] text-white hover:bg-[#0040E0] transition-colors">Opslaan</button>
                                  <button onClick={() => setEditingNotesId(null)} className={`text-[11px] px-3 py-1.5 rounded ${colors.bgCard} ${colors.textTertiary} border ${colors.border}`}>Annuleer</button>
                                </div>
                              </td>
                            </tr>
                          )}
                          {expandedProspectId === prospect.id && (
                            <tr key={`${prospect.id}-detail`} className={`border-b ${colors.border}`}>
                              <td colSpan={12} className="px-4 py-3">
                                <div className="grid grid-cols-2 gap-4 text-[12px]">
                                  <div>
                                    <div className={`font-medium ${colors.textPrimary} mb-1`}>Beschrijving</div>
                                    <div className={colors.textSecondary}>{prospect.description}</div>
                                  </div>
                                  <div>
                                    <div className={`font-medium ${colors.textPrimary} mb-1`}>Waarom interessant</div>
                                    <div className={colors.textSecondary}>{prospect.why_interesting}</div>
                                  </div>
                                  {prospect.size && (
                                    <div>
                                      <div className={`font-medium ${colors.textPrimary} mb-1`}>Grootte</div>
                                      <div className={colors.textSecondary}>{prospect.size}</div>
                                    </div>
                                  )}
                                  <div>
                                    <div className={`font-medium ${colors.textPrimary} mb-1`}>Alle services</div>
                                    <div className="flex gap-1 flex-wrap">
                                      {prospect.services.map(s => (
                                        <span key={s} className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bgCard} ${colors.textTertiary} border ${colors.border}`}>{s}</span>
                                      ))}
                                    </div>
                                  </div>
                                  {prospect.notes && (
                                    <div>
                                      <div className={`font-medium ${colors.textPrimary} mb-1`}>Notities</div>
                                      <div className={colors.textSecondary}>{prospect.notes}</div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Analytics: Jouw Voorkeuren */}
                {interestingProspects.length > 0 && (
                  <div className={`${colors.bgCard} border ${colors.border} rounded-lg p-4`}>
                    <h3 className={`text-[13px] font-semibold ${colors.textPrimary} mb-3`}>📊 Jouw voorkeuren</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12px]">
                      <div>
                        <div className={`${colors.textTertiary} text-[11px] mb-1`}>Favoriete categorie</div>
                        <div className={`${colors.textPrimary} font-medium`}>{favCategory}</div>
                      </div>
                      <div>
                        <div className={`${colors.textTertiary} text-[11px] mb-1`}>Gem. match score ⭐</div>
                        <div className={`${colors.textPrimary} font-medium`}>{avgScore}</div>
                      </div>
                      <div>
                        <div className={`${colors.textTertiary} text-[11px] mb-1`}>Top services bij ⭐</div>
                        <div className="flex gap-1 flex-wrap">
                          {topServices.map(s => (
                            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
          {activeTab === 'agencyos' && (() => {
            const [expandedAppId, setExpandedAppId] = [expandedAgencyApp, setExpandedAgencyApp]
            const statusBadge = (status: string) => {
              const map: Record<string, string> = { idea: 'bg-gray-500/20 text-gray-400', building: 'bg-blue-500/20 text-blue-400', beta: 'bg-amber-500/20 text-amber-400', live: 'bg-green-500/20 text-green-400' }
              return map[status] || map.idea
            }
            return (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[13px] mb-3">
                <span className={colors.textTertiary}>Strategy</span>
                <span className={colors.textTertiary}>/</span>
                <span className={colors.textPrimary}>Agency OS</span>
              </div>

              <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Priority Apps</h3>
                <div className="space-y-2">
                  {data.agencyOsApps.map((app, index) => {
                    const isExpanded = expandedAppId === app.id
                    return (
                    <div key={app.id} className={`p-3 rounded-md ${colors.bgInput} border ${colors.border} cursor-pointer transition-all`} onClick={() => setExpandedAppId(isExpanded ? null : app.id)}>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-md ${colors.bgCard} border ${colors.border} flex items-center justify-center text-base`}>{app.emoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[10px] ${colors.textTertiary} font-mono`}>0{index + 1}</span>
                            <h4 className={`text-[13px] font-semibold ${colors.textPrimary}`}>{app.name}</h4>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusBadge(app.status)}`}>{app.status}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              app.impact === 'Hoog' ? 'bg-green-500/20 text-green-500' : `${colors.bgActive} ${colors.textSecondary}`
                            }`}>
                              {app.impact}
                            </span>
                            <span className={`ml-auto text-[11px] ${colors.textTertiary}`}>{isExpanded ? '▾' : '▸'}</span>
                          </div>
                          <p className={`text-[12px] ${colors.textSecondary} mb-1.5`}>{app.description}</p>
                          {isExpanded && (
                            <div className="mt-2 space-y-2">
                              {app.details && <p className={`text-[11px] ${colors.textSecondary} italic`}>{app.details}</p>}
                              <div className="flex flex-wrap gap-1">
                                {app.features.map((f, i) => (
                                  <span key={i} className={`text-[10px] ${colors.bgCard} border ${colors.border} px-1.5 py-0.5 rounded`}>{f}</span>
                                ))}
                              </div>
                              <div className="flex gap-3 text-[10px]">
                                <span className={colors.textTertiary}>Integrations: {app.integrations.join(', ')}</span>
                                <span className={colors.textTertiary}>Effort: {app.effort}</span>
                              </div>
                            </div>
                          )}
                          {!isExpanded && (
                            <div className="flex flex-wrap gap-1">
                              {app.features.slice(0, 3).map((f, i) => (
                                <span key={i} className={`text-[10px] ${colors.bgCard} border ${colors.border} px-1.5 py-0.5 rounded`}>{f}</span>
                              ))}
                              {app.features.length > 3 && <span className={`text-[10px] ${colors.textTertiary}`}>+{app.features.length - 3}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    )
                  })}
                </div>
              </div>
            </div>
            )
          })()}

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
                const startIdx = sm !== undefined ? sm - 1 : 0
                if (monthIdx < startIdx) return sum // client hasn't started yet
                const feb = (c as any).feb as number | undefined
                const mrt = (c as any).mrt as number | undefined
                // Non-recurring: only count explicitly defined months
                if (!c.recurring) {
                  if (monthIdx === 0 && startIdx === 0) return sum + c.jan
                  if (monthIdx === 1 && feb !== undefined) return sum + feb
                  if (monthIdx === 1 && startIdx === 0 && feb === undefined) return sum + c.jan
                  if (monthIdx === 2 && mrt !== undefined) return sum + mrt
                  return sum
                }
                if (monthIdx === 0) return sum + c.jan
                if (monthIdx === 1) return sum + (feb !== undefined ? feb : c.jan)
                // Month 2+ (mrt onwards): use mrt if defined, else feb if defined, else jan, else bedrag/12
                const stableMonthly = mrt !== undefined ? mrt : (feb !== undefined ? feb : (c.jan || Math.round(c.bedrag / 12)))
                return sum + stableMonthly
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

                {/* Prioriteitenmatrix — Top 3 Moneymakers */}
                <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Prioriteitenmatrix — Top 3 Moneymakers</h3>
                  {(() => {
                    const stageUrgency: Record<string, number> = {
                      'decisionmakerboughtin': 0.9,
                      'qualifiedtobuy': 0.7,
                      'appointmentscheduled': 0.5,
                      '5509912': 0.3,
                      'deal_registration_Pricing and Terms': 0.6,
                      'deal_registration_discovery': 0.2,
                    };
                    const now = new Date();
                    const remainingMonths = 12 - now.getMonth();
                    const topDeals = data.pipelineDeals
                      .filter(d => !CLOSED_STAGE_IDS.has(d.stageId) && d.value && d.value > 0)
                      .map(d => {
                        const annualValue = d.value || 0;
                        const revenueThisYear = (annualValue / 12) * remainingMonths;
                        const urgency = stageUrgency[d.stageId] || 0.4;
                        const score = revenueThisYear * (1 + urgency * 0.5);
                        return { ...d, revenueThisYear, urgency, score };
                      })
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 3);
                    return (
                      <div className="space-y-2">
                        {topDeals.map((deal, i) => (
                          <div key={deal.id} className={`flex items-center justify-between p-3 rounded-md ${colors.bgInput} border ${colors.border}`}>
                            <div className="flex items-center gap-3">
                              <span className={`text-lg font-bold ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-400' : 'text-amber-700'}`}>#{i + 1}</span>
                              <div>
                                <p className={`text-[13px] font-medium ${colors.textPrimary}`}>{deal.name}</p>
                                <p className={`text-[11px] ${colors.textTertiary}`}>
                                  €{Math.round(deal.revenueThisYear).toLocaleString('nl-NL')} dit jaar · Urgency {Math.round(deal.urgency * 100)}%
                                </p>
                              </div>
                            </div>
                            <div className={`text-[14px] font-mono font-bold ${colors.accent}`}>
                              €{(deal.value || 0).toLocaleString('nl-NL')}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
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

                {/* Historical Revenue Chart (pure CSS) */}
                <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Historische Revenue</h3>
                  {(() => {
                    const years = ['2022', '2023', '2024', '2025']
                    const maxRev = Math.max(...HISTORICAL_REVENUE.map(r => r.revenue))
                    return (
                      <div className="space-y-3">
                        {years.map(year => {
                          const yearData = HISTORICAL_REVENUE.filter(r => r.month.startsWith(year))
                          const yearTotal = yearData.reduce((s, r) => s + r.revenue, 0)
                          return (
                            <div key={year}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-[11px] font-medium ${colors.textPrimary}`}>{year}</span>
                                <span className={`text-[11px] font-mono ${colors.textSecondary}`}>€{Math.round(yearTotal / 1000)}k totaal</span>
                              </div>
                              <div className="flex gap-0.5 h-12 items-end">
                                {yearData.map(r => (
                                  <div key={r.month} className="flex-1 h-full flex items-end" title={`${r.month}: €${r.revenue.toLocaleString('nl-NL')}`}>
                                    <div className="w-full bg-blue-500/60 rounded-t-sm transition-all hover:bg-blue-400" style={{ height: `${Math.max((r.revenue / maxRev) * 100, 3)}%` }} />
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-0.5 mt-0.5">
                                {['J','F','M','A','M','J','J','A','S','O','N','D'].map((m, i) => (
                                  <span key={i} className={`flex-1 text-center text-[8px] ${colors.textTertiary}`}>{m}</span>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>

                {/* Scenario Planning */}
                <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Scenario Planning 2026</h3>
                  {(() => {
                    const scenarios = [
                      { name: 'Optimistisch', growth: 0.35, color: 'text-green-400', bgColor: 'bg-green-500/20', desc: '+35% groei, 8 nieuwe klanten' },
                      { name: 'Realistisch', growth: 0.20, color: 'text-blue-400', bgColor: 'bg-blue-500/20', desc: '+20% groei, 5 nieuwe klanten' },
                      { name: 'Pessimistisch', growth: 0.05, color: 'text-red-400', bgColor: 'bg-red-500/20', desc: '+5% groei, 2 nieuwe klanten' },
                    ]
                    const lastYearRev = HISTORICAL_REVENUE.filter(r => r.month.startsWith('2025')).reduce((s, r) => s + r.revenue, 0)
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {scenarios.map(s => {
                          const projected = Math.round(lastYearRev * (1 + s.growth))
                          return (
                            <div key={s.name} className={`p-3 rounded-md ${colors.bgInput}`}>
                              <span className={`text-[11px] font-medium ${s.color}`}>{s.name}</span>
                              <p className={`text-[18px] font-bold font-mono ${colors.textPrimary} my-1`}>€{Math.round(projected / 1000)}k</p>
                              <p className={`text-[10px] ${colors.textTertiary}`}>{s.desc}</p>
                              <div className={`mt-2 text-[10px] px-2 py-0.5 rounded ${s.bgColor} ${s.color} inline-block`}>+{Math.round(s.growth * 100)}%</div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
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
          {/* FORECAST TAB */}
          {/* ============================================ */}
          {activeTab === 'forecast' && (() => {
            const years = ['2022', '2023', '2024', '2025']
            const maxRev = Math.max(...HISTORICAL_REVENUE.map(r => r.revenue))
            const lastYearRev = HISTORICAL_REVENUE.filter(r => r.month.startsWith('2025')).reduce((s, r) => s + r.revenue, 0)
            const scenarios = [
              { name: 'Optimistisch', growth: 0.35, color: 'text-green-400', bgColor: 'bg-green-500/20', desc: '+35% groei, 8 nieuwe klanten' },
              { name: 'Realistisch', growth: 0.20, color: 'text-blue-400', bgColor: 'bg-blue-500/20', desc: '+20% groei, 5 nieuwe klanten' },
              { name: 'Pessimistisch', growth: 0.05, color: 'text-red-400', bgColor: 'bg-red-500/20', desc: '+5% groei, 2 nieuwe klanten' },
            ]
            const MONTH_LABELS = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
            // Seasonal pattern from 2025
            const rev2025 = HISTORICAL_REVENUE.filter(r => r.month.startsWith('2025'))
            const seasonalWeights = rev2025.map(r => r.revenue / (lastYearRev / 12))

            return (
              <div className="space-y-4">
                <h2 className={`text-[15px] font-semibold ${colors.textPrimary}`}>📈 Revenue Forecast</h2>

                {/* Historical Revenue Chart */}
                <div className={`${colors.bgCard} rounded-lg border ${colors.border} p-4`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Historische Revenue</h3>
                  <div className="space-y-3">
                    {years.map(year => {
                      const yearData = HISTORICAL_REVENUE.filter(r => r.month.startsWith(year))
                      const yearTotal = yearData.reduce((s, r) => s + r.revenue, 0)
                      return (
                        <div key={year}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[11px] font-medium ${colors.textPrimary}`}>{year}</span>
                            <span className={`text-[11px] font-mono ${colors.textSecondary}`}>€{Math.round(yearTotal / 1000)}k totaal</span>
                          </div>
                          <div className="flex gap-0.5 h-16 items-end">
                            {yearData.map(r => (
                              <div key={r.month} className="flex-1 h-full flex items-end group relative" title={`${r.month}: €${r.revenue.toLocaleString('nl-NL')}`}>
                                <div className="w-full bg-blue-500/60 rounded-t-sm transition-all hover:bg-blue-400" style={{ height: `${Math.max((r.revenue / maxRev) * 100, 3)}%` }} />
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-0.5 mt-0.5">
                            {MONTH_LABELS.map((m, i) => (
                              <span key={i} className={`flex-1 text-center text-[8px] ${colors.textTertiary}`}>{m}</span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Scenario Planning */}
                <div className={`${colors.bgCard} rounded-lg border ${colors.border} p-4`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Scenario Planning 2026</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {scenarios.map(s => {
                      const projected = Math.round(lastYearRev * (1 + s.growth))
                      return (
                        <div key={s.name} className={`p-3 rounded-md ${colors.bgInput}`}>
                          <span className={`text-[11px] font-medium ${s.color}`}>{s.name}</span>
                          <p className={`text-[18px] font-bold font-mono ${colors.textPrimary} my-1`}>€{Math.round(projected / 1000)}k</p>
                          <p className={`text-[10px] ${colors.textTertiary}`}>{s.desc}</p>
                          <div className={`mt-2 text-[10px] px-2 py-0.5 rounded ${s.bgColor} ${s.color} inline-block`}>+{Math.round(s.growth * 100)}%</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Monthly Breakdown 2026 */}
                <div className={`${colors.bgCard} rounded-lg border ${colors.border} p-4`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Maandelijkse Breakdown 2026</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className={`border-b ${colors.border}`}>
                          <th className={`py-2 px-2 text-left ${colors.textTertiary}`}>Maand</th>
                          {scenarios.map(s => (
                            <th key={s.name} className={`py-2 px-2 text-right ${s.color}`}>{s.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {MONTH_LABELS.map((month, i) => {
                          const weight = seasonalWeights[i] || 1
                          return (
                            <tr key={month} className={`border-b ${colors.border}`}>
                              <td className={`py-2 px-2 ${colors.textPrimary}`}>{month}</td>
                              {scenarios.map(s => {
                                const yearTotal = lastYearRev * (1 + s.growth)
                                const monthVal = Math.round((yearTotal / 12) * weight)
                                return (
                                  <td key={s.name} className={`py-2 px-2 text-right font-mono ${colors.textSecondary}`}>
                                    €{monthVal.toLocaleString('nl-NL')}
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })}
                        <tr className={`font-bold border-t-2 ${colors.border}`}>
                          <td className={`py-2 px-2 ${colors.textPrimary}`}>Totaal</td>
                          {scenarios.map(s => {
                            const total = Math.round(lastYearRev * (1 + s.growth))
                            return (
                              <td key={s.name} className={`py-2 px-2 text-right font-mono ${s.color}`}>
                                €{total.toLocaleString('nl-NL')}
                              </td>
                            )
                          })}
                        </tr>
                      </tbody>
                    </table>
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
            const MONTH_TARGET = RETAINER_ARR / 12

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
              const startIdx = sm !== undefined ? sm - 1 : 0 // 0-indexed month where client starts
              const feb = (c as any).feb as number | undefined
              const mrt = (c as any).mrt as number | undefined
              
              const result = Array(12).fill(0)
              
              // Non-recurring: only fill explicitly defined months
              if (!c.recurring) {
                if (startIdx === 0) result[0] = c.jan
                if (startIdx <= 1 && feb !== undefined) result[1] = feb
                else if (startIdx === 0 && feb === undefined) result[1] = c.jan
                if (mrt !== undefined) result[2] = mrt
                return result
              }
              
              // Determine the "stable" monthly amount (what the client pays from month 3 onwards)
              const stableMonthly = mrt !== undefined ? mrt : (feb !== undefined ? feb : (c.jan || Math.round(c.bedrag / 12)))
              
              if (startIdx === 0) {
                result[0] = c.jan
                result[1] = feb !== undefined ? feb : stableMonthly
                for (let i = 2; i < 12; i++) result[i] = stableMonthly
              } else {
                for (let i = startIdx; i < 12; i++) {
                  if (i === startIdx && feb !== undefined) result[i] = feb
                  else if (i === startIdx) result[i] = stableMonthly
                  else if (i === startIdx + 1 && mrt !== undefined) result[i] = mrt
                  else result[i] = stableMonthly
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Totaal ARR', value: `€${RETAINER_ARR.toLocaleString('nl-NL')}`, sub: 'Annual Recurring Revenue' },
                    { label: 'Gem. MRR', value: `€${RETAINER_MRR.toLocaleString('nl-NL')}`, sub: 'Monthly Recurring Revenue' },
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
                          <td className={`px-3 py-2 text-right font-mono font-semibold ${colors.textPrimary}`}>{fmtEurK(RETAINER_ARR)}</td>
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

      {/* ============================================ */}
      {/* MOBILE BOTTOM TAB BAR (< 768px) */}
      {/* ============================================ */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden ${colors.bgSidebar} border-t ${colors.border} flex items-center justify-around py-2 px-1 safe-area-inset-bottom`}>
        {(() => {
          // Mobile tabs: max 5 icons + More drawer
          const MOBILE_TABS: { id: TabId; label: string; icon: string }[] = [
            { id: 'overview', label: 'Home', icon: '🏠' },
            { id: 'pipeline', label: 'Pipeline', icon: '📊' },
            { id: 'prospects', label: 'Prospects', icon: '🎯' },
            { id: 'klanten', label: 'Klanten', icon: '👥' },
            { id: 'reports', label: 'Reports', icon: '📈' },
          ]
          const visibleTabs = MOBILE_TABS.filter(t => canAccessTab(t.id))
          const hasMore = NAV_SECTIONS.flatMap(s => s.items).filter(i => canAccessTab(i.id)).length > 5
          
          return (
            <>
              {visibleTabs.slice(0, hasMore ? 4 : 5).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false) }}
                  className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 rounded-md transition-colors ${
                    activeTab === tab.id ? colors.accentBg + ' text-white' : colors.textSecondary
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="text-[10px] mt-0.5">{tab.label}</span>
                </button>
              ))}
              {hasMore && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 rounded-md transition-colors ${
                    mobileMenuOpen ? colors.accentBg + ' text-white' : colors.textSecondary
                  }`}
                >
                  <span className="text-lg">⋯</span>
                  <span className="text-[10px] mt-0.5">Meer</span>
                </button>
              )}
            </>
          )
        })()}
      </nav>

      {/* Mobile "More" drawer */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className={`fixed bottom-16 left-2 right-2 z-50 lg:hidden ${colors.bgCard} rounded-lg border ${colors.border} p-3 max-h-[60vh] overflow-y-auto safe-area-inset-bottom`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {NAV_SECTIONS.flatMap(s => s.items)
                .filter(i => canAccessTab(i.id))
                .map(item => {
                  const icons: Record<TabId, string> = {
                    overview: '🏠', klanten: '👥', reports: '📈', pipeline: '📊',
                    prospects: '🎯', masterplan: '🗺️', cases: '💼', agencyos: '🤖',
                    content: '✍️', strategy: '🎯', forecast: '📈', retainers: '💰',
                    settings: '⚙️', admin: '👤',
                  }
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false) }}
                      className={`flex flex-col items-center justify-center min-h-[56px] p-2 rounded-md transition-colors ${
                        activeTab === item.id ? colors.accentBg + ' text-white' : `${colors.bgInput} ${colors.textSecondary}`
                      }`}
                    >
                      <span className="text-xl">{icons[item.id] || '📄'}</span>
                      <span className="text-[10px] mt-1 truncate w-full text-center">{item.label}</span>
                    </button>
                  )
                })}
              {canManageUsers && SYSTEM_NAV.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false) }}
                  className={`flex flex-col items-center justify-center min-h-[56px] p-2 rounded-md transition-colors ${
                    activeTab === item.id ? colors.accentBg + ' text-white' : `${colors.bgInput} ${colors.textSecondary}`
                  }`}
                >
                  <span className="text-xl">{item.id === 'settings' ? '⚙️' : '👤'}</span>
                  <span className="text-[10px] mt-1 truncate w-full text-center">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Add padding at bottom on mobile for the tab bar */}
      <style jsx global>{`
        @media (max-width: 1023px) {
          main > div:last-of-type {
            padding-bottom: 80px;
          }
        }
        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
      `}</style>
    </main>
  )
}