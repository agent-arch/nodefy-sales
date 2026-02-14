'use client'

import { useState, useEffect } from 'react'

// ============================================
// NODEFY SALES DASHBOARD
// Fresh white design with Nodefy green
// ============================================

// ICP Personas
const personas = [
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

// Pain points
const painPoints = [
  { rank: 1, title: 'Ik verspil ad spend maar weet niet waarom', impact: '€12K/jaar verloren bij €1K/mnd waste', solution: 'AI-optimalisatie + transparante ROAS reporting' },
  { rank: 2, title: 'Ik heb geen tijd voor marketing', impact: 'Omzet schommelt wild, geen voorspelbare groei', solution: 'Full-service management, wij doen alles' },
  { rank: 3, title: 'Bureaus zijn te duur of leveren niet', impact: 'Wantrouwen hele industry', solution: 'Vaste prijs, geen BS, maandelijks opzegbaar' },
  { rank: 4, title: 'Ik weet niet of mijn ads werken', impact: 'Beslissingen op onderbuikgevoel', solution: 'Wekelijkse rapportage die je snapt' },
  { rank: 5, title: 'Ik kan niet schalen zonder kosten explosie', impact: 'Plafond op groei', solution: 'AI schaalt mee, fixed fee blijft' },
]

// Communities
const communities = [
  { name: 'Webshop Ondernemers NL', platform: 'Facebook', size: '~15.000', relevance: 5 },
  { name: 'Shopify Nederland', platform: 'Facebook', size: '~5.000', relevance: 5 },
  { name: 'E-commerce NL', platform: 'LinkedIn', size: '~8.000', relevance: 4 },
  { name: 'WooCommerce Nederland', platform: 'Facebook', size: '~3.000', relevance: 4 },
  { name: 'DutchEcommerce', platform: 'Slack', size: '~1.000', relevance: 4 },
  { name: 'Vrouwelijke Ondernemers NL', platform: 'Facebook', size: '~30.000', relevance: 3 },
]

// LinkedIn posts
const linkedinPosts = [
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
  {
    id: 6,
    title: 'Waarom we nee zeggen tegen 50% van de leads',
    category: 'Ondernemerschap',
    hook: 'Positionering',
    status: 'draft',
    concept: `Waarom we nee zeggen tegen 50% van de leads.

Klinkt contra-intuïtief.
Maar het is de beste beslissing die we maakten.

Leads die we afwijzen:
❌ "We willen even proberen" (geen commitment)
❌ Budget onder €2K/maand (kunnen we niet helpen)
❌ Geen product-market fit (ads fixen dat niet)
❌ "Kunnen jullie ook X, Y, Z?" (geen focus)

Leads die we aannemen:
✅ Duidelijk doel + budget
✅ Bestaande omzet om te schalen
✅ Bereid om te investeren in data

Resultaat:
→ Betere resultaten (we werken met goede fits)
→ Minder stress (geen onmogelijke verwachtingen)
→ Hogere retentie (95%+ blijft >12 maanden)

Soms is nee zeggen de beste sales strategie.

#sales #agency #positioning #business`,
  },
  {
    id: 7,
    title: 'Server-side tracking uitgelegd in 60 seconden',
    category: 'Data & Tracking',
    hook: 'Educatief',
    status: 'draft',
    concept: `Server-side tracking uitgelegd in 60 seconden.

Oude manier (client-side):
Browser → Pixel → Facebook/Google
Probleem: Adblockers, iOS, consent → 30-40% data loss

Nieuwe manier (server-side):
Browser → Jouw Server → Facebook/Google
Voordeel: Meer controle, meer data, betere resultaten

Wat je nodig hebt:
1. Google Tag Manager Server Container
2. Cloud hosting (Google Cloud, AWS, Stape)
3. Iemand die weet wat ie doet

Kosten: €50-200/maand hosting
ROI: Meestal 20-40% meer gemeten conversies

Is het voor iedereen? Nee.
Is het voor serieuze advertisers? Absoluut.

#tracking #serverside #googleads #metaads`,
  },
  {
    id: 8,
    title: 'Performance Max is geen magic button',
    category: 'Marketing',
    hook: 'Hot take',
    status: 'draft',
    concept: `Performance Max is geen magic button.

Google's pitch: "Laat AI alles doen!"
Realiteit: Garbage in, garbage out.

Wat we zien bij audits:
❌ Alle producten in 1 asset group
❌ Geen audience signals
❌ Stock foto's als assets
❌ Geen brand exclusions
❌ "Laten draaien" zonder analyse

Resultaat: Google optimaliseert op wat makkelijk is, niet op wat winstgevend is.

Wat wél werkt:
→ Segmenteer op marge/categorie
→ Feed audience data
→ Custom assets per product type
→ Exclude branded search
→ Check placement reports wekelijks

PMax is krachtig.
Maar alleen als je het stuurt.

#googleads #pmax #ecommerce #marketing`,
  },
  {
    id: 9,
    title: 'Het probleem met full-service agencies',
    category: 'Thought Leadership',
    hook: 'Industry kritiek',
    status: 'idea',
    concept: `Het probleem met "full-service" agencies.

Ik heb bij 3 gewerkt. Dit is wat ik zag:

Full-service = jack of all trades, master of none.

Het model:
→ Verkoop alles aan iedereen
→ Junior doet het werk (goedkoop)
→ Senior zit in meetings (duur)
→ Klant betaalt voor overhead

Het resultaat:
→ Middelmatige uitvoering
→ Geen echte expertise
→ "Het loopt wel"

Wat beter werkt:
Specialists die samenwerken.

Wij doen: AI + Data + Performance
We doen NIET: Branding, websites, social content

Voor de rest verwijzen we door.

Klant krijgt experts op elk vlak.
Wij blijven scherp in ons vak.

#agency #marketing #specialist #business`,
  },
  {
    id: 10,
    title: 'Hoe we meetings halveerden zonder chaos',
    category: 'Ondernemerschap',
    hook: 'Operationeel',
    status: 'idea',
    concept: `Hoe we meetings halveerden zonder chaos.

Vorig jaar: gemiddeld 4 uur meetings per dag.
Nu: gemiddeld 2 uur.

Wat we veranderden:

1. Standaard 25 minuten (niet 30)
→ Dwingt focus
→ 5 min buffer tussen calls

2. Async eerst
→ Kan dit een Slack bericht zijn?
→ Kan dit een Loom zijn?
→ Nee? Dan meeting.

3. Agenda verplicht
→ Geen agenda = meeting wordt geweigerd

4. Meeting-vrije dagen
→ Woensdag = focus day
→ Geen interne meetings

Resultaat:
→ Meer deep work
→ Betere beslissingen
→ Team is gelukkiger

#productivity #agency #management`,
  },
  {
    id: 11,
    title: 'Franky Case: Hun "geweldige ROAS" was een leugen',
    category: 'Case Study',
    hook: 'Eerlijke consultant angle',
    status: 'ready',
    concept: `Vorig jaar januari kregen we een nieuwe klant: een sieraden merk met "geweldige ROAS."

Eerste wat ik deed: de data checken.

Bleek dat die geweldige ROAS... dubbel werd gemeten.

Conversies werden meerdere keren geteld. Hun échte performance was een stuk minder rooskleurig.

Nu kun je twee dingen doen:
1. Niks zeggen en lekker doorboeren op die "mooie" cijfers
2. Eerlijk zijn en het fundament fixen

Wij kozen optie 2.

Wat we deden:
→ Server-side tracking geïmplementeerd (echte data)
→ Google Shopping feed compleet herbouwd  
→ Alle kanalen geoptimaliseerd op basis van correcte cijfers
→ TikTok toegevoegd
→ Duitsland gelanceerd

13 maanden later:
→ Webshop omzet flink gestegen
→ Duitsland draait met hoge ROAS
→ Elke euro die ze uitgeven is meetbaar én winstgevend

De ironie? 

Door eerlijk te zijn over slechte data, konden we pas écht gaan groeien.

Measuring wrong = optimizing wrong.
Fix your foundation first.

#ecommerce #tracking #googleads #casestudy`,
  },
  {
    id: 12,
    title: 'Franky Case: Testimonial van Franca',
    category: 'Case Study',
    hook: 'Klant perspectief - voor Franca',
    status: 'ready',
    concept: `[POST VANUIT FRANCA - FRANKY AMSTERDAM]

Een jaar geleden dacht ik dat mijn marketing goed liep.

Onze ROAS zag er mooi uit. We groeiden. Alles leek prima.

Tot ons nieuwe bureau één vraag stelde: 

"Mogen we even in je tracking kijken?"

Wat ze vonden was pijnlijk: onze conversies werden dubbel geteld. Die "mooie" cijfers? Waren niet echt.

Eerlijk? Ik schrok. 

Als ondernemer neem je beslissingen op basis van data. En mijn data klopte niet.

Maar in plaats van in paniek te raken, zijn we gaan bouwen:
→ Nieuwe tracking die wél klopt
→ Advertenties die wél renderen
→ Een Duitsland lancering die wél werkt

Nu, 13 maanden later, is onze omzet flink gegroeid. 

En dit keer weet ik: de cijfers zijn echt.

Aan elke ondernemer die dit leest: wanneer heb jij voor het laatst je tracking laten checken?

Je zou weleens verrast kunnen worden.

#ecommerce #ondernemen #fashion #marketing`,
  },
]

// Outreach templates
const outreachTemplates = [
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
  {
    id: 4,
    name: 'Post engagement follow-up',
    type: 'linkedin',
    template: `Hey [naam],

Zag je reactie op mijn post over [onderwerp] - goede toevoeging!

Ben benieuwd: herken je dat probleem bij [bedrijf]? Of hebben jullie dat al opgelost?

Ruben`,
  },
  {
    id: 5,
    name: 'Referral vraag',
    type: 'email',
    template: `Hey [naam],

Hoop dat alles goed gaat met [bedrijf]!

Ik ben op zoek naar webshops die worstelen met hun ads - ken jij toevallig iemand in je netwerk die daar mee zit?

Geen druk, maar als je iemand kent: een intro zou super zijn.

Thanks!
Ruben`,
  },
]

// Sales targets
const salesTargets = {
  current: { deals: '2-3', retainer: '€3-5K', ratio: '90/10', pipeline: '~€50K' },
  target90d: { deals: '4-5', retainer: '€6-8K', ratio: '60/40', pipeline: '€150K' },
}

// Website improvement tasks
const websiteTasks = {
  critical: [
    { id: 1, task: 'Fix stats counters', desc: 'Tonen nu "0" - animatie werkt niet', status: 'todo' },
    { id: 2, task: 'Footer: "fabrica® Studio" → Nodefy', desc: 'Template placeholder verwijderen', status: 'todo' },
    { id: 3, task: 'Fix telefoon placeholder', desc: '(312) 555-2468 is nep', status: 'todo' },
    { id: 4, task: 'Social links updaten', desc: 'Twitter → Nodefy, Dribbble verwijderen', status: 'todo' },
    { id: 5, task: 'Blog link fixen', desc: 'Gaat nu naar /what-we-do ipv /blog', status: 'todo' },
    { id: 6, task: 'Cases: placeholders verwijderen', desc: '"filter-category" zichtbaar bij Stories', status: 'todo' },
  ],
  improvements: [
    { id: 7, task: 'FAQs herschrijven', desc: 'Nu website-gericht, moet marketing/AI zijn', status: 'todo' },
    { id: 8, task: 'Meer AI messaging toevoegen', desc: 'AI komt te weinig terug voor "AI Infused"', status: 'todo' },
    { id: 9, task: 'Email checken', desc: 'info@nodefy.ai of info@nodefy.nl?', status: 'todo' },
    { id: 10, task: 'Framer badge verwijderen', desc: 'Pro plan nodig', status: 'todo' },
  ],
  suggestions: [
    { id: 11, task: 'Concrete resultaten toevoegen', desc: 'ROAS cijfers, % groei, bespaarde uren', status: 'idea' },
    { id: 12, task: 'Team/About page vullen', desc: 'Ruben & team zichtbaar maken', status: 'idea' },
    { id: 13, task: 'AI tools showcase', desc: 'Laat zien welke AI jullie gebruiken', status: 'idea' },
    { id: 14, task: 'Pricing indicatie', desc: '"Vanaf €X" of duidelijke CTA', status: 'idea' },
    { id: 15, task: 'Testimonials toevoegen', desc: 'Quotes van klanten', status: 'idea' },
  ],
}

// Today's tasks (14 feb 2026)
const todayTasks = [
  { 
    id: 't1', 
    category: 'Website', 
    task: 'Footer fixen: "fabrica®" → "Nodefy B.V."', 
    time: '5 min',
    priority: 'high'
  },
  { 
    id: 't2', 
    category: 'Website', 
    task: 'Telefoon updaten: echte nummer invullen', 
    time: '2 min',
    priority: 'high'
  },
  { 
    id: 't3', 
    category: 'Website', 
    task: 'Email checken: info@nodefy.nl of .ai?', 
    time: '2 min',
    priority: 'high'
  },
  { 
    id: 't4', 
    category: 'Website', 
    task: 'Social links: LinkedIn toevoegen, Dribbble weg', 
    time: '5 min',
    priority: 'high'
  },
  { 
    id: 't5', 
    category: 'Website', 
    task: 'Stats invullen: echte cijfers (50+ clients, etc)', 
    time: '10 min',
    priority: 'high'
  },
  { 
    id: 't6', 
    category: 'LinkedIn', 
    task: 'Post plaatsen: "We vervingen 3 uur handwerk..."', 
    time: '15 min',
    priority: 'medium'
  },
  { 
    id: 't7', 
    category: 'Content', 
    task: 'Case study uitwerken (Franky of Stories)', 
    time: '60 min',
    priority: 'medium'
  },
  { 
    id: 't8', 
    category: 'Tools', 
    task: 'Tracking Health Checker afmaken', 
    time: '90 min',
    priority: 'building',
    assignee: 'AI'
  },
  { 
    id: 't9', 
    category: 'Tools', 
    task: 'ROAS Calculator reviewen + verbeteren', 
    time: '60 min',
    priority: 'building',
    assignee: 'AI'
  },
]

// Agency OS Apps
const agencyOsApps = {
  priority: [
    {
      id: 'alertpilot',
      name: 'AlertPilot',
      emoji: '🚨',
      description: 'Campagne Monitoring & Alerts',
      features: [
        'ROAS daalt onder target',
        'Budget bijna op',
        'Conversies stoppen',
        'CPL/CPA spikes'
      ],
      integrations: ['Google Ads', 'Meta Ads', 'Triple Whale'],
      notifications: ['Slack', 'Telegram', 'Email'],
      effort: 'Medium',
      impact: 'Hoog',
      status: 'idea'
    },
    {
      id: 'clientpulse',
      name: 'ClientPulse',
      emoji: '📊',
      description: 'Klant Health Dashboard',
      features: [
        'Status: 🟢 Gezond / 🟡 Aandacht / 🔴 Risico',
        'Laatste contact datum',
        'Performance trend',
        'Contract verloop',
        'Upsell opportunities'
      ],
      integrations: ['HubSpot', 'Google Ads', 'Meta Ads'],
      notifications: [],
      effort: 'Medium',
      impact: 'Hoog',
      status: 'idea'
    },
    {
      id: 'capacitytracker',
      name: 'CapacityTracker',
      emoji: '⏱️',
      description: 'Team Workload & Beschikbaarheid',
      features: [
        'Uren per klant per persoon',
        'Beschikbare capaciteit',
        'Nieuwe klant fit check'
      ],
      integrations: ['HubSpot', 'Google Calendar'],
      notifications: [],
      effort: 'Laag',
      impact: 'Medium',
      status: 'idea'
    },
    {
      id: 'briefbuilder',
      name: 'BriefBuilder',
      emoji: '📝',
      description: 'AI Campaign Brief Generator',
      features: [
        'Intake form → AI brief',
        'Campagne strategie',
        'Doelgroep omschrijving',
        'Ad copy suggesties',
        'Budget verdeling'
      ],
      integrations: ['HubSpot', 'OpenAI'],
      notifications: [],
      effort: 'Medium',
      impact: 'Hoog',
      status: 'idea'
    },
    {
      id: 'revenuepulse',
      name: 'RevenuePulse',
      emoji: '💰',
      description: 'Finance Dashboard',
      features: [
        'MRR per klant',
        'Pipeline waarde',
        'Churn risk (€)',
        'Upsell potential',
        'Retainer vs project split'
      ],
      integrations: ['HubSpot', 'Exact/Moneybird'],
      notifications: [],
      effort: 'Medium',
      impact: 'Medium',
      status: 'idea'
    },
  ],
  niceToHave: [
    { id: 'onboardflow', name: 'OnboardFlow', emoji: '✅', description: 'Checklist voor nieuwe klant onboarding' },
    { id: 'playbookhub', name: 'PlaybookHub', emoji: '📚', description: 'Interne kennisbank + SOPs' },
    { id: 'competitorradar', name: 'CompetitorRadar', emoji: '👀', description: 'Monitor concurrent ads (Meta Ad Library)' },
    { id: 'pacingmonitor', name: 'PacingMonitor', emoji: '📈', description: 'Budget pacing per klant per maand' },
    { id: 'meetingprep', name: 'MeetingPrep', emoji: '🎯', description: 'AI samenvat vorige calls + data voor klantgesprek' },
  ],
  tools: [
    { id: 'roas-calculator', name: 'ROAS Calculator', emoji: '🧮', description: 'Lead gen tool voor website', status: 'in-progress', url: 'https://github.com/nodefy/roas-calculator' },
    { id: 'tracking-health', name: 'Tracking Health Checker', emoji: '🔍', description: 'Audit tracking setup via URL', status: 'in-progress', url: '' },
  ]
}

// Client Cases
const clientCases = [
  {
    id: 'unity-units',
    name: 'Unity Units',
    industry: 'Vastgoed / Storage Units',
    logo: '🏢',
    location: 'Hilversum (landelijk actief)',
    challenge: 'Gefragmenteerde lead data, geen overzicht per makelaar, marketing optimalisatie op onderbuikgevoel',
    solution: [
      'HubSpot CRM implementatie met custom objects',
      'Custom makelaar portal voor lead feedback',
      'Lead source tracking per kanaal en makelaar',
      'Closed-loop reporting voor campagne optimalisatie'
    ],
    results: [
      { metric: 'Gekwalificeerde leads', value: '+72%', color: 'green' },
      { metric: 'Lead response tijd', value: '48 → 4 uur', color: 'green' },
      { metric: 'Marketing efficiency', value: '+35%', color: 'green' },
      { metric: 'Makelaar tevredenheid', value: '6.2 → 8.7', color: 'green' }
    ],
    quote: '"Voorheen optimaliseerden we op clicks. Nu optimaliseren we op getekende contracten."',
    services: ['HubSpot', 'Custom Development', 'Google Ads', 'Meta Ads'],
    duration: '3 maanden implementatie',
    featured: true
  },
  {
    id: 'stories',
    name: 'Stories',
    industry: 'B2B Leadgen',
    logo: '📖',
    location: 'Amsterdam',
    challenge: 'Inconsistente lead flow, hoge cost per lead, geen inzicht in funnel performance',
    solution: [
      'LinkedIn Ads strategie herstructurering',
      'Conversion tracking optimalisatie',
      'Lead scoring implementatie',
      'Weekly performance reporting'
    ],
    results: [
      { metric: 'Cost per Lead', value: '-45%', color: 'green' },
      { metric: 'Lead volume', value: '+120%', color: 'green' },
      { metric: 'SQL ratio', value: '18% → 34%', color: 'green' }
    ],
    quote: '"Eindelijk predictable growth. We weten precies wat we krijgen voor elke euro."',
    services: ['LinkedIn Ads', 'HubSpot', 'Reporting'],
    duration: '6 maanden samenwerking',
    featured: true
  },
  {
    id: 'franky',
    name: 'Franky Amsterdam',
    industry: 'E-commerce / Fashion & Sieraden',
    logo: '💎',
    location: 'Amsterdam',
    challenge: 'ROAS werd dubbel gemeten (onbetrouwbare data), geen server-side tracking, Google Shopping feed niet geoptimaliseerd, geen Duitsland strategie',
    solution: [
      'Volledige server-side tracking implementatie',
      'Google Shopping feed grondig verbeterd',
      'Budget testing & data-driven optimalisatie',
      'Duitsland expansie via eigen advertising',
      'TikTok Ads opgezet voor nieuwe doelgroep'
    ],
    results: [
      { metric: 'ROAS Duitsland', value: 'Zeer hoog', color: 'green' },
      { metric: 'Conversie data', value: '+40%', color: 'green' },
      { metric: 'Nieuwe markten', value: 'DE live', color: 'green' },
      { metric: 'TikTok', value: 'Succes', color: 'green' }
    ],
    quote: '"De tracking fix was de game-changer. Eindelijk betrouwbare data om beslissingen op te baseren."',
    services: ['Google Ads', 'Meta Ads', 'TikTok Ads', 'Server-side Tracking', 'Shopping Feed'],
    duration: '13+ maanden samenwerking',
    featured: true
  }
]

// Quick actions
const quickActions = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/rubenstrootman/', icon: '🔗' },
  { label: 'Post', url: 'https://www.linkedin.com/post/new/', icon: '✏️' },
  { label: 'HubSpot', url: 'https://app.hubspot.com/', icon: '💼' },
  { label: 'Website', url: 'https://nodefry.framer.website', icon: '🌐' },
]

