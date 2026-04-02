'use client'
import React, { useState } from 'react'
import type { EditableData, KPICard, QuarterlyGoal, MasterTask, TabId } from '../../types'
import { RETAINER_CLIENTS, RETAINER_ARR, MONTHLY_COSTS, CLOSED_STAGE_IDS, PIPELINES, HISTORICAL_REVENUE, CURRENT_MONTH_IDX } from '../../data/config'
import { DEFAULT_MONTHLY_FORECAST } from '../../data/defaults'

interface StrategyTabProps {
  data: EditableData
  setData: React.Dispatch<React.SetStateAction<EditableData>>
  colors: Record<string, string>
  updateData: <K extends keyof EditableData>(key: K, value: EditableData[K]) => void
  editMode: boolean
  setActiveTab: (tab: TabId) => void
}

export default function StrategyTab({ data, setData, colors, updateData, editMode, setActiveTab }: StrategyTabProps) {
  const [taskFilter, setTaskFilter] = useState('all')
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('all')
  const [taskStatusFilter, setTaskStatusFilter] = useState('all')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [newTask, setNewTask] = useState({ title: '', deadline: '', category: 'Strategy' as MasterTask['category'], priority: 'medium' as MasterTask['priority'] })
  const [showAddTask, setShowAddTask] = useState(false)
  const [editingKpiId, setEditingKpiId] = useState<string | null>(null)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
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

            // Monthly MRR from retainers — uses months array for accurate per-month revenue
            const MONTH_NAMES = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
            const getMonthlyMRR = (monthIdx: number) => {
              return activeClients.reduce((sum, c) => sum + c.months[monthIdx], 0)
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
                              <div className="flex gap-0.5 items-end" style={{ height: '80px' }}>
                                {yearData.map(r => (
                                  <div key={r.month} className="flex-1 flex items-end" style={{ height: '80px' }} title={`${r.month}: €${r.revenue.toLocaleString('nl-NL')}`}>
                                    <div className="w-full bg-blue-500/60 rounded-t-sm transition-all hover:bg-blue-400" style={{ height: `${Math.max((r.revenue / maxRev) * 80, 2)}px` }} />
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
                    const target2026 = 1500000
                    const currentARR = RETAINER_ARR
                    const gap = target2026 - currentARR
                    const scenarios = [
                      { name: 'Optimistisch', gapPct: 0.80, color: 'text-green-400', bgColor: 'bg-green-500/20', desc: '80% van gap dichten, 8 nieuwe klanten' },
                      { name: 'Realistisch', gapPct: 0.50, color: 'text-blue-400', bgColor: 'bg-blue-500/20', desc: '50% van gap dichten, 5 nieuwe klanten' },
                      { name: 'Pessimistisch', gapPct: 0.20, color: 'text-red-400', bgColor: 'bg-red-500/20', desc: '20% van gap dichten, 2 nieuwe klanten' },
                    ]
                    return (
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
}
