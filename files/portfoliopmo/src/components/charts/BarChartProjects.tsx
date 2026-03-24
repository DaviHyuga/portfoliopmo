'use client'
// src/components/charts/BarChartProjects.tsx

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Tooltip, Legend,
} from 'chart.js'
import type { Project } from '@/types'
import { FAROL_COLORS } from '@/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export function BarChartProjects({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm" style={{ color: 'var(--text3)' }}>
        Adicione projetos para visualizar
      </div>
    )
  }

  const sorted = [...projects].sort((a, b) => b.pct_evolucao - a.pct_evolucao)
  const height = Math.max(240, sorted.length * 44 + 60)

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <Bar
        data={{
          labels: sorted.map(p => p.nome.length > 24 ? p.nome.slice(0, 24) + '…' : p.nome),
          datasets: [{
            data: sorted.map(p => p.pct_evolucao),
            backgroundColor: sorted.map(p => FAROL_COLORS[p.farol] + 'cc'),
            borderColor: sorted.map(p => FAROL_COLORS[p.farol]),
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          }],
        }}
        options={{
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: ctx => ` ${ctx.raw}% de evolução` }
            },
          },
          scales: {
            x: {
              min: 0, max: 100,
              ticks: { color: '#5c6278', callback: v => v + '%', font: { family: 'DM Mono', size: 11 } },
              grid: { color: 'rgba(255,255,255,0.04)' },
              border: { color: 'rgba(255,255,255,0.07)' },
            },
            y: {
              ticks: { color: '#9da3b4', font: { family: 'DM Sans', size: 12 } },
              grid: { display: false },
              border: { display: false },
            },
          },
        }}
      />
    </div>
  )
}