export default function SalesDashboard() {
  const [activeTab, setActiveTab] = useState<'today' | 'cases' | 'posts' | 'outreach' | 'icp' | 'strategy' | 'website' | 'agencyos'>('today')
  const [selectedPost, setSelectedPost] = useState<typeof linkedinPosts[0] | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<typeof outreachTemplates[0] | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<typeof personas[0] | null>(null)
  const [filter, setFilter] = useState('all')
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load completed tasks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nodefy-completed-tasks-20260214')
    if (saved) {
      setCompletedTasks(JSON.parse(saved))
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever completedTasks changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('nodefy-completed-tasks-20260214', JSON.stringify(completedTasks))
    }
  }, [completedTasks, isLoaded])

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const completedCount = completedTasks.length
  const totalTasks = todayTasks.length

  const filteredPosts = filter === 'all' ? linkedinPosts : linkedinPosts.filter(p => p.status === filter)
  const readyCount = linkedinPosts.filter(p => p.status === 'ready').length

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00C853] flex items-center justify-center font-bold text-white text-lg">N</div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Nodefy Sales</h1>
                <p className="text-sm text-gray-500 hidden sm:block">Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {quickActions.map((a) => (
                <a key={a.label} href={a.url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg hover:bg-gray-100 text-sm transition-colors" title={a.label}>
                  <span>{a.icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Deals/maand</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-gray-900">{salesTargets.current.deals}</span>
              <span className="text-sm text-[#00C853] font-medium">→ {salesTargets.target90d.deals}</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Retainer</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-gray-900">{salesTargets.current.retainer}</span>
              <span className="text-sm text-[#00C853] font-medium hidden sm:inline">→ {salesTargets.target90d.retainer}</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Posts Ready</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-[#00C853]">{readyCount}</span>
              <span className="text-sm text-gray-400">/ {linkedinPosts.length}</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Pipeline</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-gray-900">{salesTargets.current.pipeline}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white p-1 rounded-xl border border-gray-200 overflow-x-auto">
          {[
            { id: 'today', label: 'Vandaag', icon: '🔥', count: totalTasks - completedCount },
            { id: 'cases', label: 'Cases', icon: '📈', count: clientCases.length },
            { id: 'agencyos', label: 'Agency OS', icon: '⚡', count: agencyOsApps.priority.length },
            { id: 'posts', label: 'LinkedIn', icon: '📝', count: linkedinPosts.length },
            { id: 'outreach', label: 'Outreach', icon: '📨', count: outreachTemplates.length },
            { id: 'icp', label: 'ICP', icon: '🎯', count: personas.length },
            { id: 'strategy', label: 'Strategy', icon: '📊' },
            { id: 'website', label: 'Website', icon: '🌐', count: websiteTasks.critical.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#00C853] text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="hidden sm:inline">{tab.icon} </span>
              {tab.label}
              {tab.count && <span className="ml-1.5 opacity-70">({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* TODAY TAB */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            {/* Progress header */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Vandaag — 14 februari</h2>
                  <p className="text-sm text-gray-500 mt-1">Focus op de belangrijkste taken</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-2xl font-bold text-[#00C853]">{completedCount}</span>
                    <span className="text-2xl font-bold text-gray-300">/{totalTasks}</span>
                  </div>
                  <div className="w-24 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#00C853] rounded-full transition-all duration-300"
                      style={{ width: `${(completedCount / totalTasks) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* High priority tasks */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                Website fixes
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full ml-2">~25 min totaal</span>
              </h3>
              <div className="space-y-2">
                {todayTasks.filter(t => t.priority === 'high').map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`w-full flex items-start gap-3 p-4 rounded-xl transition-all text-left ${
                      completedTasks.includes(task.id)
                        ? 'bg-green-50 opacity-60'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      completedTasks.includes(task.id)
                        ? 'bg-[#00C853] border-[#00C853] text-white'
                        : 'border-gray-300'
                    }`}>
                      {completedTasks.includes(task.id) && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <div className="flex-1">
                      <h4 className={`font-medium ${completedTasks.includes(task.id) ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {task.task}
                      </h4>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{task.time}</span>
                  </button>
                ))}
              </div>
              <a 
                href="https://nodefry.framer.website" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-[#00C853] hover:underline"
              >
                Open Framer website →
              </a>
            </div>

            {/* Medium priority tasks */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-400 rounded-full"></span>
                Content & Marketing
                <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full ml-2">~75 min totaal</span>
              </h3>
              <div className="space-y-2">
                {todayTasks.filter(t => t.priority === 'medium').map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`w-full flex items-start gap-3 p-4 rounded-xl transition-all text-left ${
                      completedTasks.includes(task.id)
                        ? 'bg-green-50 opacity-60'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      completedTasks.includes(task.id)
                        ? 'bg-[#00C853] border-[#00C853] text-white'
                        : 'border-gray-300'
                    }`}>
                      {completedTasks.includes(task.id) && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <div className="flex-1">
                      <h4 className={`font-medium ${completedTasks.includes(task.id) ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {task.task}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{task.category}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{task.time}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Building tasks (AI) */}
            <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                AI is bezig met...
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-2">~2.5 uur</span>
              </h3>
              <div className="space-y-2">
                {todayTasks.filter(t => t.priority === 'building').map((task) => (
                  <div
                    key={task.id}
                    className={`w-full flex items-start gap-3 p-4 rounded-xl transition-all text-left ${
                      completedTasks.includes(task.id)
                        ? 'bg-green-50'
                        : 'bg-blue-50'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      completedTasks.includes(task.id)
                        ? 'bg-[#00C853] text-white'
                        : 'bg-blue-200 text-blue-600'
                    }`}>
                      {completedTasks.includes(task.id) ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs">🤖</span>
                      )}
                    </span>
                    <div className="flex-1">
                      <h4 className={`font-medium ${completedTasks.includes(task.id) ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {task.task}
                      </h4>
                      <p className="text-xs text-blue-600 mt-0.5">Wordt door AI opgepakt</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{task.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-gradient-to-r from-[#00C853]/10 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-3">Quick links</h3>
              <div className="flex flex-wrap gap-2">
                <a href="https://nodefry.framer.website" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">🌐 Framer website</a>
                <a href="https://www.linkedin.com/post/new/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">✏️ LinkedIn post</a>
                <a href="https://app.hubspot.com/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">💼 HubSpot</a>
              </div>
            </div>

            {/* Completion message */}
            {completedCount === totalTasks && (
              <div className="bg-[#00C853] rounded-2xl p-6 text-white text-center">
                <span className="text-4xl mb-2 block">🎉</span>
                <h3 className="text-xl font-semibold">Alles gedaan!</h3>
                <p className="text-green-100 mt-1">Goed bezig. Geniet van je weekend!</p>
              </div>
            )}
          </div>
        )}

        {/* CASES TAB */}
        {activeTab === 'cases' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00C853] to-emerald-500 rounded-2xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Client Cases</h2>
              <p className="text-green-100">Bewezen resultaten voor onze klanten</p>
            </div>

            {/* Featured Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {clientCases.filter(c => c.featured).map((caseItem) => (
                <div key={caseItem.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-3xl">
                          {caseItem.logo}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{caseItem.name}</h3>
                          <p className="text-sm text-gray-500">{caseItem.industry}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{caseItem.location}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Featured</span>
                    </div>
                  </div>

                  {/* Challenge */}
                  <div className="p-6 bg-red-50 border-b border-red-100">
                    <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Uitdaging
                    </h4>
                    <p className="text-sm text-gray-700">{caseItem.challenge}</p>
                  </div>

                  {/* Solution */}
                  <div className="p-6 border-b border-gray-100">
                    <h4 className="text-sm font-semibold text-[#00C853] mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#00C853] rounded-full"></span>
                      Onze Aanpak
                    </h4>
                    <ul className="space-y-2">
                      {caseItem.solution.map((s, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-[#00C853] mt-0.5">✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Results */}
                  <div className="p-6 bg-green-50">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Resultaten</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {caseItem.results.map((r, i) => (
                        <div key={i} className="bg-white rounded-xl p-3 border border-green-100">
                          <p className="text-xs text-gray-500">{r.metric}</p>
                          <p className="text-lg font-bold text-[#00C853]">{r.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="p-6 border-t border-gray-100">
                    <p className="text-sm text-gray-600 italic">{caseItem.quote}</p>
                  </div>

                  {/* Footer */}
                  <div className="px-6 pb-6">
                    <div className="flex flex-wrap gap-2">
                      {caseItem.services.map((s, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">{caseItem.duration}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Other Cases */}
            {clientCases.filter(c => !c.featured).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Meer Cases</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clientCases.filter(c => !c.featured).map((caseItem) => (
                    <div key={caseItem.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                          {caseItem.logo}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{caseItem.name}</h4>
                          <p className="text-xs text-gray-500">{caseItem.industry}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{caseItem.challenge}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {caseItem.results.slice(0, 2).map((r, i) => (
                          <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                            {r.metric}: {r.value}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {caseItem.services.slice(0, 3).map((s, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Meer cases toevoegen?</h3>
              <p className="text-sm text-gray-500 mb-4">Vraag de AI agent om een nieuwe case te schrijven</p>
              <div className="flex justify-center gap-2 flex-wrap">
                <span className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg">Floryn</span>
                <span className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg">Johan Cruyff</span>
                <span className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg">Lake Cycling</span>
                <span className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg">Tours & Tickets</span>
              </div>
            </div>
          </div>
        )}

        {/* POSTS TAB */}
        {activeTab === 'posts' && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-2/5">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-2">
                  {['all', 'ready', 'draft', 'idea'].map((f) => (
                    <button 
                      key={f} 
                      onClick={() => setFilter(f)} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filter === f 
                          ? 'bg-[#00C853] text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f === 'all' ? 'Alle' : f}
                    </button>
                  ))}
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                  {filteredPosts.map((post) => (
                    <button 
                      key={post.id} 
                      onClick={() => setSelectedPost(post)} 
                      className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        selectedPost?.id === post.id ? 'bg-green-50 border-l-4 border-l-[#00C853]' : ''
                      }`}
                    >
                      <h3 className="font-medium text-sm text-gray-900 line-clamp-2">{post.title}</h3>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{post.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          post.status === 'ready' ? 'bg-green-100 text-green-700' : 
                          post.status === 'draft' ? 'bg-amber-100 text-amber-700' : 
                          'bg-gray-100 text-gray-500'
                        }`}>{post.status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:w-3/5">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full min-h-[400px]">
                {selectedPost ? (
                  <>
                    <div className="p-4 border-b border-gray-100 flex justify-between items-start gap-4">
                      <h2 className="font-semibold text-gray-900">{selectedPost.title}</h2>
                      <button 
                        onClick={() => copyToClipboard(selectedPost.concept, selectedPost.id)} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                          copiedId === selectedPost.id 
                            ? 'bg-green-500 text-white' 
                            : 'bg-[#00C853] text-white hover:bg-green-600'
                        }`}
                      >
                        {copiedId === selectedPost.id ? '✓ Gekopieerd' : 'Kopieer'}
                      </button>
                    </div>
                    <div className="p-4">
                      <pre className="bg-gray-50 rounded-xl p-4 text-sm text-gray-800 whitespace-pre-wrap max-h-[400px] overflow-y-auto font-sans leading-relaxed">{selectedPost.concept}</pre>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 py-20">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">📝</span>
                      <p>Selecteer een post</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* OUTREACH TAB */}
        {activeTab === 'outreach' && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                {outreachTemplates.map((t) => (
                  <button 
                    key={t.id} 
                    onClick={() => setSelectedTemplate(t)} 
                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      selectedTemplate?.id === t.id ? 'bg-green-50 border-l-4 border-l-[#00C853]' : ''
                    }`}
                  >
                    <h3 className="font-medium text-gray-900">{t.name}</h3>
                    <span className="text-xs text-gray-500 mt-1 inline-block">{t.type}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:w-2/3">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-h-[400px]">
                {selectedTemplate ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-semibold text-lg text-gray-900">{selectedTemplate.name}</h2>
                      <button 
                        onClick={() => copyToClipboard(selectedTemplate.template, selectedTemplate.id)} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          copiedId === selectedTemplate.id 
                            ? 'bg-green-500 text-white' 
                            : 'bg-[#00C853] text-white hover:bg-green-600'
                        }`}
                      >
                        {copiedId === selectedTemplate.id ? '✓ Gekopieerd' : 'Kopieer'}
                      </button>
                    </div>
                    <pre className="bg-gray-50 rounded-xl p-6 text-sm whitespace-pre-wrap text-gray-800 font-sans">{selectedTemplate.template}</pre>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">📨</span>
                      <p>Selecteer een template</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ICP TAB */}
        {activeTab === 'icp' && (
          <div className="space-y-6">
            {/* Personas */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Buyer Personas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {personas.map((p) => (
                  <button 
                    key={p.id} 
                    onClick={() => setSelectedPersona(selectedPersona?.id === p.id ? null : p)} 
                    className={`text-left bg-white rounded-2xl p-5 border shadow-sm transition-all ${
                      selectedPersona?.id === p.id 
                        ? 'border-[#00C853] ring-2 ring-green-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00C853] to-emerald-400 flex items-center justify-center text-white font-semibold">
                        {p.name.split(' ')[0][0]}{p.name.split(' ')[1][0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{p.name}</h3>
                        <p className="text-xs text-gray-500">{p.age} jaar • {p.role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{p.company}</p>
                  </button>
                ))}
              </div>
              
              {selectedPersona && (
                <div className="mt-4 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-[#00C853] mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#00C853] rounded-full"></span>
                        Goals
                      </h4>
                      <ul className="space-y-1.5">{selectedPersona.goals.map((g, i) => <li key={i} className="text-sm text-gray-700">• {g}</li>)}</ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-red-500 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        Pains
                      </h4>
                      <ul className="space-y-1.5">{selectedPersona.pains.map((p, i) => <li key={i} className="text-sm text-gray-700">• {p}</li>)}</ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-amber-500 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        Triggers
                      </h4>
                      <ul className="space-y-1.5">{selectedPersona.triggers.map((t, i) => <li key={i} className="text-sm text-gray-700">• {t}</li>)}</ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        Objections
                      </h4>
                      <ul className="space-y-1.5">{selectedPersona.objections.map((o, i) => <li key={i} className="text-sm text-gray-500 italic">{o}</li>)}</ul>
                    </div>
                  </div>
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Channels</h4>
                    <div className="flex gap-2 flex-wrap">{selectedPersona.channels.map((c, i) => <span key={i} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{c}</span>)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Pain Points */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Pain Points</h2>
              <div className="space-y-3">
                {painPoints.map((p) => (
                  <div key={p.rank} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-start gap-4">
                    <span className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {p.rank}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{p.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{p.impact}</p>
                      <p className="text-sm text-[#00C853] mt-1 font-medium">→ {p.solution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Communities */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Communities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {communities.map((c, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <h3 className="font-medium text-gray-900">{c.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{c.platform} • {c.size}</span>
                      <div className="flex">{[...Array(c.relevance)].map((_, j) => <span key={j} className="text-amber-400 text-sm">★</span>)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STRATEGY TAB */}
        {activeTab === 'strategy' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-3 h-3 bg-[#00C853] rounded-full"></span>
                  <h3 className="font-semibold text-gray-900">Week 1-4</h3>
                </div>
                <p className="text-sm text-gray-500 mb-3">Foundation</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-gray-300"></span>LinkedIn 3x/week</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-gray-300"></span>3 case studies</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-gray-300"></span>Comment strategy</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-gray-300"></span>€10K package test</li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-3 h-3 bg-amber-400 rounded-full"></span>
                  <h3 className="font-semibold text-gray-900">Week 5-8</h3>
                </div>
                <p className="text-sm text-gray-500 mb-3">Outbound</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-gray-300"></span>50 connecties/week</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-gray-300"></span>DM sequence</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-gray-300"></span>Cold outreach</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-gray-300"></span>Partnerships</li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                  <h3 className="font-semibold text-gray-900">Week 9-12</h3>
                </div>
                <p className="text-sm text-gray-500 mb-3">Scale</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-gray-300"></span>Content engine</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-gray-300"></span>5 meetings/week</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-gray-300"></span>Pipeline 3x</li>
                  <li className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-gray-300"></span>Playbook docs</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Key Insights</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { n: 1, t: 'Specialisatie is verplicht', d: '84% succesvolle agencies is specialist' },
                  { n: 2, t: 'Sales is #1 bottleneck', d: 'Outbound agencies groeien 3-5x sneller' },
                  { n: 3, t: 'AI is de multiplier', d: '95% marketeers gebruikt AI tools' },
                  { n: 4, t: 'Pricing = waarde', d: 'Slechts 2% doet value-based pricing' },
                  { n: 5, t: 'Schalen = systemen', d: 'Founder uit productie bij <25 FTE' },
                ].map((f) => (
                  <div key={f.n} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <span className="w-8 h-8 rounded-full bg-[#00C853] text-white flex items-center justify-center text-sm font-bold">{f.n}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{f.t}</h4>
                      <p className="text-sm text-gray-500">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WEBSITE TAB */}
        {activeTab === 'website' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Website Review</h2>
                <p className="text-sm text-gray-500 mt-1">nodefry.framer.website</p>
              </div>
              <a href="https://nodefry.framer.website" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00C853] text-white rounded-xl font-medium hover:bg-green-600 transition-colors">
                Open Website →
              </a>
            </div>

            {/* Critical */}
            <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                Kritiek
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full ml-2">{websiteTasks.critical.length}</span>
              </h3>
              <div className="space-y-2">
                {websiteTasks.critical.map((t) => (
                  <div key={t.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
                    <span className="w-5 h-5 rounded border-2 border-red-300 flex-shrink-0 mt-0.5"></span>
                    <div>
                      <h4 className="font-medium text-gray-900">{t.task}</h4>
                      <p className="text-sm text-gray-500">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvements */}
            <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-400 rounded-full"></span>
                Verbeterpunten
                <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full ml-2">{websiteTasks.improvements.length}</span>
              </h3>
              <div className="space-y-2">
                {websiteTasks.improvements.map((t) => (
                  <div key={t.id} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                    <span className="w-5 h-5 rounded border-2 border-amber-300 flex-shrink-0 mt-0.5"></span>
                    <div>
                      <h4 className="font-medium text-gray-900">{t.task}</h4>
                      <p className="text-sm text-gray-500">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-[#00C853] rounded-full"></span>
                Suggesties
                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full ml-2">{websiteTasks.suggestions.length}</span>
              </h3>
              <div className="space-y-2">
                {websiteTasks.suggestions.map((t) => (
                  <div key={t.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                    <span className="w-5 h-5 rounded border-2 border-green-300 flex-shrink-0 mt-0.5"></span>
                    <div>
                      <h4 className="font-medium text-gray-900">{t.task}</h4>
                      <p className="text-sm text-gray-500">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AGENCY OS TAB */}
        {activeTab === 'agencyos' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">⚡</span>
                <h2 className="text-2xl font-bold">Nodefy Agency OS</h2>
              </div>
              <p className="text-gray-400">Interne tools voor operations, monitoring & groei</p>
            </div>

            {/* Current Tools */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                In Development
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agencyOsApps.tools.map((tool) => (
                  <div key={tool.id} className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{tool.emoji}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                          <p className="text-sm text-gray-600">{tool.description}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">In progress</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Apps */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                🏆 Top 5 Priority Apps
              </h3>
              <div className="space-y-4">
                {agencyOsApps.priority.map((app, index) => (
                  <div key={app.id} className="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-2xl flex-shrink-0">
                        {app.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-400 font-mono">0{index + 1}</span>
                          <h4 className="font-semibold text-gray-900">{app.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            app.impact === 'Hoog' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            Impact: {app.impact}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{app.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {app.features.slice(0, 3).map((f, i) => (
                            <span key={i} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded">
                              {f}
                            </span>
                          ))}
                          {app.features.length > 3 && (
                            <span className="text-xs text-gray-400 px-2 py-1">
                              +{app.features.length - 3} more
                            </span>
                          )}
                        </div>
                        {app.integrations.length > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-gray-400">Integrations:</span>
                            {app.integrations.map((int, i) => (
                              <span key={i} className="text-xs text-gray-500">{int}{i < app.integrations.length - 1 ? ',' : ''}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nice to Have */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                💡 Nice to Have
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {agencyOsApps.niceToHave.map((app) => (
                  <div key={app.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{app.emoji}</span>
                      <h4 className="font-medium text-gray-900 text-sm">{app.name}</h4>
                    </div>
                    <p className="text-xs text-gray-500">{app.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-gradient-to-r from-[#00C853]/10 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2">🎯 Aanbevolen startpunt</h3>
              <p className="text-gray-600 text-sm mb-4">
                Begin met <strong>AlertPilot</strong> en <strong>ClientPulse</strong> — direct waarde, relatief snel te bouwen, en dagelijks nut.
              </p>
              <div className="flex gap-2">
                <span className="text-xs bg-white border border-green-200 px-3 py-1.5 rounded-lg">AlertPilot: voorkom fuck-ups</span>
                <span className="text-xs bg-white border border-green-200 px-3 py-1.5 rounded-lg">ClientPulse: overzicht dat nu mist</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
