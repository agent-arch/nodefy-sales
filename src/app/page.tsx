'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

// Types
import type {
  TabId, UserRole, User, EditableData, RevenueGoals, KPICard, QuarterlyGoal,
  MasterTask, Persona, PainPoint, LinkedInPost, OutreachTemplate, TodayTask,
  WebsiteCase, AgencyApp, Recommendation, WebsiteTask, WebsiteTasks, Masterplan,
  Kantoor, Client, ClientPerformance, PipelineDeal, PipelineStage, Pipeline,
  MegaProspect
} from '../types'

// Data
import {
  DEFAULT_PERSONAS, DEFAULT_PAIN_POINTS, DEFAULT_LINKEDIN_POSTS,
  DEFAULT_OUTREACH_TEMPLATES, DEFAULT_TODAY_TASKS, DEFAULT_CLIENT_CASES,
  DEFAULT_AGENCY_OS_APPS, DEFAULT_WEBSITE_TASKS, DEFAULT_FRANKY_RECOMMENDATIONS,
  DEFAULT_FLORYN_RECOMMENDATIONS, DEFAULT_MASTERPLAN, DEFAULT_KANTOOR,
  DEFAULT_CLIENTS, DEFAULT_PIPELINE_DEALS, DEFAULT_REVENUE_GOALS,
  DEFAULT_KPI_SCOREBOARD, DEFAULT_QUARTERLY_GOALS, DEFAULT_MASTER_TASKS,
  DEFAULT_MONTHLY_FORECAST
} from '../data/defaults'

import { MEGA_PROSPECTS } from '../data/prospects'

