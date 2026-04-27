// src/app/(app)/status-recorrente/page.tsx
import { getProjects, getWeeklyStatuses } from '@/lib/projects'
import { StatusRecorrenteClient } from './_StatusRecorrenteClient'

export const revalidate = 0

function getWeekStart(date: Date): string {
  const d   = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

export default async function StatusRecorrentePage({
  searchParams,
}: {
  searchParams: { week?: string }
}) {
  const currentWeekStart = getWeekStart(new Date())
  const weekStart = searchParams.week ?? currentWeekStart

  const [projects, weeklyStatuses] = await Promise.all([
    getProjects(),
    getWeeklyStatuses(weekStart),
  ])

  return (
    <StatusRecorrenteClient
      initialProjects={projects}
      initialStatuses={weeklyStatuses}
      weekStart={weekStart}
      currentWeekStart={currentWeekStart}
    />
  )
}
