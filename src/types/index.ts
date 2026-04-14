// ============================================
// NODEFY SALES DASHBOARD - Types & Interfaces
// ============================================

export type TabId = 'overview' | 'klanten' | 'reports' | 'pipeline' | 'prospects' | 'masterplan' | 'cases' | 'agencyos' | 'content' | 'strategy' | 'forecast' | 'retainers' | 'nightshift' | 'meetings' | 'tasks' | 'team' | 'client-tools' | 'settings' | 'admin'

export type UserRole = 'superadmin' | 'admin' | 'viewer' | 'custom'

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  permissions: Record<TabId, boolean>
  lastLogin: string | null
  createdAt: string
}
export interface EditableData {
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
export interface RevenueGoals {
  annualTarget: number
  quarters: { q: string; target: number; realized: number }[]
}

export interface KPICard {
  id: string
  name: string
  current: number
  target: number
  unit: string
}

export interface QuarterlyGoal {
  id: string
  quarter: string
  text: string
  status: 'green' | 'yellow' | 'red'
}

export interface MasterTask {
  id: string
  title: string
  done: boolean
  deadline: string
  category: 'Content' | 'Agency OS' | 'Masterplan' | 'Strategy' | 'Reports' | 'Klanten' | 'Pipeline'
  priority: 'high' | 'medium' | 'low'
}

export interface Persona {
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

export interface PainPoint {
  rank: number
  title: string
  impact: string
  solution: string
}

export interface LinkedInPost {
  id: number
  title: string
  category: string
  hook: string
  status: 'ready' | 'draft' | 'idea'
  concept: string
}

export interface OutreachTemplate {
  id: number
  name: string
  type: string
  template: string
}

export interface TodayTask {
  id: string
  category: string
  task: string
  time: string
  priority: 'high' | 'medium' | 'building'
  assignee?: string
}

// Website case format matching Nodefy website structure
export interface WebsiteCase {
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

export interface AgencyApp {
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

export interface Recommendation {
  id: number
  priority: 'high' | 'medium' | 'low'
  action: string
  impact: string
}

export interface WebsiteTask {
  id: number
  task: string
  desc: string
  status: string
}

export interface WebsiteTasks {
  critical: WebsiteTask[]
  improvements: WebsiteTask[]
  suggestions: WebsiteTask[]
}

export interface Masterplan {
  pillars: { id: number; title: string; emoji: string; description: string; items: string[] }[]
  aiAgents: {
    current: string[]
    planned: { name: string; timeline: string; impact: string }[]
  }
  ninetyDayRoadmap: { week: string; focus: string; tasks: string[]; responsible: string; kpi: string }[]
  kpis: { metric: string; current: string; target: string; status: string }[]
  quickWins: { id: number; task: string; time: string; done: boolean }[]
}

export interface Kantoor {
  address: string
  city: string
  postalCode: string
  features: string[]
  contentIdeas: string[]
  history: { built: string; style: string; notable: string; neighborhood: string }
  movingTasks: { id: number; task: string; status: string }[]
}

export interface Client {
  id: string
  naam: string
  jaar: number
  lead: string
  dashboard: boolean
  status: string
  vertical: string
  services: string[]
}

export interface ClientPerformance {
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

export interface PipelineDeal {
  id: string
  name: string
  value: number | null
  stageId: string
  pipelineId: string
  slagingskans?: number
  closedAt?: string
  createdAt?: string
}

export interface PipelineStage {
  id: string
  name: string
  order: number
  closed: boolean
}

export interface Pipeline {
  id: string
  name: string
  stages: PipelineStage[]
}

export interface MegaProspect {
  id: number; name: string; website: string; description: string;
  category: string; location: string; size: string; why_interesting: string;
  services: string[]; retainer_potential: number; match_score: number;
  priority: 'hot' | 'warm' | 'cold';
  source_agency?: string;
  status?: 'new' | 'interesting' | 'archived' | 'contacted';
  notes?: string;
}
