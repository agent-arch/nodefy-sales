#!/usr/bin/env node
/**
 * Parse memory files and push timeline data to the dashboard API.
 * Usage: node scripts/push-timeline.mjs [--range 30] [--url https://nodefy-sales-dashboard.vercel.app]
 */
import fs from 'fs'
import path from 'path'

const MEMORY_DIR = process.env.MEMORY_DIR || '/Users/nodefynode04/clawd/memory'
const API_URL = process.argv.includes('--url') 
  ? process.argv[process.argv.indexOf('--url') + 1]
  : 'https://nodefy-sales-dashboard.vercel.app'
const RANGE = parseInt(process.argv.includes('--range') ? process.argv[process.argv.indexOf('--range') + 1] : '90', 10)

const CATEGORY_RULES = [
  { cat: 'build', keywords: ['gebouwd', 'deployed', 'built', 'deploy', 'website', 'tool', 'vercel', 'feature', 'feat', 'fix', 'bug', 'dashboard', 'pushed', 'commit'] },
  { cat: 'pipeline', keywords: ['hubspot', 'deal', 'pipeline', 'closed', 'won', 'lost', 'offerte', 'proposal', 'retainer', 'revenue', 'arr', 'mrr', 'prospect', 'lead'] },
  { cat: 'content', keywords: ['linkedin', 'blog', 'article', 'content', 'post', 'case study', 'one-pager', 'schrijven', 'copywriting'] },
  { cat: 'research', keywords: ['research', 'scan', 'analyse', 'intelligence', 'competitor', 'markt', 'trend', 'analysis'] },
  { cat: 'system', keywords: ['config', 'cron', 'server', 'api', 'setup', 'migration', 'backup', 'security', 'nachtshift', 'nightshift'] },
]

function categorize(text) {
  const lower = text.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(k => lower.includes(k))) return rule.cat
  }
  return 'chat'
}

function parseMemoryFile(content, date) {
  const items = []
  const lines = content.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    // Extract bullet points with content
    const bulletMatch = trimmed.match(/^[-*]\s+\*?\*?(.+?)\*?\*?\s*$/) || trimmed.match(/^[-*]\s+(.+)$/)
    if (bulletMatch) {
      let text = bulletMatch[1].trim()
      // Clean up markdown bold
      text = text.replace(/\*\*/g, '').trim()
      if (text.length > 10 && text.length < 300) {
        // Try to extract time
        const timeMatch = text.match(/^(\d{1,2}:\d{2})\s*[-—]\s*(.+)/)
        items.push({
          text: timeMatch ? timeMatch[2] : text,
          category: categorize(text),
          ...(timeMatch ? { time: timeMatch[1] } : {})
        })
      }
    }
    // H2/H3 headers as section markers
    const headerMatch = trimmed.match(/^#{2,3}\s+(.+)/)
    if (headerMatch) {
      const text = headerMatch[1].replace(/\*\*/g, '').trim()
      if (text.length > 5 && !text.match(/^(key highlights|top \d|acties|samenvatting)/i)) {
        items.push({ text, category: categorize(text) })
      }
    }
  }
  
  return items
}

async function main() {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - RANGE)
  
  const files = fs.readdirSync(MEMORY_DIR)
    .filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.md$/))
    .sort()
    .reverse()
  
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  
  const days = []
  for (const file of files) {
    const date = file.replace('.md', '')
    if (date < cutoff.toISOString().split('T')[0]) continue
    
    const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf-8')
    const items = parseMemoryFile(content, date)
    if (items.length === 0) continue
    
    let label = date
    if (date === today) label = 'Vandaag'
    else if (date === yesterday) label = 'Gisteren'
    else {
      const d = new Date(date + 'T12:00:00')
      label = d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
    }
    
    days.push({ date, label, items })
  }
  
  console.log(`Parsed ${days.length} days, ${days.reduce((s, d) => s + d.items.length, 0)} total items`)
  
  // Push to API
  const res = await fetch(`${API_URL}/api/timeline`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ days })
  })
  const result = await res.json()
  console.log('Push result:', result)
}

main().catch(console.error)
