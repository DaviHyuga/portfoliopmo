'use client'
// src/components/charts/QuartersChart.tsx

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Tooltip, Legend,
} from 'chart.js'
import type { Project } from '@/types'
import { FAROL_COLORS, FAROL_LABELS } from '@/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

function getQuarter(dateStr: string): string {
  const month = new Date(dateStr + 'T00:00:00').getMonth() + 1
  return `T${Math.ceil(month / 3)}`
}

export function QuartersChart({ projects }: { projects: Project[] }) {
  const withDate = projects.filter(p => p.data_fim_prevista)

  if (withDate.length === 0) {
    return (
      <div className="flex items-center justify-center h-28 text-center text-xs px-4"
        style={{ color: 'var(--text3)' }}>
        Preencha a Data de Término dos projetos para visualizar a distribuição por trimestre
      </div>
    )
  }

  const quarters = ['T1', 'T2', 'T3', 'T4']
  const farois = ['verde', 'amarelo', 'vermelho', 'azul'] as const

  const counts: Record<string, Record<string, number>> = {}
  farois.forEach(f => { counts[f] = { T1: 0, T2: 0, T3: 0, T4: 0 } })
  withDate.forEach(p => { counts[p.farol][getQuarter(p.data_fim_prevista!)]++ })

  const datasets = farois.map(f => ({
    label: FAROL_LABELS[f],
    data: quarters.map(q => counts[f][q]),
    backgroundColor: FAROL_COLORS[f] + 'cc',
    borderColor: FAROL_COLORS[f],
    borderWidth: 1,
    borderRadius: 4,
    borderSkipped: false,
  }))

  return (
    <div style={{ position: 'relative', width: '100%', height: 180 }}>
      <Bar
        data={{ labels: quarters, datasets }}
        options={{
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                color: '#9da3b4',
                font: { family: 'DM Sans', size: 11 },
                boxWidth: 12,
                padding: 12,
              },
            },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.dataset.label}: ${ctx.raw} projeto${(ctx.raw as number) !== 1 ? 's' : ''}`,
              },
            },
          },
          scales: {
            x: {
              stacked: true,
              ticks: { color: '#5c6278', stepSize: 1, font: { family: 'DM Mono', size: 11 } },
              grid: { color: 'rgba(255,255,255,0.04)' },
              border: { color: 'rgba(255,255,255,0.07)' },
            },
            y: {
              stacked: true,
              ticks: { color: '#9da3b4', font: { family: 'DM Mono', size: 12 } },
              grid: { display: false },
              border: { display: false },
            },
          },
        }}
      />
    </div>
  )
}
