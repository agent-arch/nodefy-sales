'use client'

import { useState } from 'react'

// ============================================
// NODEFY SALES DASHBOARD
// LinkedIn, Outreach, ICP, Strategy
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
  target12m: { deals: '8-10', retainer: '€10-15K', ratio: '40/60', pipeline: '€250K' },
}

// Quick actions
const quickActions = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/rubenstrootman/', icon: '🔗' },
  { label: 'Post', url: 'https://www.linkedin.com/post/new/', icon: '📝' },
  { label: 'HubSpot', url: 'https://app.hubspot.com/', icon: '💰' },
  { label: 'Projects', url: 'https://nodefy-openclawd.vercel.app', icon: '📊' },
]

export default function SalesDashboard() {
  const [activeTab, setActiveTab] = useState<'posts' | 'outreach' | 'icp' | 'strategy'>('posts')
  const [selectedPost, setSelectedPost] = useState<typeof linkedinPosts[0] | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<typeof outreachTemplates[0] | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<typeof personas[0] | null>(null)
  const [filter, setFilter] = useState('all')
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const filteredPosts = filter === 'all' ? linkedinPosts : linkedinPosts.filter(p => p.status === filter)
  const readyCount = linkedinPosts.filter(p => p.status === 'ready').length

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-lg">N</div>
              <div>
                <h1 className="text-xl font-bold">Nodefy Sales</h1>
                <p className="text-sm text-slate-400">LinkedIn • Outreach • ICP • Strategy</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {quickActions.map((a) => (
                <a key={a.label} href={a.url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors" title={a.label}>
                  <span>{a.icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <p className="text-xs text-slate-400 uppercase">Deals/maand</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold">{salesTargets.current.deals}</span>
              <span className="text-sm text-emerald-400">→ {salesTargets.target90d.deals}</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <p className="text-xs text-slate-400 uppercase">Avg Retainer</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold">{salesTargets.current.retainer}</span>
              <span className="text-sm text-emerald-400">→ {salesTargets.target90d.retainer}</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <p className="text-xs text-slate-400 uppercase">Posts Ready</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-emerald-400">{readyCount}</span>
              <span className="text-sm text-slate-400">/ {linkedinPosts.length} total</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
            <p className="text-xs text-slate-400 uppercase">Pipeline</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold">{salesTargets.current.pipeline}</span>
              <span className="text-sm text-emerald-400">→ {salesTargets.target90d.pipeline}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'posts', label: '📝 LinkedIn Posts', count: linkedinPosts.length },
            { id: 'outreach', label: '📨 Outreach', count: outreachTemplates.length },
            { id: 'icp', label: '🎯 ICP', count: personas.length },
            { id: 'strategy', label: '📊 90-Dagen Plan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
            >
              {tab.label} {tab.count && <span className="ml-1 opacity-60">({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* POSTS TAB */}
        {activeTab === 'posts' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-5">
              <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex gap-2">
                  {['all', 'ready', 'draft', 'idea'].map((f) => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs ${filter === f ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                      {f === 'all' ? 'All' : f}
                    </button>
                  ))}
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                  {filteredPosts.map((post) => (
                    <button key={post.id} onClick={() => setSelectedPost(post)} className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 ${selectedPost?.id === post.id ? 'bg-blue-500/20' : ''}`}>
                      <h3 className="font-medium text-sm truncate">{post.title}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded">{post.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${post.status === 'ready' ? 'bg-emerald-500/20 text-emerald-400' : post.status === 'draft' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>{post.status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-span-7">
              <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden h-full">
                {selectedPost ? (
                  <>
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                      <h2 className="font-semibold">{selectedPost.title}</h2>
                      <button onClick={() => copyToClipboard(selectedPost.concept, selectedPost.id)} className={`px-4 py-2 rounded-lg text-sm font-medium ${copiedId === selectedPost.id ? 'bg-emerald-500' : 'bg-blue-500 hover:bg-blue-600'}`}>
                        {copiedId === selectedPost.id ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <div className="p-6">
                      <pre className="bg-black/30 rounded-xl p-6 text-sm whitespace-pre-wrap max-h-[400px] overflow-y-auto">{selectedPost.concept}</pre>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 py-20">📝 Selecteer een post</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* OUTREACH TAB */}
        {activeTab === 'outreach' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4">
              <div className="bg-white/5 rounded-2xl border border-white/10">
                {outreachTemplates.map((t) => (
                  <button key={t.id} onClick={() => setSelectedTemplate(t)} className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 ${selectedTemplate?.id === t.id ? 'bg-blue-500/20' : ''}`}>
                    <h3 className="font-medium">{t.name}</h3>
                    <span className="text-xs text-slate-400">{t.type}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-8">
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6 min-h-[400px]">
                {selectedTemplate ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-semibold text-lg">{selectedTemplate.name}</h2>
                      <button onClick={() => copyToClipboard(selectedTemplate.template, selectedTemplate.id)} className={`px-4 py-2 rounded-lg text-sm ${copiedId === selectedTemplate.id ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                        {copiedId === selectedTemplate.id ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <pre className="bg-black/30 rounded-xl p-6 text-sm whitespace-pre-wrap">{selectedTemplate.template}</pre>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">📨 Selecteer template</div>
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
              <h2 className="text-lg font-semibold mb-4">👥 Buyer Personas</h2>
              <div className="grid grid-cols-3 gap-4">
                {personas.map((p) => (
                  <button key={p.id} onClick={() => setSelectedPersona(selectedPersona?.id === p.id ? null : p)} className={`text-left bg-white/5 rounded-xl p-5 border transition-all ${selectedPersona?.id === p.id ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/20'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-lg">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{p.name}</h3>
                        <p className="text-xs text-slate-400">{p.age} jaar, {p.role}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300">{p.company}</p>
                  </button>
                ))}
              </div>
              
              {selectedPersona && (
                <div className="mt-4 bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-emerald-400 mb-2">🎯 Goals</h4>
                      <ul className="space-y-1">{selectedPersona.goals.map((g, i) => <li key={i} className="text-sm">• {g}</li>)}</ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-red-400 mb-2">😤 Pains</h4>
                      <ul className="space-y-1">{selectedPersona.pains.map((p, i) => <li key={i} className="text-sm">• {p}</li>)}</ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-amber-400 mb-2">⚡ Triggers</h4>
                      <ul className="space-y-1">{selectedPersona.triggers.map((t, i) => <li key={i} className="text-sm">• {t}</li>)}</ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-400 mb-2">🛑 Objections</h4>
                      <ul className="space-y-1">{selectedPersona.objections.map((o, i) => <li key={i} className="text-sm text-slate-400">{o}</li>)}</ul>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-medium text-slate-400 mb-2">📍 Channels</h4>
                    <div className="flex gap-2 flex-wrap">{selectedPersona.channels.map((c, i) => <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded">{c}</span>)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Pain Points */}
            <div>
              <h2 className="text-lg font-semibold mb-4">😤 Top Pain Points</h2>
              <div className="space-y-3">
                {painPoints.map((p) => (
                  <div key={p.rank} className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-start gap-4">
                    <span className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold flex-shrink-0">#{p.rank}</span>
                    <div className="flex-1">
                      <h3 className="font-medium">{p.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">Impact: {p.impact}</p>
                      <p className="text-sm text-emerald-400 mt-1">→ {p.solution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Communities */}
            <div>
              <h2 className="text-lg font-semibold mb-4">🌐 Communities</h2>
              <div className="grid grid-cols-3 gap-4">
                {communities.map((c, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="font-medium">{c.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400">{c.platform} • {c.size}</span>
                      <div className="flex">{[...Array(c.relevance)].map((_, j) => <span key={j} className="text-amber-400">★</span>)}</div>
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
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-emerald-400 font-semibold text-lg mb-4">Week 1-4: Foundation</h3>
                <ul className="space-y-2 text-sm">
                  <li>○ LinkedIn 3x/week posten</li>
                  <li>○ 3 case studies met ROI</li>
                  <li>○ Comment strategy (5-10/dag)</li>
                  <li>○ €10K package testen</li>
                </ul>
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-amber-400 font-semibold text-lg mb-4">Week 5-8: Outbound</h3>
                <ul className="space-y-2 text-sm">
                  <li>○ 50 connecties per week</li>
                  <li>○ DM sequence starten</li>
                  <li>○ Cold outreach</li>
                  <li>○ Partnership gesprekken</li>
                </ul>
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-blue-400 font-semibold text-lg mb-4">Week 9-12: Scale</h3>
                <ul className="space-y-2 text-sm">
                  <li>○ Content engine op stoom</li>
                  <li>○ 5 meetings per week</li>
                  <li>○ Pipeline naar 3x MRR</li>
                  <li>○ Playbook documenteren</li>
                </ul>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold text-lg mb-4">🔑 5 Key Findings</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { n: 1, t: 'Specialisatie is verplicht', i: '84% succesvolle agencies is specialist', a: '"AI Marketing Agency" is je claim' },
                  { n: 2, t: 'Sales is #1 bottleneck', i: 'Outbound agencies groeien 3-5x sneller', a: 'LinkedIn outbound + content engine' },
                  { n: 3, t: 'AI is de multiplier', i: '95% marketeers gebruikt AI tools', a: 'Client-facing AI transformatie' },
                  { n: 4, t: 'Pricing = waarde', i: 'Slechts 2% doet value-based', a: 'Verkoop resultaat, niet uren' },
                  { n: 5, t: 'Schalen = systemen', i: 'Founder uit productie <25 FTE', a: 'Documenteer alles' },
                ].map((f) => (
                  <div key={f.n} className="flex items-start gap-4 p-3 bg-white/5 rounded-lg">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">{f.n}</span>
                    <div><h4 className="font-medium">{f.t}</h4><p className="text-xs text-slate-400">{f.i} → {f.a}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
