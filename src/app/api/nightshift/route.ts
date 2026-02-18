import { NextResponse } from 'next/server'
import { readFile, readdir, stat } from 'fs/promises'
import { join } from 'path'

const BASE = '/Users/nodefynode04/clawd/nodefy-sales'
const MEMORY = '/Users/nodefynode04/clawd/memory'

interface NightshiftFile {
  name: string
  path: string
  category: string
  content: string
  size: number
  date: string
}

interface NightshiftDay {
  date: string
  files: NightshiftFile[]
  summary: string | null
  stats: {
    totalFiles: number
    totalLines: number
    categories: Record<string, number>
  }
}

async function readFileSafe(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf-8')
  } catch {
    return ''
  }
}

async function findMdFiles(dir: string, category: string, date: string): Promise<NightshiftFile[]> {
  const files: NightshiftFile[] = []
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        const subFiles = await findMdFiles(fullPath, category, date)
        files.push(...subFiles)
      } else if (entry.name.endsWith('.md') && entry.name.includes(date)) {
        const content = await readFileSafe(fullPath)
        const s = await stat(fullPath)
        files.push({
          name: entry.name.replace('.md', '').replace(`${date}-`, '').replace(date, 'rapport'),
          path: fullPath.replace(BASE + '/', ''),
          category,
          content,
          size: s.size,
          date,
        })
      }
    }
  } catch { /* dir doesn't exist yet */ }
  return files
}

async function getNightshiftDay(date: string): Promise<NightshiftDay> {
  const dirs: { path: string; category: string }[] = [
    { path: join(BASE, 'intelligence'), category: 'Intelligence' },
    { path: join(BASE, 'intelligence', 'competitors'), category: 'Competitors' },
    { path: join(BASE, 'content', 'linkedin'), category: 'LinkedIn' },
    { path: join(BASE, 'content', 'articles'), category: 'Articles' },
    { path: join(BASE, 'content', 'case-studies'), category: 'Case Studies' },
    { path: join(BASE, 'content', 'sales'), category: 'Sales Material' },
    { path: join(BASE, 'pipeline'), category: 'Pipeline' },
    { path: join(BASE, 'outreach'), category: 'Outreach' },
    { path: join(BASE, 'reports'), category: 'Reports' },
  ]

  const allFiles: NightshiftFile[] = []
  for (const dir of dirs) {
    const files = await findMdFiles(dir.path, dir.category, date)
    allFiles.push(...files)
  }

  // Also check for non-dated files created on that date
  // Get memory summary
  const memorySummary = await readFileSafe(join(MEMORY, `${date}.md`))
  const summaryMatch = memorySummary.match(/## Nachtshift Resultaten[\s\S]*$/)?.[0] || null

  const totalLines = allFiles.reduce((sum, f) => sum + f.content.split('\n').length, 0)
  const categories: Record<string, number> = {}
  allFiles.forEach(f => {
    categories[f.category] = (categories[f.category] || 0) + 1
  })

  return {
    date,
    files: allFiles,
    summary: summaryMatch,
    stats: {
      totalFiles: allFiles.length,
      totalLines,
      categories,
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const days = parseInt(searchParams.get('days') || '7')

  if (date) {
    const day = await getNightshiftDay(date)
    return NextResponse.json(day)
  }

  // Get last N days
  const results: NightshiftDay[] = []
  const now = new Date()
  for (let i = 0; i < days; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const day = await getNightshiftDay(dateStr)
    if (day.files.length > 0) {
      results.push(day)
    }
  }

  return NextResponse.json({ days: results })
}
