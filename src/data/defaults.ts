import type {
  Persona, PainPoint, LinkedInPost, OutreachTemplate, TodayTask,
  WebsiteCase, AgencyApp, WebsiteTasks, Recommendation, Masterplan,
  Kantoor, Client, PipelineDeal, RevenueGoals, KPICard, QuarterlyGoal,
  MasterTask
} from '../types'
import { ACTIVE_RETAINER_CLIENTS, RETAINER_ARR, RETAINER_MRR, RETAINER_AVG_MRR, RETAINER_NEW_2026 } from './config'

export const DEFAULT_PERSONAS: Persona[] = [
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

export const DEFAULT_PAIN_POINTS: PainPoint[] = [
  { rank: 1, title: 'Ik verspil ad spend maar weet niet waarom', impact: '€12K/jaar verloren bij €1K/mnd waste', solution: 'AI-optimalisatie + transparante ROAS reporting' },
  { rank: 2, title: 'Ik heb geen tijd voor marketing', impact: 'Omzet schommelt wild, geen voorspelbare groei', solution: 'Full-service management, wij doen alles' },
  { rank: 3, title: 'Bureaus zijn te duur of leveren niet', impact: 'Wantrouwen hele industry', solution: 'Vaste prijs, geen BS, maandelijks opzegbaar' },
  { rank: 4, title: 'Ik weet niet of mijn ads werken', impact: 'Beslissingen op onderbuikgevoel', solution: 'Wekelijkse rapportage die je snapt' },
  { rank: 5, title: 'Ik kan niet schalen zonder kosten explosie', impact: 'Plafond op groei', solution: 'AI schaalt mee, fixed fee blijft' },
]

export const DEFAULT_LINKEDIN_POSTS: LinkedInPost[] = [
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

export const DEFAULT_OUTREACH_TEMPLATES: OutreachTemplate[] = [
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

export const DEFAULT_TODAY_TASKS: TodayTask[] = [
  { id: 't1', category: 'Website', task: 'Footer fixen: "fabrica®" → "Nodefy B.V."', time: '5 min', priority: 'high' },
  { id: 't2', category: 'Website', task: 'Telefoon updaten: echte nummer invullen', time: '2 min', priority: 'high' },
  { id: 't3', category: 'Website', task: 'Email checken: info@nodefy.nl of .ai?', time: '2 min', priority: 'high' },
  { id: 't4', category: 'LinkedIn', task: 'Post plaatsen: "We vervingen 3 uur handwerk..."', time: '15 min', priority: 'medium' },
  { id: 't5', category: 'Content', task: 'Case study uitwerken (Franky of Stories)', time: '60 min', priority: 'medium' },
  { id: 't6', category: 'Tools', task: 'Tracking Health Checker afmaken', time: '90 min', priority: 'building', assignee: 'AI' },
]

// Website format cases matching Nodefy website structure
export const DEFAULT_CLIENT_CASES: WebsiteCase[] = [
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

export const DEFAULT_AGENCY_OS_APPS: AgencyApp[] = [
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

export const DEFAULT_WEBSITE_TASKS: WebsiteTasks = {
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

export const DEFAULT_FRANKY_RECOMMENDATIONS: Recommendation[] = [
  { id: 1, priority: 'high', action: 'Budget shift van DE → NL', impact: '+€1-2K omzet/maand' },
  { id: 2, priority: 'medium', action: 'Schaal retargeting catalog op', impact: '+10-20% retargeting omzet' },
  { id: 3, priority: 'low', action: 'Consolideer See campagnes', impact: 'Betere optimalisatie' },
]

export const DEFAULT_FLORYN_RECOMMENDATIONS: Recommendation[] = [
  { id: 1, priority: 'high', action: 'Nieuwe creatives voor Carrousel BOFU', impact: 'CPL -25-30%' },
  { id: 2, priority: 'high', action: 'Schaal ABM Lead campagne op', impact: '+40-60 leads/maand' },
  { id: 3, priority: 'medium', action: 'Voeg retargeting campagne toe', impact: 'Extra lead kanaal' },
]

export const DEFAULT_MASTERPLAN: Masterplan = {
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

export const DEFAULT_KANTOOR: Kantoor = {
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
export const DEFAULT_CLIENTS: Client[] = [
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

export const DEFAULT_PIPELINE_DEALS: PipelineDeal[] = [
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


export const DEFAULT_MONTHLY_FORECAST = Array.from({ length: 12 }, (_, i) => ({
  month: i + 1,
  nieuwDeals: 0,
  target: Math.round(1300000 / 12),
}))

// Default Strategy cockpit data — Updated 2026-03-29 per Ruben×Matthijs meeting
// Matthijs: "ik denk dat we boven de 1,3 gaan eindigen" — target €1.3M, stretch €1.5M
export const DEFAULT_REVENUE_GOALS: RevenueGoals = {
  annualTarget: 1300000,
  quarters: [
    { q: 'Q1', target: 269260, realized: 269260 },
    { q: 'Q2', target: 343580, realized: 0 },
    { q: 'Q3', target: 343580, realized: 0 },
    { q: 'Q4', target: 343580, realized: 0 },
  ]
}

export const DEFAULT_KPI_SCOREBOARD: KPICard[] = [
  { id: 'k1', name: 'Actieve klanten', current: ACTIVE_RETAINER_CLIENTS.length, target: 45, unit: '' },
  { id: 'k2', name: 'MRR (huidig)', current: RETAINER_MRR, target: 108000, unit: '€' },
  { id: 'k3', name: 'ARR', current: RETAINER_ARR, target: 1300000, unit: '€' },
  { id: 'k4', name: 'Gem. retainer', current: RETAINER_AVG_MRR, target: 4000, unit: '€' },
  { id: 'k5', name: 'Nieuwe deals 2026', current: RETAINER_NEW_2026, target: 15, unit: '' },
]

export const DEFAULT_QUARTERLY_GOALS: QuarterlyGoal[] = [
  { id: 'qg1', quarter: 'Q1', text: 'LinkedIn 3x/week posting opzetten', status: 'green' },
  { id: 'qg2', quarter: 'Q1', text: '3 nieuwe case studies publiceren', status: 'yellow' },
  { id: 'qg3', quarter: 'Q1', text: 'AlertPilot MVP lanceren', status: 'red' },
  { id: 'qg4', quarter: 'Q2', text: 'Pipeline naar €150K', status: 'yellow' },
  { id: 'qg5', quarter: 'Q2', text: '5 nieuwe klanten binnenhalen', status: 'yellow' },
]

export const DEFAULT_MASTER_TASKS: MasterTask[] = [
  { id: 'mt1', title: 'LinkedIn post schrijven over AI automation', done: false, deadline: '2026-02-17', category: 'Content', priority: 'high' },
  { id: 'mt2', title: 'Franky case study afmaken', done: false, deadline: '2026-02-20', category: 'Content', priority: 'medium' },
  { id: 'mt3', title: 'AlertPilot specs uitwerken', done: false, deadline: '2026-02-22', category: 'Agency OS', priority: 'high' },
  { id: 'mt4', title: '90-day roadmap reviewen', done: true, deadline: '2026-02-10', category: 'Masterplan', priority: 'medium' },
  { id: 'mt5', title: 'Pipeline deals follow-up', done: false, deadline: '2026-02-18', category: 'Pipeline', priority: 'high' },
  { id: 'mt6', title: 'KPI targets Q2 bepalen', done: false, deadline: '2026-02-25', category: 'Strategy', priority: 'medium' },
  { id: 'mt7', title: 'Nodefy Platform Upgrade: monorepo (Turborepo), Supabase DB, shared auth (Clerk), Sentry monitoring, shared UI package — 17 losse apps → 1 platform', done: false, deadline: '2026-04-30', category: 'Agency OS', priority: 'high' },
]

