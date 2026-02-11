'use client'

import { useState } from 'react'

// ============================================
// NODEFY SALES DASHBOARD
// Focused: LinkedIn, Sales Targets, Content
// ============================================

// LinkedIn post ideas met volledige concepten
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
    hook: 'Contrarian take + praktische tip',
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
    hook: 'Observatie + simpele fix',
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
    hook: 'Reflectie, geen flex',
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
    hook: 'Transparant, geen BS',
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

Wat zijn jullie LinkedIn resultaten?

#linkedinads #b2b #saas #marketing`,
  },
  {
    id: 6,
    title: 'De AI tool die niemand kent maar wij dagelijks gebruiken',
    category: 'AI & Automation',
    hook: 'Tool discovery',
    status: 'draft',
    concept: `De AI tool die niemand kent maar wij dagelijks gebruiken.

Het is niet ChatGPT.
Het is niet Claude.
Het is niet Midjourney.

Het is: [tool naam]

Wat het doet:
→ [specifieke functie]
→ [specifieke functie]
→ [specifieke functie]

Waarom het werkt:
Geen hype. Geen fancy UI. Gewoon resultaat.

We besparen er ~[X] uur per week mee.

De beste tools zijn vaak niet de bekendste.

Welke "geheime" tool gebruik jij?

#ai #tools #productivity #marketing`,
  },
  {
    id: 7,
    title: 'Waarom we nee zeggen tegen 50% van de leads',
    category: 'Ondernemerschap',
    hook: 'Positionering, kwaliteit > kwantiteit',
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
    id: 8,
    title: 'Server-side tracking uitgelegd in 60 seconden',
    category: 'Data & Tracking',
    hook: 'Educatief, geen jargon',
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

Vragen? Drop ze hieronder.

#tracking #serverside #googleads #metaads`,
  },
  {
    id: 9,
    title: 'Het probleem met full-service agencies',
    category: 'Thought Leadership',
    hook: 'Industry kritiek, constructief',
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

Full-service is een business model, geen kwaliteitskeuze.

#agency #marketing #specialist #business`,
  },
  {
    id: 10,
    title: 'Performance Max is geen magic button',
    category: 'Marketing',
    hook: 'Hot take met onderbouwing',
    status: 'idea',
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
→ Feed audience data (remarketing, customer match)
→ Custom assets per product type
→ Exclude branded search
→ Check placement reports wekelijks

PMax is krachtig.
Maar alleen als je het stuurt.

"Set and forget" is geen strategie.

#googleads #pmax #ecommerce #marketing`,
  },
  {
    id: 11,
    title: 'Consent Mode v2: wat marketeers écht moeten weten',
    category: 'Data & Tracking',
    hook: 'Actueel, praktisch',
    status: 'idea',
    concept: `Consent Mode v2: wat marketeers écht moeten weten.

Vanaf maart 2024 verplicht voor Google Ads.
Maar 80% van de implementaties klopt niet.

Wat is het?
→ Google's manier om consent-signalen door te geven
→ Bepaalt welke data je mag verzamelen
→ Vereist voor remarketing & conversie-tracking

De 4 consent types:
1. ad_storage (ads cookies)
2. analytics_storage (GA4)
3. ad_user_data (user data naar Google)
4. ad_personalization (personalized ads)

Wat je moet doen:
✅ CMP updaten (Cookiebot, OneTrust, etc.)
✅ GTM consent mode configureren
✅ Default states instellen
✅ Testen, testen, testen

Doe je dit niet?
→ Geen remarketing audiences
→ Slechte conversie-attributie
→ Google gaat modelleren (= raden)

Check je setup. Vandaag nog.

#consentmode #privacy #googleads #gdpr`,
  },
  {
    id: 12,
    title: 'Hoe we meetings halveerden zonder chaos',
    category: 'Ondernemerschap',
    hook: 'Operationeel, relatable',
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
→ Klinkt streng, is noodzakelijk

4. Meeting-vrije dagen
→ Woensdag = focus day
→ Geen interne meetings

5. Standing permission om te weigeren
→ "Past niet in mijn planning" is een valid antwoord

Resultaat:
→ Meer deep work
→ Betere beslissingen (minder haast)
→ Team is gelukkiger

Hoeveel uur zit jij in meetings?

#productivity #agency #management #werk`,
  },
]

// Sales targets
const salesTargets = {
  current: {
    dealsPerMonth: '2-3',
    avgRetainer: '€3-5K',
    referralOutbound: '90/10',
    pipelineValue: '~€50K',
  },
  target90d: {
    dealsPerMonth: '4-5',
    avgRetainer: '€6-8K',
    referralOutbound: '60/40',
    pipelineValue: '€150K',
  },
  target12m: {
    dealsPerMonth: '8-10',
    avgRetainer: '€10-15K',
    referralOutbound: '40/60',
    pipelineValue: '€250K',
  },
}

