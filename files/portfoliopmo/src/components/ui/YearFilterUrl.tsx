'use client'
// src/components/ui/YearFilterUrl.tsx
// Filtro de ano para páginas de produção — persiste o ano na URL via searchParam ?ano=XXXX

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const YEARS = Array.from({ length: 45 }, (_, i) => 2026 + i)

export function YearFilterUrl({ defaultYear }: { defaultYear: number }) {
  const router = useRouter()
  const params = useSearchParams()
  const pathname = usePathname()
  const selectedYear = Number(params.get('ano')) || defaultYear

  function handleChange(year: string) {
    const sp = new URLSearchParams(params.toString())
    sp.set('ano', year)
    router.push(`${pathname}?${sp.toString()}`)
  }

  return (
    <select
      value={selectedYear}
      onChange={e => handleChange(e.target.value)}
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