import {
  CMD_PALETTE_STYLES, DEFAULT_USERS, ALL_TAB_IDS, VISIBLE_TAB_IDS,
  USERS_STORAGE_KEY, CURRENT_USER_STORAGE_KEY, STORAGE_KEY,
  CLIENT_PERFORMANCE, PIPELINES, CLOSED_STAGE_IDS,
  RETAINER_CLIENTS, ACTIVE_RETAINER_CLIENTS, RETAINER_ARR,
  CURRENT_MONTH_IDX, RETAINER_MRR, RETAINER_AVG_MRR, RETAINER_NEW_2026,
  MONTHLY_COSTS, HISTORICAL_REVENUE,
  NAV_SECTIONS, SYSTEM_NAV, ROLE_COLORS
} from '../data/config'
import type { NavSection } from '../data/config'
import StrategyTab from '../components/tabs/StrategyTab'
import TeamTab from '../components/tabs/TeamTab'

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
  const [theme, setTheme] = useState<'dark' | 'light'>('light')

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

  // Nightshift state
  const [nsData, setNsData] = useState<{ days: { date: string; files: { name: string; path: string; category: string; content: string; size: number }[]; summary: string | null; stats: { totalFiles: number; totalLines: number; categories: Record<string, number> } }[] } | null>(null)
  const [nsLoading, setNsLoading] = useState(true)
  const [nsSelectedFile, setNsSelectedFile] = useState<string | null>(null)
  const [nsSelectedDay, setNsSelectedDay] = useState<string | null>(null)

  // Meetings state (Fireflies)
  type FFMeeting = { id: string; title: string; date: number; duration: number; participants: string[]; speakers: { id: number; name: string }[]; meeting_attendees: { displayName: string | null; email: string }[]; summary: { action_items: string | null; overview: string | null; short_summary: string | null; keywords: string[] | null; meeting_type: string | null } }
  type FFMeetingDetail = FFMeeting & { transcript_url: string | null; audio_url: string | null; sentences: { index: number; speaker_name: string; text: string; start_time: number; end_time: number; ai_filters: { task: string | null; question: string | null } }[]; summary: FFMeeting['summary'] & { outline: string | null; bullet_gist: string | null } }
  const [ffMeetings, setFfMeetings] = useState<FFMeeting[]>([])
  const [ffLoading, setFfLoading] = useState(false)
  const [ffSyncing, setFfSyncing] = useState(false)
  const [ffSelectedMeeting, setFfSelectedMeeting] = useState<string | null>(null)
  const [ffMeetingDetail, setFfMeetingDetail] = useState<FFMeetingDetail | null>(null)
  const [ffDetailLoading, setFfDetailLoading] = useState(false)
  const [ffSearch, setFfSearch] = useState('')
  const [ffSelectedClient, setFfSelectedClient] = useState<string | null>(null)
  const [ffEditingLabel, setFfEditingLabel] = useState<string | null>(null)
  const [ffClientFilter, setFfClientFilter] = useState('all')
  const [ffTagFilter, setFfTagFilter] = useState('all')
  const [ffMeetingTags, setFfMeetingTags] = useState<Record<string, string[]>>({}) // title -> tags
  const [ffAllTags, setFfAllTags] = useState<string[]>([])
  const [ffNewTag, setFfNewTag] = useState('')
  const [ffShowTagInput, setFfShowTagInput] = useState(false)
  const [ffTaggingMeeting, setFfTaggingMeeting] = useState<string | null>(null)

  // Meeting analysis state
  type MeetingAnalysis = { date: string; title: string; client: string; type: 'client' | 'sales' | 'intern' | 'demo'; duration: number; nodefy_team: string[]; client_contacts: string[]; sentiment: 'positief' | 'neutraal' | 'negatief'; sentiment_score: number; analysis: string; risk: string; action_needed: string }
  const [meetingAnalysis, setMeetingAnalysis] = useState<MeetingAnalysis[]>([])

  // Tasks state
  type DashTask = { id: string; title: string; description?: string; owner: string; status: 'todo' | 'bezig' | 'klaar'; priority: 'hoog' | 'normaal' | 'laag'; category: string; deadline?: string; source?: string; meetingId?: string; meetingTitle?: string; createdAt: string; updatedAt: string; createdBy: string }
  const [tasks, setTasks] = useState<DashTask[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [myTaskFilter, setMyTaskFilter] = useState<{ owner: string; status: string; category: string }>({ owner: 'all', status: 'all', category: 'all' })
  const [showAddMyTask, setShowAddMyTask] = useState(false)
  const [newMyTask, setNewMyTask] = useState<Partial<DashTask>>({ title: '', owner: 'ruben', priority: 'normaal', category: 'overig', status: 'todo' })

  // Timeline state

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

  // === Feature 1: Command Palette (Cmd+K) ===
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false)
  const [cmdSearch, setCmdSearch] = useState('')
  const [cmdSelectedIdx, setCmdSelectedIdx] = useState(0)
  const cmdInputRef = useRef<HTMLInputElement>(null)

  // === Feature 2: Data Freshness (timestamps tracked) ===
  const [dataTimestamps] = useState(() => ({
    pipeline: new Date().toISOString(),
    retainers: new Date().toISOString(),
    prospects: new Date().toISOString(),
  }))

  // === Feature 3: Client Quick-View Panel ===
  const [quickViewClient, setQuickViewClient] = useState<string | null>(null)

  // === Night Shift Features ===
  // Activity Feed
  type ActivityItem = { id: string; type: 'deal_moved' | 'deal_new' | 'deal_won' | 'deal_lost' | 'client_health' | 'task_completed' | 'prospect_added'; title: string; description: string; timestamp: string; metadata?: Record<string, string | number> }
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([])
  const [activityLoading, setActivityLoading] = useState(false)

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
  const [dealProbability, setDealProbability] = useState<Record<string, number>>({})
  const [dealQualification, setDealQualification] = useState<Record<string, boolean[]>>({})

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
      const savedTheme = (localStorage.getItem('nodefy-theme') || 'light') as 'dark' | 'light'
      setTheme(savedTheme)

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
              // Merge new default master tasks that don't exist in saved data
              if (merged.masterTasks) {
                const existingIds = new Set(merged.masterTasks.map((t: MasterTask) => t.id))
                const newTasks = DEFAULT_MASTER_TASKS.filter(t => !existingIds.has(t.id))
                if (newTasks.length) merged.masterTasks = [...merged.masterTasks, ...newTasks]
              }
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
                if (merged.masterTasks) {
                  const existingIds = new Set(merged.masterTasks.map((t: MasterTask) => t.id))
                  const newTasks = DEFAULT_MASTER_TASKS.filter(t => !existingIds.has(t.id))
                  if (newTasks.length) merged.masterTasks = [...merged.masterTasks, ...newTasks]
                }
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
              if (merged.masterTasks) {
                const existingIds = new Set(merged.masterTasks.map((t: MasterTask) => t.id))
                const newTasks = DEFAULT_MASTER_TASKS.filter(t => !existingIds.has(t.id))
                if (newTasks.length) merged.masterTasks = [...merged.masterTasks, ...newTasks]
              }
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
          if (result.probability) {
            setDealProbability(result.probability)
            localStorage.setItem('nodefy-pipeline-probability', JSON.stringify(result.probability))
          }
        }
      } catch (e) {
        // Fallback to localStorage
        const saved = localStorage.getItem('nodefy-pipeline-nextsteps')
        if (saved) setNextSteps(JSON.parse(saved))
        const savedProb = localStorage.getItem('nodefy-pipeline-probability')
        if (savedProb) setDealProbability(JSON.parse(savedProb))
      }
      // Load deal qualifications from localStorage
      try {
        const savedQual = localStorage.getItem('nodefy-deal-qualification')
        if (savedQual) setDealQualification(JSON.parse(savedQual))
      } catch {}

      
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
              if (d.nextStep && String(d.nextStep).trim()) hubSpotNextSteps[d.id] = d.nextStep
            })
            setNextSteps(prev => {
              const merged = { ...hubSpotNextSteps }
              // Only keep local values if HubSpot has nothing for that deal
              Object.keys(prev).forEach(id => {
                if (prev[id] && String(prev[id]).trim() && !merged[id]) merged[id] = prev[id]
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

  // Load activity feed
  useEffect(() => {
    if (activeTab === 'overview') {
      setActivityLoading(true)
      fetch('/api/activity').then(r => r.json()).then(d => { setActivityFeed(d.activities || []); setActivityLoading(false) }).catch(() => setActivityLoading(false))
    }
  }, [activeTab])

  // Load nightshift data
  useEffect(() => {
    if (activeTab === 'nightshift') {
      fetch('/api/nightshift?days=14').then(r => r.json()).then(d => { setNsData(d); setNsLoading(false); if (d.days?.[0] && !nsSelectedDay) setNsSelectedDay(d.days[0].date) }).catch(() => setNsLoading(false))
    }
  }, [activeTab])

  // Load meetings from cache + analysis
  useEffect(() => {
    if (activeTab === 'meetings') {
      if (ffMeetings.length === 0) {
        setFfLoading(true)
        fetch('/api/fireflies/meetings').then(r => r.json()).then(d => {
          if (d.ok && d.meetings) setFfMeetings(d.meetings)
          setFfLoading(false)
        }).catch(() => setFfLoading(false))
      }
      if (meetingAnalysis.length === 0) {
        fetch('/api/fireflies/analysis').then(r => r.json()).then(d => {
          if (d.ok && d.analysis) setMeetingAnalysis(d.analysis)
          if (d.meetingTags) setFfMeetingTags(d.meetingTags)
          if (d.allTags) setFfAllTags(d.allTags)
        }).catch(() => {})
      }
    }
  }, [activeTab])

  // Load meeting detail
  useEffect(() => {
    if (ffSelectedMeeting && !ffMeetingDetail) {
      setFfDetailLoading(true)
      fetch(`/api/fireflies/meeting/${ffSelectedMeeting}`).then(r => r.json()).then(d => {
        if (d.ok && d.meeting) setFfMeetingDetail(d.meeting)
        setFfDetailLoading(false)
      }).catch(() => setFfDetailLoading(false))
    }
  }, [ffSelectedMeeting])

  // Load tasks
  useEffect(() => {
    if ((activeTab === 'tasks' || activeTab === 'meetings') && tasks.length === 0) {
      setTasksLoading(true)
      fetch('/api/tasks').then(r => r.json()).then(d => {
        if (d.ok && d.tasks) setTasks(d.tasks)
        setTasksLoading(false)
      }).catch(() => setTasksLoading(false))
    }
  }, [activeTab])

  // Sync Fireflies meetings
  const syncFireflies = async () => {
    setFfSyncing(true)
    try {
      const res = await fetch('/api/fireflies/sync?limit=30')
      const d = await res.json()
      if (d.ok) {
        const meetingsRes = await fetch('/api/fireflies/meetings')
        const md = await meetingsRes.json()
        if (md.ok) setFfMeetings(md.meetings)
      }
    } catch { /* ignore */ }
    setFfSyncing(false)
  }

  // Task CRUD helpers
  const addTask = async (task: Partial<DashTask>) => {
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add', ...task, createdBy: currentUser?.email || 'unknown' }) })
    const d = await res.json()
    if (d.ok && d.task) setTasks(prev => [d.task, ...prev])
    return d
  }

  const updateTask = async (id: string, updates: Partial<DashTask>) => {
    const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', id, updates }) })
    const d = await res.json()
    if (d.ok && d.task) setTasks(prev => prev.map(t => t.id === id ? d.task : t))
  }

  const deleteTask = async (id: string) => {
    await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id }) })
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  // Update meeting analysis client label
  const updateMeetingLabel = async (title: string, newClient: string) => {
    const updated = meetingAnalysis.map(a => a.title === title ? { ...a, client: newClient } : a)
    setMeetingAnalysis(updated)
    await fetch('/api/fireflies/analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ analysis: updated }) })
    setFfEditingLabel(null)
  }

  // Meeting tags CRUD
  const saveMeetingTags = async (tags: Record<string, string[]>, allTags: string[]) => {
    await fetch('/api/fireflies/analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ meetingTags: tags, allTags }) })
  }
  const addTagToMeeting = (title: string, tag: string) => {
    const updated = { ...ffMeetingTags, [title]: [...(ffMeetingTags[title] || []).filter(t => t !== tag), tag] }
    setFfMeetingTags(updated)
    saveMeetingTags(updated, ffAllTags)
  }
  const removeTagFromMeeting = (title: string, tag: string) => {
    const updated = { ...ffMeetingTags, [title]: (ffMeetingTags[title] || []).filter(t => t !== tag) }
    setFfMeetingTags(updated)
    saveMeetingTags(updated, ffAllTags)
  }
  const createTag = (tag: string) => {
    if (!tag.trim() || ffAllTags.includes(tag.trim())) return
    const updated = [...ffAllTags, tag.trim()]
    setFfAllTags(updated)
    saveMeetingTags(ffMeetingTags, updated)
    setFfNewTag('')
    setFfShowTagInput(false)
  }
  const deleteMeetingAnalysis = async (title: string) => {
    const updated = meetingAnalysis.filter(a => a.title !== title)
    setMeetingAnalysis(updated)
    await fetch('/api/fireflies/analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ analysis: updated }) })
  }
  const deleteTag = (tag: string) => {
    const updatedAll = ffAllTags.filter(t => t !== tag)
    const updatedMeetings = Object.fromEntries(Object.entries(ffMeetingTags).map(([k, v]) => [k, v.filter(t => t !== tag)]))
    setFfAllTags(updatedAll)
    setFfMeetingTags(updatedMeetings)
    saveMeetingTags(updatedMeetings, updatedAll)
    if (ffTagFilter === tag) setFfTagFilter('all')
  }

  // Import action items from a meeting as tasks
  const importMeetingTasks = async (meeting: FFMeeting) => {
    if (!meeting.summary?.action_items) return
    const lines = meeting.summary.action_items.split('\n').filter(l => l.trim())
    const parsedTasks: Partial<DashTask>[] = []
    let currentOwner = 'ruben'
    for (const line of lines) {
      const ownerMatch = line.match(/^\*\*(.+?)\*\*$/)
      if (ownerMatch) {
        const name = ownerMatch[1].toLowerCase()
        if (name.includes('ruben')) currentOwner = 'ruben'
        else if (name.includes('matthijs')) currentOwner = 'matthijs'
        else if (name.includes('loes')) currentOwner = 'loes'
        else if (name.includes('dane')) currentOwner = 'dane'
        else if (name.includes('charlotte')) currentOwner = 'charlotte'
        else if (name.includes('benjamin')) currentOwner = 'benjamin'
        else currentOwner = name.split(' ')[0].toLowerCase()
        continue
      }
      const taskText = line.replace(/^[-•]\s*/, '').replace(/\(\d+:\d+\)/, '').trim()
      if (taskText.length > 3) {
        parsedTasks.push({ title: taskText, owner: currentOwner, source: 'fireflies', meetingId: meeting.id, meetingTitle: meeting.title, category: 'overig', priority: 'normaal' })
      }
    }
    if (parsedTasks.length > 0) {
      const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'bulk_add', tasks: parsedTasks }) })
      const d = await res.json()
      if (d.ok) {
        // Reload tasks
        const tr = await fetch('/api/tasks')
        const td = await tr.json()
        if (td.ok) setTasks(td.tasks)
      }
      return d
    }
  }

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
  const SUPERADMIN_ONLY_TABS: TabId[] = ['retainers', 'strategy', 'forecast', 'nightshift', ]
  
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
              if (prev[id] && String(prev[id]).trim()) merged[id] = prev[id];
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

  // Update probability for a deal
  const probSaveTimer = useRef<NodeJS.Timeout | null>(null)
  const updateDealProbability = (dealId: string, value: number) => {
    const updated = { ...dealProbability, [dealId]: value }
    setDealProbability(updated)
    localStorage.setItem('nodefy-pipeline-probability', JSON.stringify(updated))
    
    if (probSaveTimer.current) clearTimeout(probSaveTimer.current)
    probSaveTimer.current = setTimeout(async () => {
      try {
        await fetch('/api/pipeline-nextsteps', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...nextSteps, _probability: updated }),
        })
      } catch (e) { console.error('Failed to save probability to KV:', e); }
    }, 1500)
  }

  // Deal qualification questions
  const QUAL_QUESTIONS = ['ICP fit', 'Budget confirmed', 'DMU identified', 'Marketing goal clear', 'Reason for switch']
  const updateDealQualification = (dealId: string, questionIdx: number) => {
    const current = dealQualification[dealId] || [false, false, false, false, false]
    const updated = { ...dealQualification, [dealId]: current.map((v: boolean, i: number) => i === questionIdx ? !v : v) }
    setDealQualification(updated)
    localStorage.setItem('nodefy-deal-qualification', JSON.stringify(updated))
    try {
      fetch('/api/pipeline-nextsteps', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...nextSteps, _probability: dealProbability, _qualification: updated }),
      })
    } catch {}
  }
  const getDealQualScore = (dealId: string): number => (dealQualification[dealId] || []).filter(Boolean).length

  // ============================================
  // CMD+K COMMAND PALETTE LOGIC
  // ============================================
  const cmdPaletteResults = React.useMemo(() => {
    if (!cmdSearch.trim()) return []
    const q = cmdSearch.toLowerCase()
    const results: { type: string; emoji: string; label: string; sub: string; action: () => void }[] = []
    
    // Search clients
    data.clients.filter(c => c.naam.toLowerCase().includes(q) || c.vertical?.toLowerCase().includes(q)).slice(0, 5).forEach(c => {
      results.push({ type: 'Client', emoji: '👤', label: c.naam, sub: `${c.status} · ${c.vertical || ''}`, action: () => { setActiveTab('klanten'); setCmdPaletteOpen(false) } })
    })
    
    // Search pipeline deals
    data.pipelineDeals.filter(d => d.name.toLowerCase().includes(q)).slice(0, 5).forEach(d => {
      results.push({ type: 'Pipeline', emoji: '💰', label: d.name, sub: d.value ? `€${d.value.toLocaleString()}` : 'No value', action: () => { setActiveTab('pipeline'); setCmdPaletteOpen(false) } })
    })
    
    // Search prospects
    MEGA_PROSPECTS.filter(p => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)).slice(0, 5).forEach(p => {
      results.push({ type: 'Prospect', emoji: '🎯', label: p.name, sub: `${p.priority} · ${p.category}`, action: () => { setActiveTab('prospects'); setCmdPaletteOpen(false) } })
    })
    
    // Search tabs
    const tabLabels: Record<string, string> = { overview: 'Klanten Overview', klanten: 'Klanten', reports: 'Reports', pipeline: 'Pipeline', prospects: 'Prospects', masterplan: 'Masterplan', cases: 'Cases', agencyos: 'Agency OS', content: 'Content', strategy: 'Strategy', retainers: 'Retainers' }
    Object.entries(tabLabels).filter(([, label]) => label.toLowerCase().includes(q)).forEach(([id, label]) => {
      results.push({ type: 'Tab', emoji: '📑', label, sub: 'Navigate to tab', action: () => { setActiveTab(id as TabId); setCmdPaletteOpen(false) } })
    })
    
    return results
  }, [cmdSearch, data.clients, data.pipelineDeals])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdPaletteOpen(prev => !prev)
        setCmdSearch('')
        setCmdSelectedIdx(0)
      }
      if (e.key === 'Escape' && cmdPaletteOpen) {
        setCmdPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [cmdPaletteOpen])

  useEffect(() => {
    if (cmdPaletteOpen && cmdInputRef.current) {
      cmdInputRef.current.focus()
    }
  }, [cmdPaletteOpen])

  const handleCmdKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCmdSelectedIdx(prev => Math.min(prev + 1, cmdPaletteResults.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setCmdSelectedIdx(prev => Math.max(prev - 1, 0)) }
    if (e.key === 'Enter' && cmdPaletteResults[cmdSelectedIdx]) { cmdPaletteResults[cmdSelectedIdx].action() }
  }, [cmdPaletteResults, cmdSelectedIdx])

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

  // Warm chart colors
  const CHART_COLORS = {
    primary: '#F97316',
    secondary: '#3B82F6',
    tertiary: '#FBBF24',
    quaternary: '#EC4899',
    success: '#22C55E',
  }

  // Section dot colors for sidebar
  const SECTION_DOT_COLORS: Record<string, string> = {
    'GENERAL': 'bg-green-500',
    'STRATEGY': 'bg-blue-500',
    'SALES': 'bg-orange-500',
    'SYSTEM': 'bg-gray-500',
  }

  // --- Chart Components ---
  const MiniBarChart = ({ values, color = CHART_COLORS.primary, height = 24 }: { values: number[]; color?: string; height?: number }) => {
    const max = Math.max(...values, 1)
    return (
      <div className="flex items-end gap-[2px]" style={{ height }}>
        {values.map((v, i) => (
          <div key={i} style={{ width: 4, height: `${Math.max((v / max) * 100, 5)}%`, backgroundColor: color, borderRadius: 1, opacity: i === values.length - 1 ? 1 : 0.6 }} />
        ))}
      </div>
    )
  }

  const CircularProgress = ({ value, max, size = 80, strokeWidth = 6, color = CHART_COLORS.primary, label, sublabel }: { value: number; max: number; size?: number; strokeWidth?: number; color?: string; label?: string; sublabel?: string }) => {
    const pct = Math.min((value / max) * 100, 100)
    const r = (size - strokeWidth) / 2
    const circ = 2 * Math.PI * r
    const offset = circ - (pct / 100) * circ
    return (
      <div className="flex flex-col items-center gap-1">
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={isDark ? '#2E2E32' : '#E4E4E8'} strokeWidth={strokeWidth} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
        </svg>
        <div className="text-center -mt-[52px] mb-5">
          <p className={`text-sm font-bold font-mono ${colors.textPrimary}`}>{Math.round(pct)}%</p>
        </div>
        {label && <p className={`text-[10px] font-medium ${colors.textPrimary}`}>{label}</p>}
        {sublabel && <p className={`text-[9px] ${colors.textTertiary}`}>{sublabel}</p>}
      </div>
    )
  }

  const RevenueAreaChart = ({ data: chartData, color = CHART_COLORS.primary, height = 120 }: { data: { label: string; value: number }[]; color?: string; height?: number }) => {
    const max = Math.max(...chartData.map(d => d.value))
    const min = Math.min(...chartData.map(d => d.value)) * 0.8
    const range = max - min || 1
    const w = 100
    const points = chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * w
      const y = height - ((d.value - min) / range) * (height - 10) - 5
      return `${x},${y}`
    })
    const areaPoints = `0,${height} ${points.join(' ')} ${w},${height}`
    return (
      <div className="w-full overflow-hidden" style={{ height }}>
        <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#areaGrad)" />
          <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    )
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
      case 'prospects': return MEGA_PROSPECTS.length
      case 'content': return readyCount
      case 'tasks': { const open = tasks.filter(t => t.status !== 'klaar').length; return open || undefined }
      case 'meetings': return ffMeetings.length || undefined
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
    <main className={`min-h-screen ${colors.bgMain} ${colors.textPrimary} flex transition-colors duration-150`}>
      <style dangerouslySetInnerHTML={{ __html: CMD_PALETTE_STYLES }} />
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
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${SECTION_DOT_COLORS[section.title] || 'bg-gray-500'}`} />
                        {item.label}
                      </span>
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
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                    {item.label}
                  </span>
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
      {/* CMD+K COMMAND PALETTE */}
      {/* ============================================ */}
      {cmdPaletteOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]" onClick={() => setCmdPaletteOpen(false)}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" style={{ animation: 'fadeIn 150ms ease-out' }} />
          <div 
            className={`relative w-full max-w-[520px] mx-4 ${isDark ? 'bg-[#222225] border-[#2E2E32]' : 'bg-white border-[#E4E4E8]'} border rounded-lg shadow-2xl overflow-hidden`}
            style={{ animation: 'slideUp 150ms ease-out' }}
            onClick={e => e.stopPropagation()}
          >
            <div className={`flex items-center gap-2 px-4 py-3 border-b ${isDark ? 'border-[#2E2E32]' : 'border-[#E4E4E8]'}`}>
              <span className={`text-sm ${isDark ? 'text-[#5C5C63]' : 'text-gray-400'}`}>⌘K</span>
              <input
                ref={cmdInputRef}
                value={cmdSearch}
                onChange={e => { setCmdSearch(e.target.value); setCmdSelectedIdx(0) }}
                onKeyDown={handleCmdKeyDown}
                placeholder="Search clients, deals, prospects, tabs..."
                className={`flex-1 bg-transparent text-sm ${isDark ? 'text-[#E8E8ED] placeholder:text-[#5C5C63]' : 'text-gray-900 placeholder:text-gray-400'} outline-none`}
              />
              <kbd className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-[#2A2A2E] text-[#5C5C63]' : 'bg-gray-100 text-gray-400'}`}>ESC</kbd>
            </div>
            {cmdPaletteResults.length > 0 && (
              <div className="max-h-[300px] overflow-y-auto py-1">
                {cmdPaletteResults.map((r, i) => (
                  <button
                    key={`${r.type}-${r.label}-${i}`}
                    onClick={r.action}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                      i === cmdSelectedIdx
                        ? isDark ? 'bg-[#2A2A2E]' : 'bg-gray-100'
                        : isDark ? 'hover:bg-[#2A2A2E]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-base">{r.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] ${isDark ? 'text-[#E8E8ED]' : 'text-gray-900'} truncate`}>{r.label}</p>
                      <p className={`text-[11px] ${isDark ? 'text-[#5C5C63]' : 'text-gray-400'} truncate`}>{r.sub}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-[#18181B] text-[#5C5C63]' : 'bg-gray-100 text-gray-400'}`}>{r.type}</span>
                  </button>
                ))}
              </div>
            )}
            {cmdSearch && cmdPaletteResults.length === 0 && (
              <div className={`py-8 text-center text-[13px] ${isDark ? 'text-[#5C5C63]' : 'text-gray-400'}`}>No results found</div>
            )}
            {!cmdSearch && (
              <div className={`py-6 text-center text-[13px] ${isDark ? 'text-[#5C5C63]' : 'text-gray-400'}`}>Type to search...</div>
            )}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* CLIENT QUICK-VIEW PANEL */}
      {/* ============================================ */}
      {quickViewClient && (() => {
        const client = data.clients.find(c => c.id === quickViewClient)
        const retainerInfo = RETAINER_CLIENTS.find(r => r.klant === client?.naam)
        const clientDeals = data.pipelineDeals.filter(d => d.name.toLowerCase().includes(client?.naam?.toLowerCase() || '___'))
        if (!client) return null
        return (
          <div className="fixed inset-0 z-[90] flex justify-end" onClick={() => setQuickViewClient(null)}>
            <div className="fixed inset-0 bg-black/30" />
            <div 
              className={`relative w-full max-w-[400px] h-full ${isDark ? 'bg-[#1C1C1F] border-l border-[#2E2E32]' : 'bg-white border-l border-[#E4E4E8]'} shadow-2xl overflow-y-auto`}
              style={{ animation: 'slideInRight 200ms ease-out' }}
              onClick={e => e.stopPropagation()}
            >
              <div className={`sticky top-0 ${isDark ? 'bg-[#1C1C1F]' : 'bg-white'} z-10 px-5 py-4 border-b ${isDark ? 'border-[#2E2E32]' : 'border-[#E4E4E8]'} flex items-center justify-between`}>
                <h2 className={`text-[15px] font-semibold ${isDark ? 'text-[#E8E8ED]' : 'text-gray-900'}`}>{client.naam}</h2>
                <button onClick={() => setQuickViewClient(null)} className={`p-1 rounded ${isDark ? 'hover:bg-[#2A2A2E] text-[#8B8B93]' : 'hover:bg-gray-100 text-gray-400'}`}>✕</button>
              </div>
              <div className="px-5 py-4 space-y-5">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${client.status === 'Actief' ? 'bg-green-500' : client.status === 'Churned' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <span className={`text-[13px] ${isDark ? 'text-[#E8E8ED]' : 'text-gray-900'}`}>{client.status}</span>
                  <span className={`text-[11px] ${isDark ? 'text-[#5C5C63]' : 'text-gray-400'}`}>· {client.vertical}</span>
                </div>

                {/* Retainer Info */}
                {retainerInfo && (
                  <div className={`${isDark ? 'bg-[#222225] border-[#2E2E32]' : 'bg-gray-50 border-[#E4E4E8]'} border rounded-md p-3`}>
                    <p className={`text-[10px] uppercase tracking-wide ${isDark ? 'text-[#5C5C63]' : 'text-gray-400'} mb-1`}>Retainer</p>
                    <p className={`text-lg font-mono font-semibold ${isDark ? 'text-[#E8E8ED]' : 'text-gray-900'}`}>€{retainerInfo.bedrag.toLocaleString()}<span className={`text-[11px] font-normal ${isDark ? 'text-[#5C5C63]' : 'text-gray-400'}`}>/jaar</span></p>
                    <p className={`text-[11px] ${isDark ? 'text-[#8B8B93]' : 'text-gray-500'} mt-1`}>{retainerInfo.onderdeel} · {retainerInfo.lead}</p>
                    {/* Mini monthly chart */}
                    <div className="mt-3">
                      <p className={`text-[10px] ${isDark ? 'text-[#5C5C63]' : 'text-gray-400'} mb-1`}>Maandelijks verloop</p>
                      <div className="flex items-end gap-[3px]" style={{ height: 32 }}>
                        {retainerInfo.months.map((m, i) => {
                          const max = Math.max(...retainerInfo.months, 1)
                          return <div key={i} style={{ width: 6, height: `${Math.max((m / max) * 100, 4)}%`, backgroundColor: i <= new Date().getMonth() ? '#0047FF' : isDark ? '#2E2E32' : '#E4E4E8', borderRadius: 1 }} />
                        })}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className={`text-[9px] ${isDark ? 'text-[#5C5C63]' : 'text-gray-400'}`}>Jan</span>
                        <span className={`text-[9px] ${isDark ? 'text-[#5C5C63]' : 'text-gray-400'}`}>Dec</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pipeline Deals */}
                <div>
                  <p className={`text-[10px] uppercase tracking-wide ${isDark ? 'text-[#5C5C63]' : 'text-gray-400'} mb-2`}>Pipeline Deals ({clientDeals.length})</p>
                  {clientDeals.length > 0 ? clientDeals.map(d => (
                    <div key={d.id} className={`flex items-center justify-between py-1.5 border-b ${isDark ? 'border-[#2E2E32]' : 'border-[#E4E4E8]'} last:border-0`}>
                      <span className={`text-[12px] ${isDark ? 'text-[#E8E8ED]' : 'text-gray-900'} truncate`}>{d.name}</span>
                      <span className={`text-[11px] font-mono ${isDark ? 'text-[#8B8B93]' : 'text-gray-500'}`}>{d.value ? `€${d.value.toLocaleString()}` : '—'}</span>
                    </div>
                  )) : <p className={`text-[12px] ${isDark ? 'text-[#5C5C63]' : 'text-gray-400'}`}>Geen actieve deals</p>}
                </div>

                {/* Services */}
                <div>
                  <p className={`text-[10px] uppercase tracking-wide ${isDark ? 'text-[#5C5C63]' : 'text-gray-400'} mb-2`}>Services</p>
                  <div className="flex flex-wrap gap-1">
                    {client.services.map((s, i) => (
                      <span key={i} className={`text-[11px] px-2 py-0.5 rounded ${isDark ? 'bg-[#2A2A2E] text-[#8B8B93]' : 'bg-gray-100 text-gray-500'}`}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="flex gap-2 pt-2">
                  <button onClick={() => { setActiveTab('retainers'); setQuickViewClient(null) }} className="flex-1 text-[12px] py-1.5 rounded bg-[#0047FF]/10 text-[#0047FF] hover:bg-[#0047FF]/20 transition-colors">💰 Retainers</button>
                  <button onClick={() => { setActiveTab('pipeline'); setQuickViewClient(null) }} className="flex-1 text-[12px] py-1.5 rounded bg-[#0047FF]/10 text-[#0047FF] hover:bg-[#0047FF]/20 transition-colors">📊 Pipeline</button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <div className="flex-1 min-w-0 min-h-screen lg:ml-0">
        <div className="max-w-5xl mx-auto px-3 py-4 sm:px-4 lg:px-6 lg:py-5">
          {/* Feature 2: Data Freshness Indicators */}
          <div className={`flex items-center justify-end gap-3 mb-3 text-[11px] ${isDark ? 'text-[#5C5C63]' : 'text-gray-400'}`}>
            <button onClick={() => setCmdPaletteOpen(true)} className={`flex items-center gap-1.5 px-2 py-1 rounded ${isDark ? 'bg-[#222225] border-[#2E2E32] hover:bg-[#2A2A2E]' : 'bg-gray-50 border-[#E4E4E8] hover:bg-gray-100'} border transition-colors`}>
              <span>🔍</span>
              <span>Search</span>
              <kbd className={`text-[9px] ml-1 px-1 py-0.5 rounded ${isDark ? 'bg-[#18181B] text-[#5C5C63]' : 'bg-gray-200 text-gray-400'}`}>⌘K</kbd>
            </button>
            {[
              { label: 'Pipeline', ts: data.pipelineLastUpdated || dataTimestamps.pipeline },
              { label: 'Retainers', ts: dataTimestamps.retainers },
              { label: 'Prospects', ts: dataTimestamps.prospects },
            ].map(({ label, ts }) => {
              const hours = (Date.now() - new Date(ts).getTime()) / (1000 * 60 * 60)
              const dotColor = hours < 24 ? 'bg-green-500' : hours < 168 ? 'bg-yellow-500' : 'bg-red-500'
              return (
                <span key={label} className="flex items-center gap-1" title={`${label}: ${new Date(ts).toLocaleString()}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                  {label}
                </span>
              )
            })}
          </div>
          
          {/* ============================================ */}
          {/* OVERVIEW TAB */}
          {/* ============================================ */}
          {activeTab === 'overview' && (() => {
            const activeClientCount = data.clients.filter(c => c.status === 'Actief').length
            const TARGET_ARR = 2000000
            const arrProgress = Math.min((RETAINER_ARR / TARGET_ARR) * 100, 100)
            const pipelineTotal = data.pipelineDeals.filter(d => !CLOSED_STAGE_IDS.has(d.stageId)).reduce((s, d) => s + (d.value || 0), 0)
            const openDeals = data.pipelineDeals.filter(d => !CLOSED_STAGE_IDS.has(d.stageId))
            const offerteDeals = openDeals.filter(d => d.stageId === 'decisionmakerboughtin')
            const openVoorOfferte = openDeals.filter(d => d.stageId === 'qualifiedtobuy')
            const topDeals = [...openDeals].filter(d => d.value && d.value > 0).sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 5)
            // Deals without next steps = need attention
            const dealsNeedingAction = openDeals.filter(d => !nextSteps[d.id] || String(nextSteps[d.id]).trim() === '')
            // High-value deals without values set
            const dealsWithoutValue = openDeals.filter(d => !d.value || d.value === 0)

            // Weighted pipeline (using slagingskans)
            const weightedPipeline = openDeals.reduce((sum, d) => {
              const prob = d.slagingskans || 25
              return sum + ((d.value || 0) * prob / 100)
            }, 0)
            // Won deals this year
            const wonDealsThisYear = data.pipelineDeals.filter(d => d.stageId === 'closedwon' && d.closedAt && new Date(d.closedAt).getFullYear() === new Date().getFullYear())
            const wonValue = wonDealsThisYear.reduce((s, d) => s + (d.value || 0), 0)
            const lostDealsThisYear = data.pipelineDeals.filter(d => (d.stageId === 'closedlost' || d.stageId === '3982505168') && d.closedAt && new Date(d.closedAt).getFullYear() === new Date().getFullYear())
            const winRate = wonDealsThisYear.length + lostDealsThisYear.length > 0 ? Math.round((wonDealsThisYear.length / (wonDealsThisYear.length + lostDealsThisYear.length)) * 100) : 0
            // Monthly MRR trend from retainers
            const mrrTrend = Array.from({ length: Math.min(CURRENT_MONTH_IDX + 1, 12) }, (_, i) => ({
              label: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Dec'][i],
              value: ACTIVE_RETAINER_CLIENTS.reduce((s, c) => s + c.months[i], 0)
            }))
            // Stale deals (created > 45 days ago, still open)
            const now = Date.now()
            const staleDeals = openDeals.filter(d => {
              const created = d.createdAt ? new Date(d.createdAt).getTime() : now
              return (now - created) > 45 * 24 * 60 * 60 * 1000 && (d.value || 0) > 10000
            }).sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 5)
            // Costs & profit
            const monthlyProfit = RETAINER_MRR - MONTHLY_COSTS.totalMonthly
            const profitMargin = RETAINER_MRR > 0 ? Math.round((monthlyProfit / RETAINER_MRR) * 100) : 0

            return (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[13px]">
                  <span className={colors.textTertiary}>Dashboard</span>
                  <span className={colors.textTertiary}>/</span>
                  <span className={colors.textPrimary}>Command Center</span>
                </div>
                <a href="/morning-brief" target="_blank" className={`text-[11px] px-2.5 py-1 rounded-md ${colors.bgInput} ${colors.textTertiary} hover:${colors.textPrimary} transition-colors border ${colors.border}`}>
                  ☀️ Morning Brief
                </a>
              </div>

              {/* Financial Pulse — compact KPIs + MRR trend */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className={`${colors.bgCard} rounded-md p-3 border ${colors.border}`}>
                  <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wide mb-1`}>MRR</p>
                  <p className={`text-lg font-semibold font-mono ${colors.textPrimary}`}>€{RETAINER_MRR.toLocaleString('nl-NL')}</p>
                  <p className={`text-[10px] ${colors.textTertiary} mt-0.5`}>{ACTIVE_RETAINER_CLIENTS.filter(c => c.months[CURRENT_MONTH_IDX] > 0).length} betalende klanten</p>
                </div>
                <div className={`${colors.bgCard} rounded-md p-3 border ${colors.border}`}>
                  <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wide mb-1`}>ARR</p>
                  <p className={`text-lg font-semibold font-mono ${colors.textPrimary}`}>€{(RETAINER_ARR / 1000).toFixed(0)}K</p>
                  <p className={`text-[10px] mt-0.5`} style={{ color: RETAINER_ARR >= 1300000 ? CHART_COLORS.success : CHART_COLORS.primary }}>target €1.3M ({Math.round(RETAINER_ARR / 13000)}%)</p>
                </div>
                <div className={`${colors.bgCard} rounded-md p-3 border ${colors.border}`}>
                  <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wide mb-1`}>Marge</p>
                  <p className={`text-lg font-semibold font-mono`} style={{ color: profitMargin >= 30 ? CHART_COLORS.success : profitMargin >= 15 ? CHART_COLORS.primary : CHART_COLORS.quaternary }}>{profitMargin}%</p>
                  <p className={`text-[10px] ${colors.textTertiary} mt-0.5`}>€{Math.round(monthlyProfit).toLocaleString('nl-NL')}/mnd winst</p>
                </div>
                <div className={`${colors.bgCard} rounded-md p-3 border ${colors.border}`}>
                  <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wide mb-1`}>Pipeline</p>
                  <p className={`text-lg font-semibold font-mono ${colors.textPrimary}`}>€{(weightedPipeline / 1000).toFixed(0)}K</p>
                  <p className={`text-[10px] ${colors.textTertiary} mt-0.5`}>{openDeals.length} deals gewogen</p>
                </div>
                <div className={`${colors.bgCard} rounded-md p-3 border ${colors.border}`}>
                  <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wide mb-1`}>Win Rate</p>
                  <p className={`text-lg font-semibold font-mono`} style={{ color: winRate >= 50 ? CHART_COLORS.success : winRate >= 30 ? CHART_COLORS.primary : CHART_COLORS.quaternary }}>{winRate}%</p>
                  <p className={`text-[10px] ${colors.textTertiary} mt-0.5`}>{wonDealsThisYear.length}W / {lostDealsThisYear.length}L dit jaar</p>
                </div>
              </div>

              {/* MRR Trend Bar Chart */}
              <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary}`}>MRR Trend 2026</h3>
                  <span className={`text-[10px] ${colors.textTertiary} px-1.5 py-0.5 rounded ${colors.bgInput}`}>Retainer Revenue</span>
                </div>
                <div className="flex items-end gap-1" style={{ height: '80px' }}>
                  {mrrTrend.map((m, i) => {
                    const maxVal = Math.max(...mrrTrend.map(x => x.value), 1)
                    const height = Math.max((m.value / maxVal) * 100, 2)
                    const isCurrentMonth = i === CURRENT_MONTH_IDX
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className={`text-[9px] font-mono ${colors.textTertiary}`}>
                          {m.value > 0 ? `€${(m.value / 1000).toFixed(0)}K` : ''}
                        </span>
                        <div
                          className="w-full rounded-t transition-all"
                          style={{
                            height: `${height}%`,
                            backgroundColor: isCurrentMonth ? CHART_COLORS.secondary : `${CHART_COLORS.secondary}60`,
                            minHeight: '2px'
                          }}
                        />
                        <span className={`text-[9px] ${isCurrentMonth ? colors.textPrimary + ' font-semibold' : colors.textTertiary}`}>{m.label}</span>
                      </div>
                    )
                  })}
                  {/* Show future months greyed out */}
                  {Array.from({ length: 12 - mrrTrend.length }, (_, i) => {
                    const futureIdx = mrrTrend.length + i
                    const labels = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Dec']
                    const futureValue = ACTIVE_RETAINER_CLIENTS.reduce((s, c) => s + c.months[futureIdx], 0)
                    const maxVal = Math.max(...mrrTrend.map(x => x.value), futureValue, 1)
                    const height = Math.max((futureValue / maxVal) * 100, 2)
                    return (
                      <div key={`f${i}`} className="flex-1 flex flex-col items-center gap-1">
                        <span className={`text-[9px] font-mono ${colors.textTertiary}`}>
                          {futureValue > 0 ? `€${(futureValue / 1000).toFixed(0)}K` : ''}
                        </span>
                        <div
                          className="w-full rounded-t"
                          style={{
                            height: `${height}%`,
                            backgroundColor: isDark ? '#2E2E32' : '#E4E4E8',
                            minHeight: '2px',
                            border: `1px dashed ${isDark ? '#3E3E42' : '#D4D4D8'}`
                          }}
                        />
                        <span className={`text-[9px] ${colors.textTertiary}`}>{labels[futureIdx]}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Q2 Targets */}
              {(() => {
                const q2Months = [3, 4, 5] // Apr, May, Jun
                const q2Revenue = q2Months.reduce((sum, mi) => sum + ACTIVE_RETAINER_CLIENTS.reduce((s, c) => s + c.months[mi], 0), 0)
                const q2Target = 350000
                const q2Progress = Math.min((q2Revenue / q2Target) * 100, 100)
                const q2NewClients = RETAINER_CLIENTS.filter(c => c.startJaar === 2026 && c.months[3] > 0 && c.months[2] === 0).length
                return (
                  <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-[13px] font-medium ${colors.textPrimary}`}>Q2 2026 Revenue Target</h3>
                      <span className={`text-[11px] font-mono font-semibold`} style={{ color: q2Progress >= 80 ? CHART_COLORS.success : CHART_COLORS.primary }}>
                        €{(q2Revenue / 1000).toFixed(0)}K / €{(q2Target / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${colors.bgInput}`}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${q2Progress}%`,
                          backgroundColor: q2Progress >= 80 ? CHART_COLORS.success : q2Progress >= 50 ? CHART_COLORS.secondary : CHART_COLORS.primary
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[10px] ${colors.textTertiary}`}>{Math.round(q2Progress)}% van target</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] ${colors.textTertiary}`}>Won dit jaar: €{(wonValue / 1000).toFixed(0)}K</span>
                        {q2NewClients > 0 && <span className={`text-[10px]`} style={{ color: CHART_COLORS.success }}>+{q2NewClients} nieuwe klanten in Q2</span>}
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Client Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className={`${colors.bgCard} rounded-md p-3 border ${colors.border}`}>
                  <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wide mb-1`}>Actieve Klanten</p>
                  <p className={`text-lg font-semibold font-mono ${colors.textPrimary}`}>{activeClientCount}</p>
                  <p className={`text-[10px] ${colors.textTertiary} mt-0.5`}>{data.clients.filter(c => c.dashboard).length} met dashboard</p>
                </div>
                <div className={`${colors.bgCard} rounded-md p-3 border ${colors.border}`}>
                  <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wide mb-1`}>Gezond</p>
                  <p className={`text-lg font-semibold font-mono`} style={{ color: CHART_COLORS.success }}>{CLIENT_PERFORMANCE.filter(c => c.health === 'good').length}</p>
                  <p className={`text-[10px] ${colors.textTertiary} mt-0.5`}>van {CLIENT_PERFORMANCE.length} gemonitord</p>
                </div>
                <div className={`${colors.bgCard} rounded-md p-3 border ${colors.border}`}>
                  <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wide mb-1`}>Aandacht Nodig</p>
                  <p className={`text-lg font-semibold font-mono`} style={{ color: CHART_COLORS.primary }}>{CLIENT_PERFORMANCE.filter(c => c.health === 'warning').length}</p>
                  <p className={`text-[10px] ${colors.textTertiary} mt-0.5`}>warning status</p>
                </div>
                <div className={`${colors.bgCard} rounded-md p-3 border ${colors.border}`}>
                  <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wide mb-1`}>Kritiek</p>
                  <p className={`text-lg font-semibold font-mono`} style={{ color: CHART_COLORS.quaternary }}>{CLIENT_PERFORMANCE.filter(c => c.health === 'critical').length}</p>
                  <p className={`text-[10px] ${colors.textTertiary} mt-0.5`}>directe actie vereist</p>
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
                          <span className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: client.health === 'good' ? CHART_COLORS.success : client.health === 'warning' ? CHART_COLORS.primary : CHART_COLORS.quaternary }} />
                          <span className={`text-[13px] ${colors.textPrimary}`}>{client.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {client.fbSpend && <span className={`text-[12px] font-mono ${colors.textSecondary}`}>{client.fbSpend}</span>}
                          {client.fbRoas && <span className="text-[12px] font-mono" style={{ color: CHART_COLORS.success }}>{client.fbRoas}x</span>}
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
                          <span className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: client.health === 'good' ? CHART_COLORS.success : client.health === 'warning' ? CHART_COLORS.primary : CHART_COLORS.quaternary }} />
                          <span className={`text-[13px] ${colors.textPrimary}`}>{client.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {client.googleSpend && <span className={`text-[12px] font-mono ${colors.textSecondary}`}>{client.googleSpend}</span>}
                          {client.googleRoas && <span className="text-[12px] font-mono" style={{ color: CHART_COLORS.success }}>{client.googleRoas}x</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {alertClients.length > 0 && (
                <div className={`${colors.bgCard} rounded-md p-4 border`} style={{ borderColor: `${CHART_COLORS.primary}50` }}>
                  <h3 className="text-[13px] font-medium mb-2 flex items-center gap-2" style={{ color: CHART_COLORS.primary }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: CHART_COLORS.primary }} />
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

              {/* Pipeline Quick View — Top deals + Stale deals */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Top Pipeline Deals */}
                {topDeals.length > 0 && (
                  <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                    <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Top Pipeline Deals</h3>
                    <div className="space-y-1">
                      {topDeals.map((deal, i) => {
                        const prob = deal.slagingskans || 25
                        return (
                          <div key={i} className={`flex items-center justify-between py-1.5 border-b ${colors.border} last:border-0`}>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${colors.bgInput}`} style={{ color: prob >= 75 ? CHART_COLORS.success : prob >= 50 ? CHART_COLORS.secondary : CHART_COLORS.primary }}>{prob}%</span>
                              <span className={`text-[12px] ${colors.textPrimary} truncate`}>{deal.name}</span>
                            </div>
                            <span className={`text-[12px] font-mono font-semibold ${colors.textPrimary} ml-2`}>€{(deal.value! / 1000).toFixed(0)}K</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Stale Deals Warning */}
                {staleDeals.length > 0 && (
                  <div className={`${colors.bgCard} rounded-md p-4 border`} style={{ borderColor: `${CHART_COLORS.quaternary}30` }}>
                    <h3 className={`text-[13px] font-medium mb-3 flex items-center gap-2`} style={{ color: CHART_COLORS.quaternary }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CHART_COLORS.quaternary }} />
                      Stale Deals ({'>'}45 dagen)
                    </h3>
                    <div className="space-y-1">
                      {staleDeals.map((deal, i) => {
                        const daysOld = deal.createdAt ? Math.round((Date.now() - new Date(deal.createdAt).getTime()) / (24 * 60 * 60 * 1000)) : 0
                        return (
                          <div key={i} className={`flex items-center justify-between py-1.5 border-b ${colors.border} last:border-0`}>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className={`text-[10px] font-mono ${colors.textTertiary}`}>{daysOld}d</span>
                              <span className={`text-[12px] ${colors.textPrimary} truncate`}>{deal.name}</span>
                            </div>
                            <span className={`text-[12px] font-mono ${colors.textSecondary}`}>€{((deal.value || 0) / 1000).toFixed(0)}K</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* If no stale deals, show deals needing next steps */}
                {staleDeals.length === 0 && dealsNeedingAction.length > 0 && (
                  <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                    <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Deals Zonder Volgende Stap</h3>
                    <div className="space-y-1">
                      {dealsNeedingAction.slice(0, 5).map((deal, i) => (
                        <div key={i} className={`flex items-center justify-between py-1.5 border-b ${colors.border} last:border-0`}>
                          <span className={`text-[12px] ${colors.textPrimary} truncate`}>{deal.name}</span>
                          <span className={`text-[10px] ${colors.textTertiary}`}>Actie nodig</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Weekly Performance Comparison + Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* This Week vs Last Week */}
                {(() => {
                  const now = new Date()
                  const startOfThisWeek = new Date(now); startOfThisWeek.setDate(now.getDate() - now.getDay() + 1); startOfThisWeek.setHours(0,0,0,0)
                  const startOfLastWeek = new Date(startOfThisWeek); startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)
                  const endOfLastWeek = new Date(startOfThisWeek)

                  const inRange = (dateStr: string | undefined, start: Date, end: Date) => {
                    if (!dateStr) return false
                    const d = new Date(dateStr)
                    return d >= start && d < end
                  }

                  const wonThisWeek = data.pipelineDeals.filter(d => d.stageId === 'closedwon' && inRange(d.closedAt, startOfThisWeek, now))
                  const wonLastWeek = data.pipelineDeals.filter(d => d.stageId === 'closedwon' && inRange(d.closedAt, startOfLastWeek, endOfLastWeek))
                  const lostThisWeek = data.pipelineDeals.filter(d => (d.stageId === 'closedlost' || d.stageId === '3982505168') && inRange(d.closedAt, startOfThisWeek, now))
                  const lostLastWeek = data.pipelineDeals.filter(d => (d.stageId === 'closedlost' || d.stageId === '3982505168') && inRange(d.closedAt, startOfLastWeek, endOfLastWeek))
                  const revThisWeek = wonThisWeek.reduce((s, d) => s + (d.value || 0), 0)
                  const revLastWeek = wonLastWeek.reduce((s, d) => s + (d.value || 0), 0)
                  const newThisWeek = data.pipelineDeals.filter(d => inRange(d.createdAt, startOfThisWeek, now) && !CLOSED_STAGE_IDS.has(d.stageId))
                  const newLastWeek = data.pipelineDeals.filter(d => inRange(d.createdAt, startOfLastWeek, endOfLastWeek) && !CLOSED_STAGE_IDS.has(d.stageId))

                  const Comp = ({ label, thisW, lastW, isCurrency }: { label: string; thisW: number; lastW: number; isCurrency?: boolean }) => {
                    const diff = thisW - lastW
                    const up = diff > 0
                    const same = diff === 0
                    return (
                      <div className={`flex items-center justify-between py-2 border-b ${colors.border} last:border-0`}>
                        <span className={`text-[12px] ${colors.textSecondary}`}>{label}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[13px] font-mono font-semibold ${colors.textPrimary}`}>
                            {isCurrency ? `€${thisW.toLocaleString('nl-NL')}` : thisW}
                          </span>
                          <span className={`text-[10px] ${colors.textTertiary}`}>vs {isCurrency ? `€${lastW.toLocaleString('nl-NL')}` : lastW}</span>
                          {!same && (
                            <span className={`text-[11px] font-medium ${up ? 'text-emerald-500' : 'text-red-400'}`}>
                              {up ? '↑' : '↓'} {isCurrency ? `€${Math.abs(diff).toLocaleString('nl-NL')}` : Math.abs(diff)}
                            </span>
                          )}
                          {same && <span className={`text-[11px] ${colors.textTertiary}`}>—</span>}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                      <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3 flex items-center gap-2`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CHART_COLORS.secondary }} />
                        This Week vs Last Week
                      </h3>
                      <div>
                        <Comp label="Deals Won" thisW={wonThisWeek.length} lastW={wonLastWeek.length} />
                        <Comp label="Deals Lost" thisW={lostThisWeek.length} lastW={lostLastWeek.length} />
                        <Comp label="Revenue Closed" thisW={revThisWeek} lastW={revLastWeek} isCurrency />
                        <Comp label="New Prospects" thisW={newThisWeek.length} lastW={newLastWeek.length} />
                      </div>
                    </div>
                  )
                })()}

                {/* Activity Feed */}
                <div className={`${colors.bgCard} rounded-md p-4 border ${colors.border}`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3 flex items-center gap-2`}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CHART_COLORS.primary }} />
                    Recent Activity
                  </h3>
                  {activityLoading ? (
                    <p className={`text-[11px] ${colors.textTertiary}`}>Loading...</p>
                  ) : activityFeed.length === 0 ? (
                    <p className={`text-[11px] ${colors.textTertiary} italic`}>No recent activity logged yet. Activities are tracked when deals, tasks, and clients change.</p>
                  ) : (
                    <div className="space-y-0.5 max-h-[280px] overflow-y-auto">
                      {activityFeed.slice(0, 20).map((act) => {
                        const icons: Record<string, string> = { deal_moved: '🔄', deal_new: '✨', deal_won: '🎉', deal_lost: '❌', client_health: '💊', task_completed: '✅', prospect_added: '🎯' }
                        const colorMap: Record<string, string> = { deal_won: CHART_COLORS.success, deal_lost: CHART_COLORS.quaternary, deal_new: CHART_COLORS.secondary, deal_moved: CHART_COLORS.primary, client_health: CHART_COLORS.tertiary, task_completed: CHART_COLORS.success, prospect_added: CHART_COLORS.secondary }
                        const timeAgo = (ts: string) => {
                          const diff = Date.now() - new Date(ts).getTime()
                          const mins = Math.floor(diff / 60000)
                          if (mins < 60) return `${mins}m ago`
                          const hrs = Math.floor(mins / 60)
                          if (hrs < 24) return `${hrs}h ago`
                          return `${Math.floor(hrs / 24)}d ago`
                        }
                        return (
                          <div key={act.id} className={`flex items-start gap-2 py-1.5 border-b ${colors.border} last:border-0`}>
                            <span className="text-[12px] mt-0.5">{icons[act.type] || '📌'}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-[12px] ${colors.textPrimary} truncate`}>{act.title}</p>
                              {act.description && <p className={`text-[10px] ${colors.textTertiary} truncate`}>{act.description}</p>}
                            </div>
                            <span className={`text-[9px] ${colors.textTertiary} whitespace-nowrap`}>{timeAgo(act.timestamp)}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
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
                      className={`p-2 rounded-md ${colors.bgInput} border ${colors.border} text-center cursor-pointer transition-colors hover:scale-105`}
                      style={{ borderColor: client.health === 'good' ? `${CHART_COLORS.success}30` : client.health === 'warning' ? `${CHART_COLORS.primary}30` : client.health === 'critical' ? `${CHART_COLORS.quaternary}30` : undefined }}
                      title={`${client.name}: ${client.health === 'good' ? 'Healthy' : client.health === 'warning' ? 'Needs attention' : client.health === 'critical' ? 'Critical' : 'Geen data'}`}
                      onClick={() => { const match = data.clients.find(c => c.naam === client.name); if (match) setQuickViewClient(match.id) }}
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: client.health === 'good' ? CHART_COLORS.success : client.health === 'warning' ? CHART_COLORS.primary : client.health === 'critical' ? CHART_COLORS.quaternary : 'transparent', border: client.health === 'unknown' ? `1px solid ${isDark ? '#52525b' : '#a1a1aa'}` : 'none' }} />
                      </div>
                      <p className={`text-[10px] ${client.health === 'unknown' ? colors.textTertiary : colors.textPrimary} truncate font-medium`}>{client.name}</p>
                      {client.fbRoas && (
                        <p className={`text-[9px] font-mono`} style={{ color: parseFloat(client.fbRoas) >= 5 ? CHART_COLORS.success : undefined }}>{client.fbRoas}x</p>
                      )}
                      {!client.fbRoas && client.googleRoas && (
                        <p className={`text-[9px] font-mono`} style={{ color: parseFloat(client.googleRoas) >= 5 ? CHART_COLORS.success : undefined }}>{client.googleRoas}x</p>
                      )}
                      {!client.fbRoas && !client.googleRoas && (
                        <p className={`text-[9px] ${colors.textTertiary}`}>—</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-dashed" style={{ borderColor: isDark ? '#2E2E32' : '#E4E4E8' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.success }} />
                    <span className={`text-[10px] ${colors.textTertiary}`}>Good ({CLIENT_PERFORMANCE.filter(c => c.health === 'good').length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.primary }} />
                    <span className={`text-[10px] ${colors.textTertiary}`}>Warning ({CLIENT_PERFORMANCE.filter(c => c.health === 'warning').length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.quaternary }} />
                    <span className={`text-[10px] ${colors.textTertiary}`}>Critical ({CLIENT_PERFORMANCE.filter(c => c.health === 'critical').length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full border ${isDark ? 'border-zinc-600' : 'border-zinc-400'}`} />
                    <span className={`text-[10px] ${colors.textTertiary}`}>Geen data ({CLIENT_PERFORMANCE.filter(c => c.health === 'unknown').length})</span>
                  </div>
                </div>
              </div>

            </div>
            )
          })()}

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
                  <table className="w-full text-[13px] min-w-[550px]">
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
          {/* SALES OVERVIEW TAB */}
          {/* ============================================ */}

          {/* ============================================ */}
          {/* TEAM PERFORMANCE TAB */}
          {/* ============================================ */}
          {activeTab === 'team' && (
            <TeamTab colors={colors} />
          )}

          {/* ============================================ */}
          {/* PIPELINE TAB - Multi-pipeline with HubSpot links */}
          {/* ============================================ */}
          {activeTab === 'pipeline' && (() => {
            const activePipeline = PIPELINES.find(p => p.id === activePipelineId) || PIPELINES[0]
            const openStages = activePipeline.stages.filter(s => !s.closed)
            
            // Meeting count per deal (fuzzy match title)
            const getMeetingCount = (dealName: string): number => {
              if (!dealName || ffMeetings.length === 0) return 0
              const dn = dealName.toLowerCase().replace(/[^a-z0-9]/g, '')
              return ffMeetings.filter(m => {
                const mt = (m.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')
                return mt.includes(dn) || dn.includes(mt)
              }).length
            }
            
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
              <div className="space-y-5">
                {/* Header with pipeline tabs */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className={colors.textTertiary}>Dashboard</span>
                    <span className={colors.textTertiary}>/</span>
                    <span className={`font-medium ${colors.textPrimary}`}>Pipeline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] ${colors.textTertiary}`}>
                      {formatDate(data.pipelineLastUpdated)}
                    </span>
                    <button
                      onClick={() => {
                        const rows = [['Deal', 'Stage', 'Bedrag', 'Kans %', 'Gewogen', 'Leeftijd (d)', 'Volgende Stap'].join(',')]
                        const openStagesLocal = (PIPELINES.find(p => p.id === activePipelineId) || PIPELINES[0]).stages.filter(s => !s.closed)
                        data.pipelineDeals.filter(d => d.pipelineId === activePipelineId && !CLOSED_STAGE_IDS.has(d.stageId)).forEach(d => {
                          const stage = openStagesLocal.find(s => s.id === d.stageId)?.name || d.stageId
                          const prob = d.slagingskans || 25
                          const weighted = Math.round((d.value || 0) * prob / 100)
                          const age = d.createdAt ? Math.round((Date.now() - new Date(d.createdAt).getTime()) / (24*60*60*1000)) : ''
                          const ns = (nextSteps[d.id] || '').replace(/"/g, '""')
                          rows.push(`"${d.name}","${stage}",${d.value || 0},${prob},${weighted},${age},"${ns}"`)
                        })
                        const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url; a.download = `pipeline-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className={`px-3 py-1 rounded text-[12px] font-medium ${colors.bgCard} ${colors.textSecondary} border ${colors.border} hover:${colors.textPrimary} transition-all flex items-center gap-1.5`}
                    >
                      📥 CSV
                    </button>
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

                {/* Pipeline Funnel */}
                <div className={`${colors.bgCard} rounded-lg border ${colors.border} p-4`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Pipeline Funnel</h3>
                  <div className="space-y-1">
                    {groupedDeals.map((group, idx) => {
                      const stageValue = group.deals.reduce((s, d) => s + (d.value || 0), 0)
                      const maxValue = Math.max(...groupedDeals.map(g => g.deals.reduce((s, d) => s + (d.value || 0), 0)), 1)
                      const pct = (stageValue / maxValue) * 100
                      const stageColors = [CHART_COLORS.secondary, CHART_COLORS.primary, CHART_COLORS.tertiary, CHART_COLORS.success, CHART_COLORS.quaternary]
                      const color = stageColors[idx % stageColors.length]
                      return (
                        <div key={group.stage.id} className="flex items-center gap-3">
                          <span className={`text-[11px] w-28 text-right ${colors.textSecondary} truncate`}>{group.stage.name}</span>
                          <div className="flex-1 h-6 rounded-sm overflow-hidden" style={{ backgroundColor: isDark ? '#1C1C1E' : '#F4F4F5' }}>
                            <div className="h-full rounded-sm flex items-center justify-end px-2 transition-all duration-500" style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: color + '40' }}>
                              {stageValue > 0 && <span className="text-[10px] font-mono font-medium" style={{ color }}>€{(stageValue / 1000).toFixed(0)}K</span>}
                            </div>
                          </div>
                          <span className={`text-[11px] font-mono ${colors.textTertiary} w-8 text-right`}>{group.deals.length}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Kanban columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {groupedDeals.map((group) => (
                    <div key={group.stage.id} className={`${colors.bgCard} rounded-lg border ${colors.border}`}>
                      {/* Stage header */}
                      <div className={`px-4 py-2.5 border-b ${colors.border} flex items-center justify-between`}>
                        <h3 className={`text-[11px] font-semibold ${colors.textPrimary} uppercase tracking-wider`}>{group.stage.name}</h3>
                        <span className={`text-[11px] ${colors.textTertiary} font-mono bg-${isDark ? 'white' : 'black'}/5 px-1.5 py-0.5 rounded`}>{group.deals.length}</span>
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
                                <select
                                  value={deal.stageId}
                                  onChange={(e) => updateDeal(deal.id, 'stageId', e.target.value)}
                                  className={`w-full px-2 py-1 rounded text-[12px] ${colors.bgCard} ${colors.textSecondary} border ${colors.border} focus:outline-none focus:ring-1 focus:ring-[#0047FF]`}
                                >
                                  {openStages.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                                </select>
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
                                    <div className="flex items-center gap-1">
                                      <p className={`text-[13px] font-medium ${colors.textPrimary} leading-tight`}>{deal.name}</p>
                                      {getMeetingCount(deal.name) > 0 && (
                                        <button onClick={() => { setActiveTab('meetings'); setFfSearch(deal.name.split(' ')[0]) }} className="text-[9px] px-1 py-0.5 rounded bg-purple-500/15 text-purple-400 hover:bg-purple-500/25" title={`${getMeetingCount(deal.name)} meeting(s)`}>
                                          🎙️{getMeetingCount(deal.name)}
                                        </button>
                                      )}
                                    </div>
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
                                {/* Deal age + probability badges */}
                                <div className="flex items-center gap-1.5 mt-1">
                                  {deal.createdAt && (() => {
                                    const age = Math.round((Date.now() - new Date(deal.createdAt).getTime()) / (24*60*60*1000))
                                    return <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${age > 60 ? 'bg-red-500/15 text-red-400' : age > 30 ? 'bg-amber-500/15 text-amber-400' : `${colors.bgInput} ${colors.textTertiary}`}`}>{age}d</span>
                                  })()}
                                  {deal.slagingskans && <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${colors.bgInput}`} style={{ color: deal.slagingskans >= 75 ? CHART_COLORS.success : deal.slagingskans >= 50 ? CHART_COLORS.primary : undefined }}>{deal.slagingskans}%</span>}
                                  {(() => { const qs = getDealQualScore(deal.id); return qs > 0 ? <span className={`text-[9px] font-mono px-1 py-0.5 rounded`} style={{ backgroundColor: qs >= 4 ? '#22C55E20' : qs >= 2 ? '#F9731620' : '#EF444420', color: qs >= 4 ? '#22C55E' : qs >= 2 ? '#F97316' : '#EF4444' }}>Q{qs}/5</span> : null })()}
                                </div>
                                {/* Qualification Scorecard */}
                                <div className="flex items-center gap-1 mt-1.5">
                                  {QUAL_QUESTIONS.map((q, qi) => {
                                    const answers = dealQualification[deal.id] || [false, false, false, false, false]
                                    return <button key={qi} onClick={() => updateDealQualification(deal.id, qi)} title={q} className={`w-4 h-4 rounded-sm text-[8px] flex items-center justify-center transition-colors ${answers[qi] ? 'bg-emerald-500/20 text-emerald-500' : `${colors.bgInput} ${colors.textTertiary}`}`}>{answers[qi] ? '✓' : (qi + 1)}</button>
                                  })}
                                  <span className={`text-[8px] ${colors.textTertiary} ml-0.5`}>qual</span>
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

                {/* Deal Velocity Metrics */}
                {(() => {
                  const wonDeals = data.pipelineDeals.filter(d => d.stageId === 'closedwon' && d.closedAt && d.createdAt)
                  const daysToClose = wonDeals.map(d => Math.round((new Date(d.closedAt!).getTime() - new Date(d.createdAt!).getTime()) / (24 * 60 * 60 * 1000))).filter(d => d > 0 && d < 365)
                  const avgDaysToClose = daysToClose.length > 0 ? Math.round(daysToClose.reduce((a, b) => a + b, 0) / daysToClose.length) : 0
                  
                  // Time in each stage (approximate using created dates of deals currently in those stages)
                  const stageTimeData = openStages.map(stage => {
                    const stageDeals = pipelineDeals.filter(d => d.stageId === stage.id && d.createdAt)
                    const avgDays = stageDeals.length > 0 
                      ? Math.round(stageDeals.reduce((sum, d) => sum + Math.round((Date.now() - new Date(d.createdAt!).getTime()) / (24 * 60 * 60 * 1000)), 0) / stageDeals.length)
                      : 0
                    return { name: stage.name, days: avgDays, count: stageDeals.length }
                  }).filter(s => s.count > 0)
                  
                  const maxDays = Math.max(...stageTimeData.map(s => s.days), 1)
                  
                  // Velocity trend: compare recent 3 months vs prior 3 months
                  const now = new Date()
                  const threeMonthsAgo = new Date(now); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
                  const sixMonthsAgo = new Date(now); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
                  const recentWon = wonDeals.filter(d => new Date(d.closedAt!) >= threeMonthsAgo)
                  const olderWon = wonDeals.filter(d => new Date(d.closedAt!) >= sixMonthsAgo && new Date(d.closedAt!) < threeMonthsAgo)
                  const recentAvg = recentWon.length > 0 ? Math.round(recentWon.map(d => (new Date(d.closedAt!).getTime() - new Date(d.createdAt!).getTime()) / (24*60*60*1000)).filter(d => d > 0 && d < 365).reduce((a,b) => a+b, 0) / recentWon.length) : 0
                  const olderAvg = olderWon.length > 0 ? Math.round(olderWon.map(d => (new Date(d.closedAt!).getTime() - new Date(d.createdAt!).getTime()) / (24*60*60*1000)).filter(d => d > 0 && d < 365).reduce((a,b) => a+b, 0) / olderWon.length) : 0
                  const velocityTrend = olderAvg > 0 && recentAvg > 0 ? (recentAvg < olderAvg ? 'faster' : recentAvg > olderAvg ? 'slower' : 'same') : 'unknown'
                  
                  return (
                    <div className={`${colors.bgCard} rounded-lg border ${colors.border} p-4`}>
                      <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3 flex items-center gap-2`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CHART_COLORS.tertiary }} />
                        Deal Velocity
                      </h3>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className={`${colors.bgInput} rounded-md p-3 text-center`}>
                          <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wide mb-1`}>Avg Days to Close</p>
                          <p className={`text-lg font-semibold font-mono ${colors.textPrimary}`}>{avgDaysToClose || '—'}</p>
                          <p className={`text-[10px] ${colors.textTertiary}`}>{daysToClose.length} won deals</p>
                        </div>
                        <div className={`${colors.bgInput} rounded-md p-3 text-center`}>
                          <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wide mb-1`}>Recent Trend</p>
                          <p className={`text-lg font-semibold font-mono ${velocityTrend === 'faster' ? 'text-emerald-500' : velocityTrend === 'slower' ? 'text-red-400' : colors.textPrimary}`}>
                            {velocityTrend === 'faster' ? '⚡ Faster' : velocityTrend === 'slower' ? '🐢 Slower' : '—'}
                          </p>
                          <p className={`text-[10px] ${colors.textTertiary}`}>{recentAvg > 0 ? `${recentAvg}d vs ${olderAvg}d` : 'Not enough data'}</p>
                        </div>
                        <div className={`${colors.bgInput} rounded-md p-3 text-center`}>
                          <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wide mb-1`}>Active Deals</p>
                          <p className={`text-lg font-semibold font-mono ${colors.textPrimary}`}>{pipelineDeals.length}</p>
                          <p className={`text-[10px] ${colors.textTertiary}`}>in pipeline</p>
                        </div>
                      </div>
                      {stageTimeData.length > 0 && (
                        <>
                          <p className={`text-[11px] ${colors.textSecondary} mb-2`}>Average time in stage (days)</p>
                          <div className="space-y-1.5">
                            {stageTimeData.map((s, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <span className={`text-[11px] w-28 text-right ${colors.textSecondary} truncate`}>{s.name}</span>
                                <div className="flex-1 h-5 rounded-sm overflow-hidden" style={{ backgroundColor: isDark ? '#1C1C1E' : '#F4F4F5' }}>
                                  <div className="h-full rounded-sm flex items-center justify-end px-2 transition-all duration-500" style={{ width: `${Math.max((s.days / maxDays) * 100, 5)}%`, backgroundColor: CHART_COLORS.tertiary + '50' }}>
                                    <span className="text-[10px] font-mono font-medium" style={{ color: CHART_COLORS.tertiary }}>{s.days}d</span>
                                  </div>
                                </div>
                                <span className={`text-[10px] font-mono ${colors.textTertiary} w-8 text-right`}>{s.count}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })()}

                {/* List view for all deals in pipeline */}
                <div className={`${colors.bgCard} rounded-lg border ${colors.border} overflow-hidden`}>
                  <div className={`px-5 py-3 border-b ${colors.border} flex items-center justify-between`}>
                    <h3 className={`text-[14px] font-semibold ${colors.textPrimary} tracking-tight`}>Alle deals — {activePipeline.name}</h3>
                    <span className={`text-[12px] font-mono ${colors.textTertiary}`}>{filteredDeals.length} deals</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]" style={{ minWidth: 800 }}>
                      <thead>
                        <tr className={`${colors.bgInput} border-b ${colors.border}`}>
                          <th className={`text-left px-5 py-2.5 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary} sticky left-0 ${colors.bgInput} z-10`}>Deal</th>
                          <th className={`text-left px-4 py-2.5 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary}`}>Stage</th>
                          <th className={`text-right px-4 py-2.5 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary}`}>Bedrag</th>
                          <th className={`text-right px-4 py-2.5 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary} w-[100px]`}>Kans</th>
                          <th className={`text-right px-4 py-2.5 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary} w-[110px]`}>Gewogen</th>
                          <th className={`text-center px-3 py-2.5 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary} w-[80px]`}>Qual</th>
                          <th className={`text-left px-4 py-2.5 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary}`} style={{ minWidth: 200 }}>Volgende stap</th>
                          <th className={`text-center px-3 py-2.5 w-10`}></th>
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
                              <tr key={deal.id} className={`border-t ${colors.border} hover:${isDark ? 'bg-white/[0.02]' : 'bg-black/[0.015]'} transition-colors`}>
                                <td className={`px-5 py-3 font-medium ${colors.textPrimary} sticky left-0 ${colors.bgCard} z-10`}>
                                  <span className="flex items-center gap-1">
                                    {deal.name}
                                    {getMeetingCount(deal.name) > 0 && <span className="text-[9px] px-1 py-0.5 rounded bg-purple-500/15 text-purple-400">🎙️{getMeetingCount(deal.name)}</span>}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <select
                                    value={deal.stageId}
                                    onChange={(e) => updateDeal(deal.id, 'stageId', e.target.value)}
                                    className={`text-[11px] px-2 py-1 rounded-full font-medium border-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0047FF]/50 ${
                                      stageOrder >= 4 ? 'bg-emerald-500/15 text-emerald-500' :
                                      stageOrder === 3 ? 'bg-blue-500/15 text-blue-400' :
                                      stageOrder === 2 ? 'bg-violet-500/15 text-violet-400' :
                                      `${colors.bgActive} ${colors.textSecondary}`
                                    }`}
                                  >
                                    {openStages.map(s => (
                                      <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <AmountInput value={deal.value || 0} onChange={(v) => updateDeal(deal.id, 'value', v)} className={`font-mono text-[13px] ${deal.value ? colors.accent : colors.textTertiary}`} />
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <select
                                    value={dealProbability[deal.id] ?? ''}
                                    onChange={(e) => updateDealProbability(deal.id, Number(e.target.value))}
                                    className={`text-[12px] font-mono ${colors.textSecondary} bg-transparent border-none rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#0047FF]/50 cursor-pointer appearance-none text-center`}
                                    style={{ minHeight: 28 }}
                                  >
                                    <option value="">—</option>
                                    <option value="10">10%</option>
                                    <option value="25">25%</option>
                                    <option value="50">50%</option>
                                    <option value="75">75%</option>
                                    <option value="90">90%</option>
                                    <option value="100">100%</option>
                                  </select>
                                </td>
                                <td className={`px-4 py-3 text-right font-mono text-[13px] font-medium ${dealProbability[deal.id] && deal.value ? 'text-emerald-500' : colors.textTertiary}`}>
                                  {dealProbability[deal.id] && deal.value
                                    ? `€${Math.round((deal.value * dealProbability[deal.id]) / 100).toLocaleString('nl-NL')}`
                                    : '—'}
                                </td>
                                <td className="px-3 py-3 text-center">
                                  <div className="flex items-center justify-center gap-0.5">
                                    {QUAL_QUESTIONS.map((q, qi) => {
                                      const answers = dealQualification[deal.id] || [false, false, false, false, false]
                                      return <button key={qi} onClick={() => updateDealQualification(deal.id, qi)} title={q} className={`w-3.5 h-3.5 rounded-sm text-[7px] flex items-center justify-center ${answers[qi] ? 'bg-emerald-500/20 text-emerald-500' : `${colors.bgInput} ${colors.textTertiary}`}`}>{answers[qi] ? '✓' : ''}</button>
                                    })}
                                  </div>
                                  <span className={`text-[9px] font-mono ${getDealQualScore(deal.id) >= 4 ? 'text-emerald-500' : getDealQualScore(deal.id) >= 2 ? 'text-amber-500' : colors.textTertiary}`}>{getDealQualScore(deal.id)}/5</span>
                                </td>
                                <td className={`px-4 py-3`}>
                                  <input
                                    type="text"
                                    value={nextSteps[deal.id] || ''}
                                    onChange={(e) => updateNextStep(deal.id, e.target.value)}
                                    placeholder="+ Voeg volgende stap toe..."
                                    className={`w-full text-[12px] ${nextSteps[deal.id] ? colors.textSecondary : colors.textTertiary} bg-transparent focus:outline-none focus:ring-1 focus:ring-[#0047FF]/50 rounded px-2 py-1 placeholder:italic placeholder:${colors.textTertiary}`}
                                    style={{ minHeight: 28 }}
                                  />
                                </td>
                                <td className="px-3 py-3 text-center">
                                  <a
                                    href={`https://app-eu1.hubspot.com/contacts/8271281/record/0-3/${deal.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex p-1.5 rounded-md ${colors.textTertiary} hover:${colors.textPrimary} hover:${colors.bgInput} transition-all`}
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
                        {/* Totaal rij */}
                        <tr className={`border-t-2 ${colors.border}`}>
                          <td className={`px-5 py-3 font-semibold ${colors.textPrimary} sticky left-0 ${colors.bgCard} z-10`}>Totaal</td>
                          <td className="px-4 py-3"></td>
                          <td className={`px-4 py-3 text-right font-mono font-semibold ${colors.accent}`}>
                            €{filteredDeals.reduce((sum, d) => sum + (d.value || 0), 0).toLocaleString('nl-NL')}
                          </td>
                          <td className="px-4 py-3"></td>
                          <td className={`px-4 py-3 text-right font-mono font-semibold text-emerald-500`}>
                            €{filteredDeals.reduce((sum, d) => {
                              const prob = dealProbability[d.id] || 0
                              return sum + Math.round(((d.value || 0) * prob) / 100)
                            }, 0).toLocaleString('nl-NL')}
                          </td>
                          <td className="px-3 py-3"></td>
                          <td className="px-4 py-3" colSpan={2}></td>
                        </tr>
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
                            <td className="px-3 py-1.5" onClick={e => e.stopPropagation()}>
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
                            <td className="px-1 py-1.5" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => updateProspectStatus(prospect.id, prospect.status === 'interesting' ? 'new' : 'interesting')}
                                className={`text-[14px] transition-transform hover:scale-125 ${prospect.status === 'interesting' ? '' : 'opacity-30 hover:opacity-60'}`}
                                title="Toggle interessant"
                              >⭐</button>
                            </td>
                            <td className="px-3 py-1.5">
                              <a href={prospect.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-[12px] text-blue-400 hover:text-blue-300 font-medium">
                                {prospect.name}
                              </a>
                            </td>
                            <td className={`px-3 py-1.5 text-[12px] ${colors.textSecondary}`}>{prospect.category}</td>
                            <td className="px-3 py-1.5">
                              {prospect.source_agency && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">{prospect.source_agency}</span>
                              )}
                            </td>
                            <td className={`px-3 py-1.5 text-[12px] ${colors.textSecondary}`}>{prospect.location}</td>
                            <td className="px-3 py-1.5">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${prospect.match_score * 10}%` }} />
                                </div>
                                <span className={`text-[11px] ${colors.textSecondary}`}>{prospect.match_score}</span>
                              </div>
                            </td>
                            <td className="px-3 py-1.5">
                              <div className="flex gap-1 flex-nowrap overflow-hidden">
                                {prospect.services.slice(0, 2).map(s => (
                                  <span key={s} className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bgCard} ${colors.textTertiary} border ${colors.border} whitespace-nowrap`}>{s}</span>
                                ))}
                                {prospect.services.length > 2 && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${colors.textTertiary} whitespace-nowrap`}>+{prospect.services.length - 2}</span>
                                )}
                              </div>
                            </td>
                            <td className={`px-3 py-1.5 text-[12px] ${colors.textPrimary} font-medium`}>€{prospect.retainer_potential.toLocaleString('nl-NL')}</td>
                            <td className="px-3 py-1.5">
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${priorityColors[prospect.priority]}`}>
                                {prospect.priority}
                              </span>
                            </td>
                            <td className="px-3 py-1.5">
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
          {activeTab === 'strategy' && (
            <StrategyTab data={data} setData={setData} colors={colors} updateData={updateData} editMode={editMode} setActiveTab={setActiveTab} />
          )}
          {/* ============================================ */}
          {/* FORECAST TAB */}
          {/* ============================================ */}
          {activeTab === 'forecast' && (() => {
            const years = ['2022', '2023', '2024', '2025']
            const maxRev = Math.max(...HISTORICAL_REVENUE.map(r => r.revenue))
            const lastYearRev = HISTORICAL_REVENUE.filter(r => r.month.startsWith('2025')).reduce((s, r) => s + r.revenue, 0)
            const target2026 = 1500000
            const currentARR = RETAINER_ARR
            const gap = target2026 - currentARR
            const scenarios = [
              { name: 'Optimistisch', gapPct: 0.80, color: 'text-green-400', bgColor: 'bg-green-500/20', desc: '80% van gap dichten, 8 nieuwe klanten' },
              { name: 'Realistisch', gapPct: 0.50, color: 'text-blue-400', bgColor: 'bg-blue-500/20', desc: '50% van gap dichten, 5 nieuwe klanten' },
              { name: 'Pessimistisch', gapPct: 0.20, color: 'text-red-400', bgColor: 'bg-red-500/20', desc: '20% van gap dichten, 2 nieuwe klanten' },
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
                          <div className="flex gap-0.5 items-end" style={{ height: '80px' }}>
                            {yearData.map(r => (
                              <div key={r.month} className="flex-1 flex items-end group relative" style={{ height: '80px' }} title={`${r.month}: €${r.revenue.toLocaleString('nl-NL')}`}>
                                <div className="w-full bg-blue-500/60 rounded-t-sm transition-all hover:bg-blue-400" style={{ height: `${Math.max((r.revenue / maxRev) * 80, 2)}px` }} />
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

                {/* 2026 Target Gap Visualization */}
                <div className={`${colors.bgCard} rounded-lg border ${colors.border} p-4`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>2026 Target: €1.5M</h3>
                  <div className="mb-3">
                    <div className={`h-6 rounded-full ${colors.bgInput} overflow-hidden flex`}>
                      <div className="h-full bg-green-600 rounded-l-full transition-all" style={{ width: `${Math.min((currentARR / target2026) * 100, 100)}%` }} />
                      <div className="h-full bg-amber-600/40 transition-all" style={{ width: `${Math.min((gap / target2026) * 100, 100 - (currentARR / target2026) * 100)}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className={`text-[10px] font-mono text-green-400`}>Bestaande ARR: €{Math.round(currentARR / 1000)}k</span>
                      <span className={`text-[10px] font-mono text-amber-400`}>Gap: €{Math.round(gap / 1000)}k</span>
                      <span className={`text-[10px] font-mono ${colors.textSecondary}`}>Target: €{Math.round(target2026 / 1000)}k</span>
                    </div>
                  </div>
                  {/* Monthly target line visualization */}
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[11px] ${colors.textSecondary}`}>Maandelijks target: €{Math.round(target2026 / 12 / 1000)}k/mnd</span>
                      <span className={`text-[11px] ${colors.textTertiary}`}>|</span>
                      <span className={`text-[11px] ${colors.textSecondary}`}>Huidig MRR: €{Math.round(currentARR / 12 / 1000)}k/mnd</span>
                    </div>
                    <div className="flex gap-0.5 items-end" style={{ height: '60px' }}>
                      {MONTH_LABELS.map((m, i) => {
                        const weight = seasonalWeights[i] || 1
                        const realisticMonthly = ((currentARR + gap * 0.5) / 12) * weight
                        const targetMonthly = (target2026 / 12) * weight
                        const maxVal = targetMonthly * 1.2
                        return (
                          <div key={m} className="flex-1 relative" style={{ height: '60px' }}>
                            {/* Target line */}
                            <div className="absolute w-full border-t border-dashed border-amber-500/50" style={{ bottom: `${(targetMonthly / maxVal) * 60}px` }} />
                            {/* Realistic bar */}
                            <div className="absolute bottom-0 w-full flex items-end">
                              <div className="w-full bg-blue-500/50 rounded-t-sm" style={{ height: `${Math.max((realisticMonthly / maxVal) * 60, 2)}px` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex gap-0.5 mt-0.5">
                      {MONTH_LABELS.map((m, i) => (
                        <span key={i} className={`flex-1 text-center text-[8px] ${colors.textTertiary}`}>{m}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1"><div className="w-3 h-2 bg-blue-500/50 rounded-sm" /><span className={`text-[9px] ${colors.textTertiary}`}>Realistisch scenario</span></div>
                      <div className="flex items-center gap-1"><div className="w-3 border-t border-dashed border-amber-500/50" /><span className={`text-[9px] ${colors.textTertiary}`}>Target €1.5M</span></div>
                    </div>
                  </div>
                </div>

                {/* Scenario Planning */}
                <div className={`${colors.bgCard} rounded-lg border ${colors.border} p-4`}>
                  <h3 className={`text-[13px] font-medium ${colors.textPrimary} mb-3`}>Scenario Planning 2026</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {scenarios.map(s => {
                      const projected = Math.round(currentARR + gap * s.gapPct)
                      const growthPct = Math.round(((projected - currentARR) / currentARR) * 100)
                      return (
                        <div key={s.name} className={`p-3 rounded-md ${colors.bgInput}`}>
                          <span className={`text-[11px] font-medium ${s.color}`}>{s.name}</span>
                          <p className={`text-[18px] font-bold font-mono ${colors.textPrimary} my-1`}>€{Math.round(projected / 1000)}k</p>
                          <p className={`text-[10px] ${colors.textTertiary}`}>{s.desc}</p>
                          <div className={`mt-2 text-[10px] px-2 py-0.5 rounded ${s.bgColor} ${s.color} inline-block`}>+{growthPct}%</div>
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
                                const yearTotal = currentARR + gap * s.gapPct
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
                            const total = Math.round(currentARR + gap * s.gapPct)
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

            const realClients = RETAINER_CLIENTS.filter(c => c.status === 'Actief')

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

            // Monthly calculations: use months array directly
            const getClientMonthly = (c: (typeof RETAINER_CLIENTS)[number]) => {
              return [...c.months] as number[]
            }

            const monthlyTotals = MONTHS.map((_, mi) => {
              return realClients.reduce((sum, c) => sum + getClientMonthly(c)[mi], 0)
            })

            // Count new clients per month based on first month with revenue
            const newClientsPerMonth = MONTHS.map((_, mi) => {
              return realClients.filter(c => {
                if (c.startJaar !== 2026) return false
                // Client starts in the first month where months[i] > 0
                const firstMonth = c.months.findIndex(v => v > 0)
                return firstMonth === mi
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
                      <div className="overflow-x-auto">
                      <table className="w-full text-[12px] min-w-[600px]">
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
                    </div>

                    {/* P&L Summary */}
                    <div className={`${colors.bgCard} rounded-md border ${colors.border} overflow-hidden`}>
                      <div className={`px-4 py-2.5 border-b ${colors.border}`}>
                        <h3 className={`text-[13px] font-medium ${colors.textPrimary}`}>P&L Overzicht 2026</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[12px] min-w-[700px]">
                          <thead>
                            <tr className={`border-b ${colors.border}`}>
                              <th className={`text-left px-4 py-2 ${colors.textTertiary} font-medium`}>Maand</th>
                              <th className={`text-right px-4 py-2 ${colors.textTertiary} font-medium`}>Omzet</th>
                              <th className={`text-right px-4 py-2 ${colors.textTertiary} font-medium`}>Kosten</th>
                              <th className={`text-right px-4 py-2 ${colors.textTertiary} font-medium`}>Winst</th>
                              <th className={`text-right px-4 py-2 ${colors.textTertiary} font-medium`}>Marge</th>
                              <th className={`px-4 py-2 ${colors.textTertiary} font-medium w-[120px]`}>Visualisatie</th>
                            </tr>
                          </thead>
                          <tbody>
                            {MONTHS.map((m, mi) => {
                              const rev = monthlyTotals[mi]
                              const costs = MONTHLY_COSTS.totalMonthly
                              const profit = rev - costs
                              const margin = rev > 0 ? Math.round((profit / rev) * 100) : 0
                              return (
                                <tr key={m} className={`border-b ${colors.border} hover:${colors.bgInput}`}>
                                  <td className={`px-4 py-2 ${colors.textPrimary}`}>{m}</td>
                                  <td className={`px-4 py-2 text-right font-mono ${colors.textPrimary}`}>{fmtEur(Math.round(rev))}</td>
                                  <td className={`px-4 py-2 text-right font-mono ${colors.textTertiary}`}>{fmtEur(Math.round(costs))}</td>
                                  <td className={`px-4 py-2 text-right font-mono font-medium`} style={{ color: profit > 0 ? CHART_COLORS.success : CHART_COLORS.quaternary }}>
                                    {profit > 0 ? '+' : ''}{fmtEur(Math.round(profit))}
                                  </td>
                                  <td className={`px-4 py-2 text-right font-mono`} style={{ color: margin > 30 ? CHART_COLORS.success : margin > 0 ? CHART_COLORS.primary : CHART_COLORS.quaternary }}>
                                    {margin}%
                                  </td>
                                  <td className="px-4 py-2">
                                    <div className="flex items-center gap-1">
                                      <div className="h-2 rounded-sm" style={{ width: `${Math.max(Math.min((rev / (Math.max(...monthlyTotals) || 1)) * 100, 100), 2)}%`, backgroundColor: CHART_COLORS.success + '40' }} />
                                      <div className="h-2 rounded-sm" style={{ width: `${Math.max((costs / (Math.max(...monthlyTotals) || 1)) * 100, 2)}%`, backgroundColor: CHART_COLORS.quaternary + '30' }} />
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                            <tr className={`font-medium border-t-2 ${colors.border}`}>
                              <td className={`px-4 py-2 ${colors.textPrimary}`}>Totaal</td>
                              <td className={`px-4 py-2 text-right font-mono ${colors.textPrimary}`}>{fmtEurK(monthlyTotals.reduce((s, v) => s + v, 0))}</td>
                              <td className={`px-4 py-2 text-right font-mono ${colors.textTertiary}`}>{fmtEurK(MONTHLY_COSTS.totalMonthly * 12)}</td>
                              <td className={`px-4 py-2 text-right font-mono`} style={{ color: monthlyTotals.reduce((s, v) => s + v, 0) - MONTHLY_COSTS.totalMonthly * 12 > 0 ? CHART_COLORS.success : CHART_COLORS.quaternary }}>
                                {fmtEurK(monthlyTotals.reduce((s, v) => s + v, 0) - MONTHLY_COSTS.totalMonthly * 12)}
                              </td>
                              <td className={`px-4 py-2 text-right font-mono ${colors.textTertiary}`}>
                                {Math.round(((monthlyTotals.reduce((s, v) => s + v, 0) - MONTHLY_COSTS.totalMonthly * 12) / Math.max(monthlyTotals.reduce((s, v) => s + v, 0), 1)) * 100)}%
                              </td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      {/* Cost Breakdown */}
                      <div className={`px-4 py-3 border-t ${colors.border}`}>
                        <div className="flex flex-wrap gap-4 text-[11px]">
                          <span className={colors.textTertiary}>Kosten breakdown:</span>
                          <span className={colors.textSecondary}>👥 Personeel €{MONTHLY_COSTS.personnel.total.toLocaleString('nl-NL')}/mnd</span>
                          <span className={colors.textSecondary}>🏢 Overhead €{MONTHLY_COSTS.overhead.total.toLocaleString('nl-NL')}/mnd</span>
                          <span className={colors.textSecondary}>💰 Totaal €{MONTHLY_COSTS.totalMonthly.toLocaleString('nl-NL')}/mnd</span>
                        </div>
                      </div>
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
                      <div className="overflow-x-auto">
                      <table className="w-full text-[12px] min-w-[700px]">
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
                      </div>
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
          {/* NACHTSHIFT TAB - Overnight Work Results */}
          {/* ============================================ */}
          {activeTab === 'nightshift' && (() => {

            const selectedDayData = nsData?.days?.find(d => d.date === nsSelectedDay)
            const selectedFileData = selectedDayData?.files?.find(f => f.path === nsSelectedFile)

            const categoryColors: Record<string, string> = {
              'Intelligence': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
              'Competitors': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
              'LinkedIn': 'text-sky-400 bg-sky-500/10 border-sky-500/20',
              'Articles': 'text-green-400 bg-green-500/10 border-green-500/20',
              'Case Studies': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
              'Sales Material': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
              'Pipeline': 'text-red-400 bg-red-500/10 border-red-500/20',
              'Outreach': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
              'Reports': 'text-teal-400 bg-teal-500/10 border-teal-500/20',
            }

            const categoryIcons: Record<string, string> = {
              'Intelligence': '🔍', 'Competitors': '🏢', 'LinkedIn': '💼', 'Articles': '📝',
              'Case Studies': '📊', 'Sales Material': '💰', 'Pipeline': '🔥', 'Outreach': '📧', 'Reports': '📋',
            }

            if (nsLoading) return <div className={`flex items-center justify-center py-20 ${colors.textTertiary}`}>Laden...</div>
            if (!nsData?.days?.length) return (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <span className="text-4xl">🌙</span>
                <p className={`text-[14px] ${colors.textSecondary}`}>Nog geen nachtshift data</p>
                <p className={`text-[12px] ${colors.textTertiary}`}>De eerste shift draait vannacht om 01:00</p>
              </div>
            )

            return (
              <div className="space-y-4">
                {/* Day selector */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {nsData.days.map(day => {
                    const d = new Date(day.date + 'T12:00:00')
                    const dayName = d.toLocaleDateString('nl-NL', { weekday: 'short' })
                    const dayNum = d.getDate()
                    const isSelected = day.date === nsSelectedDay
                    return (
                      <button key={day.date} onClick={() => { setNsSelectedDay(day.date); setNsSelectedFile(null) }}
                        className={`flex flex-col items-center min-w-[56px] px-3 py-2 rounded-md border transition-colors ${
                          isSelected ? `${colors.accentBg} text-white border-transparent` : `${colors.bgCard} ${colors.border} ${colors.textSecondary} hover:${colors.textPrimary}`
                        }`}>
                        <span className="text-[10px] uppercase">{dayName}</span>
                        <span className="text-[16px] font-semibold">{dayNum}</span>
                        <span className="text-[10px]">{day.stats.totalFiles} files</span>
                      </button>
                    )
                  })}
                </div>

                {selectedDayData && (
                  <>
                    {/* Stats cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className={`${colors.bgCard} rounded-md border ${colors.border} p-3`}>
                        <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wider`}>Bestanden</p>
                        <p className={`text-[20px] font-semibold font-mono ${colors.textPrimary}`}>{selectedDayData.stats.totalFiles}</p>
                      </div>
                      <div className={`${colors.bgCard} rounded-md border ${colors.border} p-3`}>
                        <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wider`}>Regels</p>
                        <p className={`text-[20px] font-semibold font-mono ${colors.textPrimary}`}>{selectedDayData.stats.totalLines.toLocaleString()}</p>
                      </div>
                      <div className={`${colors.bgCard} rounded-md border ${colors.border} p-3`}>
                        <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wider`}>Categorieën</p>
                        <p className={`text-[20px] font-semibold font-mono ${colors.textPrimary}`}>{Object.keys(selectedDayData.stats.categories).length}</p>
                      </div>
                      <div className={`${colors.bgCard} rounded-md border ${colors.border} p-3`}>
                        <p className={`text-[10px] ${colors.textTertiary} uppercase tracking-wider`}>Shifts</p>
                        <p className={`text-[20px] font-semibold font-mono ${colors.textPrimary}`}>5</p>
                      </div>
                    </div>

                    {/* Category badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(selectedDayData.stats.categories).map(([cat, count]) => (
                        <span key={cat} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${categoryColors[cat] || `${colors.textSecondary} ${colors.bgInput} ${colors.border}`}`}>
                          {categoryIcons[cat] || '📄'} {cat} ({count})
                        </span>
                      ))}
                    </div>

                    {/* File list + content viewer */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      {/* File list */}
                      <div className={`${colors.bgCard} rounded-md border ${colors.border} overflow-hidden lg:col-span-1`}>
                        <div className={`px-3 py-2 border-b ${colors.border}`}>
                          <h3 className={`text-[12px] font-medium ${colors.textPrimary}`}>Bestanden ({selectedDayData.files.length})</h3>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                          {selectedDayData.files.map((file) => (
                            <button key={file.path} onClick={() => setNsSelectedFile(file.path)}
                              className={`w-full text-left px-3 py-2.5 border-b ${colors.border} transition-colors ${
                                nsSelectedFile === file.path ? (isDark ? 'bg-white/5' : 'bg-black/5') : `hover:${colors.bgInput}`
                              }`}>
                              <div className="flex items-center gap-2">
                                <span className="text-[14px]">{categoryIcons[file.category] || '📄'}</span>
                                <div className="min-w-0 flex-1">
                                  <p className={`text-[12px] font-medium ${colors.textPrimary} truncate`}>{file.name}</p>
                                  <p className={`text-[10px] ${colors.textTertiary}`}>{file.category} · {(file.size / 1024).toFixed(1)}KB</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Content viewer */}
                      <div className={`${colors.bgCard} rounded-md border ${colors.border} overflow-hidden lg:col-span-2`}>
                        {selectedFileData ? (
                          <>
                            <div className={`px-3 py-2 border-b ${colors.border} flex items-center justify-between`}>
                              <div>
                                <h3 className={`text-[12px] font-medium ${colors.textPrimary}`}>{selectedFileData.name}</h3>
                                <p className={`text-[10px] ${colors.textTertiary}`}>{selectedFileData.category} · {selectedFileData.content.split('\n').length} regels</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] border ${categoryColors[selectedFileData.category] || ''}`}>{selectedFileData.category}</span>
                            </div>
                            <div className="p-3 max-h-[600px] overflow-y-auto">
                              <pre className={`text-[12px] ${colors.textSecondary} whitespace-pre-wrap font-sans leading-relaxed`}>
                                {selectedFileData.content}
                              </pre>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 gap-2">
                            <span className="text-3xl">🌙</span>
                            <p className={`text-[12px] ${colors.textTertiary}`}>Selecteer een bestand om te bekijken</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })()}

          {/* ============================================ */}
          {/* MEETINGS TAB - Fireflies Integration */}
          {/* ============================================ */}
          {activeTab === 'meetings' && (() => {
            const filteredMeetings = ffMeetings.filter(m => {
              if (!ffSearch) return true
              const s = ffSearch.toLowerCase()
              return m.title?.toLowerCase().includes(s) || m.speakers?.some(sp => sp.name?.toLowerCase().includes(s)) || m.summary?.keywords?.some(k => k.toLowerCase().includes(s))
            })
            const formatMeetingDate = (ts: number) => { const d = new Date(ts); return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }) }
            const formatDuration = (mins: number) => mins < 60 ? `${Math.round(mins)}min` : `${Math.floor(mins / 60)}u${Math.round(mins % 60)}min`

            // Detail view
            if (ffSelectedMeeting) {
              const meeting = ffMeetings.find(m => m.id === ffSelectedMeeting)
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[13px]">
                    <button onClick={() => { setFfSelectedMeeting(null); setFfMeetingDetail(null) }} className={`${colors.textTertiary} hover:${colors.textPrimary}`}>← Meetings</button>
                    <span className={colors.textTertiary}>/</span>
                    <span className={colors.textPrimary}>{meeting?.title || 'Loading...'}</span>
                  </div>

                  {ffDetailLoading ? (
                    <div className={`${colors.bgCard} rounded-md border ${colors.border} p-8 text-center`}>
                      <p className={`text-[13px] ${colors.textTertiary}`}>Meeting laden...</p>
                    </div>
                  ) : ffMeetingDetail ? (
                    <div className="space-y-4">
                      {/* Meeting header */}
                      <div className={`${colors.bgCard} rounded-md border ${colors.border} p-4`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className={`text-[15px] font-semibold ${colors.textPrimary}`}>{ffMeetingDetail.title}</h2>
                            <div className={`flex items-center gap-3 mt-1 text-[11px] ${colors.textTertiary}`}>
                              <span>{formatMeetingDate(ffMeetingDetail.date)}</span>
                              <span>{formatDuration(ffMeetingDetail.duration)}</span>
                              <span>{ffMeetingDetail.speakers?.map(s => s.name).join(', ')}</span>
                            </div>
                            {ffMeetingDetail.summary?.keywords && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {ffMeetingDetail.summary.keywords.map((k, i) => (
                                  <span key={i} className={`px-1.5 py-0.5 rounded text-[10px] ${isDark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-600'}`}>{k}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {ffMeetingDetail.transcript_url && (
                              <a href={ffMeetingDetail.transcript_url} target="_blank" rel="noopener noreferrer" className={`px-2 py-1 rounded text-[11px] border ${colors.border} ${colors.textSecondary} hover:${colors.textPrimary}`}>
                                Open in Fireflies ↗
                              </a>
                            )}
                            <button
                              onClick={() => meeting && importMeetingTasks(meeting)}
                              className={`px-2 py-1 rounded text-[11px] font-medium ${colors.accentBg} text-white ${colors.accentHover}`}
                            >
                              Import taken
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      {ffMeetingDetail.summary?.overview && (
                        <div className={`${colors.bgCard} rounded-md border ${colors.border} p-4`}>
                          <h3 className={`text-[12px] font-medium ${colors.textTertiary} mb-2`}>SAMENVATTING</h3>
                          <div className={`text-[13px] ${colors.textSecondary} leading-relaxed whitespace-pre-wrap`}>{ffMeetingDetail.summary.overview}</div>
                        </div>
                      )}

                      {/* Action Items */}
                      {ffMeetingDetail.summary?.action_items && (
                        <div className={`${colors.bgCard} rounded-md border ${colors.border} p-4`}>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`text-[12px] font-medium ${colors.textTertiary}`}>ACTIEPUNTEN</h3>
                          </div>
                          <div className={`text-[13px] ${colors.textSecondary} leading-relaxed whitespace-pre-wrap`}>{ffMeetingDetail.summary.action_items}</div>
                        </div>
                      )}

                      {/* Transcript */}
                      {ffMeetingDetail.sentences && ffMeetingDetail.sentences.length > 0 && (
                        <details className={`${colors.bgCard} rounded-md border ${colors.border}`}>
                          <summary className={`px-4 py-3 cursor-pointer text-[12px] font-medium ${colors.textTertiary} hover:${colors.textSecondary}`}>
                            TRANSCRIPT ({ffMeetingDetail.sentences.length} zinnen)
                          </summary>
                          <div className="px-4 pb-4 max-h-[500px] overflow-y-auto">
                            {ffMeetingDetail.sentences.map((s, i) => (
                              <div key={i} className={`py-1 border-b ${colors.border} last:border-0`}>
                                <span className={`text-[11px] font-medium ${s.ai_filters?.task ? 'text-amber-500' : s.ai_filters?.question ? 'text-blue-400' : colors.textTertiary}`}>
                                  {s.speaker_name}
                                </span>
                                <span className={`text-[10px] ${colors.textTertiary} ml-2`}>{Math.floor(s.start_time / 60)}:{String(Math.floor(s.start_time % 60)).padStart(2, '0')}</span>
                                <p className={`text-[12px] ${colors.textSecondary}`}>{s.text}</p>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  ) : null}
                </div>
              )
            }

            // Helpers
            const SC: Record<string, string> = {
              positief: 'bg-green-500/15 text-green-500',
              neutraal: isDark ? 'bg-white/10 text-white/50' : 'bg-gray-100 text-gray-500',
              negatief: 'bg-red-500/15 text-red-400',
            }
            const SE: Record<string, string> = { positief: '😊', neutraal: '😐', negatief: '😟' }
            const TC: Record<string, string> = {
              client: 'bg-blue-500/15 text-blue-400',
              sales: 'bg-purple-500/15 text-purple-400',
              intern: isDark ? 'bg-white/10 text-white/40' : 'bg-gray-100 text-gray-400',
              demo: 'bg-amber-500/15 text-amber-400',
            }
            const TL: Record<string, string> = { client: 'Klant', sales: 'Sales', intern: 'Intern', demo: 'Demo' }

            // Unique clients + types for filters
            const allClients = [...new Set(meetingAnalysis.map(a => a.client))].sort()
            const allTypes = [...new Set(meetingAnalysis.map(a => a.type))].sort()

            // Custom tags
            const allMeetingTags = [...new Set([...ffAllTags, ...Object.values(ffMeetingTags).flat()])].sort()

            // Apply filters
            const filtered = meetingAnalysis.filter(a => {
              if (ffClientFilter !== 'all' && a.client !== ffClientFilter) return false
              if (ffTagFilter !== 'all') {
                const tags = ffMeetingTags[a.title] || []
                if (!tags.includes(ffTagFilter)) return false
              }
              if (ffSearch) {
                const s = ffSearch.toLowerCase()
                if (!a.client.toLowerCase().includes(s) && !a.title.toLowerCase().includes(s) && !a.analysis.toLowerCase().includes(s) && !a.nodefy_team.some(t => t.toLowerCase().includes(s))) return false
              }
              return true
            })

            // Stats from filtered
            const fClient = filtered.filter(a => a.type === 'client')
            const avgScore = fClient.length > 0 ? Math.round(fClient.reduce((s, a) => s + a.sentiment_score, 0) / fClient.length) : 0
            const allRisks = filtered.filter(a => a.risk && a.risk !== 'geen')

            // Client detail view
            if (ffSelectedClient) {
              const cm = meetingAnalysis.filter(a => a.client === ffSelectedClient)
              const cClient = cm.filter(m => m.type !== 'intern')
              const cAvg = cClient.length > 0 ? Math.round(cClient.reduce((s, m) => s + m.sentiment_score, 0) / cClient.length) : 0
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[13px]">
                      <button onClick={() => setFfSelectedClient(null)} className={`${colors.textTertiary} hover:${colors.textPrimary}`}>← Meetings</button>
                      <span className={colors.textTertiary}>/</span>
                      <span className={`font-medium ${colors.textPrimary}`}>{ffSelectedClient}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${SC[cAvg >= 75 ? 'positief' : cAvg >= 60 ? 'neutraal' : 'negatief']}`}>
                        {SE[cAvg >= 75 ? 'positief' : cAvg >= 60 ? 'neutraal' : 'negatief']} {cAvg}/100
                      </span>
                      <span className={`text-[11px] ${colors.textTertiary}`}>· {cm.length} meetings</span>
                    </div>
                  </div>

                  <div className={`${colors.bgCard} rounded-lg border ${colors.border} overflow-hidden`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[13px]" style={{ minWidth: 700 }}>
                        <thead>
                          <tr className={`${colors.bgInput} border-b ${colors.border}`}>
                            <th className={`text-left px-4 py-2 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary} w-24`}>Datum</th>
                            <th className={`text-left px-4 py-2 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary} w-20`}>Score</th>
                            <th className={`text-left px-4 py-2 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary} w-16`}>Duur</th>
                            <th className={`text-left px-4 py-2 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary}`}>Analyse</th>
                            <th className={`text-left px-4 py-2 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary}`}>Tags</th>
                            <th className={`w-20 px-4 py-2`} />
                          </tr>
                        </thead>
                        <tbody>
                          {cm.map((a, i) => (
                            <tr key={i} className={`border-t ${colors.border} hover:${isDark ? 'bg-white/[0.03]' : 'bg-black/[0.015]'} group`}>
                              <td className={`px-4 py-2.5 font-mono text-[12px] ${colors.textTertiary}`}>{a.date}</td>
                              <td className="px-4 py-2.5"><span className={`text-[10px] px-1.5 py-0.5 rounded ${SC[a.sentiment]}`}>{SE[a.sentiment]} {a.sentiment_score}</span></td>
                              <td className={`px-4 py-2.5 font-mono text-[12px] ${colors.textTertiary}`}>{formatDuration(a.duration)}</td>
                              <td className={`px-4 py-2.5 text-[12px] ${colors.textSecondary}`}>
                                <p>{a.analysis}</p>
                                {a.action_needed && a.action_needed !== 'geen' && <p className="mt-0.5"><span className="text-amber-400">→</span> <span className={colors.textTertiary}>{a.action_needed}</span></p>}
                                {a.risk && a.risk !== 'geen' && <p className="mt-0.5"><span className="text-red-400">⚠</span> <span className={colors.textTertiary}>{a.risk}</span></p>}
                                <p className={`text-[10px] ${colors.textTertiary} mt-0.5`}>{a.nodefy_team.join(', ')}</p>
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-1 flex-wrap">
                                  {(ffMeetingTags[a.title] || []).map(tag => (
                                    <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'} flex items-center gap-0.5`}>
                                      {tag}<button onClick={() => removeTagFromMeeting(a.title, tag)} className="hover:text-red-400 ml-0.5">×</button>
                                    </span>
                                  ))}
                                  {ffTaggingMeeting === a.title ? (
                                    <select autoFocus onChange={e => { if (e.target.value) addTagToMeeting(a.title, e.target.value); setFfTaggingMeeting(null) }} onBlur={() => setFfTaggingMeeting(null)}
                                      className={`text-[10px] px-1 py-0.5 rounded ${colors.bgInput} border ${colors.border} ${colors.textPrimary}`}>
                                      <option value="">Tag...</option>
                                      {ffAllTags.filter(t => !(ffMeetingTags[a.title] || []).includes(t)).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                  ) : (
                                    <button onClick={() => setFfTaggingMeeting(a.title)} className={`text-[9px] px-1 py-0.5 rounded border border-dashed ${colors.border} ${colors.textTertiary} hover:${colors.textPrimary}`}>+</button>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-1">
                                  {ffEditingLabel === a.title ? (
                                    <input type="text" defaultValue={a.client} autoFocus className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bgInput} border ${colors.border} ${colors.textPrimary} w-24`}
                                      onBlur={e => updateMeetingLabel(a.title, e.target.value)} onKeyDown={e => { if (e.key === 'Enter') updateMeetingLabel(a.title, (e.target as HTMLInputElement).value); if (e.key === 'Escape') setFfEditingLabel(null) }} />
                                  ) : (
                                    <button onClick={() => setFfEditingLabel(a.title)} className={`text-[10px] ${colors.textTertiary} hover:${colors.textPrimary}`} title="Klant wijzigen">✏️</button>
                                  )}
                                  <button onClick={() => deleteMeetingAnalysis(a.title)} className={`opacity-0 group-hover:opacity-100 text-[10px] ${colors.textTertiary} hover:text-red-400`} title="Verwijderen">🗑</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )
            }

            // Main meetings view
            return (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className={colors.textTertiary}>General</span><span className={colors.textTertiary}>/</span><span className={colors.textPrimary}>Meetings</span>
                    <span className={`text-[11px] font-mono ${colors.textTertiary}`}>{filtered.length} van {meetingAnalysis.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={syncFireflies} disabled={ffSyncing} className={`px-3 py-1.5 rounded text-[12px] font-medium ${colors.accentBg} text-white ${colors.accentHover} disabled:opacity-50`}>
                      {ffSyncing ? 'Syncing...' : '↻ Sync'}
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  <input type="text" placeholder="Zoek..." value={ffSearch} onChange={e => setFfSearch(e.target.value)} className={`px-2 py-1 rounded text-[11px] ${colors.bgInput} border ${colors.border} ${colors.textPrimary} w-40`} />
                  <select value={ffClientFilter} onChange={e => setFfClientFilter(e.target.value)} className={`px-2 py-1 rounded text-[11px] ${colors.bgInput} border ${colors.border} ${colors.textPrimary}`}>
                    <option value="all">Alle klanten</option>
                    {allClients.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={ffTagFilter} onChange={e => setFfTagFilter(e.target.value)} className={`px-2 py-1 rounded text-[11px] ${colors.bgInput} border ${colors.border} ${colors.textPrimary}`}>
                    <option value="all">Alle tags</option>
                    {allMeetingTags.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {/* Tag management */}
                  {ffShowTagInput ? (
                    <div className="flex items-center gap-1">
                      <input type="text" placeholder="Nieuwe tag..." value={ffNewTag} onChange={e => setFfNewTag(e.target.value)} autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') createTag(ffNewTag); if (e.key === 'Escape') setFfShowTagInput(false) }}
                        className={`px-2 py-1 rounded text-[11px] ${colors.bgInput} border ${colors.border} ${colors.textPrimary} w-28`} />
                      <button onClick={() => createTag(ffNewTag)} className={`text-[11px] px-2 py-1 rounded ${colors.accentBg} text-white`}>+</button>
                      <button onClick={() => setFfShowTagInput(false)} className={`text-[11px] ${colors.textTertiary}`}>✕</button>
                    </div>
                  ) : (
                    <button onClick={() => setFfShowTagInput(true)} className={`text-[11px] px-2 py-1 rounded border border-dashed ${colors.border} ${colors.textTertiary} hover:${colors.textPrimary}`}>+ Tag</button>
                  )}
                  {/* Show existing tags with delete */}
                  {ffAllTags.map(tag => (
                    <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'} flex items-center gap-1`}>
                      {tag}<button onClick={() => deleteTag(tag)} className="hover:text-red-400">×</button>
                    </span>
                  ))}
                </div>

                {/* Overview cards */}
                {meetingAnalysis.length > 0 && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className={`${colors.bgCard} rounded-md border ${colors.border} p-3`}>
                      <p className={`text-[10px] ${colors.textTertiary}`}>SENTIMENT</p>
                      <p className={`text-[22px] font-bold font-mono ${avgScore >= 75 ? 'text-green-500' : avgScore >= 60 ? colors.textPrimary : 'text-red-400'}`}>{avgScore}/100</p>
                    </div>
                    <div className={`${colors.bgCard} rounded-md border ${colors.border} p-3`}>
                      <p className={`text-[10px] ${colors.textTertiary}`}>KLANTEN</p>
                      <p className={`text-[22px] font-bold font-mono ${colors.textPrimary}`}>{new Set(filtered.filter(a => a.type === 'client').map(a => a.client)).size}</p>
                    </div>
                    <div className={`${colors.bgCard} rounded-md border ${colors.border} p-3`}>
                      <p className={`text-[10px] ${colors.textTertiary}`}>MEETINGS</p>
                      <p className={`text-[22px] font-bold font-mono ${colors.textPrimary}`}>{filtered.length}</p>
                    </div>
                    <div className={`${colors.bgCard} rounded-md border ${colors.border} p-3`}>
                      <p className={`text-[10px] ${colors.textTertiary}`}>RISICO&apos;S</p>
                      <p className={`text-[22px] font-bold font-mono ${allRisks.length > 0 ? 'text-amber-400' : 'text-green-500'}`}>{allRisks.length}</p>
                    </div>
                  </div>
                )}

                {/* Alerts */}
                {allRisks.length > 0 && (
                  <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
                    <h3 className="text-[12px] font-medium text-amber-400 mb-1">⚠️ Aandachtspunten</h3>
                    {allRisks.map((r, i) => (
                      <p key={i} className={`text-[11px] ${colors.textSecondary}`}><span className="text-amber-400 font-medium">{r.client}:</span> {r.risk}</p>
                    ))}
                  </div>
                )}

                {/* Meetings table */}
                {filtered.length > 0 ? (
                  <div className={`${colors.bgCard} rounded-lg border ${colors.border} overflow-hidden`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[13px]" style={{ minWidth: 800 }}>
                        <thead>
                          <tr className={`${colors.bgInput} border-b ${colors.border}`}>
                            <th className={`text-left px-4 py-2 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary} w-24`}>Datum</th>
                            <th className={`text-left px-4 py-2 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary}`}>Klant</th>
                            <th className={`text-left px-4 py-2 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary} w-16`}>Type</th>
                            <th className={`text-left px-4 py-2 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary} w-20`}>Score</th>
                            <th className={`text-left px-4 py-2 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary}`}>Analyse</th>
                            <th className={`text-left px-4 py-2 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary}`}>Tags</th>
                            <th className={`w-16 px-4 py-2`} />
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((a, i) => (
                            <tr key={i} className={`border-t ${colors.border} hover:${isDark ? 'bg-white/[0.03]' : 'bg-black/[0.015]'} transition-colors group`}>
                              <td className={`px-4 py-2.5 font-mono text-[12px] ${colors.textTertiary} whitespace-nowrap`}>{a.date}</td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-1.5">
                                  <button onClick={() => setFfSelectedClient(a.client)} className={`text-[12px] font-medium ${colors.textPrimary} hover:underline`}>{a.client}</button>
                                  {a.risk && a.risk !== 'geen' && <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-400">⚠</span>}
                                </div>
                              </td>
                              <td className="px-4 py-2.5"><span className={`text-[9px] px-1.5 py-0.5 rounded ${TC[a.type] || ''}`}>{TL[a.type] || a.type}</span></td>
                              <td className="px-4 py-2.5"><span className={`text-[10px] px-1.5 py-0.5 rounded ${SC[a.sentiment]}`}>{SE[a.sentiment]} {a.sentiment_score}</span></td>
                              <td className={`px-4 py-2.5 text-[11px] ${colors.textSecondary} max-w-xs`}>
                                <p className="line-clamp-2">{a.analysis}</p>
                                {a.action_needed && a.action_needed !== 'geen' && <p className="mt-0.5 text-[10px]"><span className="text-amber-400">→</span> {a.action_needed}</p>}
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-1 flex-wrap">
                                  {(ffMeetingTags[a.title] || []).map(tag => (
                                    <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'} flex items-center gap-0.5`}>
                                      {tag}<button onClick={() => removeTagFromMeeting(a.title, tag)} className="hover:text-red-400 ml-0.5">×</button>
                                    </span>
                                  ))}
                                  {ffTaggingMeeting === a.title ? (
                                    <select autoFocus onChange={e => { if (e.target.value) addTagToMeeting(a.title, e.target.value); setFfTaggingMeeting(null) }} onBlur={() => setFfTaggingMeeting(null)}
                                      className={`text-[10px] px-1 py-0.5 rounded ${colors.bgInput} border ${colors.border} ${colors.textPrimary}`}>
                                      <option value="">Tag...</option>
                                      {ffAllTags.filter(t => !(ffMeetingTags[a.title] || []).includes(t)).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                  ) : (
                                    <button onClick={() => setFfTaggingMeeting(a.title)} className={`text-[9px] px-1 py-0.5 rounded border border-dashed ${colors.border} ${colors.textTertiary}`}>+</button>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-1">
                                  {ffEditingLabel === a.title ? (
                                    <input type="text" defaultValue={a.client} autoFocus className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bgInput} border ${colors.border} ${colors.textPrimary} w-24`}
                                      onBlur={e => updateMeetingLabel(a.title, e.target.value)} onKeyDown={e => { if (e.key === 'Enter') updateMeetingLabel(a.title, (e.target as HTMLInputElement).value); if (e.key === 'Escape') setFfEditingLabel(null) }} />
                                  ) : (
                                    <button onClick={() => setFfEditingLabel(a.title)} className={`text-[10px] ${colors.textTertiary} hover:${colors.textPrimary}`} title="Klant wijzigen">✏️</button>
                                  )}
                                  <button onClick={() => deleteMeetingAnalysis(a.title)} className={`opacity-0 group-hover:opacity-100 text-[10px] ${colors.textTertiary} hover:text-red-400 transition-opacity`} title="Verwijderen">🗑</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : meetingAnalysis.length === 0 ? (
                  <div className={`${colors.bgCard} rounded-md border ${colors.border} p-8 text-center`}>
                    <p className={`text-[13px] ${colors.textTertiary}`}>Klik &quot;Sync&quot; om meetings op te halen.</p>
                  </div>
                ) : (
                  <div className={`${colors.bgCard} rounded-md border ${colors.border} p-8 text-center`}>
                    <p className={`text-[13px] ${colors.textTertiary}`}>Geen meetings met deze filters.</p>
                  </div>
                )}
              </div>
            )
          })()}

          {/* ============================================ */}
          {/* TASKS TAB - Shared task management */}
          {/* ============================================ */}
          {activeTab === 'tasks' && (() => {
            const OWNERS = ['all', 'ruben', 'matthijs', 'loes', 'koen', 'thijs', 'benjamin', 'dane', 'beiden']
            const STATUSES = ['all', 'todo', 'bezig', 'klaar']
            const CATEGORIES = ['all', 'financieel', 'sales', 'hr', 'strategie', 'operationeel', 'marketing', 'overig']
            const PRIORITIES: Record<string, string> = { hoog: '🔴', normaal: '🟡', laag: '⚪' }
            const STATUS_COLORS: Record<string, string> = {
              todo: isDark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-600',
              bezig: 'bg-blue-500/20 text-blue-400',
              klaar: 'bg-green-500/20 text-green-400',
            }
            const filtered = tasks.filter(t => {
              if (myTaskFilter.owner !== 'all' && t.owner !== myTaskFilter.owner) return false
              if (myTaskFilter.status !== 'all' && t.status !== myTaskFilter.status) return false
              if (myTaskFilter.category !== 'all' && t.category !== myTaskFilter.category) return false
              return true
            })
            const todoCount = tasks.filter(t => t.status === 'todo').length
            const bezigCount = tasks.filter(t => t.status === 'bezig').length
            const klaarCount = tasks.filter(t => t.status === 'klaar').length

            return (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className={colors.textTertiary}>General</span><span className={colors.textTertiary}>/</span><span className={colors.textPrimary}>Tasks</span>
                    <span className={`ml-2 text-[11px] font-mono ${colors.textTertiary}`}>{todoCount} open · {bezigCount} bezig · {klaarCount} klaar</span>
                  </div>
                  <button onClick={() => setShowAddMyTask(!showAddMyTask)} className={`px-3 py-1.5 rounded text-[12px] font-medium ${colors.accentBg} text-white ${colors.accentHover}`}>+ Nieuwe taak</button>
                </div>

                {/* Add task form */}
                {showAddMyTask && (
                  <div className={`${colors.bgCard} rounded-md border ${colors.border} p-4`}>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                      <input type="text" placeholder="Taak *" value={newMyTask.title || ''} onChange={e => setNewMyTask(p => ({ ...p, title: e.target.value }))} className={`px-2 py-1.5 rounded text-[12px] ${colors.bgInput} border ${colors.border} ${colors.textPrimary} md:col-span-3`} />
                      <select value={newMyTask.owner || 'ruben'} onChange={e => setNewMyTask(p => ({ ...p, owner: e.target.value }))} className={`px-2 py-1.5 rounded text-[12px] ${colors.bgInput} border ${colors.border} ${colors.textPrimary}`}>
                        {OWNERS.filter(o => o !== 'all').map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                      </select>
                      <select value={newMyTask.category || 'overig'} onChange={e => setNewMyTask(p => ({ ...p, category: e.target.value }))} className={`px-2 py-1.5 rounded text-[12px] ${colors.bgInput} border ${colors.border} ${colors.textPrimary}`}>
                        {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                      <select value={newMyTask.priority || 'normaal'} onChange={e => setNewMyTask(p => ({ ...p, priority: e.target.value as DashTask['priority'] }))} className={`px-2 py-1.5 rounded text-[12px] ${colors.bgInput} border ${colors.border} ${colors.textPrimary}`}>
                        <option value="hoog">Hoog</option><option value="normaal">Normaal</option><option value="laag">Laag</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={async () => { if (!newMyTask.title?.trim()) return; await addTask(newMyTask); setNewMyTask({ title: '', owner: 'ruben', priority: 'normaal', category: 'overig', status: 'todo' }); setShowAddMyTask(false) }} className={`px-3 py-1 rounded text-[12px] font-medium ${colors.accentBg} text-white`}>Toevoegen</button>
                      <button onClick={() => setShowAddMyTask(false)} className={`px-3 py-1 rounded text-[12px] ${colors.textTertiary}`}>Annuleren</button>
                    </div>
                  </div>
                )}

                {/* Filters row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <select value={myTaskFilter.owner} onChange={e => setMyTaskFilter(p => ({ ...p, owner: e.target.value }))} className={`px-2 py-1 rounded text-[11px] ${colors.bgInput} border ${colors.border} ${colors.textPrimary}`}>
                    {OWNERS.map(o => <option key={o} value={o}>{o === 'all' ? 'Alle personen' : o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                  </select>
                  <select value={myTaskFilter.status} onChange={e => setMyTaskFilter(p => ({ ...p, status: e.target.value }))} className={`px-2 py-1 rounded text-[11px] ${colors.bgInput} border ${colors.border} ${colors.textPrimary}`}>
                    {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'Alle statussen' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                  <select value={myTaskFilter.category} onChange={e => setMyTaskFilter(p => ({ ...p, category: e.target.value }))} className={`px-2 py-1 rounded text-[11px] ${colors.bgInput} border ${colors.border} ${colors.textPrimary}`}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'Alle onderwerpen' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>

                {/* Task TABLE */}
                {tasksLoading ? (
                  <div className={`${colors.bgCard} rounded-md border ${colors.border} p-8 text-center`}><p className={`text-[13px] ${colors.textTertiary}`}>Laden...</p></div>
                ) : filtered.length === 0 ? (
                  <div className={`${colors.bgCard} rounded-md border ${colors.border} p-8 text-center`}><p className={`text-[13px] ${colors.textTertiary}`}>{tasks.length === 0 ? 'Nog geen taken.' : 'Geen resultaten.'}</p></div>
                ) : (
                  <div className={`${colors.bgCard} rounded-lg border ${colors.border} overflow-hidden`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[13px]" style={{ minWidth: 700 }}>
                        <thead>
                          <tr className={`${colors.bgInput} border-b ${colors.border}`}>
                            <th className={`w-8 px-3 py-2`} />
                            <th className={`text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary}`}>Taak</th>
                            <th className={`text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary} w-28`}>Persoon</th>
                            <th className={`text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary} w-28`}>Onderwerp</th>
                            <th className={`text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary} w-20`}>Prio</th>
                            <th className={`text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider ${colors.textTertiary} w-20`}>Status</th>
                            <th className={`w-8 px-3 py-2`} />
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map(t => (
                            <tr key={t.id} className={`border-t ${colors.border} hover:${isDark ? 'bg-white/[0.03]' : 'bg-black/[0.015]'} transition-colors group`}>
                              <td className="px-3 py-2">
                                <button onClick={() => { const next = t.status === 'todo' ? 'bezig' : t.status === 'bezig' ? 'klaar' : 'todo'; updateTask(t.id, { status: next }) }}
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${t.status === 'klaar' ? 'bg-green-500 border-green-500' : t.status === 'bezig' ? 'border-blue-400 bg-blue-400/20' : isDark ? 'border-white/30' : 'border-gray-300'}`}>
                                  {t.status === 'klaar' && <span className="text-white text-[8px]">✓</span>}
                                </button>
                              </td>
                              <td className={`px-3 py-2 ${t.status === 'klaar' ? `line-through ${colors.textTertiary}` : colors.textPrimary}`}>
                                <p className="font-medium">{t.title}</p>
                                {t.description && <p className={`text-[11px] ${colors.textTertiary} mt-0.5`}>{t.description}</p>}
                                {t.source === 'fireflies' && <span className={`text-[10px] ${colors.textTertiary}`}>🎙️ {t.meetingTitle}</span>}
                              </td>
                              <td className="px-3 py-2">
                                <select value={t.owner} onChange={e => updateTask(t.id, { owner: e.target.value })}
                                  className={`text-[11px] px-1.5 py-0.5 rounded ${colors.bgInput} border ${colors.border} ${colors.textPrimary} cursor-pointer`}>
                                  {OWNERS.filter(o => o !== 'all').map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                <select value={t.category} onChange={e => updateTask(t.id, { category: e.target.value })}
                                  className={`text-[11px] px-1.5 py-0.5 rounded ${colors.bgInput} border ${colors.border} ${colors.textPrimary} cursor-pointer`}>
                                  {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                <select value={t.priority} onChange={e => updateTask(t.id, { priority: e.target.value as DashTask['priority'] })}
                                  className={`text-[11px] px-1.5 py-0.5 rounded ${colors.bgInput} border ${colors.border} ${colors.textPrimary} cursor-pointer`}>
                                  <option value="hoog">🔴 Hoog</option><option value="normaal">🟡 Normaal</option><option value="laag">⚪ Laag</option>
                                </select>
                              </td>
                              <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_COLORS[t.status]}`}>{t.status}</span></td>
                              <td className="px-3 py-2">
                                <button onClick={() => deleteTask(t.id)} className={`opacity-0 group-hover:opacity-100 text-[11px] ${colors.textTertiary} hover:text-red-400`}>✕</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
                    content: '✍️', strategy: '🎯', forecast: '📈', retainers: '💰', nightshift: '🌙',
                    meetings: '🎙️', tasks: '✅', team: '👥',
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