// Quick actions
const quickActions = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/rubenstrootman/', icon: '🔗' },
  { label: 'Nieuwe Post', url: 'https://www.linkedin.com/post/new/', icon: '📝' },
  { label: 'HubSpot', url: 'https://app.hubspot.com/', icon: '💰' },
  { label: 'Nodefy.nl', url: 'https://nodefy.nl', icon: '🌐' },
  { label: 'Projects', url: 'https://nodefy-openclawd.vercel.app', icon: '📊' },
]

// Outreach templates
const outreachTemplates = [
  {
    id: 1,
    name: 'Connectie verzoek',
    template: `Hey [naam],

Zag dat je [bedrijf] runt - mooie webshop!

Ik help e-commerce bedrijven met AI-gedreven marketing. Altijd interessant om te connecten met ondernemers in dezelfde space.

Groet,
Ruben`,
  },
  {
    id: 2,
    name: 'Follow-up na connectie',
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
    template: `Hey [naam],

Zag dat je met [platform] werkt - wij hielpen laatst een vergelijkbare webshop van €X naar €Y ROAS.

Dacht: misschien interessant voor je?

Happy om te delen hoe we dat aanpakten - geen strings attached.

Ruben`,
  },
]

export default function SalesDashboard() {
  const [selectedPost, setSelectedPost] = useState<typeof linkedinPosts[0] | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'posts' | 'outreach' | 'strategy'>('posts')
  const [selectedTemplate, setSelectedTemplate] = useState<typeof outreachTemplates[0] | null>(null)

  const filteredPosts = filter === 'all' 
    ? linkedinPosts 
    : linkedinPosts.filter(p => p.status === filter)

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const categories = [...new Set(linkedinPosts.map(p => p.category))]
  const readyCount = linkedinPosts.filter(p => p.status === 'ready').length
  const draftCount = linkedinPosts.filter(p => p.status === 'draft').length

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-lg">
                N
              </div>
              <div>
                <h1 className="text-xl font-bold">Nodefy Sales</h1>
                <p className="text-sm text-slate-400">LinkedIn • Outreach • Pipeline</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {quickActions.map((action) => (
                <a
                  key={action.label}
                  href={action.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors flex items-center gap-2"
                  title={action.label}
                >
                  <span>{action.icon}</span>
                  <span className="hidden lg:inline">{action.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* KPI Cards */}
        <section className="mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-white/10">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Deals/maand</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold">{salesTargets.current.dealsPerMonth}</span>
                <span className="text-sm text-emerald-400">→ {salesTargets.target90d.dealsPerMonth}</span>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-white/10">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Avg Retainer</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold">{salesTargets.current.avgRetainer}</span>
                <span className="text-sm text-emerald-400">→ {salesTargets.target90d.avgRetainer}</span>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-white/10">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Posts Ready</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-emerald-400">{readyCount}</span>
                <span className="text-sm text-slate-400">+ {draftCount} drafts</span>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-white/10">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Pipeline</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold">{salesTargets.current.pipelineValue}</span>
                <span className="text-sm text-emerald-400">→ {salesTargets.target90d.pipelineValue}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'posts', label: '📝 LinkedIn Posts', count: linkedinPosts.length },
            { id: 'outreach', label: '📨 Outreach Templates', count: outreachTemplates.length },
            { id: 'strategy', label: '🎯 90-Dagen Plan', count: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {tab.label}
              {tab.count && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  activeTab === tab.id ? 'bg-blue-600' : 'bg-white/10'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* LinkedIn Posts Tab */}
        {activeTab === 'posts' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Posts List */}
            <div className="col-span-5">
              <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <div className="flex gap-2">
                    {['all', 'ready', 'draft', 'idea'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 rounded-full text-xs transition-colors ${
                          filter === f
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {f === 'all' ? `Alle (${linkedinPosts.length})` : 
                         f === 'ready' ? `✅ Ready (${readyCount})` : 
                         f === 'draft' ? `📝 Draft (${draftCount})` : 
                         `💡 Idea (${linkedinPosts.filter(p => p.status === 'idea').length})`}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="max-h-[550px] overflow-y-auto">
                  {filteredPosts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${
                        selectedPost?.id === post.id ? 'bg-blue-500/20 border-l-2 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                          post.status === 'ready' ? 'bg-emerald-500/20 text-emerald-400' :
                          post.status === 'draft' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {post.id}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-white truncate">{post.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-300">
                              {post.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Post Preview */}
            <div className="col-span-7">
              <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 overflow-hidden h-full">
                {selectedPost ? (
                  <>
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold">{selectedPost.title}</h2>
                        <p className="text-sm text-slate-400">{selectedPost.category} • {selectedPost.hook}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(selectedPost.concept, selectedPost.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            copiedId === selectedPost.id
                              ? 'bg-emerald-500 text-white'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          {copiedId === selectedPost.id ? '✓ Copied!' : '📋 Copy'}
                        </button>
                        <a
                          href="https://www.linkedin.com/post/new/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
                        >
                          Open LinkedIn →
                        </a>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="bg-black/30 rounded-xl p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-[450px] overflow-y-auto">
                        {selectedPost.concept}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
                    <span className="text-5xl mb-4">📝</span>
                    <p className="text-lg">Selecteer een post</p>
                    <p className="text-sm mt-2">Klik links om de volledige tekst te zien</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Outreach Templates Tab */}
        {activeTab === 'outreach' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4">
              <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h2 className="font-semibold">Templates</h2>
                </div>
                <div>
                  {outreachTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${
                        selectedTemplate?.id === template.id ? 'bg-blue-500/20 border-l-2 border-l-blue-500' : ''
                      }`}
                    >
                      <h3 className="font-medium">{template.name}</h3>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-span-8">
              <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6 min-h-[400px]">
                {selectedTemplate ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold text-lg">{selectedTemplate.name}</h2>
                      <button
                        onClick={() => copyToClipboard(selectedTemplate.template, selectedTemplate.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          copiedId === selectedTemplate.id
                            ? 'bg-emerald-500 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {copiedId === selectedTemplate.id ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <div className="bg-black/30 rounded-xl p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedTemplate.template}
                    </div>
                    <p className="text-xs text-slate-500 mt-4">
                      💡 Vervang [naam], [bedrijf], etc. met echte gegevens
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <span className="text-5xl mb-4">📨</span>
                    <p>Selecteer een template</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Strategy Tab */}
        {activeTab === 'strategy' && (
          <div className="space-y-6">
            {/* 90-Day Roadmap */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
                <h3 className="text-emerald-400 font-semibold text-lg mb-4">Week 1-4: Foundation</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">○</span> LinkedIn 3x/week posten</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">○</span> 3 case studies met ROI cijfers</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">○</span> Comment strategy (5-10/dag)</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">○</span> €10K package testen</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">○</span> Website case studies pagina</li>
                </ul>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
                <h3 className="text-amber-400 font-semibold text-lg mb-4">Week 5-8: Outbound</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">○</span> 50 connecties per week</li>
                  <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">○</span> DM sequence starten</li>
                  <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">○</span> Eerste cold outreach</li>
                  <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">○</span> Partnership gesprekken</li>
                  <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">○</span> Referral programma</li>
                </ul>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
                <h3 className="text-blue-400 font-semibold text-lg mb-4">Week 9-12: Scale</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">○</span> Content engine op stoom</li>
                  <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">○</span> 5 meetings per week</li>
                  <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">○</span> Pipeline naar 3x MRR</li>
                  <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">○</span> Playbook documenteren</li>
                  <li className="flex items-start gap-2"><span className="text-slate-500 mt-0.5">○</span> Sales hire evalueren</li>
                </ul>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold text-lg mb-4">🔑 5 Key Findings uit Research</h3>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { num: 1, title: 'Specialisatie is verplicht', insight: '84% van succesvolle agencies is specialist', action: '"AI-Powered Marketing Agency" is je claim' },
                  { num: 2, title: 'Sales is de #1 bottleneck', insight: 'Agencies met outbound groeien 3-5x sneller', action: 'LinkedIn outbound + content engine' },
                  { num: 3, title: 'AI is de multiplier', insight: '95% van marketers gebruikt nu AI tools', action: 'Client-facing AI transformatie verkopen' },
                  { num: 4, title: 'Pricing power = waarde', insight: 'Slechts 2% doet pure value-based pricing', action: 'Verkoop "5x meer leads" niet "10 uur"' },
                  { num: 5, title: 'Schalen vereist systemen', insight: 'Founder moet uit productie vóór 25 FTE', action: 'Documenteer alles. Bouw playbooks.' },
                ].map((item) => (
                  <div key={item.num} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                    <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold flex-shrink-0">
                      {item.num}
                    </span>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-slate-400">{item.insight}</p>
                      <p className="text-sm text-blue-400 mt-1">→ {item.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Nodefy Sales Dashboard — Built by AI Agent
          </p>
          <p className="text-xs text-slate-500">
            LinkedIn: 1x per 2 weken
          </p>
        </div>
      </footer>
    </main>
  )
}
