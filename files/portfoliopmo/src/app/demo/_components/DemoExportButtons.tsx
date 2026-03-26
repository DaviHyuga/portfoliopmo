'use client'
// src/app/demo/_components/DemoExportButtons.tsx
// Botões de exportação para a rota demo — chama API routes via POST com dados do contexto

import { useState } from 'react'
import { useDemoContext } from '../context'

type ExportType = 'csv' | 'pptx'

async function downloadViaPost(
  url: string,
  body: object,
  defaultFilename: string,
  mimeType: string,
) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? 'Erro desconhecido')
  }
  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition')
  const filename = disposition?.match(/filename="(.+)"/)?.[1] ?? defaultFilename

  const urlObj = URL.createObjectURL(new Blob([blob], { type: mimeType }))
  const a = document.createElement('a')
  a.href = urlObj
  a.download = filename
  a.click()
  URL.revokeObjectURL(urlObj)
}

export function DemoExportButtons() {
  const { projects } = useDemoContext()
  const [loading, setLoading] = useState<ExportType | null>(null)
  const [error, setError]   = useState<string | null>(null)

  async function handleExport(type: ExportType) {
    setLoading(type)
    setError(null)
    try {
      const date = new Date().toISOString().slice(0, 10)
      if (type === 'csv') {
        await downloadViaPost(
          '/api/export/demo/csv',
          { projects },
          `portfolio_demo_${date}.csv`,
          'text/csv;charset=utf-8',
        )
      } else {
        await downloadViaPost(
          '/api/export/demo/pptx',
          { projects, orgName: 'Chubb' },
          `portfolio_executivo_${date}.pptx`,
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        )
      }
    } catch (e) {
      console.error(e)
      setError(type === 'csv' ? 'Erro ao gerar CSV' : 'Erro ao gerar PPTX')
    } finally {
      setLoading(null)
    }
  }

  const btnClass = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const btnStyle = { background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--text2)' }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-xs" style={{ color: 'var(--red, #ef4444)' }}>{error}</span>
      )}
      <button
        onClick={() => handleExport('csv')}
        disabled={loading !== null}
        className={btnClass}
        style={btnStyle}
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
        className={btnClass}
        style={btnStyle}
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
