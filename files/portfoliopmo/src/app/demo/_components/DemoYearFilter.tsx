'use client'
// src/app/demo/_components/DemoYearFilter.tsx
// Filtro de ano global para o modo demo — lê/escreve no contexto

import { useDemoContext } from '../context'

const YEARS = Array.from({ length: 45 }, (_, i) => 2026 + i)

export function DemoYearFilter() {
  const { selectedYear, setSelectedYear } = useDemoContext()
  return (
    <select
      value={selectedYear}
      onChange={e => setSelectedYear(Number(e.target.value))}
      className="text-sm px-3 py-1.5 rounded-lg border transition-colors"
      style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text)' }}
      aria-label="Filtrar por ano"
    >
      {YEARS.map(y => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>
  )
}
