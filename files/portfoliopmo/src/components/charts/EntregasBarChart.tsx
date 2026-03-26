'use client'
// src/components/charts/EntregasBarChart.tsx
// Gráfico de barras vertical — Projetos Entregues por Quarter

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import type { Project } from '@/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

/** Retorna o quarter (1–4) com base na data de entrega (UTC-safe) */
function getQuarter(dateStr: string): number {
  const month = new Date(dateStr + 'T00:00:00').getMonth() + 1 // 1-12
  return Math.ceil(month / 3)
}

interface Props {
  projects: Project[]         // projetos do ano selecionado (farol=azul)
  prevYearProjects: Project[] // projetos do ano anterior (farol=azul)
  selectedYear: number
}

export function EntregasBarChart({ projects, prevYearProjects, selectedYear }: Props) {
  // Agrupar por quarter
  const counts = [0, 0, 0, 0]
  const byQ: Project[][] = [[], [], [], []]

  projects.forEach(p => {
    if (!p.data_fim_prevista) return
    const q = getQuarter(p.data_fim_prevista) - 1 // index 0-3
    counts[q]++
    byQ[q].push(p)
  })

  const prevCounts = [0, 0, 0, 0]
  prevYearProjects.forEach(p => {
    if (!p.data_fim_prevista) return
    prevCounts[getQuarter(p.data_fim_prevista) - 1]++
  })

  // Crescimento total vs ano anterior
  const totalCurrent = counts.reduce((a, b) => a + b, 0)
  const totalPrev = prevCounts.reduce((a, b) => a + b, 0)
  const growth = totalPrev > 0
    ? Math.round(((totalCurrent - totalPrev) / totalPrev) * 100)
    : null

  const data = {
    labels: ['Q1 (Jan–Mar)', 'Q2 (Abr–Jun)', 'Q3 (Jul–Set)', 'Q4 (Out–Dez)'],
    datasets: [
      {
        label: `${selectedYear}`,
        data: counts,
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        hoverBackgroundColor: 'rgba(99, 102, 241, 1)',
        borderRadius: 8,
        borderSkipped: false as const,
        barThickness: 44,
      },
      {
        label: `${selectedYear - 1}`,
        data: prevCounts,
        backgroundColor: 'rgba(99, 102, 241, 0.18)',
        hoverBackgroundColor: 'rgba(99, 102, 241, 0.30)',
        borderRadius: 8,
        borderSkipped: false as const,
        barThickness: 44,
      },
    ],
  }

  return (
    <div>
      {/* Indicador de crescimento */}
      {growth !== null && (
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-xs font-semibold px-2 py-1 rounded-full"
            style={{
              background: growth >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              color: growth >= 0 ? '#22c55e' : '#ef4444',
            }}
          >
            {growth >= 0 ? `▲ +${growth}%` : `▼ ${growth}%`}
          </span>
          <span className="text-xs" style={{ color: 'var(--text3)' }}>
            vs {selectedYear - 1} ({totalPrev} entrega{totalPrev !== 1 ? 's' : ''})
          </span>
        </div>
      )}

      {/* Gráfico */}
      <div style={{ height: 260 }}>
        <Bar
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top' as const,
                align: 'end' as const,
                labels: {
                  font: { size: 11 },
                  color: '#94a3b8',
                  boxWidth: 12,
                  boxHeight: 12,
                  padding: 16,
                },
              },
              tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                padding: 12,
                callbacks: {
                  label: (ctx) => {
                    const count = ctx.parsed.y
                    return `  ${ctx.dataset.label}: ${count} projeto${count !== 1 ? 's' : ''}`
                  },
                  afterBody: (items) => {
                    const item = items.find(i => i.datasetIndex === 0)
                    if (!item) return []
                    const q = item.dataIndex
                    const names = byQ[q].map(p => `  • ${p.nome}`)
                    return names.length > 0 ? ['', ...names] : []
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                  color: '#64748b',
                  font: { size: 11 },
                },
                grid: { color: 'rgba(148,163,184,0.08)' },
                border: { display: false },
              },
              x: {
                ticks: {
                  color: '#94a3b8',
                  font: { size: 12 },
                },
                grid: { display: false },
                border: { display: false },
              },
            },
          }}
        />
      </div>

      {/* Legenda de totais por quarter */}
      {totalCurrent > 0 && (
        <div className="flex gap-4 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => (
            <div key={q} className="flex-1 text-center">
              <div className="text-xl font-bold" style={{ color: counts[i] > 0 ? '#6366f1' : 'var(--text3)' }}>
                {counts[i]}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{q}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
