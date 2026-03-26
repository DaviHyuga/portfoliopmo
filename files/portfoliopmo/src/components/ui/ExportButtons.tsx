'use client'
// src/components/ui/ExportButtons.tsx

import { useState } from 'react'

type ExportType = 'csv' | 'pptx'

export function ExportButtons() {
  const [loading, setLoading] = useState<ExportType | null>(null)

  async function handleExport(type: ExportType) {
    setLoading(type)
    try {
      const res = await fetch(`/api/export/${type}`)
      if (!res.ok) throw new Error('Erro na geração do arquivo')

      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = res.headers.get('Content-Disposition')
        ?.match(/filename="(.+)"/)?.[1] ?? `portfolio.${type}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Erro ao gerar o arquivo. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleExport('csv')}
        disabled={loading !== null}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text2)' }}
        title="Baixar base de dados em CSV"
      >
        {loading === 'csv' ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="text-xs">↓</span>
        )}
        CSV
      </button>

      <button
        onClick={() => handleExport('pptx')}
        disabled={loading !== null}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text2)' }}
        title="Baixar relatório executivo em PowerPoint"
      >
        {loading === 'pptx' ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="text-xs">↓</span>
        )}
        Relatório PPTX
      </button>
    </div>
  )
}
